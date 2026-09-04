import React from 'react';
import { BookOpen, Copy, Plus, ExternalLink, Sparkles } from 'lucide-react';
import { RDocEntry } from '../lib/rDocs';

interface RDocHoverCardProps {
  doc: RDocEntry;
  position: { x: number; y: number };
  onInsertExample: (code: string) => void;
  onClose: () => void;
}

export const RDocHoverCard: React.FC<RDocHoverCardProps> = ({
  doc,
  position,
  onInsertExample,
  onClose,
}) => {
  return (
    <div
      style={{
        top: `${Math.min(position.y + 20, window.innerHeight - 340)}px`,
        left: `${Math.min(Math.max(position.x - 100, 10), window.innerWidth - 420)}px`,
      }}
      className="fixed z-50 w-96 max-w-[90vw] bg-white border border-[#CBD5E1] rounded-lg shadow-xl overflow-hidden font-sans text-xs animate-in fade-in zoom-in-95 duration-100"
      onMouseLeave={onClose}
    >
      {/* Header */}
      <div className="bg-[#1E293B] text-white px-3 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BookOpen className="w-3.5 h-3.5 text-[#38BDF8]" />
          <span className="font-mono font-bold text-sm text-[#F8FAFC]">{doc.name}</span>
          <span className="px-1.5 py-0.2 bg-[#334155] text-[#93C5FD] rounded text-[10px] font-mono">
            {'{' + doc.pkg + '}'}
          </span>
        </div>
        <span className="text-[10px] text-[#94A3B8] uppercase">{doc.category}</span>
      </div>

      {/* Signature */}
      <div className="p-2.5 bg-[#F8FAFC] border-b border-[#E2E8F0]">
        <div className="text-[10px] text-[#64748B] font-semibold mb-1">構文シグネチャ:</div>
        <code className="block bg-white p-1.5 rounded border border-[#CBD5E1] font-mono text-[11px] text-[#2563EB] whitespace-pre-wrap">
          {doc.signature}
        </code>
      </div>

      {/* Description */}
      <div className="p-3 text-[#334155] leading-relaxed border-b border-[#F1F5F9] max-h-32 overflow-y-auto">
        <p className="text-[11px]">{doc.description}</p>
        
        {doc.args.length > 0 && (
          <div className="mt-2.5">
            <div className="text-[10px] text-[#64748B] font-semibold mb-1">主要な引数:</div>
            <div className="space-y-1">
              {doc.args.map((a) => (
                <div key={a.name} className="text-[10px] text-[#475569] flex gap-1.5">
                  <span className="font-mono font-bold text-[#1E293B] shrink-0">{a.name}:</span>
                  <span>{a.desc}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Example & Actions */}
      <div className="p-2.5 bg-[#F9FAFB] flex items-center justify-between gap-2">
        <div className="text-[10px] text-[#64748B] font-mono truncate">
          例: {doc.example.split('\n')[0]}
        </div>
        <button
          onClick={() => {
            onInsertExample(doc.example + '\n');
            onClose();
          }}
          className="flex items-center gap-1 px-2 py-0.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded text-[10px] font-medium transition-colors cursor-pointer shrink-0 shadow-2xs"
          title="使用例コードをエディタに挿入"
        >
          <Plus className="w-2.5 h-2.5" />
          <span>コード挿入</span>
        </button>
      </div>
    </div>
  );
};
