import React from 'react';
import { Play, Square, RotateCcw, Trash2, Sparkles, BookOpen, Layers, Terminal, Database, FolderArchive, Package, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { WebRStatus } from '../types';

interface HeaderProps {
  status: WebRStatus;
  onRunCode: () => void;
  onInterrupt: () => void;
  onRestart: () => void;
  onClearConsole: () => void;
  onOpenSamples: () => void;
  onOpenAi: () => void;
  activeTab: 'console' | 'plots' | 'data' | 'files' | 'packages' | 'rmd' | 'docs';
  setActiveTab: (tab: 'console' | 'plots' | 'data' | 'files' | 'packages' | 'rmd' | 'docs') => void;
  plotCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  status,
  onRunCode,
  onInterrupt,
  onRestart,
  onClearConsole,
  onOpenSamples,
  onOpenAi,
  activeTab,
  setActiveTab,
  plotCount,
}) => {
  return (
    <header id="app-header" className="h-10 bg-[#1E293B] flex items-center justify-between px-3 text-white border-b border-[#334155] select-none shrink-0 z-20">
      {/* Left: Brand & Navigation Menus */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-[#2563EB] rounded flex items-center justify-center font-bold text-xs text-white shadow-sm">
            R
          </div>
          <span className="font-semibold text-sm tracking-tight text-white">WebR Studio</span>
        </div>

        {/* IDE Navigation Bar */}
        <nav className="hidden md:flex items-center gap-4 text-[12px] text-[#94A3B8]">
          <button onClick={onOpenSamples} className="hover:text-white transition-colors cursor-pointer flex items-center gap-1">
            <span>Samples</span>
          </button>
          <button onClick={onOpenAi} className="hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-indigo-300 hover:text-indigo-100">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span>AI Assist</span>
          </button>
          <button onClick={onRestart} className="hover:text-white transition-colors cursor-pointer flex items-center gap-1" title="Restart R session">
            <span>Session</span>
          </button>
          <button onClick={onClearConsole} className="hover:text-white transition-colors cursor-pointer">
            <span>Clear</span>
          </button>
        </nav>
      </div>

      {/* Right: Engine Status & Primary Actions */}
      <div className="flex items-center gap-3">
        {/* Status Indicator */}
        <div className="flex items-center gap-2 bg-[#0F172A] px-2.5 py-1 rounded border border-[#334155]">
          {status === 'loading' && (
            <>
              <Loader2 className="w-2.5 h-2.5 text-amber-400 animate-spin" />
              <span className="text-[10px] text-amber-400 font-mono">WebAssembly: Initializing</span>
            </>
          )}
          {status === 'ready' && (
            <>
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
              <span className="text-[10px] text-emerald-400 font-mono">WebAssembly: Active (R 4.2.1)</span>
            </>
          )}
          {status === 'running' && (
            <>
              <Loader2 className="w-2.5 h-2.5 text-blue-400 animate-spin" />
              <span className="text-[10px] text-blue-400 font-mono">Running Script...</span>
            </>
          )}
          {status === 'error' && (
            <button
              onClick={onRestart}
              className="flex items-center gap-1 text-[10px] text-rose-400 font-mono hover:underline"
            >
              <AlertCircle className="w-2.5 h-2.5 text-rose-400" />
              <span>Error (Click to Restart)</span>
            </button>
          )}
        </div>

        {/* Quick Sample/AI buttons on small screens */}
        <div className="flex md:hidden items-center gap-1">
          <button
            onClick={onOpenSamples}
            className="p-1 rounded bg-[#334155] text-slate-200 hover:bg-[#475569] text-xs"
            title="Samples"
          >
            <BookOpen className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onOpenAi}
            className="p-1 rounded bg-indigo-900/60 text-indigo-300 hover:bg-indigo-800 text-xs"
            title="AI Assistant"
          >
            <Sparkles className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Action Button */}
        {status === 'running' ? (
          <button
            id="btn-interrupt"
            onClick={onInterrupt}
            className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white px-3 py-1 rounded text-xs font-medium transition-colors shadow-sm cursor-pointer"
            title="実行を強制中断"
          >
            <Square className="w-3 h-3 fill-current" />
            <span>中断</span>
          </button>
        ) : (
          <button
            id="btn-run-code"
            onClick={onRunCode}
            disabled={status === 'loading'}
            className="flex items-center gap-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 text-white px-3 py-1 rounded text-xs font-medium transition-colors shadow-sm cursor-pointer"
            title="スクリプト全体を実行 (Ctrl+Shift+Enter)"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>スクリプト実行</span>
            <kbd className="hidden lg:inline-block ml-0.5 px-1 py-0.2 text-[9px] bg-black/25 rounded text-blue-100 font-mono">
              全行
            </kbd>
          </button>
        )}
      </div>
    </header>
  );
};
