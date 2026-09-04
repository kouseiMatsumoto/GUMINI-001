import React, { useState, useEffect } from 'react';
import { Database, Search, RefreshCw, Download, ArrowUpDown, Table, ExternalLink } from 'lucide-react';
import { WebRService } from '../lib/webrService';
import { DataFrameInfo } from '../types';

interface DataViewerProps {
  onInsertCode: (code: string) => void;
}

export const DataViewer: React.FC<DataViewerProps> = ({ onInsertCode }) => {
  const [dataFrames, setDataFrames] = useState<string[]>([]);
  const [selectedDf, setSelectedDf] = useState<string>('iris');
  const [dfInfo, setDfInfo] = useState<DataFrameInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const rowsPerPage = 12;

  const webrService = WebRService.getInstance();

  const loadDataFramesList = async () => {
    try {
      const list = await webrService.getAvailableDataFrames();
      setDataFrames(list);
      if (list.length > 0 && !list.includes(selectedDf)) {
        setSelectedDf(list[0]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadDataFrameDetails = async (name: string) => {
    if (!name) return;
    setLoading(true);
    try {
      const info = await webrService.inspectDataFrame(name);
      setDfInfo(info);
      setPage(0);
    } catch (e) {
      console.error('Failed to load DF info:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDataFramesList();
  }, [webrService.status]);

  useEffect(() => {
    if (selectedDf) {
      loadDataFrameDetails(selectedDf);
    }
  }, [selectedDf]);

  const filteredRows = (dfInfo?.previewRows || []).filter((row) => {
    if (!searchTerm) return true;
    return Object.values(row).some((val) =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const totalPages = Math.ceil(filteredRows.length / rowsPerPage);
  const paginatedRows = filteredRows.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

  const handleExportCsv = () => {
    if (!dfInfo || !dfInfo.previewRows.length) return;
    const cols = dfInfo.columns.map((c) => c.name);
    const csvLines = [
      cols.join(','),
      ...dfInfo.previewRows.map((row) => cols.map((c) => JSON.stringify(row[c] ?? '')).join(',')),
    ];
    const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedDf}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden text-xs">
      {/* High Density Top Controls */}
      <div className="h-8 bg-[#F9FAFB] border-b border-[#E5E7EB] flex items-center justify-between px-3 text-[#475569] shrink-0">
        <div className="flex items-center space-x-2">
          <Database className="w-3.5 h-3.5 text-[#2563EB]" />
          <span className="font-semibold text-[10px] uppercase text-[#6B7280] tracking-wider">Data Viewer:</span>

          {/* DataFrame selector */}
          <select
            value={selectedDf}
            onChange={(e) => setSelectedDf(e.target.value)}
            className="bg-white border border-[#CBD5E1] text-[#1E293B] text-xs font-mono font-medium rounded px-2 py-0.5 outline-none hover:bg-slate-50 cursor-pointer shadow-2xs"
          >
            {dataFrames.map((df) => (
              <option key={df} value={df}>
                {df}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              loadDataFramesList();
              loadDataFrameDetails(selectedDf);
            }}
            className="p-1 text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded transition-colors"
            title="Reload Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#2563EB]' : ''}`} />
          </button>
        </div>

        <div className="flex items-center space-x-2">
          {/* Search Filter */}
          <div className="relative">
            <Search className="w-3 h-3 absolute left-2 top-1.5 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Search table..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(0);
              }}
              className="bg-white border border-[#CBD5E1] text-[#1E293B] placeholder-[#94A3B8] rounded pl-6 pr-2 py-0.5 text-xs outline-none w-32 sm:w-44 focus:border-[#2563EB] transition-colors"
            />
          </div>

          <button
            onClick={handleExportCsv}
            disabled={!dfInfo}
            className="p-1 rounded text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] disabled:opacity-30 transition-colors"
            title="Export CSV"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onInsertCode(`summary(${selectedDf})\nstr(${selectedDf})`)}
            className="flex items-center gap-1 px-1.5 py-0.5 bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#2563EB] border border-[#BFDBFE] rounded text-[10px] font-medium transition-colors cursor-pointer"
            title="エディタに要約コードを挿入"
          >
            <Table className="w-2.5 h-2.5" />
            <span>summary()</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Badge */}
      {dfInfo && (
        <div className="px-3 py-1 bg-[#F8FAFC] border-b border-[#E5E7EB] flex items-center justify-between text-[10px] text-[#64748B] font-mono">
          <div className="flex items-center space-x-3">
            <span>
              Rows: <strong className="text-[#1E293B]">{dfInfo.rowCount.toLocaleString()}</strong>
            </span>
            <span>
              Cols: <strong className="text-[#1E293B]">{dfInfo.colCount}</strong>
            </span>
          </div>
          <div className="text-[#94A3B8]">
            {filteredRows.length !== dfInfo.rowCount && `(${filteredRows.length} matches)`}
          </div>
        </div>
      )}

      {/* Table Content */}
      <div className="flex-1 overflow-auto bg-white">
        {loading ? (
          <div className="flex h-full items-center justify-center text-[#94A3B8]">
            <RefreshCw className="w-4 h-4 animate-spin mr-2 text-[#2563EB]" />
            Loading dataframe...
          </div>
        ) : !dfInfo ? (
          <div className="flex h-full items-center justify-center text-[#94A3B8] p-6 text-center">
            No data frames found in current R workspace. Run R code to generate data.
          </div>
        ) : (
          <table className="w-full text-left border-collapse font-mono text-[11px]">
            <thead className="bg-[#F8FAFC] sticky top-0 z-10 border-b border-[#CBD5E1] text-[#475569]">
              <tr>
                <th className="py-1 px-2.5 border-r border-[#E5E7EB] w-10 text-[#94A3B8] text-right bg-[#F8FAFC]">#</th>
                {dfInfo.columns.map((col) => (
                  <th key={col.name} className="py-1.5 px-2.5 border-r border-[#E5E7EB] font-semibold text-[#1E293B]">
                    <div className="flex items-center justify-between space-x-1">
                      <span className="truncate">{col.name}</span>
                      <span className="text-[9px] text-[#94A3B8] font-normal uppercase">{col.type}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6] text-[#334155]">
              {paginatedRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-[#EFF6FF] transition-colors">
                  <td className="py-1 px-2.5 border-r border-[#E5E7EB] text-[#94A3B8] text-right font-mono text-[10px] select-none bg-[#FCFCFD]">
                    {page * rowsPerPage + idx + 1}
                  </td>
                  {dfInfo.columns.map((col) => (
                    <td key={col.name} className="py-1 px-2.5 border-r border-[#F3F4F6] whitespace-nowrap truncate max-w-xs">
                      {String(row[col.name] ?? '')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-3 py-1 bg-[#F8FAFC] border-t border-[#E5E7EB] text-[10px] text-[#64748B] shrink-0 font-sans">
          <span>
            Page <strong className="text-[#1E293B] font-mono">{page + 1}</strong> of <strong className="text-[#1E293B] font-mono">{totalPages}</strong>
          </span>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-2 py-0.5 rounded bg-white hover:bg-[#F1F5F9] border border-[#CBD5E1] disabled:opacity-30 text-[#475569] font-medium"
            >
              Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-2 py-0.5 rounded bg-white hover:bg-[#F1F5F9] border border-[#CBD5E1] disabled:opacity-30 text-[#475569] font-medium"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
