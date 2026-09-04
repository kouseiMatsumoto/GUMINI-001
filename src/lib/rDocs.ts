export interface RDocEntry {
  name: string;
  pkg: string;
  signature: string;
  description: string;
  args: { name: string; desc: string }[];
  example: string;
  category: 'base' | 'stats' | 'ggplot2' | 'dplyr' | 'tidyr' | 'io' | 'matrix';
}

export const R_DOCS: Record<string, RDocEntry> = {
  // Base R
  'c': {
    name: 'c',
    pkg: 'base',
    signature: 'c(..., recursive = FALSE)',
    description: 'ベクトルまたはリストを作成・結合します。',
    args: [
      { name: '...', desc: '結合する数値、文字列、またはオブジェクト' },
      { name: 'recursive', desc: 'リストを再帰的にベクトルへ平坦化するか' }
    ],
    example: 'x <- c(1, 3, 5, 7, 9)\nnames <- c("Tokyo", "Osaka", "Nagoya")',
    category: 'base'
  },
  'summary': {
    name: 'summary',
    pkg: 'base',
    signature: 'summary(object, ...)',
    description: 'オブジェクト（データフレーム、回帰モデル、ベクトル等）の要約統計量を計算・出力します。',
    args: [
      { name: 'object', desc: '要約を行いたいデータオブジェクト' }
    ],
    example: 'summary(iris)\nmodel <- lm(mpg ~ wt, data = mtcars)\nsummary(model)',
    category: 'base'
  },
  'head': {
    name: 'head',
    pkg: 'utils',
    signature: 'head(x, n = 6L, ...)',
    description: 'ベクトル、マトリックス、データフレームの先頭 n 行（デフォルト6行）を返します。',
    args: [
      { name: 'x', desc: '対象オブジェクト' },
      { name: 'n', desc: '取得する行数（負数の場合は末尾を除く行数）' }
    ],
    example: 'head(mtcars, 10)',
    category: 'base'
  },
  'tail': {
    name: 'tail',
    pkg: 'utils',
    signature: 'tail(x, n = 6L, ...)',
    description: 'ベクトル、マトリックス、データフレームの末尾 n 行（デフォルト6行）を返します。',
    args: [
      { name: 'x', desc: '対象オブジェクト' },
      { name: 'n', desc: '取得する行数' }
    ],
    example: 'tail(iris, 5)',
    category: 'base'
  },
  'str': {
    name: 'str',
    pkg: 'utils',
    signature: 'str(object, ...)',
    description: 'オブジェクトの内部構造（データ型、要素数、列名など）をコンパクトに表示します。',
    args: [
      { name: 'object', desc: '構造を確認したいオブジェクト' }
    ],
    example: 'str(iris)',
    category: 'base'
  },
  'length': {
    name: 'length',
    pkg: 'base',
    signature: 'length(x)',
    description: 'ベクトルやリストの要素数（長さ）を取得または設定します。',
    args: [{ name: 'x', desc: 'Rオブジェクト' }],
    example: 'length(c(1, 2, 3, 4, 5))',
    category: 'base'
  },
  'dim': {
    name: 'dim',
    pkg: 'base',
    signature: 'dim(x)',
    description: '行列やデータフレームの次元（行数と列数）を返します。',
    args: [{ name: 'x', desc: '行列またはデータフレーム' }],
    example: 'dim(iris) # [1] 150   5',
    category: 'base'
  },
  'nrow': {
    name: 'nrow',
    pkg: 'base',
    signature: 'nrow(x)',
    description: 'データフレームや行列の行数を返します。',
    args: [{ name: 'x', desc: 'データフレームまたは行列' }],
    example: 'nrow(iris)',
    category: 'base'
  },
  'ncol': {
    name: 'ncol',
    pkg: 'base',
    signature: 'ncol(x)',
    description: 'データフレームや行列の列数を返します。',
    args: [{ name: 'x', desc: 'データフレームまたは行列' }],
    example: 'ncol(iris)',
    category: 'base'
  },
  'names': {
    name: 'names',
    pkg: 'base',
    signature: 'names(x)',
    description: 'オブジェクトの変数名・列名・キー名を取得または設定します。',
    args: [{ name: 'x', desc: '名前を取得するオブジェクト' }],
    example: 'names(iris)',
    category: 'base'
  },
  'data.frame': {
    name: 'data.frame',
    pkg: 'base',
    signature: 'data.frame(..., stringsAsFactors = FALSE)',
    description: '同じ行数を持つ複数の列を結合し、データフレーム（表形式データ）を作成します。',
    args: [
      { name: '...', desc: '列となるベクトル（名前付き引数推奨）' },
      { name: 'stringsAsFactors', desc: '文字列をファクター型に変換するか' }
    ],
    example: 'df <- data.frame(\n  id = 1:3,\n  name = c("Alice", "Bob", "Charlie"),\n  score = c(95, 82, 88)\n)',
    category: 'base'
  },
  'matrix': {
    name: 'matrix',
    pkg: 'base',
    signature: 'matrix(data = NA, nrow = 1, ncol = 1, byrow = FALSE)',
    description: '2次元の行列（マトリックス）を作成します。',
    args: [
      { name: 'data', desc: '行列の要素となるベクトル' },
      { name: 'nrow', desc: '行数' },
      { name: 'ncol', desc: '列数' },
      { name: 'byrow', desc: 'TRUEなら行優先でデータを配置' }
    ],
    example: 'm <- matrix(1:9, nrow = 3, ncol = 3, byrow = TRUE)',
    category: 'matrix'
  },
  'apply': {
    name: 'apply',
    pkg: 'base',
    signature: 'apply(X, MARGIN, FUN, ...)',
    description: '行列や配列の行（MARGIN=1）または列（MARGIN=2）ごとに関数を適用します。',
    args: [
      { name: 'X', desc: '2次元以上の配列または行列' },
      { name: 'MARGIN', desc: '1: 行ごと, 2: 列ごと' },
      { name: 'FUN', desc: '適用する関数' }
    ],
    example: 'mat <- matrix(1:12, nrow = 4)\napply(mat, 2, mean) # 列ごとの平均値',
    category: 'base'
  },
  'lapply': {
    name: 'lapply',
    pkg: 'base',
    signature: 'lapply(X, FUN, ...)',
    description: 'リストやベクトルの各要素に関数を適用し、結果をリストで返します。',
    args: [
      { name: 'X', desc: '対象リストまたはベクトル' },
      { name: 'FUN', desc: '適用する関数' }
    ],
    example: 'lapply(1:3, function(x) x^2)',
    category: 'base'
  },
  'sapply': {
    name: 'sapply',
    pkg: 'base',
    signature: 'sapply(X, FUN, ..., simplify = TRUE)',
    description: 'リストやベクトルの各要素に関数を適用し、結果をベクトルまたは行列に簡略化して返します。',
    args: [
      { name: 'X', desc: '対象オブジェクト' },
      { name: 'FUN', desc: '適用する関数' }
    ],
    example: 'sapply(iris[, 1:4], mean)',
    category: 'base'
  },
  'table': {
    name: 'table',
    pkg: 'base',
    signature: 'table(..., useNA = "no")',
    description: 'カテゴリ変数のクロス集計表・度数分布表を作成します。',
    args: [
      { name: '...', desc: '集計対象のファクターまたはベクトル' },
      { name: 'useNA', desc: '欠損値(NA)を含めるか ("no", "ifany", "always")' }
    ],
    example: 'table(iris$Species)\ntable(mtcars$cyl, mtcars$gear)',
    category: 'base'
  },
  'subset': {
    name: 'subset',
    pkg: 'base',
    signature: 'subset(x, subset, select, ...)',
    description: '条件を満たす行や指定した列のみを抽出したデータフレームを返します。',
    args: [
      { name: 'x', desc: 'データフレーム' },
      { name: 'subset', desc: '行の抽出条件式' },
      { name: 'select', desc: '抽出する列' }
    ],
    example: 'subset(iris, Sepal.Length > 7.0, select = c(Sepal.Length, Species))',
    category: 'base'
  },
  'library': {
    name: 'library',
    pkg: 'base',
    signature: 'library(package, ...)',
    description: '指定した R パッケージを読み込み、関数を利用可能にします。',
    args: [{ name: 'package', desc: '読み込むパッケージ名' }],
    example: 'library(ggplot2)\nlibrary(dplyr)',
    category: 'base'
  },
  'install.packages': {
    name: 'install.packages',
    pkg: 'utils',
    signature: 'install.packages(pkgs, ...)',
    description: 'CRANリポジトリから指定のパッケージをダウンロード＆インストールします。',
    args: [{ name: 'pkgs', desc: 'パッケージ名（文字列ベクトル）' }],
    example: 'webr::install("dplyr")',
    category: 'base'
  },

  // IO
  'read.csv': {
    name: 'read.csv',
    pkg: 'utils',
    signature: 'read.csv(file, header = TRUE, sep = ",", stringsAsFactors = FALSE)',
    description: 'カンマ区切りの CSV ファイルを読み込んでデータフレームを作成します。',
    args: [
      { name: 'file', desc: 'ファイルパスまたはURL文字列' },
      { name: 'header', desc: '先頭行を列名として扱うか' },
      { name: 'sep', desc: '区切り文字（デフォルトはカンマ）' }
    ],
    example: 'df <- read.csv("sample_sales.csv")\nhead(df)',
    category: 'io'
  },
  'write.csv': {
    name: 'write.csv',
    pkg: 'utils',
    signature: 'write.csv(x, file = "", row.names = TRUE, ...)',
    description: 'データフレームを CSV 形式でファイルに書き出します。',
    args: [
      { name: 'x', desc: '書き出すデータフレーム' },
      { name: 'file', desc: '保存先ファイルパス' },
      { name: 'row.names', desc: '行名を先頭列に出力するか' }
    ],
    example: 'write.csv(iris, "iris_exported.csv", row.names = FALSE)',
    category: 'io'
  },

  // Statistics & Math
  'mean': {
    name: 'mean',
    pkg: 'base',
    signature: 'mean(x, trim = 0, na.rm = FALSE, ...)',
    description: '数値ベクトルの算術平均値を計算します。',
    args: [
      { name: 'x', desc: '数値ベクトル' },
      { name: 'na.rm', desc: 'TRUE の場合、欠損値(NA)を除外して計算' }
    ],
    example: 'mean(c(10, 20, 30, NA), na.rm = TRUE)',
    category: 'stats'
  },
  'median': {
    name: 'median',
    pkg: 'stats',
    signature: 'median(x, na.rm = FALSE)',
    description: '中央値（メディアン）を計算します。',
    args: [
      { name: 'x', desc: '数値ベクトル' },
      { name: 'na.rm', desc: 'TRUE の場合、NAを除外' }
    ],
    example: 'median(iris$Sepal.Length)',
    category: 'stats'
  },
  'sd': {
    name: 'sd',
    pkg: 'stats',
    signature: 'sd(x, na.rm = FALSE)',
    description: '不偏標準偏差（Standard Deviation）を計算します。',
    args: [
      { name: 'x', desc: '数値ベクトル' },
      { name: 'na.rm', desc: '欠損値を除外するか' }
    ],
    example: 'sd(iris$Petal.Width)',
    category: 'stats'
  },
  'var': {
    name: 'var',
    pkg: 'stats',
    signature: 'var(x, y = NULL, na.rm = FALSE)',
    description: '分散または共分散を計算します。',
    args: [
      { name: 'x', desc: '数値ベクトルまたは行列' },
      { name: 'na.rm', desc: '欠損値を除外するか' }
    ],
    example: 'var(iris$Sepal.Length)',
    category: 'stats'
  },
  'cor': {
    name: 'cor',
    pkg: 'stats',
    signature: 'cor(x, y = NULL, use = "everything", method = c("pearson", "kendall", "spearman"))',
    description: 'ピアソンの積率相関係数、または順位相関係数を計算します。',
    args: [
      { name: 'x', desc: '数値ベクトルまたはデータフレーム/行列' },
      { name: 'y', desc: '比較対象のベクトル' },
      { name: 'method', desc: '"pearson", "kendall", "spearman" のいずれか' }
    ],
    example: 'cor(iris[, 1:4])\ncor(mtcars$mpg, mtcars$wt)',
    category: 'stats'
  },
  'lm': {
    name: 'lm',
    pkg: 'stats',
    signature: 'lm(formula, data, subset, weights, ...)',
    description: '線形回帰モデル（単回帰・重回帰分析）を最小二乗法でフィッティングします。',
    args: [
      { name: 'formula', desc: 'モデル式 (例: y ~ x1 + x2)' },
      { name: 'data', desc: '使用するデータフレーム' }
    ],
    example: 'model <- lm(mpg ~ wt + hp, data = mtcars)\nsummary(model)\ncoef(model)',
    category: 'stats'
  },
  'glm': {
    name: 'glm',
    pkg: 'stats',
    signature: 'glm(formula, family = gaussian, data, ...)',
    description: '一般化線形モデル（ロジスティック回帰、ポアソン回帰等）を推定します。',
    args: [
      { name: 'formula', desc: 'モデル式 (例: survived ~ age + sex)' },
      { name: 'family', desc: '誤差構造 (例: binomial(link="logit"))' },
      { name: 'data', desc: 'データフレーム' }
    ],
    example: 'model <- glm(am ~ mpg + hp, data = mtcars, family = binomial)\nsummary(model)',
    category: 'stats'
  },
  't.test': {
    name: 't.test',
    pkg: 'stats',
    signature: 't.test(x, y = NULL, alternative = c("two.sided", "less", "greater"), mu = 0, paired = FALSE, var.equal = FALSE)',
    description: '1標本・2標本・対応のあるスチューデント/ウェルチの t 検定を実行します。',
    args: [
      { name: 'x', desc: '数値ベクトル または 式 (y ~ group)' },
      { name: 'y', desc: '第2群の数値ベクトル' },
      { name: 'var.equal', desc: 'TRUEで等分散を仮定（Studentのt検定）、FALSEでWelchのt検定' }
    ],
    example: 't.test(Sepal.Length ~ Species, data = subset(iris, Species != "virginica"))',
    category: 'stats'
  },
  'aov': {
    name: 'aov',
    pkg: 'stats',
    signature: 'aov(formula, data = NULL, ...)',
    description: '分散分析（ANOVA）モデルを適合し、群間差の有意性を検定します。',
    args: [
      { name: 'formula', desc: 'モデル式 (例: value ~ group)' },
      { name: 'data', desc: 'データフレーム' }
    ],
    example: 'res <- aov(Sepal.Length ~ Species, data = iris)\nsummary(res)\nTukeyHSD(res)',
    category: 'stats'
  },
  'rnorm': {
    name: 'rnorm',
    pkg: 'stats',
    signature: 'rnorm(n, mean = 0, sd = 1)',
    description: '指定した平均と標準偏差を持つ正規分布から n 個の擬似乱数を生成します。',
    args: [
      { name: 'n', desc: '生成する乱数の個数' },
      { name: 'mean', desc: '平均値（デフォルト 0）' },
      { name: 'sd', desc: '標準偏差（デフォルト 1）' }
    ],
    example: 'samples <- rnorm(1000, mean = 50, sd = 10)\nhist(samples)',
    category: 'stats'
  },
  'runif': {
    name: 'runif',
    pkg: 'stats',
    signature: 'runif(n, min = 0, max = 1)',
    description: '一様分布（min 〜 max）から n 個の乱数を生成します。',
    args: [
      { name: 'n', desc: '生成する乱数の個数' },
      { name: 'min', desc: '最小値' },
      { name: 'max', desc: '最大値' }
    ],
    example: 'runif(5, min = 10, max = 20)',
    category: 'stats'
  },
  'sample': {
    name: 'sample',
    pkg: 'base',
    signature: 'sample(x, size, replace = FALSE, prob = NULL)',
    description: 'ベクトルからランダムにサンプリング（無作為抽出）を行います。',
    args: [
      { name: 'x', desc: '抽出元のベクトル' },
      { name: 'size', desc: '抽出する要素数' },
      { name: 'replace', desc: '復元抽出（重複あり）にするか' }
    ],
    example: 'sample(1:6, size = 10, replace = TRUE) # サイコロ10回',
    category: 'base'
  },

  // Base Graphics
  'plot': {
    name: 'plot',
    pkg: 'graphics',
    signature: 'plot(x, y = NULL, type = "p", main = NULL, xlab = NULL, ylab = NULL, col = NULL, pch = 1, ...)',
    description: 'Base R の汎用プロット関数。散布図、折れ線グラフなどを描画します。',
    args: [
      { name: 'x, y', desc: 'プロットする座標データ' },
      { name: 'type', desc: '"p"(点), "l"(線), "b"(両方), "h"(ヒストグラム状)' },
      { name: 'main', desc: 'グラフのメインタイトル' },
      { name: 'pch', desc: '点の形状シンボル番号 (1-25)' }
    ],
    example: 'plot(iris$Sepal.Length, iris$Petal.Length, col = iris$Species, pch = 19, main = "Iris Plot")',
    category: 'base'
  },
  'hist': {
    name: 'hist',
    pkg: 'graphics',
    signature: 'hist(x, breaks = "Sturges", freq = NULL, col = NULL, main = "Histogram of ...", ...)',
    description: '度数分布を表すヒストグラムを描画します。',
    args: [
      { name: 'x', desc: '数値ベクトル' },
      { name: 'breaks', desc: 'ビンの分割数または境界ベクトル' },
      { name: 'col', desc: 'バーの塗りつぶし色' }
    ],
    example: 'hist(rnorm(500), breaks = 20, col = "skyblue", main = "Normal Distribution")',
    category: 'base'
  },
  'boxplot': {
    name: 'boxplot',
    pkg: 'graphics',
    signature: 'boxplot(formula, data = NULL, col = NULL, horizontal = FALSE, ...)',
    description: 'データの五数要約（中央値、四分位数、外れ値）を示す箱ひげ図を描画します。',
    args: [
      { name: 'formula', desc: 'プロット式 (例: value ~ group)' },
      { name: 'data', desc: 'データフレーム' },
      { name: 'col', desc: '箱の色' }
    ],
    example: 'boxplot(Sepal.Length ~ Species, data = iris, col = c("lightgreen", "lightblue", "pink"))',
    category: 'base'
  },
  'barplot': {
    name: 'barplot',
    pkg: 'graphics',
    signature: 'barplot(height, names.arg = NULL, beside = FALSE, col = NULL, ...)',
    description: '棒グラフを描画します。',
    args: [
      { name: 'height', desc: 'バーの高さを表すベクトルまたは行列' },
      { name: 'names.arg', desc: '各バーのラベル' }
    ],
    example: 'barplot(table(mtcars$cyl), col = "orange", main = "Cylinder Counts")',
    category: 'base'
  },

  // ggplot2
  'ggplot': {
    name: 'ggplot',
    pkg: 'ggplot2',
    signature: 'ggplot(data = NULL, mapping = aes(), ..., environment = parent.frame())',
    description: 'The Grammar of Graphics に基づく宣言的で美しい可視化オブジェクトを初期化します。',
    args: [
      { name: 'data', desc: 'デフォルトで使用するデータフレーム' },
      { name: 'mapping', desc: '美的一致 aes(x = ..., y = ..., color = ...)' }
    ],
    example: 'library(ggplot2)\nggplot(iris, aes(x = Sepal.Length, y = Petal.Length, color = Species)) +\n  geom_point(size = 3) +\n  theme_minimal()',
    category: 'ggplot2'
  },
  'aes': {
    name: 'aes',
    pkg: 'ggplot2',
    signature: 'aes(x, y, ...)',
    description: 'データの列をグラフの視覚的プロパティ（位置x/y、色color、塗りfill、サイズsize、形状shape等）に対応付けます。',
    args: [
      { name: 'x, y', desc: '軸にマッピングする変数名' },
      { name: 'color, fill', desc: '線・点の色または塗りつぶし色' }
    ],
    example: 'aes(x = wt, y = mpg, color = factor(cyl), size = hp)',
    category: 'ggplot2'
  },
  'geom_point': {
    name: 'geom_point',
    pkg: 'ggplot2',
    signature: 'geom_point(mapping = NULL, data = NULL, alpha = 1, size = 1.5, shape = 19, ...)',
    description: '散布図を描画するための点レイヤーを追加します。',
    args: [
      { name: 'alpha', desc: '透明度 (0:完全透明 〜 1:不透明)' },
      { name: 'size', desc: '点の大きさ' }
    ],
    example: 'ggplot(mtcars, aes(x = wt, y = mpg)) + geom_point(color = "steelblue", size = 3)',
    category: 'ggplot2'
  },
  'geom_line': {
    name: 'geom_line',
    pkg: 'ggplot2',
    signature: 'geom_line(mapping = NULL, data = NULL, linetype = "solid", linewidth = 0.5, ...)',
    description: '時系列や推移を表す折れ線レイヤーを追加します。',
    args: [
      { name: 'linewidth', desc: '線の太さ' },
      { name: 'linetype', desc: '線の種類 ("solid", "dashed", "dotted" 等)' }
    ],
    example: 'ggplot(economics, aes(x = date, y = unemploy)) + geom_line(color = "darkred")',
    category: 'ggplot2'
  },
  'geom_bar': {
    name: 'geom_bar',
    pkg: 'ggplot2',
    signature: 'geom_bar(mapping = NULL, data = NULL, stat = "count", position = "stack", ...)',
    description: 'カテゴリ変数の度数（頻度）を集計して棒グラフを描画します。',
    args: [
      { name: 'stat', desc: '"count"(自動カウント) または "identity"(y値そのまま)' },
      { name: 'position', desc: '"stack", "dodge"(横並び), "fill"(100%割合)' }
    ],
    example: 'ggplot(diamonds, aes(x = cut, fill = clarity)) + geom_bar(position = "dodge")',
    category: 'ggplot2'
  },
  'geom_col': {
    name: 'geom_col',
    pkg: 'ggplot2',
    signature: 'geom_col(mapping = NULL, data = NULL, position = "stack", ...)',
    description: '明示的な y 値をそのままバーの高さとして棒グラフを描画します。',
    args: [
      { name: 'position', desc: '"stack" または "dodge"' }
    ],
    example: 'df <- data.frame(item = c("A", "B"), val = c(10, 25))\nggplot(df, aes(x = item, y = val)) + geom_col(fill = "teal")',
    category: 'ggplot2'
  },
  'geom_histogram': {
    name: 'geom_histogram',
    pkg: 'ggplot2',
    signature: 'geom_histogram(mapping = NULL, data = NULL, bins = 30, binwidth = NULL, ...)',
    description: '連続変数の分布を表すヒストグラムレイヤーを追加します。',
    args: [
      { name: 'bins', desc: 'ビンの総数（デフォルト30）' },
      { name: 'binwidth', desc: '1つのビンの幅' }
    ],
    example: 'ggplot(iris, aes(x = Sepal.Length, fill = Species)) + geom_histogram(bins = 20, alpha = 0.6, position = "identity")',
    category: 'ggplot2'
  },
  'geom_boxplot': {
    name: 'geom_boxplot',
    pkg: 'ggplot2',
    signature: 'geom_boxplot(mapping = NULL, data = NULL, outlier.color = "black", ...)',
    description: '群ごとの分布を比較する箱ひげ図レイヤーを追加します。',
    args: [
      { name: 'outlier.color', desc: '外れ値の点の色' }
    ],
    example: 'ggplot(iris, aes(x = Species, y = Sepal.Length, fill = Species)) + geom_boxplot()',
    category: 'ggplot2'
  },
  'geom_smooth': {
    name: 'geom_smooth',
    pkg: 'ggplot2',
    signature: 'geom_smooth(mapping = NULL, data = NULL, method = "loess", se = TRUE, ...)',
    description: 'トレンド線・回帰直線と信頼区間バンドを重ねて描画します。',
    args: [
      { name: 'method', desc: '平滑化手法 ("lm", "glm", "gam", "loess")' },
      { name: 'se', desc: 'TRUE で95%信頼区間バンドを表示' }
    ],
    example: 'ggplot(mtcars, aes(x = wt, y = mpg)) + geom_point() + geom_smooth(method = "lm", color = "red")',
    category: 'ggplot2'
  },
  'facet_wrap': {
    name: 'facet_wrap',
    pkg: 'ggplot2',
    signature: 'facet_wrap(facets, nrow = NULL, ncol = NULL, scales = "fixed", ...)',
    description: 'カテゴリ変数ごとにグラフを格子状に分割（スモールマルチプル）表示します。',
    args: [
      { name: 'facets', desc: '分割基準 (~ Variable)' },
      { name: 'scales', desc: '"fixed"(共通軸), "free"(個別軸), "free_x", "free_y"' }
    ],
    example: 'ggplot(iris, aes(x = Sepal.Length, y = Sepal.Width)) + geom_point() + facet_wrap(~ Species)',
    category: 'ggplot2'
  },
  'theme_minimal': {
    name: 'theme_minimal',
    pkg: 'ggplot2',
    signature: 'theme_minimal(base_size = 11, base_family = "")',
    description: '余分な背景色やボーダーのない、クリーンでミニマルなモダンテーマを適用します。',
    args: [{ name: 'base_size', desc: '基本フォントサイズ' }],
    example: 'ggplot(iris, aes(x = Sepal.Length, y = Petal.Length)) + geom_point() + theme_minimal()',
    category: 'ggplot2'
  },
  'labs': {
    name: 'labs',
    pkg: 'ggplot2',
    signature: 'labs(title = NULL, subtitle = NULL, caption = NULL, x = NULL, y = NULL, color = NULL, ...)',
    description: 'グラフのタイトル、サブタイトル、軸ラベル、凡例ラベルを一括設定します。',
    args: [
      { name: 'title', desc: 'グラフのタイトル' },
      { name: 'x, y', desc: 'X軸およびY軸のラベル' }
    ],
    example: 'labs(title = "Iris Sepal vs Petal", x = "がく片の長さ (cm)", y = "花弁の長さ (cm)")',
    category: 'ggplot2'
  },

  // dplyr / Tidyverse
  'filter': {
    name: 'filter',
    pkg: 'dplyr',
    signature: 'filter(.data, ..., .by = NULL)',
    description: '指定した論理条件に合致する行のみを抽出します。',
    args: [
      { name: '.data', desc: 'データフレーム' },
      { name: '...', desc: '行の条件式 (例: age >= 20, status == "Active")' }
    ],
    example: 'library(dplyr)\niris %>%\n  filter(Species == "setosa", Sepal.Length > 5.0)',
    category: 'dplyr'
  },
  'select': {
    name: 'select',
    pkg: 'dplyr',
    signature: 'select(.data, ...)',
    description: 'データフレームから必要な列のみを抽出・並べ替え・リネームします。',
    args: [
      { name: '.data', desc: 'データフレーム' },
      { name: '...', desc: '選択する列名 (例: col1, starts_with("Sepal"))' }
    ],
    example: 'iris %>%\n  select(Species, Sepal.Length, Sepal.Width)',
    category: 'dplyr'
  },
  'mutate': {
    name: 'mutate',
    pkg: 'dplyr',
    signature: 'mutate(.data, ..., .by = NULL)',
    description: '新しい列を作成したり、既存の列を変換・計算します。',
    args: [
      { name: '.data', desc: 'データフレーム' },
      { name: '...', desc: '計算式 (例: total = price * qty, ratio = val / sum(val))' }
    ],
    example: 'mtcars %>%\n  mutate(wt_kg = wt * 1000 * 0.453592, km_per_l = mpg * 0.425144)',
    category: 'dplyr'
  },
  'group_by': {
    name: 'group_by',
    pkg: 'dplyr',
    signature: 'group_by(.data, ..., .add = FALSE)',
    description: 'データをカテゴリ変数ごとにグループ化し、後続の summarise() や mutate() をグループ単位で実行します。',
    args: [
      { name: '.data', desc: 'データフレーム' },
      { name: '...', desc: 'グループ化キー列' }
    ],
    example: 'iris %>%\n  group_by(Species) %>%\n  summarise(mean_len = mean(Sepal.Length), count = n())',
    category: 'dplyr'
  },
  'summarise': {
    name: 'summarise',
    pkg: 'dplyr',
    signature: 'summarise(.data, ..., .by = NULL)',
    description: 'グループごとに集計値を計算し、集計行のみに折り畳んだデータフレームを作成します。',
    args: [
      { name: '.data', desc: 'データフレーム' },
      { name: '...', desc: '集計式 (例: avg = mean(x), cnt = n(), total = sum(y))' }
    ],
    example: 'iris %>%\n  group_by(Species) %>%\n  summarise(avg_sepal = mean(Sepal.Length), sd_sepal = sd(Sepal.Length))',
    category: 'dplyr'
  },
  'arrange': {
    name: 'arrange',
    pkg: 'dplyr',
    signature: 'arrange(.data, ..., .by_group = FALSE)',
    description: '指定した列の値に基づいて行を昇順または降順（desc()）に並べ替えます。',
    args: [
      { name: '.data', desc: 'データフレーム' },
      { name: '...', desc: '並べ替えキー列 (例: desc(score), name)' }
    ],
    example: 'mtcars %>%\n  arrange(desc(mpg), wt)',
    category: 'dplyr'
  },
  'pivot_longer': {
    name: 'pivot_longer',
    pkg: 'tidyr',
    signature: 'pivot_longer(data, cols, names_to = "name", values_to = "value", ...)',
    description: '横持ちデータ（ワイド形式）を縦持ちデータ（ロング形式）に変換します。',
    args: [
      { name: 'cols', desc: '変形対象の列' },
      { name: 'names_to', desc: '列名を格納する新しい列名' },
      { name: 'values_to', desc: '値を格納する新しい列名' }
    ],
    example: 'library(tidyr)\niris %>%\n  pivot_longer(cols = 1:4, names_to = "Measurement", values_to = "Value")',
    category: 'tidyr'
  },
  'pivot_wider': {
    name: 'pivot_wider',
    pkg: 'tidyr',
    signature: 'pivot_wider(data, names_from = "name", values_from = "value", ...)',
    description: '縦持ちデータ（ロング形式）を横持ちデータ（ワイド形式）に展開します。',
    args: [
      { name: 'names_from', desc: '新しい列名になる値を持つ列' },
      { name: 'values_from', desc: 'セルの値になるデータを持つ列' }
    ],
    example: 'df %>%\n  pivot_wider(names_from = year, values_from = sales)',
    category: 'tidyr'
  }
};

export function getRDoc(token: string): RDocEntry | null {
  const clean = token.trim().replace(/^['"`]|['"`]$/g, '');
  return R_DOCS[clean] || null;
}
