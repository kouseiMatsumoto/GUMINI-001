export type WebRStatus = 'uninitialized' | 'loading' | 'ready' | 'running' | 'error';

export interface ConsoleOutputItem {
  id: string;
  type: 'stdout' | 'stderr' | 'warning' | 'message' | 'error' | 'info' | 'input';
  text: string;
  timestamp: string;
}

export interface PlotImage {
  id: string;
  url: string;
  title: string;
  timestamp: string;
  type: 'png' | 'svg' | 'canvas';
  width?: number;
  height?: number;
}

export interface RFile {
  name: string;
  path: string;
  size: number;
  isDir: boolean;
  modified?: string;
}

export interface RSample {
  id: string;
  title: string;
  category: 'basics' | 'ggplot2' | 'tidyverse' | 'statistics' | 'simulation' | 'files';
  categoryLabel: string;
  description: string;
  code: string;
  requiredPackages?: string[];
  tags: string[];
}

export interface DataFrameInfo {
  name: string;
  rowCount: number;
  colCount: number;
  columns: { name: string; type: string }[];
  previewRows: Record<string, any>[];
  summaryText?: string;
}

export interface InstalledPackageInfo {
  name: string;
  version: string;
  status: 'installed' | 'installing' | 'available' | 'error';
  description?: string;
}
