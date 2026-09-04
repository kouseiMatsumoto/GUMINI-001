import React, { useState } from 'react';
import { Search, BookOpen, Code, Plus, ExternalLink, HelpCircle } from 'lucide-react';
import { R_DOCS, RDocEntry } from '../lib/rDocs';

interface DocsViewerProps {
  onInsertCode: (code: string) => void;
}

export const DocsViewer: React.FC<DocsViewerProps> = ({ onInsertCode }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeDoc, setActiveDoc] = useState<RDocEntry | null>(R_DOCS['ggplot'] || Object.values(R_DOCS)[0]);

  const docsList = Object.values(R_DOCS);

  const filteredDocs = docsList.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.pkg.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' || doc.category === selectedCategory || doc.pkg === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden text-xs font-sans">
      {/* Top Header */}
      <div className="h-8 bg-[#F9FAFB] border-b border-[#E5E7EB] flex items-center justify-between px-3 text-[#475569] shrink-0">
        <div className="flex items-center space-x-2">
          <BookOpen className="w-3.5 h-3.5 text-[#2563EB]" />
          <span className="font-semibold text-[10px] uppercase text-[#6B7280] tracking-wider">
            R ドキュメント & ヘルプ
          </span>
        </div>
        <span className="text-[10px] text-[#64748B]">
          {filteredDocs.length} 件の関数
        </span>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-2.5 bg-[#F8FAFC] border-b border-[#E5E7EB] space-y-2 shrink-0">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="関数名・パッケージ・キーワード検索 (例: ggplot, lm, mutate)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-[#CBD5E1] text-[#1E293B] placeholder-[#94A3B8] rounded pl-8 pr-2 py-1 text-xs outline-none focus:border-[#2563EB]"
          />
        </div>

        <div className="flex items-center space-x-1 overflow-x-auto text-[10px]">
          {['all', 'base', 'ggplot2', 'dplyr', 'stats', 'tidyr', 'io'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2 py-0.5 rounded font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#2563EB] text-white shadow-2xs'
                  : 'bg-white text-[#64748B] hover:text-[#1E293B] border border-[#CBD5E1]'
              }`}
            >
              {cat === 'all' ? 'すべて' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Master-Detail Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Function List */}
        <div className="w-48 border-r border-[#E5E7EB] overflow-y-auto bg-[#F8FAFC]">
          {filteredDocs.map((doc) => (
            <button
              key={doc.name}
              onClick={() => setActiveDoc(doc)}
              className={`w-full text-left px-2.5 py-1.5 border-b border-[#F1F5F9] transition-colors flex items-center justify-between cursor-pointer ${
                activeDoc?.name === doc.name
                  ? 'bg-[#EFF6FF] text-[#2563EB] font-bold border-l-2 border-l-[#2563EB]'
                  : 'hover:bg-[#F1F5F9] text-[#334155]'
              }`}
            >
              <span className="font-mono text-xs truncate">{doc.name}()</span>
              <span className="text-[9px] text-[#94A3B8] font-mono shrink-0 ml-1">
                {doc.pkg}
              </span>
            </button>
          ))}
        </div>

        {/* Right Detail Pane */}
        {activeDoc ? (
          <div className="flex-1 p-3.5 overflow-y-auto bg-white space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB]">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-bold font-mono text-[#1E293B]">
                    {activeDoc.name}
                  </h3>
                  <span className="px-2 py-0.2 bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] text-[10px] rounded font-mono">
                    package:{activeDoc.pkg}
                  </span>
                </div>
              </div>

              <button
                onClick={() => onInsertCode(activeDoc.example + '\n')}
                className="flex items-center gap-1 px-2.5 py-1 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded text-xs font-medium transition-colors cursor-pointer shadow-2xs"
              >
                <Plus className="w-3 h-3" />
                <span>例をエディタに挿入</span>
              </button>
            </div>

            {/* Signature */}
            <div>
              <div className="text-[10px] text-[#64748B] font-semibold mb-1 uppercase tracking-wider">
                Usage / 構文
              </div>
              <pre className="bg-[#F8FAFC] border border-[#CBD5E1] p-2 rounded font-mono text-xs text-[#2563EB] whitespace-pre-wrap">
                {activeDoc.signature}
              </pre>
            </div>

            {/* Description */}
            <div>
              <div className="text-[10px] text-[#64748B] font-semibold mb-1 uppercase tracking-wider">
                Description / 解説
              </div>
              <p className="text-xs text-[#334155] leading-relaxed">
                {activeDoc.description}
              </p>
            </div>

            {/* Arguments */}
            {activeDoc.args.length > 0 && (
              <div>
                <div className="text-[10px] text-[#64748B] font-semibold mb-1 uppercase tracking-wider">
                  Arguments / 主要な引数
                </div>
                <div className="border border-[#CBD5E1] rounded overflow-hidden">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-[#F8FAFC] text-[#64748B] border-b border-[#CBD5E1]">
                      <tr>
                        <th className="p-1.5 font-mono w-24">引数</th>
                        <th className="p-1.5 font-sans">説明</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F1F5F9]">
                      {activeDoc.args.map((a) => (
                        <tr key={a.name}>
                          <td className="p-1.5 font-mono font-semibold text-[#1E293B] bg-[#F8FAFC]/50">
                            {a.name}
                          </td>
                          <td className="p-1.5 text-[#475569]">{a.desc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Examples */}
            <div>
              <div className="text-[10px] text-[#64748B] font-semibold mb-1 uppercase tracking-wider">
                Examples / サンプルコード
              </div>
              <pre className="bg-[#1E293B] text-[#E2E8F0] p-2.5 rounded font-mono text-xs overflow-x-auto whitespace-pre-wrap">
                {activeDoc.example}
              </pre>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-[#94A3B8]">
            左の一覧から関数を選択してください
          </div>
        )}
      </div>
    </div>
  );
};
