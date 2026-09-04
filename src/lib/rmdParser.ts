export interface RmdChunk {
  id: string;
  name: string;
  options: string;
  code: string;
  startLine: number;
  endLine: number;
  output?: string;
  plotUrl?: string;
  isRunning?: boolean;
}

export interface ParsedRmd {
  title?: string;
  author?: string;
  date?: string;
  chunks: RmdChunk[];
  rawMarkdown: string;
}

export function parseRmd(content: string): ParsedRmd {
  const lines = content.split('\n');
  const chunks: RmdChunk[] = [];
  let inYaml = false;
  let yamlLines: string[] = [];
  let title = '';
  let author = '';
  let date = '';

  let inChunk = false;
  let currentChunkCode: string[] = [];
  let currentChunkName = '';
  let currentChunkOptions = '';
  let currentChunkStart = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // YAML header check
    if (i === 0 && trimmed === '---') {
      inYaml = true;
      continue;
    }
    if (inYaml) {
      if (trimmed === '---') {
        inYaml = false;
        // Parse YAML
        for (const y of yamlLines) {
          if (y.startsWith('title:')) title = y.replace('title:', '').trim().replace(/^['"]|['"]$/g, '');
          if (y.startsWith('author:')) author = y.replace('author:', '').trim().replace(/^['"]|['"]$/g, '');
          if (y.startsWith('date:')) date = y.replace('date:', '').trim().replace(/^['"]|['"]$/g, '');
        }
      } else {
        yamlLines.push(trimmed);
      }
      continue;
    }

    // Chunk detection
    if (trimmed.startsWith('```{r') || trimmed.startsWith('```{R')) {
      inChunk = true;
      currentChunkStart = i + 1;
      currentChunkCode = [];
      const match = trimmed.match(/^```\{[rR]\s*([^}]*)\}/);
      const rawArgs = match ? match[1].trim() : '';
      const parts = rawArgs.split(',');
      currentChunkName = parts[0]?.trim() || `chunk-${chunks.length + 1}`;
      currentChunkOptions = parts.slice(1).join(',').trim();
      continue;
    }

    if (inChunk && trimmed === '```') {
      chunks.push({
        id: `chunk-${chunks.length + 1}`,
        name: currentChunkName,
        options: currentChunkOptions,
        code: currentChunkCode.join('\n'),
        startLine: currentChunkStart,
        endLine: i + 1,
      });
      inChunk = false;
      continue;
    }

    if (inChunk) {
      currentChunkCode.push(line);
    }
  }

  return {
    title,
    author,
    date,
    chunks,
    rawMarkdown: content,
  };
}

export function extractAllRCodeFromRmd(content: string): string {
  const parsed = parseRmd(content);
  return parsed.chunks.map((c) => `# --- Chunk: ${c.name} ---\n${c.code}`).join('\n\n');
}

export const SAMPLE_RMD = `---
title: "Iris Data Exploratory Report"
author: "Data Scientist"
date: "2026-09-04"
output: html_document
---

# 1. はじめに (Introduction)
本レポートでは、Fisherの有名な **Iris（アヤメ）データセット** を用いて、品種ごとの花弁およびがく片の統計的特徴を可視化・分析します。

\`\`\`{r setup, echo=TRUE}
# 必要なライブラリの読み込みとデータ概要の確認
library(ggplot2)
head(iris)
\`\`\`

# 2. 基本要約統計量 (Summary Statistics)
各特徴量（長さ・幅）の分布と要約統計量を算出します。

\`\`\`{r summary_stats}
summary(iris)
\`\`\`

# 3. 品種別散布図と回帰トレンド (Visualization)
がく片の長さ (\`Sepal.Length\`) と花弁の長さ (\`Petal.Length\`) の関係をプロットします。

\`\`\`{r iris_plot}
ggplot(iris, aes(x = Sepal.Length, y = Petal.Length, color = Species)) +
  geom_point(size = 3, alpha = 0.8) +
  geom_smooth(method = "lm", se = FALSE) +
  theme_minimal() +
  labs(
    title = "Iris Sepal vs Petal Length by Species",
    x = "Sepal Length (cm)",
    y = "Petal Length (cm)",
    color = "Species"
  )
\`\`\`

# 4. まとめ (Conclusion)
Setosaは花弁が明確に小さく独立したクラスタを形成しており、VersicolorとVirginicaは線形な相関関係を示しています。
`;
