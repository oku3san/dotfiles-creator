// ── CLAUDE.md config generation ───────────────────────

function highlightMarkdown(text) {
  return text.split('\n').map(line => {
    // H1 headings
    if (/^# /.test(line)) {
      return `<span class="token-section">${escapeHtml(line)}</span>`;
    }
    // H2 headings
    if (/^## /.test(line)) {
      return `<span class="token-section">${escapeHtml(line)}</span>`;
    }
    // H3 headings
    if (/^### /.test(line)) {
      return `<span class="token-key">${escapeHtml(line)}</span>`;
    }
    // Code blocks (``` lines)
    if (/^```/.test(line)) {
      return `<span class="token-comment">${escapeHtml(line)}</span>`;
    }
    // Inline code (`code`)
    let result = escapeHtml(line);
    result = result.replace(/(&#96;[^&#]*?&#96;)/g, '<span class="token-string">$1</span>');
    // Bold **text**
    result = result.replace(/(\*\*[^*]+\*\*)/g, '<span class="token-boolean">$1</span>');
    // List items
    if (/^\s*[-*] /.test(line)) {
      return `<span class="token-key">${result}</span>`;
    }
    return result;
  }).join('\n');
}

function generateClaudeMdConfig() {
  const lines = [];

  // Header
  const name = claudeMdAnswers.projectName.trim() || 'MyProject';
  lines.push(`# CLAUDE.md`);
  lines.push('');

  // Project overview
  lines.push('## プロジェクト概要');
  lines.push('');
  if (claudeMdAnswers.projectDescription.trim()) {
    lines.push(claudeMdAnswers.projectDescription.trim());
  } else {
    lines.push(`**${name}** のプロジェクト設定ファイルです。`);
  }
  lines.push('');

  // Tech stack
  const langLabels = {
    javascript: 'JavaScript / TypeScript',
    python: 'Python',
    go: 'Go',
    rust: 'Rust',
    java: 'Java',
    ruby: 'Ruby',
    other: 'その他',
  };
  const lang = claudeMdAnswers.language;
  const framework = claudeMdAnswers.framework.trim();

  lines.push('## 技術スタック');
  lines.push('');
  if (lang) lines.push(`- **言語:** ${langLabels[lang] || lang}`);
  if (framework) lines.push(`- **フレームワーク/ライブラリ:** ${framework}`);
  lines.push('');

  // Development commands
  const hasCmds = claudeMdAnswers.buildCommand || claudeMdAnswers.testCommand ||
                  claudeMdAnswers.devCommand || claudeMdAnswers.lintCommand;
  if (hasCmds) {
    lines.push('## 開発コマンド');
    lines.push('');
    if (claudeMdAnswers.devCommand.trim()) {
      lines.push('開発サーバー起動:');
      lines.push('```bash');
      lines.push(claudeMdAnswers.devCommand.trim());
      lines.push('```');
      lines.push('');
    }
    if (claudeMdAnswers.buildCommand.trim()) {
      lines.push('ビルド:');
      lines.push('```bash');
      lines.push(claudeMdAnswers.buildCommand.trim());
      lines.push('```');
      lines.push('');
    }
    if (claudeMdAnswers.testCommand.trim()) {
      lines.push('テスト実行:');
      lines.push('```bash');
      lines.push(claudeMdAnswers.testCommand.trim());
      lines.push('```');
      lines.push('');
    }
    if (claudeMdAnswers.lintCommand.trim()) {
      lines.push('リント:');
      lines.push('```bash');
      lines.push(claudeMdAnswers.lintCommand.trim());
      lines.push('```');
      lines.push('');
    }
  }

  // Coding conventions
  const conventionLabels = {
    'minimal-changes':    '変更は最小限にし、タスクに集中する',
    'no-over-engineering':'不要な抽象化や過剰な設計を避ける',
    'commit-why':         'コミットメッセージは「何を」ではなく「なぜ」を説明する',
    'readable-code':      '巧妙なコードより読みやすいコードを優先する',
    'no-dependencies':    '外部依存を最小限に保つ — 明示的に要求されない限り新しいライブラリを追加しない',
    'japanese-ui':        'UIテキストは日本語、コメントとコード識別子は英語',
    'no-security-vulns':  'XSS、SQLインジェクション、コマンドインジェクションなどのセキュリティ脆弱性を導入しない',
    'test-after-change':  '変更後にテストを実行して動作を確認する',
  };

  if (claudeMdAnswers.conventions.length > 0) {
    lines.push('## コーディング規約');
    lines.push('');
    claudeMdAnswers.conventions.forEach(c => {
      if (conventionLabels[c]) lines.push(`- ${conventionLabels[c]}`);
    });
    lines.push('');
  }

  // AI guidelines
  const guidelineLabels = {
    'read-before-edit':  '編集前に読む: 変更を提案する前に必ずファイルを読む',
    'stay-in-scope':     'スコープ内に留まる: 直接依頼されたか、明らかに必要な変更のみ行う',
    'update-docs':       'ドキュメント更新: ファイル追加、ツール導入、プロジェクト構成変更時にこのファイルを更新する',
    'branch-workflow':   'ブランチワークフロー: `main` に直接コミットせず、フィーチャーブランチで開発する',
    'keep-simple':       'シンプルに保つ: 明示的に要求されない限りビルドツールやフレームワークを導入しない',
    'verify-in-browser': 'ブラウザで検証: テストがない場合、変更が正しく表示されることを手動で確認する',
    'run-tests':         'テスト実行: 変更後に必ずテストスイートを実行し、全テストが通ることを確認する',
  };

  if (claudeMdAnswers.aiGuidelines.length > 0) {
    lines.push('## AIアシスタント向けガイドライン');
    lines.push('');
    claudeMdAnswers.aiGuidelines.forEach(g => {
      if (guidelineLabels[g]) lines.push(`- **${guidelineLabels[g].split(':')[0]}:** ${guidelineLabels[g].split(':').slice(1).join(':').trim()}`);
    });
    lines.push('');
  }

  return lines.join('\n');
}

// ── Result rendering ───────────────────────────────────

function renderClaudeMdResult() {
  const config = generateClaudeMdConfig();
  const output = document.getElementById('claudemd-config-output');
  if (output) {
    output.innerHTML = `<pre>${highlightMarkdown(config)}</pre>`;
  }
}

function copyClaudeMdConfig() {
  const config = generateClaudeMdConfig();
  navigator.clipboard.writeText(config).then(() => {
    showToast('コピーしました');
  });
}

function downloadClaudeMdConfig() {
  const config = generateClaudeMdConfig();
  const blob = new Blob([config], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'CLAUDE.md';
  a.click();
  URL.revokeObjectURL(url);
}
