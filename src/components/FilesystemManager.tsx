import React, { useState, useEffect } from 'react';
import { FolderArchive, Upload, Download, Trash2, FileText, Plus, RefreshCw, Code, Check } from 'lucide-react';
import { WebRService } from '../lib/webrService';
import { RFile } from '../types';

interface FilesystemManagerProps {
  onInsertCode: (code: string) => void;
}

export const FilesystemManager: React.FC<FilesystemManagerProps> = ({ onInsertCode }) => {
  const [files, setFiles] = useState<RFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const webrService = WebRService.getInstance();

  const loadFiles = async () => {
    setLoading(true);
    try {
      const list = await webrService.listFiles('/home/web_user');
      setFiles(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, [webrService.status]);

  const handleFileUpload = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const buffer = await file.arrayBuffer();
      const uint8 = new Uint8Array(buffer);
      await webrService.uploadFile(file.name, uint8);
    }
    await loadFiles();
    showNotification('ファイルをアップロードしました');
  };

  const handleDownload = async (file: RFile) => {
    const data = await webrService.readFile(file.path);
    if (!data) return;
    const blob = new Blob([data]);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = async (file: RFile) => {
    if (confirm(`本当にファイル "${file.name}" を削除しますか？`)) {
      await webrService.deleteFile(file.path);
      await loadFiles();
      showNotification('ファイルを削除しました');
    }
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const createSampleSalesCsv = async () => {
    const sampleCsv = `Date,Product,Units,Price,Region
2026-01-01,Laptop,5,1200,Tokyo
2026-01-02,Tablet,12,450,Osaka
2026-01-03,Phone,8,800,Nagoya
2026-01-04,Headphones,25,90,Fukuoka
2026-01-05,Laptop,7,1200,Sapporo
2026-01-06,Tablet,9,450,Tokyo
2026-01-07,Phone,15,800,Osaka
`;
    const encoder = new TextEncoder();
    await webrService.uploadFile('sample_sales.csv', encoder.encode(sampleCsv));
    await loadFiles();
    showNotification('サンプル sample_sales.csv を作成しました');
  };

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden text-xs">
      {/* High Density Header Toolbar */}
      <div className="h-8 bg-[#F9FAFB] border-b border-[#E5E7EB] flex items-center justify-between px-3 text-[#475569] shrink-0">
        <div className="flex items-center space-x-2">
          <FolderArchive className="w-3.5 h-3.5 text-amber-500" />
          <span className="font-semibold text-[10px] uppercase text-[#6B7280] tracking-wider">Virtual FS (/home/web_user)</span>
          <button
            onClick={loadFiles}
            className="p-1 text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#2563EB]' : ''}`} />
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={createSampleSalesCsv}
            className="flex items-center gap-1 px-1.5 py-0.5 bg-white hover:bg-[#F1F5F9] text-[#334155] rounded border border-[#CBD5E1] text-[10px] font-medium transition-colors cursor-pointer"
            title="Create sample sales CSV"
          >
            <Plus className="w-3 h-3 text-[#2563EB]" />
            <span>Sample CSV</span>
          </button>

          <label
            className="flex items-center gap-1 px-2 py-0.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium rounded text-[10px] shadow-2xs cursor-pointer transition-colors"
            title="Upload local files to virtual FS"
          >
            <Upload className="w-3 h-3" />
            <span>Upload File</span>
            <input
              type="file"
              multiple
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Drag & Drop Area */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFileUpload(e.dataTransfer.files);
        }}
        className={`flex-1 p-3 overflow-auto ${
          dragOver ? 'bg-[#EFF6FF] border-2 border-dashed border-[#2563EB]' : 'bg-[#F8FAFC]'
        }`}
      >
        {notification && (
          <div className="mb-2.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded text-xs flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            {notification}
          </div>
        )}

        {files.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-[#94A3B8] border border-dashed border-[#CBD5E1] rounded-lg p-6 text-center bg-white">
            <Upload className="w-8 h-8 opacity-40 mb-2 text-[#2563EB]" />
            <p className="font-semibold text-xs text-[#374151] mb-1">Drag & Drop files here</p>
            <p className="text-[11px] text-[#6B7280] max-w-sm mb-3">
              Upload CSV, TSV, text, or RDS files to read them directly in your R scripts using <code className="bg-[#F1F5F9] px-1 py-0.5 rounded font-mono text-[#2563EB]">read.csv()</code>.
            </p>
            <button
              onClick={createSampleSalesCsv}
              className="px-2.5 py-1 bg-white hover:bg-[#F1F5F9] text-[#2563EB] border border-[#CBD5E1] rounded text-xs font-medium shadow-2xs cursor-pointer"
            >
              Generate sample_sales.csv
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {files.map((file) => (
              <div
                key={file.path}
                className="flex items-center justify-between p-2 bg-white border border-[#CBD5E1] rounded hover:border-[#94A3B8] transition-colors shadow-2xs"
              >
                <div className="flex items-center space-x-2 overflow-hidden">
                  <div className="p-1 rounded bg-[#EFF6FF] text-[#2563EB]">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <div className="overflow-hidden">
                    <div className="font-mono text-[#1E293B] font-medium text-xs truncate" title={file.name}>
                      {file.name}
                    </div>
                    <div className="text-[9px] text-[#94A3B8] font-mono">
                      /home/web_user/{file.name}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-1 shrink-0">
                  {/* Insert Read Code */}
                  <button
                    onClick={() => {
                      if (file.name.endsWith('.csv')) {
                        onInsertCode(`df <- read.csv("${file.name}")\nhead(df)`);
                      } else {
                        onInsertCode(`file_data <- readLines("${file.name}")\nhead(file_data)`);
                      }
                    }}
                    className="p-1 text-[#64748B] hover:text-[#2563EB] hover:bg-[#EFF6FF] rounded transition-colors"
                    title="Insert read code in editor"
                  >
                    <Code className="w-3.5 h-3.5" />
                  </button>

                  {/* Download */}
                  <button
                    onClick={() => handleDownload(file)}
                    className="p-1 text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded transition-colors"
                    title="Download file"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(file)}
                    className="p-1 text-[#64748B] hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                    title="Delete file"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
