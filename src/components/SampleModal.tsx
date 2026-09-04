import React, { useState } from 'react';
import { BookOpen, X, Play, Copy, Check, Sparkles, Tag, ArrowRight } from 'lucide-react';
import { SAMPLE_CODES } from '../data/samples';
import { RSample } from '../types';

interface SampleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSample: (sample: RSample, autoRun: boolean) => void;
}

export const SampleModal: React.FC<SampleModalProps> = ({
  isOpen,
  onClose,
  onSelectSample,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: 'すべて' },
    { id: 'basics', label: '基本・データ探索' },
    { id: 'ggplot2', label: 'ggplot2 可視化' },
    { id: 'tidyverse', label: 'データ集計 (dplyr)' },
    { id: 'statistics', label: '統計・検定・回帰' },
    { id: 'simulation', label: 'シミュレーション' },
    { id: 'files', label: 'ファイル連携' },
  ];

  const filteredSamples =
    selectedCategory === 'all'
      ? SAMPLE_CODES
      : SAMPLE_CODES.filter((s) => s.category === selectedCategory);

  const handleCopy = (sample: RSample) => {
    navigator.clipboard.writeText(sample.code);
    setCopiedId(sample.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-[#CBD5E1] rounded-xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E7EB] bg-[#F9FAFB] shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center border border-[#BFDBFE]">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#1E293B]">R Code Gallery & Templates</h2>
              <p className="text-[11px] text-[#64748B]">Click any sample to load into editor or run instantly</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center space-x-1 px-4 py-2 border-b border-[#E5E7EB] bg-[#F8FAFC] overflow-x-auto text-xs shrink-0">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1 rounded text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[#2563EB] text-white shadow-2xs'
                  : 'text-[#64748B] hover:text-[#1E293B] hover:bg-[#F1F5F9]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Samples List */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#F1F5F9]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredSamples.map((sample) => (
              <div
                key={sample.id}
                className="bg-white border border-[#CBD5E1] hover:border-[#2563EB] rounded-lg p-3.5 flex flex-col justify-between transition-all group shadow-2xs"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="px-2 py-0.2 rounded bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] text-[10px] font-semibold font-mono">
                      {sample.categoryLabel}
                    </span>
                    {sample.requiredPackages && sample.requiredPackages.length > 0 && (
                      <span className="text-[10px] text-amber-600 font-mono">
                        Requires: {sample.requiredPackages.join(', ')}
                      </span>
                    )}
                  </div>

                  <h3 className="font-semibold text-[#1E293B] text-xs mb-1 group-hover:text-[#2563EB] transition-colors">
                    {sample.title}
                  </h3>
                  <p className="text-[11px] text-[#64748B] leading-relaxed mb-2.5">
                    {sample.description}
                  </p>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {sample.tags.map((tag) => (
                      <span key={tag} className="text-[9px] bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] px-1.5 py-0.2 rounded font-mono">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2.5 border-t border-[#F1F5F9]">
                  <button
                    onClick={() => handleCopy(sample)}
                    className="p-1 text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                    title="Copy code"
                  >
                    {copiedId === sample.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600 font-medium">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => {
                        onSelectSample(sample, false);
                        onClose();
                      }}
                      className="px-2.5 py-1 text-[11px] text-[#334155] hover:text-[#0F172A] bg-white hover:bg-[#F1F5F9] rounded border border-[#CBD5E1] transition-colors font-medium cursor-pointer shadow-2xs"
                    >
                      Load into Editor
                    </button>
                    <button
                      onClick={() => {
                        onSelectSample(sample, true);
                        onClose();
                      }}
                      className="flex items-center gap-1 px-3 py-1 text-[11px] font-medium text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded transition-colors shadow-2xs cursor-pointer"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Run</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
