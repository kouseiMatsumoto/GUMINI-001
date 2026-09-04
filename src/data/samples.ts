import { RSample } from '../types';

export const SAMPLE_CODES: RSample[] = [
  {
    id: 'basic-stats-plot',
    title: '基礎統計量と基本プロット (iris)',
    category: 'basics',
    categoryLabel: '基本操作',
    description: 'アヤメ (iris) データセットの要約統計量、相関行列、および散布図・箱ひげ図を描画します。',
    tags: ['Base R', 'iris', 'summary', 'boxplot', 'hist'],
    code: `# ==========================================
# 1. 組み込みデータセット iris の確認
# ==========================================
cat("--- データセットの先頭 6行 ---\\n")
print(head(iris))

cat("\\n--- 各列の要約統計量 ---\\n")
print(summary(iris))

# 4つの量的変数の相関係数
cat("\\n--- 相関行列 (数値列) ---\\n")
cor_matrix <- cor(iris[, 1:4])
print(round(cor_matrix, 3))

# ==========================================
# 2. 基本グラフィックス (Base R Plot)
# ==========================================
par(mfrow = c(1, 2), mar = c(4, 4, 3, 1))

# 箱ひげ図: がく片の長さ (Sepal.Length) を品種別 (Species) に比較
boxplot(Sepal.Length ~ Species, data = iris,
        col = c("#93c5fd", "#86efac", "#fca5a5"),
        main = "品種別 がく片の長さ (Sepal.Length)",
        xlab = "品種 (Species)",
        ylab = "がく片の長さ (cm)")

# 散布図: Sepal.Length vs Petal.Length
plot(iris$Sepal.Length, iris$Petal.Length,
     col = c("#2563eb", "#16a34a", "#dc2626")[as.factor(iris$Species)],
     pch = 19,
     main = "がく片の長さ vs 花弁の長さ",
     xlab = "がく片の長さ (Sepal.Length cm)",
     ylab = "花弁の長さ (Petal.Length cm)")
legend("topleft", legend = levels(iris$Species),
       col = c("#2563eb", "#16a34a", "#dc2626"), pch = 19, bty = "n")
`,
  },
  {
    id: 'ggplot2-visualization',
    title: 'ggplot2 美しいデータ可視化',
    category: 'ggplot2',
    categoryLabel: 'ggplot2',
    description: 'ggplot2 を使用して回帰直線付きの散布図や美しいファセットグラフを描画します。',
    requiredPackages: ['ggplot2'],
    tags: ['ggplot2', 'geom_point', 'geom_smooth', 'facet_wrap', 'mtcars'],
    code: `# ggplot2 ライブラリの読み込み
library(ggplot2)

# mtcars データセットを使用した洗練されたグラフ作成
# 車両重量 (wt) と 燃費 (mpg) の関係 (シリンダー数別)

p <- ggplot(mtcars, aes(x = wt, y = mpg, color = factor(cyl), size = hp)) +
  geom_point(alpha = 0.8) +
  geom_smooth(method = "lm", se = TRUE, aes(group = factor(cyl)), linewidth = 1) +
  scale_color_manual(
    values = c("4" = "#0ea5e9", "6" = "#10b981", "8" = "#f43f5e"),
    name = "シリンダー数"
  ) +
  scale_size_continuous(name = "馬力 (hp)", range = c(3, 7)) +
  labs(
    title = "mtcars: 車両重量 vs 燃費 (mpg) の回帰分析",
    subtitle = "シリンダー数 (4, 6, 8) 別の線形回帰トレンド",
    x = "車両重量 (1000 lbs)",
    y = "燃費 (マイル/ガロン)"
  ) +
  theme_minimal(base_size = 14) +
  theme(
    plot.title = element_text(face = "bold", size = 16, color = "#1e293b"),
    plot.subtitle = element_text(color = "#64748b", margin = margin(b = 10)),
    legend.position = "right",
    panel.grid.minor = element_blank(),
    panel.background = element_rect(fill = "#f8fafc", color = NA)
  )

# 描画
print(p)
`,
  },
  {
    id: 'dplyr-wrangling',
    title: 'dplyr / tidyverse データ集計パイプ処理',
    category: 'tidyverse',
    categoryLabel: 'データ処理',
    description: 'モダンなデータハンドリング (パイプ演算子 |>, filter, group_by, summarise, mutate) の実践例です。',
    requiredPackages: ['dplyr'],
    tags: ['dplyr', 'pipe', 'group_by', 'summarise', 'mutate'],
    code: `library(dplyr)

cat("=== 1. Starwars データセットの概要 ===\\n")
# dplyr 組み込みの starwars データ
starwars_sample <- starwars %>%
  select(name, height, mass, species, homeworld, gender)

cat("総キャラクター数:", nrow(starwars_sample), "\\n\\n")

cat("=== 2. 種族(species)ごとの平均身長と体重の集計 (件数3以上) ===\\n")
species_summary <- starwars_sample %>%
  filter(!is.na(height), !is.na(mass)) %>%
  group_by(species) %>%
  summarise(
    count = n(),
    mean_height = round(mean(height), 1),
    mean_mass = round(mean(mass), 1),
    bmi = round(mean(mass / ((height/100)^2)), 1),
    .groups = "drop"
  ) %>%
  filter(count >= 2) %>%
  arrange(desc(count))

print(species_summary)

cat("\\n=== 3. 人間(Human)の出身惑星別 集計 ===\\n")
human_homeworlds <- starwars_sample %>%
  filter(species == "Human", !is.na(homeworld)) %>%
  count(homeworld, sort = TRUE)

print(head(human_homeworlds, 10))
`,
  },
  {
    id: 'linear-regression-stats',
    title: '線形回帰分析と統計的仮説検定',
    category: 'statistics',
    categoryLabel: '統計・検定',
    description: '単回帰・重回帰分析 (lm) のフィッティング、分散分析 (ANOVA)、t検定、残差診断プロットを実行します。',
    tags: ['lm', 't.test', 'anova', 'regression', 'residuals'],
    code: `# ==========================================
# 1. t検定 (Two-sample t-test)
# ==========================================
cat("=== 1. オートマ車 vs マニュアル車の燃費 t検定 ===\\n")
# am: 0 = Automatic, 1 = Manual
t_result <- t.test(mpg ~ am, data = mtcars)
print(t_result)

# ==========================================
# 2. 重回帰分析 (Multiple Linear Regression)
# ==========================================
cat("\\n=== 2. 重回帰モデル: mpg ~ wt + hp + qsec ===\\n")
model <- lm(mpg ~ wt + hp + qsec, data = mtcars)
summary_model <- summary(model)
print(summary_model)

cat("\\n決定係数 R-squared:", round(summary_model$r.squared, 4), "\\n")
cat("自由度調整済み R-squared:", round(summary_model$adj.r.squared, 4), "\\n")

# ==========================================
# 3. 回帰診断プロット (Diagnostic Plots)
# ==========================================
par(mfrow = c(2, 2), mar = c(4, 4, 2, 1))
plot(model)
`,
  },
  {
    id: 'simulation-monte-carlo',
    title: 'モンテカルロ法 & 中心極限定理シミュレーション',
    category: 'simulation',
    categoryLabel: 'シミュレーション',
    description: '円周率 π のモンテカルロ推定と、指数分布から抽出した標本平均による中心極限定理の可視化を行います。',
    tags: ['Monte Carlo', 'simulation', 'CLT', 'runif', 'hist'],
    code: `# 乱数シードの設定
set.seed(42)

# ==========================================
# 1. モンテカルロ法による 円周率 π の推定
# ==========================================
n <- 5000
x <- runif(n, min = -1, max = 1)
y <- runif(n, min = -1, max = 1)
inside_circle <- (x^2 + y^2) <= 1
pi_estimate <- 4 * sum(inside_circle) / n

cat("=== モンテカルロ π 推定 (試行回数:", n, ") ===\\n")
cat("推定値:", pi_estimate, "\\n")
cat("真値との誤差:", abs(pi_estimate - pi), "\\n\\n")

# ==========================================
# 2. 中心極限定理 (CLT) のシミュレーション
# ==========================================
# 歪んだ指数分布 (Exp(1)) から標本サイズ 30 の平均を 2000回抽出
sample_size <- 30
num_trials <- 2000
sample_means <- replicate(num_trials, mean(rexp(sample_size, rate = 1)))

# ==========================================
# 3. プロット
# ==========================================
par(mfrow = c(1, 2), mar = c(4, 4, 3, 1))

# モンテカルロ円
plot(x, y, col = ifelse(inside_circle, "#3b82f6", "#ef4444"),
     pch = 20, cex = 0.6, asp = 1,
     main = paste0("モンテカルロ法 π ≈ ", round(pi_estimate, 4)),
     xlab = "X", ylab = "Y")
symbols(0, 0, circles = 1, inches = FALSE, add = TRUE, fg = "#1e293b", lwd = 2)

# 中心極限定理のヒストグラムと正規分布曲線
hist(sample_means, breaks = 30, probability = TRUE,
     col = "#93c5fd", border = "#1e40af",
     main = "中心極限定理 (標本平均の分布)",
     xlab = "標本平均", ylab = "確率密度")
curve(dnorm(x, mean = mean(sample_means), sd = sd(sample_means)),
      col = "#dc2626", lwd = 2.5, add = TRUE)
`,
  },
  {
    id: 'rmarkdown-report',
    title: 'R Markdown (.Rmd) データ分析レポート',
    category: 'basics',
    categoryLabel: 'R Markdown',
    description: '見出し、解説文、Rコードチャンク (```{r})、統計量、グラフが統合されたMarkdownレポートのテンプレートです。',
    requiredPackages: ['ggplot2'],
    tags: ['Rmd', 'Markdown', 'report', 'ggplot2', 'knit'],
    code: `---
title: "Iris Data Exploratory Report"
author: "データアナリスト"
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
    x = "がく片の長さ Sepal Length (cm)",
    y = "花弁の長さ Petal Length (cm)",
    color = "品種 Species"
  )
\`\`\`

# 4. まとめ (Conclusion)
- **Setosa**: 花弁が明確に小さく、独立したクラスタを形成しています。
- **Versicolor & Virginica**: がく片と花弁の長さに強い正の相関関係が認められます。
`,
  },
];
