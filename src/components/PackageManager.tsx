import React, { useState } from 'react';
import { Package, Search, Download, CheckCircle2, Loader2, BookOpen, Plus, Code } from 'lucide-react';
import { WebRService } from '../lib/webrService';

interface PackageManagerProps {
  onInsertCode: (code: string) => void;
}

interface PackageItem {
  name: string;
  category: string;
  description: string;
  status: 'available' | 'installing' | 'installed';
}

const DEFAULT_PACKAGES: PackageItem[] = [
  {
    name: 'ggplot2',
    category: '可視化',
    description: '宣言的なグラフ描画システム。美しい図表をレイヤー構造で作成',
    status: 'available',
  },
  {
    name: 'dplyr',
    category: 'データ操作',
    description: 'モダンで高速なデータフレーム操作（filter, select, mutate, summarise）',
    status: 'available',
  },
  {
    name: 'tidyr',
    category: 'データ整形',
    description: '横持ち・縦持ちデータの変換 (pivot_longer, pivot_wider, separate)',
    status: 'available',
  },
  {
    name: 'palmerpenguins',
    category: 'データセット',
    description: 'Palmer諸島のペンギン3種の体長・体重・性別データセット',
    status: 'available',
  },
  {
    name: 'stringr',
    category: '文字列処理',
    description: '正規表現やテキスト処理を簡単に行う関数群',
    status: 'available',
  },
  {
    name: 'jsonlite',
    category: 'フォーマット',
    description: '堅牢で高速な JSON パーサー & 生成ライブラリ',
    status: 'available',
  },
  {
    name: 'lubridate',
    category: '日付・時刻',
    description: '日付・時刻データの解析、計算、タイムゾーン処理',
    status: 'available',
  },
  {
    name: 'MASS',
    category: '統計モデル',
    description: 'ロバスト回帰、主成分分析、多変量解析などの高度な統計手法',
    status: 'available',
  },
  {
    name: 'patchwork',
    category: '可視化',
    description: '複数の ggplot2 グラフをシンプルな構文 (+) で統合レイアウト',
    status: 'available',
  },
];

export const PackageManager: React.FC<PackageManagerProps> = ({ onInsertCode }) => {
  const [packages, setPackages] = useState<PackageItem[]>(DEFAULT_PACKAGES);
  const [customPkgInput, setCustomPkgInput] = useState('');
  const [installingCustom, setInstallingCustom] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  const webrService = WebRService.getInstance();

  const handleInstall = async (pkgName: string) => {
    setPackages((prev) =>
      prev.map((p) => (p.name === pkgName ? { ...p, status: 'installing' } : p))
    );

    const success = await webrService.installPackages([pkgName]);

    setPackages((prev) =>
      prev.map((p) => (p.name === pkgName ? { ...p, status: success ? 'installed' : 'available' } : p))
    );
  };

  const handleInstallCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    const pkg = customPkgInput.trim();
    if (!pkg) return;

    setInstallingCustom(true);
    const success = await webrService.installPackages([pkg]);
    setInstallingCustom(false);

    if (success) {
      if (!packages.some((p) => p.name.toLowerCase() === pkg.toLowerCase())) {
        setPackages((prev) => [
          ...prev,
          {
            name: pkg,
            category: 'Custom',
            description: 'CRAN WebAssembly パッケージ',
            status: 'installed',
          },
        ]);
      }
      setCustomPkgInput('');
    }
  };

  const filteredPackages = packages.filter(
    (p) =>
      p.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.description.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.category.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden text-xs">
      {/* High Density Top Bar */}
      <div className="h-8 bg-[#F9FAFB] border-b border-[#E5E7EB] flex items-center justify-between px-3 text-[#475569] shrink-0">
        <div className="flex items-center space-x-2">
          <Package className="w-3.5 h-3.5 text-[#2563EB]" />
          <span className="font-semibold text-[10px] uppercase text-[#6B7280] tracking-wider">WebR Packages</span>
        </div>

        {/* Custom CRAN package installer */}
        <form onSubmit={handleInstallCustom} className="flex items-center space-x-1.5">
          <input
            type="text"
            placeholder="Package name (e.g. readr)"
            value={customPkgInput}
            onChange={(e) => setCustomPkgInput(e.target.value)}
            disabled={installingCustom}
            className="bg-white border border-[#CBD5E1] text-[#1E293B] placeholder-[#94A3B8] rounded px-2 py-0.5 text-xs outline-none w-36 sm:w-44 font-mono focus:border-[#2563EB]"
          />
          <button
            type="submit"
            disabled={installingCustom || !customPkgInput.trim()}
            className="flex items-center gap-1 px-2 py-0.5 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-40 text-white rounded text-[10px] font-medium transition-colors cursor-pointer shadow-2xs"
          >
            {installingCustom ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Plus className="w-2.5 h-2.5" />}
            <span>Install</span>
          </button>
        </form>
      </div>

      {/* Search & Notice */}
      <div className="px-3 py-1.5 bg-[#F8FAFC] border-b border-[#E5E7EB] flex items-center justify-between shrink-0">
        <div className="relative w-56">
          <Search className="w-3 h-3 absolute left-2 top-1.5 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Filter packages..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full bg-white border border-[#CBD5E1] text-[#1E293B] placeholder-[#94A3B8] rounded pl-6 pr-2 py-0.5 text-xs outline-none focus:border-[#2563EB]"
          />
        </div>
        <p className="text-[10px] text-[#64748B]">
          WebAssembly binary packages fetched directly from official WebR repos
        </p>
      </div>

      {/* Package Grid */}
      <div className="flex-1 p-3 overflow-auto bg-[#F8FAFC]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {filteredPackages.map((pkg) => (
            <div
              key={pkg.name}
              className="bg-white border border-[#CBD5E1] rounded p-2.5 flex flex-col justify-between hover:border-[#94A3B8] transition-all shadow-2xs"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-mono font-bold text-[#1E293B] text-xs">{pkg.name}</span>
                    <span className="px-1.5 py-0.2 bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] text-[9px] rounded font-medium">
                      {pkg.category}
                    </span>
                  </div>
                  {pkg.status === 'installed' && (
                    <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-medium font-sans">
                      <CheckCircle2 className="w-3 h-3" />
                      Installed
                    </span>
                  )}
                </div>
                <p className="text-[#64748B] text-[11px] leading-snug mb-2">{pkg.description}</p>
              </div>

              <div className="flex items-center justify-between pt-1.5 border-t border-[#F1F5F9]">
                {pkg.status === 'installed' ? (
                  <button
                    onClick={() => onInsertCode(`library(${pkg.name})\n`)}
                    className="flex items-center gap-1 text-[#2563EB] hover:text-[#1D4ED8] text-[11px] font-medium"
                  >
                    <Code className="w-3 h-3" />
                    <span>Insert library({pkg.name})</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleInstall(pkg.name)}
                    disabled={pkg.status === 'installing'}
                    className="flex items-center gap-1 px-2 py-0.5 bg-white hover:bg-[#F1F5F9] text-[#334155] rounded text-[10px] font-medium transition-colors border border-[#CBD5E1] cursor-pointer"
                  >
                    {pkg.status === 'installing' ? (
                      <>
                        <Loader2 className="w-2.5 h-2.5 animate-spin text-amber-500" />
                        <span>Downloading...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-2.5 h-2.5 text-[#2563EB]" />
                        <span>Install</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
