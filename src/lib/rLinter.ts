export interface LintDiagnostic {
  line: number;
  column?: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
  codeSnippet?: string;
}

export function lintRCode(code: string, isRmd: boolean = false): LintDiagnostic[] {
  const diagnostics: LintDiagnostic[] = [];
  const lines = code.split('\n');

  // 1. Bracket & Quote matching stack
  const stack: { char: string; line: number; col: number }[] = [];
  let inDoubleQuote = false;
  let inSingleQuote = false;
  let quoteStartLine = 0;
  let inRmdChunk = false;
  let rmdChunkStartLine = 0;

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const line = lines[lineIdx];
    const lineNum = lineIdx + 1;
    const trimmed = line.trim();

    // R Markdown Chunk validation
    if (isRmd) {
      if (trimmed.startsWith('```{r') || trimmed.startsWith('```{R')) {
        if (inRmdChunk) {
          diagnostics.push({
            line: lineNum,
            severity: 'error',
            message: `Rmd構文エラー: 行 ${rmdChunkStartLine} のチャンクが終了する前に新しいチャンクが開始されました。`,
          });
        }
        inRmdChunk = true;
        rmdChunkStartLine = lineNum;
        continue;
      } else if (trimmed.startsWith('```')) {
        if (!inRmdChunk) {
          diagnostics.push({
            line: lineNum,
            severity: 'warning',
            message: 'Rmd警告: 開始チャンク (```{r}) のない孤立した終了コードブロック (```) です。',
          });
        }
        inRmdChunk = false;
        continue;
      }

      // If in Rmd mode and not in R chunk, treat line as markdown text (skip pure R code linter)
      if (!inRmdChunk) {
        continue;
      }
    }

    // Skip full comment lines
    if (trimmed.startsWith('#')) {
      continue;
    }

    // Line-level checks
    // Trailing operators warning (if intentional pipe/plus, that's fine, but warn if ends on dangling comma or syntax error)
    if (trimmed.endsWith(',,')) {
      diagnostics.push({
        line: lineNum,
        severity: 'error',
        message: '構文エラー: 連続したカンマ (,,) があります。',
      });
    }

    if (trimmed.includes('== =') || trimmed.includes('= ==')) {
      diagnostics.push({
        line: lineNum,
        severity: 'error',
        message: '構文エラー: 不正な等号演算子の組み合わせです。',
      });
    }

    // Character scan on current line
    let escaped = false;
    for (let colIdx = 0; colIdx < line.length; colIdx++) {
      const ch = line[colIdx];

      if (escaped) {
        escaped = false;
        continue;
      }

      if (ch === '\\') {
        escaped = true;
        continue;
      }

      // Comments inside line (if not inside quotes)
      if (ch === '#' && !inDoubleQuote && !inSingleQuote) {
        break; // Ignore rest of line
      }

      // Quotes
      if (ch === '"' && !inSingleQuote) {
        inDoubleQuote = !inDoubleQuote;
        if (inDoubleQuote) quoteStartLine = lineNum;
        continue;
      }
      if (ch === "'" && !inDoubleQuote) {
        inSingleQuote = !inSingleQuote;
        if (inSingleQuote) quoteStartLine = lineNum;
        continue;
      }

      // If inside string literal, skip bracket checks
      if (inDoubleQuote || inSingleQuote) {
        continue;
      }

      // Brackets
      if (ch === '(' || ch === '{' || ch === '[') {
        stack.push({ char: ch, line: lineNum, col: colIdx + 1 });
      } else if (ch === ')' || ch === '}' || ch === ']') {
        if (stack.length === 0) {
          diagnostics.push({
            line: lineNum,
            column: colIdx + 1,
            severity: 'error',
            message: `構文エラー: 対応する開き括弧がない '${ch}' があります。`,
          });
        } else {
          const top = stack.pop()!;
          const match = (top.char === '(' && ch === ')') ||
                        (top.char === '{' && ch === '}') ||
                        (top.char === '[' && ch === ']');
          if (!match) {
            diagnostics.push({
              line: lineNum,
              column: colIdx + 1,
              severity: 'error',
              message: `括弧の不一致: 行 ${top.line} の '${top.char}' に対して '${ch}' で閉じようとしています。`,
            });
          }
        }
      }
    }

    // Check if string literal was left unclosed at line break (in R, multi-line string is allowed, but often a typo)
  }

  // Check unclosed quotes
  if (inDoubleQuote) {
    diagnostics.push({
      line: quoteStartLine,
      severity: 'error',
      message: `文字列エラー: 行 ${quoteStartLine} で開始されたダブルクォート (") が閉じていません。`,
    });
  }
  if (inSingleQuote) {
    diagnostics.push({
      line: quoteStartLine,
      severity: 'error',
      message: `文字列エラー: 行 ${quoteStartLine} で開始されたシングルクォート (') が閉じていません。`,
    });
  }

  // Check unclosed brackets
  while (stack.length > 0) {
    const unclosed = stack.pop()!;
    diagnostics.push({
      line: unclosed.line,
      column: unclosed.col,
      severity: 'error',
      message: `未閉じの括弧: 行 ${unclosed.line} (列 ${unclosed.col}) の '${unclosed.char}' が閉じていません。`,
    });
  }

  // Check unclosed Rmd chunk
  if (isRmd && inRmdChunk) {
    diagnostics.push({
      line: rmdChunkStartLine,
      severity: 'warning',
      message: 'Rmd構文警告: 行 ' + rmdChunkStartLine + ' のチャンク (```{r}) が末尾で閉じられていません (``` を追加してください)。',
    });
  }

  return diagnostics;
}
