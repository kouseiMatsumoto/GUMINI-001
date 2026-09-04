import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Trash2, Copy, Check, CornerDownLeft, Sparkles } from 'lucide-react';
import { ConsoleOutputItem } from '../types';

interface ConsolePaneProps {
  outputs: ConsoleOutputItem[];
  onClear: () => void;
  onExecuteCommand: (cmd: string) => void;
  isRunning: boolean;
}

const QUICK_COMMANDS = [
  { label: 'ls()', cmd: 'ls()', desc: 'オブジェクト一覧' },
  { label: 'sessionInfo()', cmd: 'sessionInfo()', desc: '環境情報' },
  { label: 'summary(iris)', cmd: 'summary(iris)', desc: 'データ要約' },
  { label: 'rnorm(5)', cmd: 'rnorm(5)', desc: '正規乱数5個' },
  { label: 'plot(1:10)', cmd: 'plot(1:10, col="blue", pch=19, main="Quick Plot")', desc: 'クイック描画' },
];

export const ConsolePane: React.FC<ConsolePaneProps> = ({
  outputs,
  onClear,
  onExecuteCommand,
  isRunning,
}) => {
  const [commandInput, setCommandInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [copied, setCopied] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom when new output arrives
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [outputs, autoScroll]);

  // Focus input automatically on mount and whenever clicking the console area
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleContainerClick = (e: React.MouseEvent) => {
    // If the user is selecting text, do not steal focus
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) return;
    
    // Avoid re-focusing if clicked on button
    if ((e.target as HTMLElement).closest('button')) return;

    inputRef.current?.focus();
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cmd = commandInput.trim();
    if (!cmd || isRunning) return;

    // Add to history
    setHistory((prev) => [...prev, cmd]);
    setHistoryIndex(-1);
    setCommandInput('');

    onExecuteCommand(cmd);

    // Keep focus after executing
    setTimeout(() => {
      inputRef.current?.focus();
    }, 10);
  };

  const handleQuickCommand = (cmd: string) => {
    if (isRunning) return;
    setHistory((prev) => [...prev, cmd]);
    setHistoryIndex(-1);
    onExecuteCommand(cmd);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length === 0) return;
      const nextIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIndex);
      setCommandInput(history[nextIndex]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === -1) return;
      const nextIndex = historyIndex + 1;
      if (nextIndex >= history.length) {
        setHistoryIndex(-1);
        setCommandInput('');
      } else {
        setHistoryIndex(nextIndex);
        setCommandInput(history[nextIndex]);
      }
    }
  };

  const handleCopyAll = () => {
    const text = outputs.map((o) => (o.type === 'input' ? `> ${o.text}` : o.text)).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      onClick={handleContainerClick}
      className="flex flex-col h-full bg-[#1E293B] text-[#E2E8F0] font-mono text-xs overflow-hidden cursor-text"
    >
      {/* High Density Console Top Toolbar */}
      <div className="h-8 bg-[#0F172A] border-b border-[#334155] flex items-center justify-between px-3 text-[#94A3B8] shrink-0 select-none">
        <div className="flex items-center space-x-2">
          <Terminal className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-mono text-[10px] text-[#94A3B8] uppercase tracking-wider font-semibold">R Console (REPL)</span>
          <span className="text-[10px] text-[#64748B]">
            ({outputs.length} ログ)
          </span>
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`px-1.5 py-0.5 rounded text-[10px] font-sans border transition-colors cursor-pointer ${
              autoScroll
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                : 'bg-[#1E293B] text-[#64748B] border-[#334155]'
            }`}
            title="自動スクロール切替"
          >
            自動スクロール: {autoScroll ? 'ON' : 'OFF'}
          </button>

          <button
            onClick={handleCopyAll}
            className="p-1 rounded hover:bg-[#334155] text-[#94A3B8] hover:text-white transition-colors cursor-pointer"
            title="コンソール全体をコピー"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={onClear}
            className="p-1 rounded hover:bg-rose-950/50 text-[#94A3B8] hover:text-rose-400 transition-colors cursor-pointer"
            title="コンソールログを消去"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Quick Command Chips */}
      <div className="px-3 py-1 bg-[#182234] border-b border-[#334155]/60 flex items-center gap-1.5 overflow-x-auto text-[10px] shrink-0 select-none">
        <span className="text-[#64748B] font-sans whitespace-nowrap">クイック実行:</span>
        {QUICK_COMMANDS.map((qc) => (
          <button
            key={qc.cmd}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleQuickCommand(qc.cmd);
            }}
            disabled={isRunning}
            className="px-1.5 py-0.2 bg-[#0F172A] hover:bg-[#2563EB]/30 text-[#93C5FD] hover:text-white border border-[#334155] hover:border-[#3B82F6] rounded font-mono transition-colors disabled:opacity-40 cursor-pointer whitespace-nowrap"
            title={qc.desc}
          >
            {qc.label}
          </button>
        ))}
      </div>

      {/* Outputs Stream */}
      <div
        ref={scrollRef}
        className="flex-1 p-3 overflow-y-auto space-y-1 select-text selection:bg-[#2563EB]/50 font-mono text-[12px] leading-relaxed"
      >
        <div className="text-[#94A3B8] italic text-[11px] pb-1 border-b border-[#334155]/60 mb-2 select-none">
          WebR (R version 4.2.1 WebAssembly) -- Interactive REPL (対話型コンソール)
        </div>

        {outputs.length === 0 ? (
          <div className="py-8 flex flex-col items-center justify-center text-[#64748B] space-y-1.5 select-none">
            <Terminal className="w-6 h-6 opacity-40" />
            <p className="text-xs">Rの実行結果・標準出力がここにリアルタイムで表示されます</p>
            <p className="text-[10px] text-[#475569]">下の入力欄にRコードを入力して Enter を押すか、エディタで [Ctrl+Enter] を押してください</p>
          </div>
        ) : (
          outputs.map((item) => {
            if (item.type === 'input') {
              return (
                <div key={item.id} className="flex items-start space-x-1.5 text-sky-400 font-semibold pt-0.5">
                  <span className="select-none text-sky-500 font-bold">{'>'}</span>
                  <pre className="font-mono whitespace-pre-wrap break-all flex-1">{item.text}</pre>
                </div>
              );
            }
            if (item.type === 'error') {
              return (
                <div key={item.id} className="p-2 rounded bg-rose-950/40 border border-rose-900/60 text-rose-300 font-mono text-[11px] whitespace-pre-wrap break-all">
                  {item.text}
                </div>
              );
            }
            if (item.type === 'stderr' || item.type === 'warning') {
              return (
                <div key={item.id} className="text-amber-300/90 whitespace-pre-wrap break-all text-[11px]">
                  {item.text}
                </div>
              );
            }
            if (item.type === 'info') {
              return (
                <div key={item.id} className="text-cyan-400 text-[11px] italic bg-[#0F172A] px-2 py-0.5 rounded border border-[#334155]">
                  {item.text}
                </div>
              );
            }
            return (
              <pre key={item.id} className="text-[#E2E8F0] font-mono whitespace-pre-wrap break-all leading-snug">
                {item.text}
              </pre>
            );
          })
        )}
      </div>

      {/* REPL Interactive Direct Input Prompt */}
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="flex items-center px-3 py-2 bg-[#0F172A] border-t-2 border-[#2563EB]/70 shadow-inner shrink-0 relative focus-within:border-[#3B82F6] transition-colors"
      >
        <span className="text-emerald-400 font-mono font-bold mr-2 text-sm select-none animate-pulse">{'>'}</span>
        <input
          id="r-repl-input"
          ref={inputRef}
          type="text"
          value={commandInput}
          onChange={(e) => setCommandInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isRunning}
          autoComplete="off"
          autoFocus
          placeholder={isRunning ? "コードを実行中..." : "Rコマンドを直接入力 (例: 1+1, summary(mtcars), sample(1:100, 5)) [Enterで実行, ↑↓で履歴]"}
          className="flex-1 bg-transparent text-[#F1F5F9] placeholder-[#64748B] font-mono text-xs md:text-[13px] outline-none"
        />
        <div className="flex items-center gap-1.5 ml-2">
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] bg-[#1E293B] text-[#94A3B8] border border-[#334155] rounded font-mono select-none">
            Enter ↵
          </kbd>
          <button
            type="submit"
            disabled={isRunning || !commandInput.trim()}
            className="p-1 px-2 rounded bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-[#334155] disabled:text-[#64748B] text-white transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
            title="送信して実行 (Enter)"
          >
            <CornerDownLeft className="w-3.5 h-3.5" />
            <span className="hidden md:inline text-[10px]">実行</span>
          </button>
        </div>
      </form>
    </div>
  );
};
