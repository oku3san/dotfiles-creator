import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { loadContext } from './helpers.mjs';

const ctx = loadContext();

// Helper: reset Starship state to known defaults before each test
function reset() {
  const a = ctx.getAnswers();
  a.style = 'plain';
  a.character = '❯';
  a.customCharacter = '';
  a.color = 'cyan';
  a.customColor = '';
  a.modules = [];
  a.rightPromptModules = [];
  a.dirTruncationLength = 3;
  a.dirTruncateToRepo = true;
  a.timeFormat = '%H:%M';
  a.cmdDurationMinTime = 2000;
  a.gitShowStash = false;
  a.gitBranchTruncation = 20;
  a.pythonShowVenv = true;
  a.memoryThreshold = 75;
}

// ── getCharacter ───────────────────────────────────────
describe('getCharacter', () => {
  test('returns preset character when no custom value', () => {
    reset();
    ctx.getAnswers().character = '❯';
    ctx.getAnswers().customCharacter = '';
    assert.equal(ctx.getCharacter(), '❯');
  });

  test('returns customCharacter when character is "custom" and customCharacter is set', () => {
    reset();
    ctx.getAnswers().character = 'custom';
    ctx.getAnswers().customCharacter = '→';
    assert.equal(ctx.getCharacter(), '→');
  });

  test('returns "custom" literal when character is "custom" but customCharacter is empty', () => {
    reset();
    ctx.getAnswers().character = 'custom';
    ctx.getAnswers().customCharacter = '';
    // getCharacter returns character itself ('custom') when customCharacter is empty
    assert.equal(ctx.getCharacter(), 'custom');
  });
});

// ── getColor ───────────────────────────────────────────
describe('getColor', () => {
  test('returns preset color when no custom color', () => {
    reset();
    ctx.getAnswers().color = 'cyan';
    ctx.getAnswers().customColor = '';
    assert.equal(ctx.getColor(), 'cyan');
  });

  test('returns customColor when set', () => {
    reset();
    ctx.getAnswers().customColor = '#ff6600';
    assert.equal(ctx.getColor(), '#ff6600');
  });
});

// ── buildFormatParts ───────────────────────────────────
describe('buildFormatParts', () => {
  test('plain style includes $directory and $character', () => {
    const parts = ctx.buildFormatParts('plain', []);
    assert.ok(parts.includes('$directory'));
    assert.ok(parts.includes('$character'));
  });

  test('multiline style includes newline separator between info and prompt', () => {
    const parts = ctx.buildFormatParts('multiline', []);
    assert.ok(parts.includes('\\n'));
    assert.ok(parts.includes('$character'));
  });

  test('bracket style wraps directory with \\[ and \\]', () => {
    const parts = ctx.buildFormatParts('bracket', []);
    assert.ok(parts.includes('\\['));
    assert.ok(parts.includes('\\] '));
  });

  test('git module adds $git_branch$git_status', () => {
    const parts = ctx.buildFormatParts('plain', ['git']);
    assert.ok(parts.some(p => p.includes('$git_branch')));
  });

  test('node module adds $nodejs', () => {
    const parts = ctx.buildFormatParts('plain', ['node']);
    assert.ok(parts.includes('$nodejs'));
  });

  test('username module prepends $username', () => {
    const parts = ctx.buildFormatParts('plain', ['username']);
    assert.ok(parts.indexOf('$username') < parts.indexOf('$directory'));
  });
});

// ── addModuleVars ──────────────────────────────────────
describe('addModuleVars', () => {
  test('adds $nodejs for node module', () => {
    const parts = [];
    ctx.addModuleVars(parts, ['node']);
    assert.ok(parts.includes('$nodejs'));
  });

  test('adds $docker_context for docker module', () => {
    const parts = [];
    ctx.addModuleVars(parts, ['docker']);
    assert.ok(parts.includes('$docker_context'));
  });

  test('does not add vars for non-lang modules like git', () => {
    const parts = [];
    ctx.addModuleVars(parts, ['git']);
    // git is not in langModules
    assert.equal(parts.length, 0);
  });

  test('preserves order: node before python before rust', () => {
    const parts = [];
    ctx.addModuleVars(parts, ['rust', 'python', 'node']);
    const ni = parts.indexOf('$nodejs');
    const pi = parts.indexOf('$python');
    const ri = parts.indexOf('$rust');
    assert.ok(ni < pi && pi < ri, 'node < python < rust ordering');
  });
});

// ── generateConfig ─────────────────────────────────────
describe('generateConfig', () => {
  test('output contains Starship header comment', () => {
    reset();
    const config = ctx.generateConfig();
    assert.match(config, /# Starship Configuration/);
  });

  test('output contains [character] section', () => {
    reset();
    const config = ctx.generateConfig();
    assert.match(config, /\[character\]/);
  });

  test('output contains [directory] section', () => {
    reset();
    const config = ctx.generateConfig();
    assert.match(config, /\[directory\]/);
  });

  test('git module generates [git_branch] section', () => {
    reset();
    ctx.getAnswers().modules = ['git'];
    const config = ctx.generateConfig();
    assert.match(config, /\[git_branch\]/);
    assert.match(config, /\[git_status\]/);
  });

  test('no git module means no [git_branch] section', () => {
    reset();
    ctx.getAnswers().modules = [];
    const config = ctx.generateConfig();
    assert.doesNotMatch(config, /\[git_branch\]/);
  });

  test('python module generates [python] section', () => {
    reset();
    ctx.getAnswers().modules = ['python'];
    const config = ctx.generateConfig();
    assert.match(config, /\[python\]/);
  });

  test('time module reflects timeFormat setting', () => {
    reset();
    ctx.getAnswers().modules = ['time'];
    ctx.getAnswers().timeFormat = '%H:%M:%S';
    const config = ctx.generateConfig();
    assert.match(config, /\[time\]/);
    assert.match(config, /time_format = "%H:%M:%S"/);
  });

  test('memory module reflects memoryThreshold setting', () => {
    reset();
    ctx.getAnswers().modules = ['memory'];
    ctx.getAnswers().memoryThreshold = 50;
    const config = ctx.generateConfig();
    assert.match(config, /\[memory_usage\]/);
    assert.match(config, /threshold = 50/);
  });

  test('right_format line appears when a module is in rightPromptModules', () => {
    reset();
    ctx.getAnswers().modules = ['time'];
    ctx.getAnswers().rightPromptModules = ['time'];
    const config = ctx.generateConfig();
    assert.match(config, /right_format/);
  });

  test('nerd style adds nerd font symbols for node', () => {
    reset();
    ctx.getAnswers().style = 'nerd';
    ctx.getAnswers().modules = ['node'];
    const config = ctx.generateConfig();
    assert.match(config, /\[nodejs\]/);
    assert.match(config, /symbol/);
  });

  test('dirTruncationLength is reflected in truncation_length', () => {
    reset();
    ctx.getAnswers().dirTruncationLength = 5;
    const config = ctx.generateConfig();
    assert.match(config, /truncation_length = 5/);
  });

  test('STARSHIP_PRESETS.minimal contains git and cmd_duration', () => {
    assert.ok(ctx.STARSHIP_PRESETS.minimal.includes('git'));
    assert.ok(ctx.STARSHIP_PRESETS.minimal.includes('cmd_duration'));
  });
});
