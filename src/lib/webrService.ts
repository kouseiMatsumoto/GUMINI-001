import { WebR, ChannelType } from 'webr';
import { ConsoleOutputItem, PlotImage, RFile, DataFrameInfo } from '../types';

export class WebRService {
  private static instance: WebRService | null = null;
  public webR: WebR | null = null;
  public status: 'uninitialized' | 'loading' | 'ready' | 'running' | 'error' = 'uninitialized';
  public initError: string | null = null;

  private outputListeners: Set<(item: ConsoleOutputItem) => void> = new Set();
  private plotListeners: Set<(plot: PlotImage) => void> = new Set();
  private statusListeners: Set<(status: string) => void> = new Set();

  private isReading = false;
  private currentPlotCounter = 1;

  public static getInstance(): WebRService {
    if (!WebRService.instance) {
      WebRService.instance = new WebRService();
    }
    return WebRService.instance;
  }

  public subscribeOutput(listener: (item: ConsoleOutputItem) => void): () => void {
    this.outputListeners.add(listener);
    return () => this.outputListeners.delete(listener);
  }

  public subscribePlot(listener: (plot: PlotImage) => void): () => void {
    this.plotListeners.add(listener);
    return () => this.plotListeners.delete(listener);
  }

  public subscribeStatus(listener: (status: string) => void): () => void {
    this.statusListeners.add(listener);
    return () => this.statusListeners.delete(listener);
  }

  private notifyStatus(status: 'uninitialized' | 'loading' | 'ready' | 'running' | 'error') {
    this.status = status;
    this.statusListeners.forEach((fn) => fn(status));
  }

