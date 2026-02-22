import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { loadContext } from './helpers.mjs';

const ctx = loadContext();

// Helper: reset CLAUDE.md state to known defaults
function reset() {
  const a = ctx.getClaudeMdAnswers();
  a.projectName = 'MyProject';
  a.projectDescription = '';
  a.language = 'javascript';
  a.framework = '';
  a.buildCommand = '';
  a.testCommand = '';
  a.devCommand = '';
  a.lintCommand = '';
  a.conventions = [];
  a.aiGuidelines = [];
}

// ── generateClaudeMdConfig ──────────────────────────────
describe('generateClaudeMdConfig', () => {
  test('output starts with # CLAUDE.md header', () => {
    reset();
    const out = ctx.generateClaudeMdConfig();
    assert.ok(out.startsWith('# CLAUDE.md'), 'should start with # CLAUDE.md');
  });

  test('project name appears in overview section', () => {
    reset();
    const a = ctx.getClaudeMdAnswers();
    a.projectName = 'awesome-tool';
    const out = ctx.generateClaudeMdConfig();
    assert.ok(out.includes('awesome-tool'), 'project name should appear in output');
  });

  test('empty project name falls back to MyProject', () => {
    reset();
    const a = ctx.getClaudeMdAnswers();
    a.projectName = '';
    const out = ctx.generateClaudeMdConfig();
    assert.ok(out.includes('MyProject'), 'should fall back to MyProject');
  });

  test('project description is included when provided', () => {
    reset();
    const a = ctx.getClaudeMdAnswers();
    a.projectDescription = 'This is my awesome project';
    const out = ctx.generateClaudeMdConfig();
    assert.ok(out.includes('This is my awesome project'), 'description should appear in output');
  });

  test('language appears in tech stack section', () => {
    reset();
    const a = ctx.getClaudeMdAnswers();
    a.language = 'python';
    const out = ctx.generateClaudeMdConfig();
    assert.ok(out.includes('Python'), 'Python should appear in tech stack');
  });

  test('javascript language renders as JavaScript / TypeScript', () => {
    reset();
    const a = ctx.getCloudeMdAnswers !== undefined
      ? ctx.getCloudeMdAnswers()
      : ctx.getClaudeMdAnswers();
    a.language = 'javascript';
    const out = ctx.generateClaudeMdConfig();
    assert.ok(out.includes('JavaScript / TypeScript'), 'should render JS/TS label');
  });

  test('framework is included in tech stack when provided', () => {
    reset();
    const a = ctx.getClaudeMdAnswers();
    a.framework = 'React';
    const out = ctx.generateClaudeMdConfig();
    assert.ok(out.includes('React'), 'framework should appear in output');
  });

  test('no framework: framework line is omitted', () => {
    reset();
    const a = ctx.getClaudeMdAnswers();
    a.framework = '';
    const out = ctx.generateClaudeMdConfig();
    assert.ok(!out.includes('フレームワーク'), 'framework line should not appear when empty');
  });

  test('test command appears inside a code block', () => {
    reset();
    const a = ctx.getClaudeMdAnswers();
    a.testCommand = 'npm test';
    const out = ctx.generateClaudeMdConfig();
    assert.ok(out.includes('npm test'), 'test command should appear in output');
    assert.ok(out.includes('```'), 'code block fences should be present');
  });

  test('build command appears in output', () => {
    reset();
    const a = ctx.getClaudeMdAnswers();
    a.buildCommand = 'npm run build';
    const out = ctx.generateClaudeMdConfig();
    assert.ok(out.includes('npm run build'), 'build command should appear in output');
  });

  test('dev command appears in output', () => {
    reset();
    const a = ctx.getClaudeMdAnswers();
    a.devCommand = 'npm run dev';
    const out = ctx.generateClaudeMdConfig();
    assert.ok(out.includes('npm run dev'), 'dev command should appear in output');
  });

  test('lint command appears in output', () => {
    reset();
    const a = ctx.getClaudeMdAnswers();
    a.lintCommand = 'npm run lint';
    const out = ctx.generateClaudeMdConfig();
    assert.ok(out.includes('npm run lint'), 'lint command should appear in output');
  });

  test('no commands: development commands section is omitted', () => {
    reset();
    const a = ctx.getClaudeMdAnswers();
    a.buildCommand = '';
    a.testCommand = '';
    a.devCommand = '';
    a.lintCommand = '';
    const out = ctx.generateClaudeMdConfig();
    assert.ok(!out.includes('## 開発コマンド'), 'commands section should not appear when all are empty');
  });

  test('conventions section appears when conventions are selected', () => {
    reset();
    const a = ctx.getClaudeMdAnswers();
    a.conventions = ['minimal-changes', 'readable-code'];
    const out = ctx.generateClaudeMdConfig();
    assert.ok(out.includes('## コーディング規約'), 'conventions section header should appear');
    assert.ok(out.includes('変更は最小限'), 'minimal-changes label should appear');
    assert.ok(out.includes('読みやすい'), 'readable-code label should appear');
  });

  test('no conventions selected: conventions section is omitted', () => {
    reset();
    const a = ctx.getClaudeMdAnswers();
    a.conventions = [];
    const out = ctx.generateClaudeMdConfig();
    assert.ok(!out.includes('## コーディング規約'), 'conventions section should not appear when none selected');
  });

  test('ai guidelines section appears when guidelines are selected', () => {
    reset();
    const a = ctx.getClaudeMdAnswers();
    a.aiGuidelines = ['read-before-edit', 'branch-workflow'];
    const out = ctx.generateClaudeMdConfig();
    assert.ok(out.includes('## AIアシスタント向けガイドライン'), 'ai guidelines section header should appear');
    assert.ok(out.includes('編集前に読む'), 'read-before-edit label should appear');
    assert.ok(out.includes('ブランチワークフロー'), 'branch-workflow label should appear');
  });

  test('no ai guidelines selected: section is omitted', () => {
    reset();
    const a = ctx.getClaudeMdAnswers();
    a.aiGuidelines = [];
    const out = ctx.generateClaudeMdConfig();
    assert.ok(!out.includes('## AIアシスタント向けガイドライン'), 'ai guidelines section should not appear when none selected');
  });

  test('no-security-vulns convention generates correct label', () => {
    reset();
    const a = ctx.getClaudeMdAnswers();
    a.conventions = ['no-security-vulns'];
    const out = ctx.generateClaudeMdConfig();
    assert.ok(out.includes('XSS'), 'security convention should mention XSS');
  });

  test('stay-in-scope guideline generates correct label', () => {
    reset();
    const a = ctx.getClaudeMdAnswers();
    a.aiGuidelines = ['stay-in-scope'];
    const out = ctx.generateClaudeMdConfig();
    assert.ok(out.includes('スコープ内に留まる'), 'stay-in-scope label should appear');
  });

  test('go language renders correctly', () => {
    reset();
    const a = ctx.getClaudeMdAnswers();
    a.language = 'go';
    const out = ctx.generateClaudeMdConfig();
    assert.ok(out.includes('Go'), 'Go label should appear');
  });
});

