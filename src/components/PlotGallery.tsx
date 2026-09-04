import React, { useState } from 'react';
import { Image as ImageIcon, Download, Maximize2, Trash2, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Layers } from 'lucide-react';
import { PlotImage } from '../types';

interface PlotGalleryProps {
  plots: PlotImage[];
  onClear: () => void;
}

export const PlotGallery: React.FC<PlotGalleryProps> = ({ plots, onClear }) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'focus' | 'grid'>('focus');

  const currentPlot = plots[selectedIndex] || plots[plots.length - 1];

  const handleDownload = (plot: PlotImage) => {
    const a = document.createElement('a');
    a.href = plot.url;
    a.download = `webr_plot_${plot.id}.png`;
    a.click();
  };

  if (plots.length === 0) {
    return (
      <div className="flex flex-col h-full items-center justify-center bg-[#F1F5F9] text-[#9CA3AF] p-6 select-none">
        <div className="w-12 h-12 rounded-xl bg-white border border-[#CBD5E1] flex items-center justify-center mb-3 text-[#2563EB] shadow-2xs">
          <ImageIcon className="w-6 h-6 opacity-80" />
        </div>
        <h3 className="text-xs font-semibold text-[#374151] mb-1 uppercase tracking-wider">No Plots Generated</h3>
        <p className="text-[11px] text-center text-[#6B7280] max-w-sm mb-3">
          Execute <code className="text-[#2563EB] bg-white border border-[#E5E7EB] px-1 py-0.5 rounded font-mono">plot()</code>,{' '}
          <code className="text-[#059669] bg-white border border-[#E5E7EB] px-1 py-0.5 rounded font-mono">ggplot()</code>, or{' '}
          <code className="text-[#D97706] bg-white border border-[#E5E7EB] px-1 py-0.5 rounded font-mono">hist()</code> in the editor to visualize data.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* High Density Plot Header */}
      <div className="h-8 bg-[#F9FAFB] border-b border-[#E5E7EB] flex items-center justify-between px-3 text-xs text-[#475569] shrink-0">
        <div className="flex items-center space-x-2">
          <ImageIcon className="w-3.5 h-3.5 text-[#2563EB]" />
          <span className="font-semibold text-[10px] uppercase text-[#6B7280] tracking-wider">Plots & Graphics</span>
          <span className="px-1.5 py-0.2 rounded bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] text-[10px] font-mono">
            {selectedIndex + 1} / {plots.length}
          </span>
        </div>

        <div className="flex items-center space-x-1">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-[#F1F5F9] rounded p-0.5 border border-[#E2E8F0]">
            <button
              onClick={() => setViewMode('focus')}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                viewMode === 'focus' ? 'bg-[#2563EB] text-white shadow-2xs' : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              Single
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                viewMode === 'grid' ? 'bg-[#2563EB] text-white shadow-2xs' : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              Grid
            </button>
          </div>

          {/* Navigation */}
          {viewMode === 'focus' && plots.length > 1 && (
            <div className="flex items-center space-x-1 pl-1">
              <button
                onClick={() => setSelectedIndex((prev) => Math.max(0, prev - 1))}
                disabled={selectedIndex === 0}
                className="p-1 rounded bg-white hover:bg-[#F1F5F9] border border-[#CBD5E1] disabled:opacity-30 text-[#475569]"
                title="Previous Plot"
              >
                <ChevronLeft className="w-3 h-3" />
              </button>
              <button
                onClick={() => setSelectedIndex((prev) => Math.min(plots.length - 1, prev + 1))}
                disabled={selectedIndex === plots.length - 1}
                className="p-1 rounded bg-white hover:bg-[#F1F5F9] border border-[#CBD5E1] disabled:opacity-30 text-[#475569]"
                title="Next Plot"
              >
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          )}

          {currentPlot && (
            <>
              <button
                onClick={() => handleDownload(currentPlot)}
                className="p-1 rounded hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A] transition-colors"
                title="Export Plot PNG"
              >
                <Download className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setIsFullscreen(true)}
                className="p-1 rounded hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A] transition-colors"
                title="Full Preview"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          <button
            onClick={onClear}
            className="p-1 rounded hover:bg-rose-50 text-[#64748B] hover:text-rose-600 transition-colors"
            title="Clear plots"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Plots Display Area */}
      <div className="flex-1 p-3 overflow-auto flex items-center justify-center bg-[#F1F5F9]">
        {viewMode === 'focus' && currentPlot ? (
          <div className="max-w-full max-h-full flex flex-col items-center">
            <div className="bg-white p-2 rounded border border-[#CBD5E1] shadow-sm max-w-full max-h-[calc(100vh-230px)] flex items-center justify-center overflow-hidden">
              <img
                src={currentPlot.url}
                alt={currentPlot.title}
                className="max-w-full max-h-[calc(100vh-260px)] object-contain"
              />
            </div>
            <div className="mt-1.5 text-center text-[11px] text-[#64748B] flex items-center gap-2">
              <span className="font-semibold text-[#1E293B]">{currentPlot.title}</span>
              <span>•</span>
              <span className="font-mono text-[10px]">{currentPlot.timestamp}</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full h-full auto-rows-max p-1">
            {plots.map((p, idx) => (
              <div
                key={p.id}
                onClick={() => {
                  setSelectedIndex(idx);
                  setViewMode('focus');
                }}
                className={`group relative bg-white p-2 rounded border cursor-pointer transition-all hover:border-[#2563EB] shadow-2xs ${
                  selectedIndex === idx ? 'ring-2 ring-[#2563EB] border-[#2563EB]' : 'border-[#CBD5E1]'
                }`}
              >
                <img src={p.url} alt={p.title} className="w-full h-40 object-contain rounded-xs" />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center gap-2">
                  <span className="text-white text-xs font-medium px-2 py-0.5 bg-black/60 rounded">
                    Click to zoom
                  </span>
                </div>
                <div className="mt-1 text-[10px] text-[#64748B] font-mono flex justify-between border-t border-[#F3F4F6] pt-1">
                  <span className="font-medium text-[#334155] truncate">{p.title}</span>
                  <span>{p.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && currentPlot && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex flex-col items-center justify-center p-6"
          onClick={() => setIsFullscreen(false)}
        >
          <div className="relative max-w-5xl max-h-[90vh] bg-white p-3 rounded-lg shadow-2xl border border-[#CBD5E1]" onClick={(e) => e.stopPropagation()}>
            <img
              src={currentPlot.url}
              alt={currentPlot.title}
              className="max-w-full max-h-[80vh] object-contain"
            />
            <div className="mt-3 flex items-center justify-between text-[#374151] text-xs px-1 border-t border-[#E5E7EB] pt-2">
              <span className="font-semibold text-sm">{currentPlot.title} <span className="font-mono text-[11px] text-[#64748B]">({currentPlot.timestamp})</span></span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleDownload(currentPlot)}
                  className="px-3 py-1 bg-[#2563EB] text-white rounded text-xs font-medium hover:bg-[#1D4ED8] transition-colors"
                >
                  Export PNG
                </button>
                <button
                  onClick={() => setIsFullscreen(false)}
                  className="px-3 py-1 bg-[#F1F5F9] text-[#334155] border border-[#CBD5E1] rounded text-xs font-medium hover:bg-[#E2E8F0] transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
