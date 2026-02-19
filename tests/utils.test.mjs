import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { loadContext } from './helpers.mjs';

const ctx = loadContext();

// ── escapeHtml ─────────────────────────────────────────
describe('escapeHtml', () => {
  test('escapes ampersand', () => {
    assert.equal(ctx.escapeHtml('a & b'), 'a &amp; b');
  });

  test('escapes less-than', () => {
    assert.equal(ctx.escapeHtml('<tag>'), '&lt;tag&gt;');
  });

  test('escapes greater-than', () => {
    assert.equal(ctx.escapeHtml('a > b'), 'a &gt; b');
  });

  test('escapes double quote', () => {
    assert.equal(ctx.escapeHtml('"hello"'), '&quot;hello&quot;');
  });

  test('escapes single quote', () => {
    assert.equal(ctx.escapeHtml("it's"), 'it&#39;s');
  });

  test('escapes all special chars in one string', () => {
    assert.equal(ctx.escapeHtml('<a href="x">it\'s & done</a>'),
      '&lt;a href=&quot;x&quot;&gt;it&#39;s &amp; done&lt;/a&gt;');
  });

  test('returns plain string unchanged', () => {
    assert.equal(ctx.escapeHtml('hello world'), 'hello world');
  });
});

// ── highlightValue ─────────────────────────────────────
describe('highlightValue', () => {
  test('wraps double-quoted string with token-string span', () => {
    const result = ctx.highlightValue('"hello"');
    assert.match(result, /class="token-string"/);
    assert.match(result, /hello/);
  });

  test('wraps single-quoted string with token-string span', () => {
    const result = ctx.highlightValue("'world'");
    assert.match(result, /class="token-string"/);
  });

  test('wraps "true" with token-boolean span', () => {
    const result = ctx.highlightValue('true');
    assert.match(result, /class="token-boolean"/);
  });

  test('wraps "false" with token-boolean span', () => {
    const result = ctx.highlightValue('false');
    assert.match(result, /class="token-boolean"/);
  });

  test('wraps "on" with token-boolean span (case-insensitive)', () => {
    const result = ctx.highlightValue('on');
    assert.match(result, /class="token-boolean"/);
  });

  test('wraps integer with token-number span', () => {
    const result = ctx.highlightValue('42');
    assert.match(result, /class="token-number"/);
  });

  test('wraps negative number with token-number span', () => {
    const result = ctx.highlightValue('-5');
    assert.match(result, /class="token-number"/);
  });

  test('returns unclassed text for unknown value', () => {
    const result = ctx.highlightValue('cyan');
    assert.doesNotMatch(result, /token-/);
    assert.match(result, /cyan/);
  });
});

// ── highlightToml ──────────────────────────────────────
describe('highlightToml', () => {
  test('wraps comment lines with token-comment span', () => {
    const result = ctx.highlightToml('# This is a comment');
    assert.match(result, /class="token-comment"/);
  });

  test('wraps section headers with token-section span', () => {
    const result = ctx.highlightToml('[character]');
    assert.match(result, /class="token-section"/);
  });

  test('wraps double-bracketed headers with token-section span', () => {
    const result = ctx.highlightToml('[[battery.display]]');
    assert.match(result, /class="token-section"/);
  });

  test('wraps key in key=value pair with token-key span', () => {
    const result = ctx.highlightToml('style = "bold cyan"');
    assert.match(result, /class="token-key"/);
  });

  test('passes through empty lines unchanged', () => {
    const result = ctx.highlightToml('');
    assert.equal(result, '');
  });

  test('handles multi-line input', () => {
    const result = ctx.highlightToml('# comment\n[section]\nkey = "val"');
    const lines = result.split('\n');
    assert.equal(lines.length, 3);
    assert.match(lines[0], /token-comment/);
    assert.match(lines[1], /token-section/);
    assert.match(lines[2], /token-key/);
  });
});

// ── highlightConf ──────────────────────────────────────
describe('highlightConf', () => {
  test('wraps comment lines with token-comment span', () => {
    const result = ctx.highlightConf('# Basic settings');
    assert.match(result, /class="token-comment"/);
  });

  test('wraps "set" commands with token-key span', () => {
    const result = ctx.highlightConf('set -g mouse on');
    assert.match(result, /class="token-key"/);
  });

  test('wraps "bind" commands with token-key span', () => {
    const result = ctx.highlightConf('bind r source-file ~/.tmux.conf');
    assert.match(result, /class="token-key"/);
  });

  test('passes through unknown lines unchanged', () => {
    const result = ctx.highlightConf('some-unknown-line');
    assert.doesNotMatch(result, /token-key/);
    assert.doesNotMatch(result, /token-comment/);
  });
});

// ── highlightZsh ───────────────────────────────────────
describe('highlightZsh', () => {
  test('wraps comment lines with token-comment span', () => {
    const result = ctx.highlightZsh('# History configuration');
    assert.match(result, /class="token-comment"/);
  });

  test('wraps alias lines with token-key span for "alias" keyword', () => {
    const result = ctx.highlightZsh('alias ll="ls -lh"');
    assert.match(result, /class="token-key"/);
    assert.match(result, /class="token-section"/);
  });

  test('wraps export lines with token-key span', () => {
    const result = ctx.highlightZsh('export ZSH="$HOME/.oh-my-zsh"');
    assert.match(result, /class="token-key"/);
  });

  test('wraps setopt lines with token-key span', () => {
    const result = ctx.highlightZsh('setopt SHARE_HISTORY');
    assert.match(result, /class="token-key"/);
  });
});

// ── highlightLua ───────────────────────────────────────
describe('highlightLua', () => {
  test('wraps comment lines with token-comment span', () => {
    const result = ctx.highlightLua('-- Neovim Configuration');
    assert.match(result, /class="token-comment"/);
  });

  test('wraps "local" keyword with token-key span', () => {
    const result = ctx.highlightLua('local x = 1');
    assert.match(result, /class="token-key"/);
  });

  test('wraps "true" with token-boolean span', () => {
    const result = ctx.highlightLua('vim.opt.number = true');
    assert.match(result, /class="token-boolean"/);
  });

  test('wraps numbers with token-number span', () => {
    const result = ctx.highlightLua('vim.opt.tabstop = 2');
    assert.match(result, /class="token-number"/);
  });
});