  public notifyOutput(type: ConsoleOutputItem['type'], text: string) {
    const item: ConsoleOutputItem = {
      id: `out_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      type,
      text,
      timestamp: new Date().toLocaleTimeString(),
    };
    this.outputListeners.forEach((fn) => fn(item));
  }

  public async initialize(): Promise<void> {
    if (this.status === 'ready' || this.status === 'loading') {
      return;
    }

    this.notifyStatus('loading');
    this.notifyOutput('info', '⚙️ WebR (WebAssembly R Runtime) を初期化中...');

    try {
      // Initialize WebR with PostMessage channel for maximum compatibility in iframes
      this.webR = new WebR({
        baseUrl: 'https://webr.r-wasm.org/latest/',
        channelType: ChannelType.PostMessage,
      });

      await this.webR.init();

      // Start output reader loop
      this.startReadingLoop();

      // Configure default environment & plot options in R
      try {
        await this.webR.evalR(`
          options(width = 80)
          options(warn = 1)
          # create temp dir for outputs
          dir.create("/tmp", showWarnings = FALSE)
        `);
      } catch (e) {
        console.warn('Initial R config setup:', e);
      }

      this.notifyStatus('ready');
      this.notifyOutput('info', '✅ WebR の初期化が完了しました。Rのコードを実行できます！');
      this.initError = null;
    } catch (err: any) {
      console.error('Failed to initialize WebR:', err);
      this.initError = err?.message || 'WebRの初期化に失敗しました。';
      this.notifyStatus('error');
      this.notifyOutput('error', `❌ WebR初期化エラー: ${this.initError}`);
      throw err;
    }
  }

  private async startReadingLoop() {
    if (!this.webR || this.isReading) return;
    this.isReading = true;

    try {
      while (this.webR) {
        const msg = await this.webR.read();
        if (!msg) continue;

        if (msg.type === 'stdout') {
          this.notifyOutput('stdout', msg.data);
        } else if (msg.type === 'stderr') {
          this.notifyOutput('stderr', msg.data);
        } else if (msg.type === 'prompt') {
          // prompt is ready
        } else if (msg.type === 'canvas') {
          // Canvas drawing event handled if canvas device used
        }
      }
    } catch (err) {
      console.debug('WebR read loop exited:', err);
    } finally {
      this.isReading = false;
    }
  }

  public async runCode(code: string): Promise<{ success: boolean; error?: string }> {
    if (!this.webR || this.status !== 'ready') {
      await this.initialize();
    }

    if (!this.webR) {
      throw new Error('WebR is not available');
    }

    const trimmed = code.trim();
    if (!trimmed) return { success: true };

    this.notifyStatus('running');
    this.notifyOutput('input', trimmed);

    const startTime = performance.now();

    try {
      // Check if code contains plotting functions to enable automatic graphic capture
      const hasPlotCalls = /(plot|ggplot|hist|boxplot|barplot|curve|pairs|pie|image|contour|persp|heatmap|autoplot|qplot|ggsave)\s*\(/.test(trimmed);

      if (hasPlotCalls) {
        // Run with PNG plot capture
        const plotFileName = `/tmp/plot_${Date.now()}_${this.currentPlotCounter++}.png`;
        const wrappedCode = `
          png("${plotFileName}", width = 800, height = 550, res = 100)
          tryCatch({
            {
              ${trimmed}
            }
          }, finally = {
            dev.off()
          })
        `;

        const shelter = await new this.webR.Shelter();
        try {
          const capture = await shelter.captureR(wrappedCode, {
            withAutoprint: true,
            captureStreams: true,
            captureConditions: true,
          });

          // Process stream outputs
          if (capture.output && capture.output.length > 0) {
            for (const out of capture.output) {
              if (out.type === 'stdout') {
                this.notifyOutput('stdout', out.data);
              } else if (out.type === 'stderr' || out.type === 'warning' || out.type === 'message') {
                this.notifyOutput('stderr', out.data);
              }
            }
          }

          // Check if plot file was generated
          try {
            const plotData = await this.webR.FS.readFile(plotFileName);
            if (plotData && plotData.length > 100) {
              const blob = new Blob([plotData], { type: 'image/png' });
              const url = URL.createObjectURL(blob);
              const plotItem: PlotImage = {
                id: `plot_${Date.now()}`,
                url,
                title: `Plot #${this.currentPlotCounter - 1}`,
                timestamp: new Date().toLocaleTimeString(),
                type: 'png',
                width: 800,
                height: 550,
              };
              this.plotListeners.forEach((fn) => fn(plotItem));
              this.notifyOutput('info', `📊 プロット画像をキャプチャしました (#${this.currentPlotCounter - 1})`);
            }
          } catch (fileErr) {
            // Plot was not written or empty
          }

          // Also check for canvas bitmaps if any
          if (capture.images && capture.images.length > 0) {
            for (const imgBitmap of capture.images) {
              const canvas = document.createElement('canvas');
              canvas.width = imgBitmap.width;
              canvas.height = imgBitmap.height;
              const ctx = canvas.getContext('2d');
              if (ctx) {
                ctx.drawImage(imgBitmap, 0, 0);
                const dataUrl = canvas.toDataURL('image/png');
                const plotItem: PlotImage = {
                  id: `plot_canvas_${Date.now()}`,
                  url: dataUrl,
                  title: `Canvas Plot #${this.currentPlotCounter++}`,
                  timestamp: new Date().toLocaleTimeString(),
                  type: 'png',
                  width: imgBitmap.width,
                  height: imgBitmap.height,
                };
                this.plotListeners.forEach((fn) => fn(plotItem));
              }
            }
          }
        } finally {
          shelter.purge();
        }
      } else {
        // Standard execution with shelter capture for clear output
        const shelter = await new this.webR.Shelter();
        try {
          const capture = await shelter.captureR(trimmed, {
            withAutoprint: true,
            captureStreams: true,
            captureConditions: true,
          });

          if (capture.output && capture.output.length > 0) {
            for (const out of capture.output) {
              if (out.type === 'stdout') {
                this.notifyOutput('stdout', out.data);
              } else if (out.type === 'stderr' || out.type === 'warning' || out.type === 'message') {
                this.notifyOutput('stderr', out.data);
              }
            }
          }
        } finally {
          shelter.purge();
        }
      }

      const duration = (performance.now() - startTime).toFixed(1);
      this.notifyStatus('ready');
      return { success: true };
    } catch (err: any) {
      console.error('R execution error:', err);
      const errMsg = err?.message || String(err);
      this.notifyOutput('error', `Error: ${errMsg}`);
      this.notifyStatus('ready');
      return { success: false, error: errMsg };
    }
  }

  public async runCodeWithDetails(code: string): Promise<{ success: boolean; output: string; plotUrl?: string; error?: string }> {
    if (!this.webR || this.status !== 'ready') {
      await this.initialize();
    }

    if (!this.webR) {
      throw new Error('WebR is not available');
    }

    const trimmed = code.trim();
    if (!trimmed) return { success: true, output: '' };

    this.notifyStatus('running');
    let collectedOutput: string[] = [];
    let plotUrl: string | undefined = undefined;

    try {
      const hasPlotCalls = /(plot|ggplot|hist|boxplot|barplot|curve|pairs|pie|image|contour|persp|heatmap|autoplot|qplot|ggsave)\s*\(/.test(trimmed);
      const plotFileName = `/tmp/rmd_plot_${Date.now()}_${this.currentPlotCounter++}.png`;

      let codeToRun = trimmed;
      if (hasPlotCalls) {
        codeToRun = `
          png("${plotFileName}", width = 800, height = 550, res = 100)
          tryCatch({
            {
              ${trimmed}
            }
          }, finally = {
            dev.off()
          })
        `;
      }

      const shelter = await new this.webR.Shelter();
      try {
        const capture = await shelter.captureR(codeToRun, {
          withAutoprint: true,
          captureStreams: true,
          captureConditions: true,
        });

        if (capture.output && capture.output.length > 0) {
          for (const out of capture.output) {
            collectedOutput.push(out.data);
            if (out.type === 'stdout') {
              this.notifyOutput('stdout', out.data);
            } else if (out.type === 'stderr' || out.type === 'warning' || out.type === 'message') {
              this.notifyOutput('stderr', out.data);
            }
          }
        }

        if (hasPlotCalls) {
          try {
            const plotData = await this.webR.FS.readFile(plotFileName);
            if (plotData && plotData.length > 100) {
              const blob = new Blob([plotData], { type: 'image/png' });
              plotUrl = URL.createObjectURL(blob);
              const plotItem: PlotImage = {
                id: `plot_${Date.now()}`,
                url: plotUrl,
                title: `Rmd Plot #${this.currentPlotCounter - 1}`,
                timestamp: new Date().toLocaleTimeString(),
                type: 'png',
                width: 800,
                height: 550,
              };
              this.plotListeners.forEach((fn) => fn(plotItem));
            }
          } catch (e) {
            // No file generated
          }
        }
      } finally {
        shelter.purge();
      }

      this.notifyStatus('ready');
      return {
        success: true,
        output: collectedOutput.join('\n'),
        plotUrl,
      };
    } catch (err: any) {
      this.notifyStatus('ready');
      const msg = err?.message || String(err);
      this.notifyOutput('error', `Error: ${msg}`);
      return {
        success: false,
        output: `Error: ${msg}`,
        error: msg,
      };
    }
  }

  public async installPackages(packages: string[]): Promise<boolean> {
    if (!this.webR || this.status !== 'ready') {
      await this.initialize();
    }
    if (!this.webR) return false;

    this.notifyStatus('running');
    this.notifyOutput('info', `📦 パッケージ [${packages.join(', ')}] をWebRリポジトリからインストール中...`);

    try {
      await this.webR.installPackages(packages);
      this.notifyOutput('info', `🎉 パッケージ [${packages.join(', ')}] のインストールが完了しました！`);
      this.notifyStatus('ready');
      return true;
    } catch (err: any) {
      console.error('Failed to install packages:', err);
      this.notifyOutput('error', `❌ パッケージインストールエラー: ${err?.message || err}`);
      this.notifyStatus('ready');
      return false;
    }
  }

  public async listFiles(directory = '/home/web_user'): Promise<RFile[]> {
    if (!this.webR || this.status !== 'ready') return [];

    try {
      const shelter = await new this.webR.Shelter();
      try {
        const res = await shelter.evalR(`
          tryCatch({
            files <- list.files("${directory}", full.names = FALSE)
            if (length(files) == 0) {
              "[]"
            } else {
              info <- file.info(file.path("${directory}", files))
              jsonlite::toJSON(lapply(seq_along(files), function(i) {
                list(
                  name = files[i],
                  path = file.path("${directory}", files[i]),
                  size = ifelse(is.na(info$size[i]), 0, info$size[i]),
                  isDir = ifelse(is.na(info$isdir[i]), FALSE, info$isdir[i]),
                  modified = as.character(info$mtime[i])
                )
              }), auto_unbox = TRUE)
            }
          }, error = function(e) { "[]" })
        `);
        const jsonStr = await res.toString();
        if (jsonStr && jsonStr !== '[]') {
          return JSON.parse(jsonStr) as RFile[];
        }
        return [];
      } finally {
        shelter.purge();
      }
    } catch (e) {
      console.error('Failed to list files:', e);
      return [];
    }
  }

  public async uploadFile(name: string, data: Uint8Array, directory = '/home/web_user'): Promise<boolean> {
    if (!this.webR || this.status !== 'ready') return false;

    try {
      const fullPath = `${directory}/${name}`.replace('//', '/');
      await this.webR.FS.writeFile(fullPath, data);
      this.notifyOutput('info', `📁 ファイル "${name}" を "${directory}" にアップロードしました (${data.length} bytes)`);
      return true;
    } catch (err: any) {
      this.notifyOutput('error', `❌ ファイルアップロード失敗: ${err?.message || err}`);
      return false;
    }
  }

  public async readFile(path: string): Promise<Uint8Array | null> {
    if (!this.webR || this.status !== 'ready') return null;
    try {
      return await this.webR.FS.readFile(path);
    } catch (err) {
      console.error('Failed to read file:', err);
      return null;
    }
  }

  public async deleteFile(path: string): Promise<boolean> {
    if (!this.webR || this.status !== 'ready') return false;
    try {
      await this.webR.FS.unlink(path);
      this.notifyOutput('info', `🗑️ ファイル "${path}" を削除しました`);
      return true;
    } catch (err: any) {
      this.notifyOutput('error', `❌ ファイル削除失敗: ${err?.message || err}`);
      return false;
    }
  }

  public async inspectDataFrame(dfName: string): Promise<DataFrameInfo | null> {
    if (!this.webR || this.status !== 'ready') return null;

    try {
      const shelter = await new this.webR.Shelter();
      try {
        const jsonRes = await shelter.evalR(`
          tryCatch({
            if (is.data.frame(${dfName}) || is.matrix(${dfName})) {
              df <- as.data.frame(${dfName})
              head_df <- head(df, 100)
              col_types <- sapply(df, class)
              jsonlite::toJSON(list(
                name = "${dfName}",
                rowCount = nrow(df),
                colCount = ncol(df),
                columns = lapply(names(df), function(n) list(name = n, type = as.character(col_types[[n]])[1])),
                previewRows = head_df
              ), auto_unbox = TRUE)
            } else {
              NULL
            }
          }, error = function(e) { NULL })
        `);

        const jsonStr = await jsonRes.toString();
        if (jsonStr && jsonStr !== 'NULL') {
          return JSON.parse(jsonStr) as DataFrameInfo;
        }
      } finally {
        shelter.purge();
      }
    } catch (err) {
      console.error('Inspect data frame error:', err);
    }
    return null;
  }

  public async getAvailableDataFrames(): Promise<string[]> {
    if (!this.webR || this.status !== 'ready') return ['iris', 'mtcars', 'airquality', 'quakes', 'ToothGrowth'];
    try {
      const shelter = await new this.webR.Shelter();
      try {
        const res = await shelter.evalR(`
          tryCatch({
            jsonlite::toJSON(names(which(sapply(ls(envir = .GlobalEnv), function(x) is.data.frame(get(x)) || is.matrix(get(x))))))
          }, error = function(e) { "[]" })
        `);
        const jsonStr = await res.toString();
        let userDfs: string[] = [];
        if (jsonStr && jsonStr !== '[]') {
          userDfs = JSON.parse(jsonStr) as string[];
        }
        const builtins = ['iris', 'mtcars', 'airquality', 'quakes', 'ToothGrowth', 'faithful', 'PlantGrowth'];
        return Array.from(new Set([...userDfs, ...builtins]));
      } finally {
        shelter.purge();
      }
    } catch {
      return ['iris', 'mtcars', 'airquality', 'quakes', 'ToothGrowth', 'faithful'];
    }
  }

  public async interrupt(): Promise<void> {
    if (this.webR) {
      try {
        await this.webR.interrupt();
        this.notifyOutput('warning', '⚠️ Rの実行を中断しました');
        this.notifyStatus('ready');
      } catch (err) {
        console.error('Interrupt error:', err);
      }
    }
  }

  public async restart(): Promise<void> {
    if (this.webR) {
      try {
        await this.webR.close();
      } catch (e) {
        // ignore
      }
      this.webR = null;
    }
    this.status = 'uninitialized';
    await this.initialize();
  }
}
