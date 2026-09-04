import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { EditorPane } from './components/EditorPane';
import { ConsolePane } from './components/ConsolePane';
import { PlotGallery } from './components/PlotGallery';
import { DataViewer } from './components/DataViewer';
import { FilesystemManager } from './components/FilesystemManager';
import { PackageManager } from './components/PackageManager';
import { RmdPreviewPane } from './components/RmdPreviewPane';
import { DocsViewer } from './components/DocsViewer';
import { SampleModal } from './components/SampleModal';
import { AiAssistantModal } from './components/AiAssistantModal';
import { WebRService } from './lib/webrService';
import { SAMPLE_CODES } from './data/samples';
import { ConsoleOutputItem, PlotImage, RSample, WebRStatus } from './types';
import { extractAllRCodeFromRmd } from './lib/rmdParser';
import { Terminal, Image as ImageIcon, Database, FolderArchive, Package, FileText, BookOpen, GripVertical, GripHorizontal } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  const [status, setStatus] = useState<WebRStatus>('uninitialized');
  const [code, setCode] = useState<string>(SAMPLE_CODES[0].code);
  const [isRmd, setIsRmd] = useState<boolean>(false);
  const [outputs, setOutputs] = useState<ConsoleOutputItem[]>([]);
  const [plots, setPlots] = useState<PlotImage[]>([]);
  const [activeTab, setActiveTab] = useState<'console' | 'plots' | 'data' | 'files' | 'packages' | 'rmd' | 'docs'>('console');
  const [isSampleModalOpen, setIsSampleModalOpen] = useState<boolean>(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);
  const [lastError, setLastError] = useState<string | null>(null);

  // Split Pane Resizing State (percentage: 20% to 80%)
  const [splitRatio, setSplitRatio] = useState<number>(() => {
    const saved = localStorage.getItem('r_workbench_split_ratio');
    return saved ? Number(saved) : 50;
  });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const webrService = WebRService.getInstance();

  // Save split ratio to localStorage
  useEffect(() => {
    localStorage.setItem('r_workbench_split_ratio', String(splitRatio));
  }, [splitRatio]);

  // Handle Dragging to Resize Left / Right panes
  const handleMouseDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (clientX: number, clientY: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const isLgScreen = window.innerWidth >= 1024;

      if (isLgScreen) {
        // Horizontal split (Left / Right)
        const offsetX = clientX - rect.left;
        const newRatio = (offsetX / rect.width) * 100;
        // Clamp between 20% and 80%
        const clamped = Math.max(20, Math.min(80, newRatio));
        setSplitRatio(clamped);
      } else {
        // Vertical split (Top / Bottom) for mobile/tablet
        const offsetY = clientY - rect.top;
        const newRatio = (offsetY / rect.height) * 100;
        const clamped = Math.max(20, Math.min(80, newRatio));
        setSplitRatio(clamped);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging]);

  // Reset to 50:50 on double click
  const handleResetSplit = useCallback(() => {
    setSplitRatio(50);
  }, []);

  // Initialize WebR and subscribe to events on mount
  useEffect(() => {
    const unsubStatus = webrService.subscribeStatus((newStatus) => {
      setStatus(newStatus as WebRStatus);
    });

    const unsubOutput = webrService.subscribeOutput((item) => {
      setOutputs((prev) => [...prev, item]);
      if (item.type === 'error') {
        setLastError(item.text);
      }
    });

    const unsubPlot = webrService.subscribePlot((newPlot) => {
      setPlots((prev) => [newPlot, ...prev]);
      // If user isn't in Rmd or Docs view, focus plots
      setActiveTab((curr) => (curr === 'rmd' || curr === 'docs' ? curr : 'plots'));
    });

    // Auto-initialize WebR
    webrService.initialize().catch((err) => {
      console.error('Initial WebR init failed:', err);
    });

    return () => {
      unsubStatus();
      unsubOutput();
      unsubPlot();
    };
  }, []);

  const handleRunCode = useCallback(async () => {
    if (!code.trim()) return;

    let codeToExecute = code;
    if (isRmd) {
      codeToExecute = extractAllRCodeFromRmd(code);
    }

    const result = await webrService.runCode(codeToExecute);
    if (result.success && /(plot|ggplot|hist|boxplot)/.test(codeToExecute)) {
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { y: 0.85, x: 0.75 },
      });
    }
  }, [code, isRmd]);

  const handleRunSelection = useCallback(async (selectedCode: string) => {
    if (!selectedCode.trim()) return;
    await webrService.runCode(selectedCode);
  }, []);

  const handleExecuteReplCommand = useCallback(async (command: string) => {
    await webrService.runCode(command);
  }, []);

  const handleRunRmdChunk = useCallback(async (chunkCode: string, _chunkId: string) => {
    const result = await webrService.runCodeWithDetails(chunkCode);
    return {
      output: result.output || (result.success ? '実行完了 (出力なし)' : result.error || 'エラーが発生しました'),
      plotUrl: result.plotUrl,
    };
  }, []);

  const handleRunAllRmdChunks = useCallback(async () => {
    await handleRunCode();
    setActiveTab('rmd');
  }, [handleRunCode]);

  const handleInterrupt = useCallback(async () => {
    await webrService.interrupt();
  }, []);

  const handleRestart = useCallback(async () => {
    setOutputs([]);
    setPlots([]);
    await webrService.restart();
  }, []);

  const handleClearConsole = useCallback(() => {
    setOutputs([]);
  }, []);

  const handleClearPlots = useCallback(() => {
    setPlots([]);
  }, []);

  const handleSelectSample = useCallback((sample: RSample, autoRun: boolean) => {
    setCode(sample.code);
    const isSampleRmd = sample.id === 'rmarkdown-report' || sample.code.includes('```{r');
    setIsRmd(isSampleRmd);
    if (isSampleRmd) {
      setActiveTab('rmd');
    }
    if (autoRun) {
      setTimeout(() => {
        const codeToRun = isSampleRmd ? extractAllRCodeFromRmd(sample.code) : sample.code;
        webrService.runCode(codeToRun);
      }, 100);
    }
  }, []);

  const handleApplyAiCode = useCallback((aiCode: string, mode: 'replace' | 'append') => {
    if (aiCode.includes('```{r')) {
      setIsRmd(true);
      setActiveTab('rmd');
    }
    if (mode === 'replace') {
      setCode(aiCode);
    } else {
      setCode((prev) => prev + '\n\n' + aiCode);
    }
  }, []);

  const handleInsertCodeToEditor = useCallback((snippet: string) => {
    setCode((prev) => prev + '\n\n' + snippet);
  }, []);

  const handleToggleRmd = useCallback((val: boolean) => {
    setIsRmd(val);
    if (val) {
      setActiveTab('rmd');
    }
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans select-none">
      {/* App Header */}
      <Header
        status={status}
        onRunCode={handleRunCode}
        onInterrupt={handleInterrupt}
        onRestart={handleRestart}
        onClearConsole={handleClearConsole}
        onOpenSamples={() => setIsSampleModalOpen(true)}
        onOpenAi={() => setIsAiModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab as any}
        plotCount={plots.length}
      />

      {/* Main Workspace: Split Pane (Editor Left / Results Right) */}
      <div
        ref={containerRef}
        className={`flex-1 flex flex-col lg:flex-row overflow-hidden relative ${
          isDragging ? 'select-none cursor-col-resize lg:cursor-col-resize cursor-row-resize' : ''
        }`}
      >
        {/* Left Side: R Code Editor with Syntax Linter & Hover Tooltip */}
        <div
          style={{
            flex: undefined,
            width: typeof window !== 'undefined' && window.innerWidth >= 1024 ? `${splitRatio}%` : '100%',
            height: typeof window !== 'undefined' && window.innerWidth < 1024 ? `${splitRatio}%` : '100%',
          }}
          className="flex flex-col overflow-hidden min-w-[240px] min-h-[160px]"
        >
          <EditorPane
            code={code}
            onChange={setCode}
            onRunCode={handleRunCode}
            onRunSelection={handleRunSelection}
            onClear={() => setCode('')}
            onOpenAi={() => setIsAiModalOpen(true)}
            isRmd={isRmd}
            onToggleRmd={handleToggleRmd}
          />
        </div>

        {/* Resizer Splitter Bar */}
        <div
          id="workspace-resizer"
          onMouseDown={handleMouseDown}
          onTouchStart={handleMouseDown}
          onDoubleClick={handleResetSplit}
          title="ドラッグして左右の幅を変更（ダブルクリックで 50:50 にリセット）"
          className={`group relative flex items-center justify-center shrink-0 z-30 transition-colors ${
            isDragging
              ? 'bg-blue-500 shadow-md shadow-blue-500/30 w-2.5'
              : 'bg-slate-800 hover:bg-blue-500/80 hover:w-2.5'
          } lg:w-2 lg:h-full w-full h-2.5 lg:cursor-col-resize cursor-row-resize select-none`}
        >
          {/* Visual Grip Handle */}
          <div className="hidden lg:flex flex-col items-center justify-center gap-1 py-4 px-0.5 rounded-full bg-slate-900 border border-slate-700 group-hover:border-blue-400 group-hover:bg-blue-950/90 transition-all shadow-sm">
            <GripVertical className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-300" />
          </div>
          <div className="flex lg:hidden items-center justify-center px-4 py-0.5 rounded-full bg-slate-900 border border-slate-700 group-hover:border-blue-400">
            <GripHorizontal className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-300" />
          </div>

          {/* Quick Split Ratio Presets floating box on hover/drag */}
          <div className="absolute opacity-0 group-hover:opacity-100 lg:top-3 top-[-32px] transition-all duration-150 z-40 bg-slate-900 text-slate-200 text-[10px] font-mono px-2 py-1 rounded-md border border-slate-700 shadow-xl flex items-center gap-1.5 whitespace-nowrap">
            <span className="text-blue-400 font-bold">{Math.round(splitRatio)}% : {Math.round(100 - splitRatio)}%</span>
            <span className="text-slate-600">|</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSplitRatio(30);
              }}
              className="px-1 py-0.5 hover:bg-slate-800 rounded text-[9px] text-slate-400 hover:text-white"
              title="エディタ 30% / 結果 70%"
            >
              30:70
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSplitRatio(50);
              }}
              className="px-1 py-0.5 hover:bg-slate-800 rounded text-[9px] text-slate-400 hover:text-white"
              title="均等 50:50"
            >
              50:50
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSplitRatio(70);
              }}
              className="px-1 py-0.5 hover:bg-slate-800 rounded text-[9px] text-slate-400 hover:text-white"
              title="エディタ 70% / 結果 30%"
            >
              70:30
            </button>
          </div>
        </div>

        {/* Right Side: Tabbed Results & Tools (Console, Plots, Rmd Preview, Data, Docs, Files, Packages) */}
        <div
          style={{
            flex: undefined,
            width: typeof window !== 'undefined' && window.innerWidth >= 1024 ? `${100 - splitRatio}%` : '100%',
            height: typeof window !== 'undefined' && window.innerWidth < 1024 ? `${100 - splitRatio}%` : '100%',
          }}
          className="flex flex-col bg-slate-950 overflow-hidden min-w-[260px] min-h-[160px]"
        >
          {/* Tab Navigation Header */}
          <div className="flex items-center justify-between px-2 bg-slate-900 border-b border-slate-800 shrink-0 text-xs overflow-x-auto">
            <div className="flex items-center">
            {/* Rmd Preview Tab */}
            <button
              id="tab-btn-rmd"
              onClick={() => setActiveTab('rmd')}
              className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'rmd'
                  ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                  : isRmd
                  ? 'border-transparent text-amber-400 hover:text-amber-300 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Rmd レポート (Knit)</span>
              {isRmd && (
                <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-500/20 text-amber-300 font-mono font-bold">
                  Active
                </span>
              )}
            </button>

            <button
              id="tab-btn-console"
              onClick={() => setActiveTab('console')}
              className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'console'
                  ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Console (REPL)</span>
            </button>

            <button
              id="tab-btn-plots"
              onClick={() => setActiveTab('plots')}
              className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'plots'
                  ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Plots</span>
              {plots.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-500/20 text-blue-300 font-mono font-bold">
                  {plots.length}
                </span>
              )}
            </button>

            {/* Docs / Help Explorer Tab */}
            <button
              id="tab-btn-docs"
              onClick={() => setActiveTab('docs')}
              className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'docs'
                  ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Help & Docs</span>
            </button>

            <button
              id="tab-btn-data"
              onClick={() => setActiveTab('data')}
              className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'data'
                  ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Data Viewer</span>
            </button>

            <button
              id="tab-btn-files"
              onClick={() => setActiveTab('files')}
              className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'files'
                  ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FolderArchive className="w-3.5 h-3.5" />
              <span>Files (/home)</span>
            </button>

            <button
              id="tab-btn-packages"
              onClick={() => setActiveTab('packages')}
              className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'packages'
                  ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Packages</span>
            </button>
            </div>

            {/* Quick Layout Ratio Reset */}
            <div className="hidden xl:flex items-center gap-1 text-[10px] text-slate-400 font-mono pr-2">
              <span className="text-slate-500">幅:</span>
              <button
                onClick={() => setSplitRatio(35)}
                className={`px-1.5 py-0.5 rounded transition-colors ${
                  Math.round(splitRatio) === 35
                    ? 'bg-blue-600 text-white font-bold'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
                title="エディタ 35% / 結果 65%"
              >
                35:65
              </button>
              <button
                onClick={() => setSplitRatio(50)}
                className={`px-1.5 py-0.5 rounded transition-colors ${
                  Math.round(splitRatio) === 50
                    ? 'bg-blue-600 text-white font-bold'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
                title="均等 50:50"
              >
                50:50
              </button>
              <button
                onClick={() => setSplitRatio(65)}
                className={`px-1.5 py-0.5 rounded transition-colors ${
                  Math.round(splitRatio) === 65
                    ? 'bg-blue-600 text-white font-bold'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
                title="エディタ 65% / 結果 35%"
              >
                65:35
              </button>
            </div>
          </div>

          {/* Tab Content Display */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'rmd' && (
              <RmdPreviewPane
                rmdContent={code}
                onRunChunk={handleRunRmdChunk}
                onRunAllChunks={handleRunAllRmdChunks}
                isRunning={status === 'running'}
              />
            )}

            {activeTab === 'console' && (
              <ConsolePane
                outputs={outputs}
                onClear={handleClearConsole}
                onExecuteCommand={handleExecuteReplCommand}
                isRunning={status === 'running'}
              />
            )}

            {activeTab === 'plots' && (
              <PlotGallery plots={plots} onClear={handleClearPlots} />
            )}

            {activeTab === 'docs' && (
              <DocsViewer onInsertCode={handleInsertCodeToEditor} />
            )}

            {activeTab === 'data' && (
              <DataViewer onInsertCode={handleInsertCodeToEditor} />
            )}

            {activeTab === 'files' && (
              <FilesystemManager onInsertCode={handleInsertCodeToEditor} />
            )}

            {activeTab === 'packages' && (
              <PackageManager onInsertCode={handleInsertCodeToEditor} />
            )}
          </div>
        </div>
      </div>

      {/* Sample Library Modal */}
      <SampleModal
        isOpen={isSampleModalOpen}
        onClose={() => setIsSampleModalOpen(false)}
        onSelectSample={handleSelectSample}
      />

      {/* AI Assistant Modal */}
      <AiAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        currentCode={code}
        lastError={lastError}
        onApplyCode={handleApplyAiCode}
      />
    </div>
  );
}
