import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Play, FileText, CheckCircle2, Loader2, Download, Printer, RefreshCw, Sparkles, Layers } from 'lucide-react';
import { parseRmd, RmdChunk } from '../lib/rmdParser';

interface RmdPreviewPaneProps {
  rmdContent: string;
  onRunChunk: (code: string, chunkId: string) => Promise<{ output: string; plotUrl?: string }>;
  onRunAllChunks: () => void;
  isRunning: boolean;
}

export const RmdPreviewPane: React.FC<RmdPreviewPaneProps> = ({
  rmdContent,
  onRunChunk,
  onRunAllChunks,
  isRunning,
}) => {
  const parsed = parseRmd(rmdContent);
  const [chunkResults, setChunkResults] = useState<Record<string, { output?: string; plotUrl?: string; running?: boolean }>>({});

  const handleExecuteChunk = async (chunk: RmdChunk) => {
    setChunkResults((prev) => ({
      ...prev,
      [chunk.id]: { ...prev[chunk.id], running: true },
    }));

    try {
      const res = await onRunChunk(chunk.code, chunk.id);
      setChunkResults((prev) => ({
        ...prev,
        [chunk.id]: { output: res.output, plotUrl: res.plotUrl, running: false },
      }));
    } catch (err: any) {
      setChunkResults((prev) => ({
        ...prev,
        [chunk.id]: { output: `Error: ${err.message}`, running: false },
      }));
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC] overflow-hidden font-sans text-xs">
      {/* Top Toolbar */}
      <div className="h-8 bg-white border-b border-[#E5E7EB] flex items-center justify-between px-3 text-[#475569] shrink-0 shadow-2xs">
        <div className="flex items-center space-x-2">
          <FileText className="w-3.5 h-3.5 text-[#2563EB]" />
          <span className="font-semibold text-[10px] uppercase text-[#1E293B] tracking-wider">
            R Markdown レポートプレビュー & Knit
          </span>
          {parsed.chunks.length > 0 && (
            <span className="px-1.5 py-0.2 bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] text-[9px] rounded font-mono">
              {parsed.chunks.length} 個のコードチャンク
            </span>
          )}
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={onRunAllChunks}
            disabled={isRunning}
            className="flex items-center gap-1 px-2.5 py-0.5 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-40 text-white rounded text-[10px] font-medium transition-colors cursor-pointer shadow-2xs"
            title="すべてのRチャンクを順次実行してレポートを更新 (Knit)"
          >
            {isRunning ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3 fill-current" />}
            <span>全チャンク Knit 実行</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1 px-2 py-0.5 bg-white hover:bg-[#F1F5F9] text-[#334155] border border-[#CBD5E1] rounded text-[10px] font-medium transition-colors cursor-pointer shadow-2xs"
            title="レポートを印刷またはPDF保存"
          >
            <Printer className="w-3 h-3" />
            <span>印刷 / PDF</span>
          </button>
        </div>
      </div>

      {/* Report Document Body */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#F1F5F9] flex justify-center">
        <div className="w-full max-w-3xl bg-white border border-[#CBD5E1] rounded-xl p-6 md:p-8 shadow-sm text-[#1E293B] space-y-6">
          {/* Document Metadata Header */}
          {(parsed.title || parsed.author || parsed.date) && (
            <div className="pb-4 border-b border-[#E2E8F0] space-y-1">
              {parsed.title && (
                <h1 className="text-xl md:text-2xl font-bold text-[#0F172A] tracking-tight">
                  {parsed.title}
                </h1>
              )}
              <div className="flex flex-wrap items-center gap-3 text-xs text-[#64748B]">
                {parsed.author && <span>著者: <strong>{parsed.author}</strong></span>}
                {parsed.date && <span>日付: {parsed.date}</span>}
                <span className="px-1.5 py-0.2 bg-[#F1F5F9] border border-[#E2E8F0] rounded text-[10px] font-mono">
                  output: html_document
                </span>
              </div>
            </div>
          )}

          {/* Markdown Content with Interactive Embedded R Chunks */}
          <div className="prose prose-slate max-w-none text-xs leading-relaxed space-y-4">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => (
                  <h2 className="text-lg font-bold text-[#0F172A] border-b border-[#E2E8F0] pb-1 mt-6 mb-3">
                    {children}
                  </h2>
                ),
                h2: ({ children }) => (
                  <h3 className="text-sm font-bold text-[#1E293B] mt-4 mb-2">
                    {children}
                  </h3>
                ),
                h3: ({ children }) => (
                  <h4 className="text-xs font-semibold text-[#334155] mt-3 mb-1">
                    {children}
                  </h4>
                ),
                p: ({ children }) => <p className="text-xs text-[#334155] mb-2 leading-relaxed">{children}</p>,
                ul: ({ children }) => <ul className="list-disc pl-4 space-y-1 text-xs text-[#334155] mb-3">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-4 space-y-1 text-xs text-[#334155] mb-3">{children}</ol>,
                table: ({ children }) => (
                  <div className="overflow-x-auto my-3 border border-[#CBD5E1] rounded">
                    <table className="w-full text-left text-xs divide-y divide-[#E2E8F0]">{children}</table>
                  </div>
                ),
                th: ({ children }) => <th className="bg-[#F8FAFC] p-2 font-semibold text-[#1E293B]">{children}</th>,
                td: ({ children }) => <td className="p-2 border-t border-[#F1F5F9]">{children}</td>,
                code: ({ className, children, ...props }) => {
                  const match = /language-(\w+)/.exec(className || '');
                  const isRChunk = match && (match[1] === 'r' || match[1] === 'R');

                  if (isRChunk) {
                    const codeStr = String(children).replace(/\n$/, '');
                    // Find corresponding chunk
                    const chunk = parsed.chunks.find((c) => c.code.trim() === codeStr.trim()) || {
                      id: `chunk-custom`,
                      name: 'r_chunk',
                      options: '',
                      code: codeStr,
                      startLine: 0,
                      endLine: 0,
                    };

                    const result = chunkResults[chunk.id];

                    return (
                      <div className="my-4 border border-[#CBD5E1] rounded-lg overflow-hidden shadow-2xs font-mono">
                        {/* Chunk Top Bar */}
                        <div className="bg-[#1E293B] px-3 py-1.5 flex items-center justify-between text-[#94A3B8] text-[10px]">
                          <div className="flex items-center space-x-2">
                            <span className="text-[#38BDF8] font-bold">```{'{r ' + (chunk.name || '') + '}'}</span>
                          </div>
                          <button
                            onClick={() => handleExecuteChunk(chunk)}
                            disabled={result?.running || isRunning}
                            className="flex items-center gap-1 px-2 py-0.5 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 text-white rounded text-[9px] font-medium transition-colors cursor-pointer"
                          >
                            {result?.running ? (
                              <Loader2 className="w-2.5 h-2.5 animate-spin" />
                            ) : (
                              <Play className="w-2.5 h-2.5 fill-current" />
                            )}
                            <span>チャンク実行</span>
                          </button>
                        </div>

                        {/* Chunk Code Display */}
                        <pre className="p-3 bg-[#0F172A] text-[#E2E8F0] text-[11px] overflow-x-auto m-0">
                          {codeStr}
                        </pre>

                        {/* Chunk Output (if any) */}
                        {result?.output && (
                          <div className="border-t border-[#334155] bg-[#182234] p-3 text-[10px]">
                            <div className="text-[#94A3B8] font-semibold text-[9px] mb-1">
                              [Output / 実行結果]:
                            </div>
                            <pre className="text-[#86EFAC] whitespace-pre-wrap font-mono m-0">
                              {result.output}
                            </pre>
                          </div>
                        )}

                        {/* Chunk Plot (if any) */}
                        {result?.plotUrl && (
                          <div className="border-t border-[#CBD5E1] bg-white p-3 flex flex-col items-center">
                            <img
                              src={result.plotUrl}
                              alt="Chunk Plot"
                              className="max-h-72 rounded border border-[#E2E8F0] shadow-2xs"
                            />
                          </div>
                        )}
                      </div>
                    );
                  }

                  return (
                    <code className="bg-[#F1F5F9] text-[#2563EB] px-1 py-0.5 rounded font-mono text-[11px]" {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {parsed.rawMarkdown}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
};