// ── highlightMarkdown ───────────────────────────────────
describe('highlightMarkdown', () => {
  test('H1 headings are wrapped with token-section span', () => {
    const result = ctx.highlightMarkdown('# My Project');
    assert.ok(result.includes('token-section'), 'H1 should have token-section span');
    assert.ok(result.includes('# My Project'), 'heading text should be preserved');
  });

  test('H2 headings are wrapped with token-section span', () => {
    const result = ctx.highlightMarkdown('## Tech Stack');
    assert.ok(result.includes('token-section'), 'H2 should have token-section span');
  });

  test('H3 headings are wrapped with token-key span', () => {
    const result = ctx.highlightMarkdown('### Details');
    assert.ok(result.includes('token-key'), 'H3 should have token-key span');
  });

  test('code fences are wrapped with token-comment span', () => {
    const result = ctx.highlightMarkdown('```bash');
    assert.ok(result.includes('token-comment'), 'code fence should have token-comment span');
  });

  test('list items are wrapped with token-key span', () => {
    const result = ctx.highlightMarkdown('- some item');
    assert.ok(result.includes('token-key'), 'list item should have token-key span');
  });

  test('HTML special chars are escaped', () => {
    const result = ctx.highlightMarkdown('plain text <b> & "quotes"');
    assert.ok(result.includes('&lt;'), 'less-than should be escaped');
    assert.ok(result.includes('&amp;'), 'ampersand should be escaped');
  });

  test('plain lines are returned without extra spans', () => {
    const result = ctx.highlightMarkdown('just some text');
    assert.equal(result, 'just some text', 'plain text should not be wrapped');
  });

  test('multi-line input produces multi-line output', () => {
    const input = '# Title\n\nsome text\n- item';
    const result = ctx.highlightMarkdown(input);
    const lines = result.split('\n');
    assert.equal(lines.length, 4, 'output should have same number of lines as input');
  });
});
