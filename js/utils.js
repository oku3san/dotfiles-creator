// ── Syntax highlighting ───────────────────────────────
function highlightToml(text) {
  return text.split('\n').map(line => {
    // Comments
    if (/^\s*#/.test(line)) {
      return `<span class="token-comment">${escapeHtml(line)}</span>`;
    }
    // Section headers [foo] or [[foo.bar]]
    if (/^\s*\[{1,2}[^\]]+\]{1,2}\s*$/.test(line)) {
      return `<span class="token-section">${escapeHtml(line)}</span>`;
    }
    // Key = value pairs
    const kvMatch = line.match(/^(\s*\S+)(\s*=\s*)(.+)$/);
    if (kvMatch) {
      const key = `<span class="token-key">${escapeHtml(kvMatch[1])}</span>`;
      const eq = escapeHtml(kvMatch[2]);
      const val = highlightValue(kvMatch[3]);
      return key + eq + val;
    }
    return escapeHtml(line);
  }).join('\n');
}

function highlightConf(text) {
  return text.split('\n').map(line => {
    // Comments
    if (/^\s*#/.test(line)) {
      return `<span class="token-comment">${escapeHtml(line)}</span>`;
    }
    // Commands like 'set -g key value', 'bind key action'
    const cmdMatch = line.match(/^(\s*(?:set|setw|bind|unbind|run|source-file)\b)(.*)$/);
    if (cmdMatch) {
      const cmd = `<span class="token-key">${escapeHtml(cmdMatch[1])}</span>`;
      const rest = highlightConfArgs(cmdMatch[2]);
      return cmd + rest;
    }
    return escapeHtml(line);
  }).join('\n');
}

function highlightZsh(text) {
  return text.split('\n').map(line => {
    // Comments
    if (/^\s*#/.test(line)) {
      return `<span class="token-comment">${escapeHtml(line)}</span>`;
    }
    // alias x="y"
    const aliasMatch = line.match(/^(\s*alias\s+)(\S+?)(=)(.+)$/);
    if (aliasMatch) {
      return `<span class="token-key">${escapeHtml(aliasMatch[1])}</span><span class="token-section">${escapeHtml(aliasMatch[2])}</span>${escapeHtml(aliasMatch[3])}${highlightValue(aliasMatch[4])}`;
    }
    // export VAR=val
    const exportMatch = line.match(/^(\s*export\s+)(\w+)(=)(.+)$/);
    if (exportMatch) {
      return `<span class="token-key">${escapeHtml(exportMatch[1])}</span><span class="token-section">${escapeHtml(exportMatch[2])}</span>${escapeHtml(exportMatch[3])}${highlightValue(exportMatch[4])}`;
    }
    // VAR=val
    const varMatch = line.match(/^(\s*\w+)(=)(.+)$/);
    if (varMatch) {
      return `<span class="token-section">${escapeHtml(varMatch[1])}</span>${escapeHtml(varMatch[2])}${highlightValue(varMatch[3])}`;
    }
    // Commands: setopt, autoload, compinit, bindkey, source, zstyle, zinit, plugins
    const cmdMatch = line.match(/^(\s*(?:setopt|autoload|compinit|bindkey|source|zstyle|zinit\s+\w+|plugins)\b)(.*)$/);
    if (cmdMatch) {
      return `<span class="token-key">${escapeHtml(cmdMatch[1])}</span>${escapeHtml(cmdMatch[2])}`;
    }
    return escapeHtml(line);
  }).join('\n');
}

function highlightLua(text) {
  return text.split('\n').map(line => {
    // Comments
    if (/^\s*--/.test(line)) {
      return `<span class="token-comment">${escapeHtml(line)}</span>`;
    }
    // Strings
    let result = escapeHtml(line);
    result = result.replace(/(&quot;[^&]*?&quot;|&#39;[^&]*?&#39;)/g, '<span class="token-string">$1</span>');
    // Booleans
    result = result.replace(/\b(true|false|nil)\b/g, '<span class="token-boolean">$1</span>');
    // Numbers
    result = result.replace(/\b(\d+)\b/g, '<span class="token-number">$1</span>');
    // Keywords
    result = result.replace(/\b(local|return|if|then|else|elseif|end|function|require|for|do|in)\b/g, '<span class="token-key">$1</span>');
    return result;
  }).join('\n');
}

function highlightValue(val) {
  val = val.trim();
  // Quoted strings
  if (/^".*"$/.test(val) || /^'.*'$/.test(val)) {
    return `<span class="token-string">${escapeHtml(val)}</span>`;
  }
  // Booleans
  if (/^(true|false|on|off|yes|no)$/i.test(val)) {
    return `<span class="token-boolean">${escapeHtml(val)}</span>`;
  }
  // Numbers
  if (/^-?\d+(\.\d+)?$/.test(val)) {
    return `<span class="token-number">${escapeHtml(val)}</span>`;
  }
  return escapeHtml(val);
}

function highlightConfArgs(text) {
  // Highlight quoted strings in tmux conf arguments
  return escapeHtml(text).replace(/(&quot;[^&]*?&quot;|&#39;[^&]*?&#39;)/g, '<span class="token-string">$1</span>');
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// ── Dynamic option setup (avoids duplicate listeners) ─
function setupDynamicOptions(root) {
  root.querySelectorAll('.options[data-type="radio"]').forEach(container => {
    const key = container.dataset.key;
    container.querySelectorAll('.option').forEach(option => {
      option.addEventListener('click', () => {
        container.querySelectorAll('.option').forEach(o => o.classList.remove('selected'));
        option.classList.add('selected');
        if (key.startsWith('zsh-')) {
          const zshKey = key.replace('zsh-', '').replace(/-([a-z])/g, (_, c) => c.toUpperCase());
          zshAnswers[zshKey] = option.dataset.value;
        } else if (key.startsWith('neovim-')) {
          const nvimKey = key.replace('neovim-', '').replace(/-([a-z])/g, (_, c) => c.toUpperCase());
          neovimAnswers[nvimKey] = option.dataset.value;
        }
      });
    });
  });

  root.querySelectorAll('.options[data-type="checkbox"]').forEach(container => {
    const key = container.dataset.key;
    container.querySelectorAll('.option').forEach(option => {
      option.addEventListener('click', () => {
        option.classList.toggle('selected');
        const val = option.dataset.value;
        if (key.startsWith('zsh-')) {
          const zshKey = key.replace('zsh-', '').replace(/-([a-z])/g, (_, c) => c.toUpperCase());
          if (option.classList.contains('selected')) {
            if (!zshAnswers[zshKey].includes(val)) zshAnswers[zshKey].push(val);
          } else {
            zshAnswers[zshKey] = zshAnswers[zshKey].filter(v => v !== val);
          }
        } else if (key.startsWith('neovim-')) {
          const nvimKey = key.replace('neovim-', '').replace(/-([a-z])/g, (_, c) => c.toUpperCase());
          if (option.classList.contains('selected')) {
            if (!neovimAnswers[nvimKey].includes(val)) neovimAnswers[nvimKey].push(val);
          } else {
            neovimAnswers[nvimKey] = neovimAnswers[nvimKey].filter(v => v !== val);
          }
        }
      });
    });
  });
}

// ── Toast notification ────────────────────────────────
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}
