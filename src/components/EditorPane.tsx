import React, { useRef, useState, useEffect } from 'react';
import { Play, Download, Upload, Copy, Check, Trash2, Code2, Sparkles, FileText, CornerDownLeft, AlertCircle, AlertTriangle, BookOpen, Layers, Plus } from 'lucide-react';
import { lintRCode, LintDiagnostic } from '../lib/rLinter';
import { getRDoc, RDocEntry } from '../lib/rDocs';
import { RDocHoverCard } from './RDocHoverCard';
import { SAMPLE_RMD } from '../lib/rmdParser';

interface EditorPaneProps {
  code: string;
  onChange: (code: string) => void;
  onRunCode: () => void;
  onRunSelection: (selectedCode: string) => void;
  onClear: () => void;
  onOpenAi: () => void;
  isRmd?: boolean;
  onToggleRmd?: (val: boolean) => void;
}

export const EditorPane: React.FC<EditorPaneProps> = ({
  code,
  onChange,
  onRunCode,
  onRunSelection,
  onClear,
  onOpenAi,
  isRmd = false,
  onToggleRmd,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [selectedTextLength, setSelectedTextLength] = useState(0);

  // Syntax Linter state
  const [diagnostics, setDiagnostics] = useState<LintDiagnostic[]>([]);
  
  // Hover Tooltip state
  const [hoverDoc, setHoverDoc] = useState<RDocEntry | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);

  const lines = code.split('\n');
  const lineCount = Math.max(lines.length, 1);

  // Real-time Linting
  useEffect(() => {
    const timer = setTimeout(() => {
      const results = lintRCode(code, isRmd);
      setDiagnostics(results);
    }, 250);
    return () => clearTimeout(timer);
  }, [code, isRmd]);

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  // Step execution: runs current line, chunk, or selection, and advances cursor
  const executeCurrentLineOrSelection = (forceAll: boolean = false) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const text = textarea.value;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    // 1. If text is explicitly selected
    if (!forceAll && start !== end) {
      const selected = text.substring(start, end);
      if (selected.trim()) {
        onRunSelection(selected);
      }
      return;
    }

    // 2. If forceAll is requested
    if (forceAll) {
      onRunCode();
      return;
    }

    // 3. Line-by-line / Chunk step execution
    const textBeforeCursor = text.substring(0, start);
    const currentLineIndex = textBeforeCursor.split('\n').length - 1;
    const allLines = text.split('\n');

    if (currentLineIndex >= allLines.length) {
      onRunCode();
      return;
    }

    // If in Rmd mode and on a chunk header or inside chunk, run chunk
    const currentLine = allLines[currentLineIndex];
    
    // Multi-line continuation check
    let endLineIndex = currentLineIndex;
    let accumulatedCode = currentLine;

    const isContinuation = (s: string) => {
      const trimmed = s.trim();
      if (trimmed.endsWith('+') || trimmed.endsWith('%>%') || trimmed.endsWith('|>') || trimmed.endsWith(',')) return true;
      const openParens = (s.match(/\(/g) || []).length;
      const closeParens = (s.match(/\)/g) || []).length;
      const openBrackets = (s.match(/\{/g) || []).length;
      const closeBrackets = (s.match(/\}/g) || []).length;
      if (openParens > closeParens || openBrackets > closeBrackets) return true;
      return false;
    };

    while (endLineIndex < allLines.length - 1 && isContinuation(accumulatedCode)) {
      endLineIndex++;
      accumulatedCode += '\n' + allLines[endLineIndex];
    }

    const codeToRun = accumulatedCode.trim();
    if (codeToRun && !codeToRun.startsWith('#')) {
      onRunSelection(codeToRun);
    }

    // Advance cursor to next line
    const nextLineIndex = Math.min(endLineIndex + 1, allLines.length);
    let nextPos = 0;
    for (let i = 0; i < nextLineIndex; i++) {
      if (i < allLines.length) {
        nextPos += allLines[i].length + 1;
      }
    }
    if (nextLineIndex >= allLines.length) {
      nextPos = text.length;
    }

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(nextPos, nextPos);
        setSelectedTextLength(0);
      }
    }, 10);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl+Shift+Enter or Cmd+Shift+Enter -> Run entire script
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'Enter') {
      e.preventDefault();
      onRunCode();
      return;
    }

    // Ctrl+Enter or Cmd+Enter -> Step execute current line or selection
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      executeCurrentLineOrSelection(false);
      return;
    }

    // Tab key inserts 2 spaces
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newCode = code.substring(0, start) + '  ' + code.substring(end);
      onChange(newCode);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  // Mouse move handler for Document Hover
  const handleMouseMove = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);

    const textarea = textareaRef.current;
    if (!textarea) return;

    // Approximate token under mouse from cursor coordinates or selection
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    hoverTimerRef.current = setTimeout(() => {
      // Find hovered word using document.caretPositionFromPoint or simple character heuristic
      const selection = window.getSelection();
      let word = '';
      if (selection && selection.toString().trim()) {
        word = selection.toString().trim();
      }

      // If no text selected, try to check word around caret
      if (!word && textarea.selectionStart !== undefined) {
        const text = textarea.value;
        const pos = textarea.selectionStart;
        const left = text.slice(0, pos).search(/[a-zA-Z0-9_.:]+$/);
        const right = text.slice(pos).search(/[^a-zA-Z0-9_.:]/);
        if (left !== -1) {
          const startIdx = left;
          const endIdx = right === -1 ? text.length : pos + right;
          word = text.substring(startIdx, endIdx);
        }
      }

      if (word) {
        const doc = getRDoc(word);
        if (doc) {
          setHoverDoc(doc);
          setHoverPos({ x: mouseX, y: mouseY });
          return;
        }
      }
      setHoverDoc(null);
    }, 400);
  };

  const handleMouseLeave = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    // don't clear immediately to allow hovering into the card
    setTimeout(() => {
      setHoverDoc(null);
    }, 1200);
  };

  const handleSelect = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      setSelectedTextLength(textarea.selectionEnd - textarea.selectionStart);
      const selected = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd).trim();
      if (selected) {
        const doc = getRDoc(selected);
        if (doc) {
          const rect = textarea.getBoundingClientRect();
          setHoverDoc(doc);
          setHoverPos({ x: rect.left + 80, y: rect.top + 60 });
        }
      }
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = isRmd ? 'analysis_report.Rmd' : 'script.R';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.name.endsWith('.Rmd') || file.name.endsWith('.md')) {
      onToggleRmd?.(true);
    } else if (file.name.endsWith('.R')) {
      onToggleRmd?.(false);
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content !== undefined) {
        onChange(content);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const insertChunk = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const chunkText = `\n\`\`\`{r}\n# Rコードを記述\nhead(iris)\n\`\`\`\n`;
    const newCode = code.substring(0, start) + chunkText + code.substring(start);
    onChange(newCode);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + chunkText.length - 5, start + chunkText.length - 5);
    }, 10);
  };

  // Map diagnostics to line numbers for gutter indicators
  const diagnosticsByLine: Record<number, LintDiagnostic[]> = {};
  diagnostics.forEach((d) => {
    if (!diagnosticsByLine[d.line]) diagnosticsByLine[d.line] = [];
    diagnosticsByLine[d.line].push(d);
  });

  const errorCount = diagnostics.filter((d) => d.severity === 'error').length;
  const warningCount = diagnostics.filter((d) => d.severity === 'warning').length;

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden text-xs relative font-sans">
      {/* High Density Toolbar */}
      <div className="h-8 bg-[#F9FAFB] border-b border-[#E5E7EB] flex items-center justify-between px-3 text-[#475569] shrink-0">
        <div className="flex items-center space-x-2">
          <Code2 className="w-3.5 h-3.5 text-[#2563EB]" />
          
          {/* File Mode Selector: .R vs .Rmd */}
          <div className="flex items-center bg-[#E2E8F0] p-0.5 rounded text-[10px] font-mono">
            <button
              onClick={() => onToggleRmd?.(false)}
              className={`px-1.5 py-0.2 rounded font-medium transition-colors cursor-pointer ${
                !isRmd ? 'bg-white text-[#2563EB] shadow-2xs font-bold' : 'text-[#64748B] hover:text-[#1E293B]'
              }`}
              title="Rスクリプトモード (.R)"
            >
              script.R
            </button>
            <button
              onClick={() => {
                onToggleRmd?.(true);
                if (!code.includes('```{r')) {
                  onChange(SAMPLE_RMD);
                }
              }}
              className={`px-1.5 py-0.2 rounded font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                isRmd ? 'bg-[#2563EB] text-white shadow-2xs font-bold' : 'text-[#64748B] hover:text-[#1E293B]'
              }`}
              title="R Markdown レポートモード (.Rmd)"
            >
              <span>report.Rmd</span>
              <span className="text-[8px] bg-amber-400 text-slate-950 px-1 rounded font-sans font-bold">Rmd</span>
            </button>
          </div>

          <span className="text-[10px] text-[#94A3B8]">
            ({lineCount} 行)
          </span>

          {/* Real-time Syntax Diagnostic Badge */}
          {errorCount > 0 ? (
            <div
              className="flex items-center gap-1 px-1.5 py-0.2 bg-rose-50 text-rose-700 border border-rose-200 rounded text-[10px] font-sans font-medium"
              title={diagnostics.map((d) => `行 ${d.line}: ${d.message}`).join('\n')}
            >
              <AlertCircle className="w-3 h-3 text-rose-600" />
              <span>構文エラー {errorCount}件</span>
            </div>
          ) : warningCount > 0 ? (
            <div
              className="flex items-center gap-1 px-1.5 py-0.2 bg-amber-50 text-amber-700 border border-amber-200 rounded text-[10px] font-sans font-medium"
              title={diagnostics.map((d) => `行 ${d.line}: ${d.message}`).join('\n')}
            >
              <AlertTriangle className="w-3 h-3 text-amber-600" />
              <span>警告 {warningCount}件</span>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-1 text-emerald-600 text-[10px] font-sans">
              <Check className="w-3 h-3" />
              <span>構文OK</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-1">
          {/* Insert Chunk button (if Rmd) */}
          {isRmd && (
            <button
              onClick={insertChunk}
              className="flex items-center gap-1 px-2 py-0.5 bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#2563EB] border border-[#BFDBFE] rounded text-[10px] font-medium transition-colors cursor-pointer shadow-2xs"
              title="Rコードチャンク (```{r} ... ```) を挿入"
            >
              <Plus className="w-2.5 h-2.5" />
              <span>+ チャンク</span>
            </button>
          )}

          {/* 1 Line Run */}
          <button
            onClick={() => executeCurrentLineOrSelection(false)}
            className="flex items-center gap-1 px-2 py-0.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded text-[10px] font-medium transition-colors cursor-pointer shadow-2xs"
            title="カーソル行/選択範囲を実行して次行へ進む (Ctrl+Enter)"
          >
            <Play className="w-2.5 h-2.5 fill-current" />
            <span>1行実行</span>
            <kbd className="hidden sm:inline-block px-1 py-0.2 text-[8px] bg-black/20 rounded font-mono">
              Ctrl+↵
            </kbd>
          </button>

          {/* Run All */}
          <button
            onClick={() => onRunCode()}
            className="flex items-center gap-1 px-1.5 py-0.5 bg-white hover:bg-[#F1F5F9] text-[#334155] border border-[#CBD5E1] rounded text-[10px] font-medium transition-colors cursor-pointer shadow-2xs"
            title="スクリプト全体を実行 (Ctrl+Shift+Enter)"
          >
            <span>全行実行</span>
          </button>

          {/* Quick Snippets */}
          <select
            id="snippet-select"
            onChange={(e) => {
              if (e.target.value) {
                onChange(code + '\n\n' + e.target.value);
                e.target.value = '';
              }
            }}
            defaultValue=""
            className="bg-white border border-[#CBD5E1] text-[#334155] text-[10px] rounded px-2 py-0.5 outline-none hover:bg-slate-50 cursor-pointer shadow-2xs font-sans"
          >
            <option value="" disabled>
              + スニペット
            </option>
            <option value="summary(iris)">summary() - 要約統計量</option>
            <option value="head(mtcars, 10)">head() - データ先頭表示</option>
            <option value={'plot(x, y, main="散布図", col="blue", pch=19)'}>plot() - 散布図描画</option>
            <option value={'hist(rnorm(1000), breaks=30, col="skyblue", main="正規分布")'}>hist() - ヒストグラム</option>
            <option value={'t.test(val ~ group, data = df)'}>t.test() - t検定</option>
            <option value={'model <- lm(mpg ~ wt + hp, data = mtcars)\nsummary(model)'}>lm() - 重回帰分析</option>
            <option value={'library(ggplot2)\nggplot(iris, aes(x = Sepal.Length, y = Petal.Length, color = Species)) + geom_point()'}>ggplot2 - 散布図</option>
            <option value={'df <- read.csv("sample_sales.csv")'}>read.csv() - CSV読込</option>
          </select>

          {/* Run Selection if selected */}
          {selectedTextLength > 0 && (
            <button
              onClick={() => {
                const textarea = textareaRef.current;
                if (textarea) {
                  const selected = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
                  onRunSelection(selected);
                }
              }}
              className="flex items-center gap-1 px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-medium transition-colors cursor-pointer shadow-2xs"
              title="選択したコードのみを実行"
            >
              <CornerDownLeft className="w-2.5 h-2.5" />
              <span>選択範囲を実行</span>
            </button>
          )}

          {/* Copy */}
          <button
            onClick={handleCopy}
            className="p-1 rounded hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A] transition-colors cursor-pointer"
            title="コード全体をコピー"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
          </button>

          {/* Upload */}
          <label
            className="p-1 rounded hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A] transition-colors cursor-pointer"
            title="ファイル (.R, .Rmd) を開く"
          >
            <Upload className="w-3 h-3" />
            <input type="file" accept=".R,.r,.txt,.Rmd,.rmd,.md" onChange={handleFileUpload} className="hidden" />
          </label>

          {/* Download */}
          <button
            onClick={handleDownload}
            className="p-1 rounded hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A] transition-colors cursor-pointer"
            title={isRmd ? 'analysis_report.Rmd を保存' : 'script.R を保存'}
          >
            <Download className="w-3 h-3" />
          </button>

          {/* Clear */}
          <button
            onClick={onClear}
            className="p-1 rounded hover:bg-rose-50 text-[#64748B] hover:text-rose-600 transition-colors cursor-pointer"
            title="エディタをクリア"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Editor Body with Line Numbers & Linter Gutter */}
      <div className="flex-1 flex overflow-hidden bg-white relative">
        {/* Line Numbers + Gutter */}
        <div
          ref={lineNumbersRef}
          className="w-12 py-3 bg-[#F8FAFC] border-r border-[#E5E7EB] text-[#94A3B8] font-mono text-xs select-none overflow-hidden text-right pr-2 shrink-0 leading-5"
        >
          {Array.from({ length: lineCount }).map((_, i) => {
            const lineNum = i + 1;
            const lineDiags = diagnosticsByLine[lineNum];
            const hasError = lineDiags?.some((d) => d.severity === 'error');
            const hasWarning = lineDiags?.some((d) => d.severity === 'warning');

            return (
              <div key={i} className="flex items-center justify-end space-x-1 h-5">
                {hasError ? (
                  <span className="w-2 h-2 rounded-full bg-rose-500 inline-block shrink-0" title={lineDiags?.[0]?.message} />
                ) : hasWarning ? (
                  <span className="w-2 h-2 rounded-full bg-amber-500 inline-block shrink-0" title={lineDiags?.[0]?.message} />
                ) : null}
                <span className={hasError ? 'text-rose-600 font-bold' : hasWarning ? 'text-amber-600' : ''}>
                  {lineNum}
                </span>
              </div>
            );
          })}
        </div>

        {/* Textarea Code Input with Hover Tooltip Trigger */}
        <textarea
          id="r-script-editor"
          ref={textareaRef}
          value={code}
          onChange={(e) => onChange(e.target.value)}
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
          onSelect={handleSelect}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          placeholder={
            isRmd
              ? "--- \ntitle: 'My Report'\n---\n\n```{r}\n# R Markdown コードを記述\nhead(iris)\n```"
              : "# Rコードを入力してください\n# [Ctrl+Enter] で1行実行＆次行へ進みます\n# 関数名（ggplot, lm, summary等）にマウスホバーでドキュメント表示\n"
          }
          className="flex-1 p-3 bg-white text-[#1E293B] font-mono text-xs leading-5 resize-none outline-none overflow-auto selection:bg-[#BFDBFE] tab-size-2"
        />

        {/* Document Hover Popover Card */}
        {hoverDoc && hoverPos && (
          <RDocHoverCard
            doc={hoverDoc}
            position={hoverPos}
            onInsertExample={(ex) => {
              onChange(code + '\n\n' + ex);
            }}
            onClose={() => setHoverDoc(null)}
          />
        )}
      </div>

      {/* Editor Status Bar & Linter Message */}
      <div className="px-3 py-1 bg-[#F8FAFC] border-t border-[#E5E7EB] flex items-center justify-between text-[10px] text-[#64748B] font-sans">
        <div className="flex items-center space-x-3 overflow-hidden">
          {diagnostics.length > 0 ? (
            <div className="flex items-center gap-1.5 text-rose-700 font-medium truncate">
              <AlertCircle className="w-3 h-3 text-rose-600 shrink-0" />
              <span className="truncate">
                行 {diagnostics[0].line}: {diagnostics[0].message}
              </span>
            </div>
          ) : (
            <>
              <span>
                ショートカット: <kbd className="px-1 py-0.2 bg-white border border-[#CBD5E1] rounded text-[#2563EB] font-mono font-medium">Ctrl+Enter</kbd> 1行実行
              </span>
              <span>
                <kbd className="px-1 py-0.2 bg-white border border-[#CBD5E1] rounded text-[#475569] font-mono">Ctrl+Shift+Enter</kbd> 全行実行
              </span>
            </>
          )}
        </div>

        <button
          onClick={onOpenAi}
          className="flex items-center gap-1 text-[#2563EB] hover:text-[#1D4ED8] font-medium cursor-pointer shrink-0"
        >
          <Sparkles className="w-3 h-3" />
          <span>AI支援</span>
        </button>
      </div>
    </div>
  );
};
