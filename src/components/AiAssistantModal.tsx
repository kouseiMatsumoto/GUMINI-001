import React, { useState } from 'react';
import { Sparkles, X, Send, Play, Copy, Check, CornerDownLeft, AlertCircle, Wrench, BookOpen, Lightbulb, Loader2 } from 'lucide-react';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCode: string;
  lastError: string | null;
  onApplyCode: (code: string, mode: 'replace' | 'append') => void;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  currentCode,
  lastError,
  onApplyCode,
}) => {
  const [tab, setTab] = useState<'generate' | 'explain' | 'fix'>('generate');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const quickPrompts = [
    'ggplot2で相関行列のヒートマップを作成して',
    'irisデータセットで3品種の分散分析(ANOVA)を実行して',
    '時系列データの指数平滑化と予測グラフを描画して',
    '欠損値(NA)の補完と外れ値検出のコードを書いて',
    'mtcarsを使って重回帰分析とAICモデル選択を行って',
  ];

  const handleSend = async (taskOverride?: 'generate' | 'explain' | 'fix', promptOverride?: string) => {
    const activeTask = taskOverride || tab;
    const activePrompt = promptOverride || prompt;

    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch('/api/gemini/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: activeTask,
          prompt: activePrompt,
          code: currentCode,
          error: lastError,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setResponse(data.text);
      } else {
        setResponse(`エラー: ${data.error || 'AI応答の取得に失敗しました'}`);
      }
    } catch (e: any) {
      setResponse(`通信エラー: ${e?.message || 'サーバーに接続できませんでした'}`);
    } finally {
      setLoading(false);
    }
  };

  const extractRCode = (text: string): string => {
    const codeBlockMatch = text.match(/```(?:r|R)?\n([\s\S]*?)```/);
    if (codeBlockMatch && codeBlockMatch[1]) {
      return codeBlockMatch[1].trim();
    }
    return text.trim();
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-[#CBD5E1] rounded-xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E7EB] bg-[#F9FAFB] shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center border border-[#BFDBFE]">
              <Sparkles className="w-4 h-4 text-[#2563EB]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#1E293B] flex items-center gap-1.5">
                Gemini AI R Assistant
              </h2>
              <p className="text-[11px] text-[#64748B]">Generate R scripts, statistical explanations, and automated bug fixes</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Tabs */}
        <div className="flex items-center space-x-1 px-4 py-2 border-b border-[#E5E7EB] bg-[#F8FAFC] text-xs shrink-0">
          <button
            onClick={() => {
              setTab('generate');
              setResponse(null);
            }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
              tab === 'generate' ? 'bg-[#2563EB] text-white shadow-2xs' : 'text-[#64748B] hover:text-[#1E293B] hover:bg-[#F1F5F9]'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            Generate Code
          </button>
          <button
            onClick={() => {
              setTab('explain');
              setResponse(null);
              handleSend('explain');
            }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
              tab === 'explain' ? 'bg-[#2563EB] text-white shadow-2xs' : 'text-[#64748B] hover:text-[#1E293B] hover:bg-[#F1F5F9]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Explain Code
          </button>
          <button
            onClick={() => {
              setTab('fix');
              setResponse(null);
              handleSend('fix');
            }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
              tab === 'fix' ? 'bg-[#2563EB] text-white shadow-2xs' : 'text-[#64748B] hover:text-[#1E293B] hover:bg-[#F1F5F9]'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            Diagnose & Fix
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#F8FAFC] text-xs text-[#334155]">
          {tab === 'generate' && (
            <div>
              <label className="block text-xs font-semibold text-[#1E293B] mb-1.5">
                Describe the analysis, visualization, or simulation you need:
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  placeholder="e.g., Create a ggplot2 correlation heatmap with hierarchical clustering..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend('generate')}
                  className="flex-1 bg-white border border-[#CBD5E1] text-[#1E293B] placeholder-[#94A3B8] rounded px-3 py-1.5 text-xs outline-none focus:border-[#2563EB] transition-colors"
                />
                <button
                  onClick={() => handleSend('generate')}
                  disabled={loading || !prompt.trim()}
                  className="px-3.5 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-40 text-white font-medium rounded text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                >
                  {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                  <span>Generate</span>
                </button>
              </div>

              {/* Quick suggestions */}
              <div className="mb-2">
                <span className="text-[10px] text-[#64748B] block mb-1">Suggested prompts:</span>
                <div className="flex flex-wrap gap-1.5">
                  {quickPrompts.map((q) => (
                    <button
                      key={q}
                      onClick={() => {
                        setPrompt(q);
                        handleSend('generate', q);
                      }}
                      className="px-2 py-0.5 rounded bg-white hover:bg-[#EFF6FF] text-[#475569] hover:text-[#2563EB] border border-[#CBD5E1] text-[10px] text-left transition-colors cursor-pointer shadow-2xs"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'fix' && (
            <div className="p-3 bg-white border border-amber-200 rounded-lg mb-3 shadow-2xs">
              <div className="flex items-center space-x-2 text-amber-600 font-semibold mb-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Error Context</span>
              </div>
              <pre className="font-mono text-[11px] text-rose-600 bg-rose-50 border border-rose-200 p-2 rounded max-h-24 overflow-auto">
                {lastError || 'No recent error captured. Running full script inspection.'}
              </pre>
            </div>
          )}

          {/* AI Response Output */}
          {loading && (
            <div className="py-10 flex flex-col items-center justify-center space-y-2 text-[#64748B]">
              <Loader2 className="w-7 h-7 animate-spin text-[#2563EB]" />
              <p className="text-xs font-medium">Gemini AI is crafting R code and statistical guidance...</p>
            </div>
          )}

          {response && !loading && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#1E293B] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
                  AI Solution:
                </span>
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => handleCopy(response)}
                    className="flex items-center gap-1 px-2 py-0.5 bg-white hover:bg-[#F1F5F9] text-[#475569] rounded border border-[#CBD5E1] text-[11px] font-medium transition-colors cursor-pointer shadow-2xs"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>Copy</span>
                  </button>

                  <button
                    onClick={() => {
                      const extracted = extractRCode(response);
                      onApplyCode(extracted, 'replace');
                      onClose();
                    }}
                    className="flex items-center gap-1 px-2.5 py-0.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded text-[11px] font-medium shadow-2xs cursor-pointer"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Apply to Editor</span>
                  </button>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-white border border-[#CBD5E1] leading-relaxed font-sans text-[#1E293B] whitespace-pre-wrap max-h-80 overflow-y-auto shadow-2xs">
                {response}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
