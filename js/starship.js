// ── Starship preset templates ─────────────────────────
const STARSHIP_PRESETS = {
  minimal: ['git', 'cmd_duration'],
  full: ['git', 'node', 'python', 'golang', 'rust', 'docker', 'aws', 'kubernetes', 'java', 'ruby', 'php', 'package', 'hostname', 'username', 'jobs', 'memory', 'time', 'battery', 'cmd_duration', 'terraform'],
  devops: ['git', 'docker', 'aws', 'kubernetes', 'terraform', 'hostname', 'username', 'cmd_duration'],
  webdev: ['git', 'node', 'python', 'package', 'docker', 'cmd_duration'],
};

function applyStarshipPreset(preset) {
  const modules = STARSHIP_PRESETS[preset];
  if (!modules) return;

  answers.modules = [...modules];

  // Update the checkbox UI
  const container = document.querySelector('#step-3 .options[data-key="modules"]');
  if (!container) return;
  container.querySelectorAll('.option').forEach(option => {
    const val = option.dataset.value;
    if (modules.includes(val)) {
      option.classList.add('selected');
    } else {
      option.classList.remove('selected');
    }
  });
}

// ── Detail settings (Step 4) ──────────────────────────
function buildDetailSettings() {
  const container = document.getElementById('detail-settings');
  if (!container) return;
  container.innerHTML = '';

  const modules = answers.modules;

  // Directory settings (always shown)
  const dirSection = document.createElement('div');
  dirSection.className = 'detail-section';
  dirSection.innerHTML = `
    <h3>ディレクトリ表示</h3>
    <div class="detail-row">
      <label for="dir-trunc-len">省略する深さ</label>
      <div class="detail-control">
        <input type="range" id="dir-trunc-len" min="1" max="10" value="${answers.dirTruncationLength}">
        <span id="dir-trunc-len-val">${answers.dirTruncationLength}</span>
      </div>
    </div>
    <div class="detail-row">
      <label for="dir-trunc-repo">リポジトリルートで省略</label>
      <div class="detail-control">
        <label class="toggle">
          <input type="checkbox" id="dir-trunc-repo" ${answers.dirTruncateToRepo ? 'checked' : ''}>
          <span class="toggle-slider"></span>
        </label>
      </div>
    </div>
  `;
  container.appendChild(dirSection);

  // Git settings (only if git module selected)
  if (modules.includes('git')) {
    const gitSection = document.createElement('div');
    gitSection.className = 'detail-section';
    gitSection.innerHTML = `
      <h3>Git 設定</h3>
      <div class="detail-row">
        <label for="git-branch-trunc">ブランチ名の最大文字数</label>
        <div class="detail-control">
          <input type="range" id="git-branch-trunc" min="5" max="50" value="${answers.gitBranchTruncation}">
          <span id="git-branch-trunc-val">${answers.gitBranchTruncation}</span>
        </div>
      </div>
      <div class="detail-row">
        <label for="git-show-stash">スタッシュ数を表示</label>
        <div class="detail-control">
          <label class="toggle">
            <input type="checkbox" id="git-show-stash" ${answers.gitShowStash ? 'checked' : ''}>
            <span class="toggle-slider"></span>
          </label>
        </div>
      </div>
    `;
    container.appendChild(gitSection);
  }

  // Python settings (only if python module selected)
  if (modules.includes('python')) {
    const pySection = document.createElement('div');
    pySection.className = 'detail-section';
    pySection.innerHTML = `
      <h3>Python 設定</h3>
      <div class="detail-row">
        <label for="python-show-venv">仮想環境名を表示</label>
        <div class="detail-control">
          <label class="toggle">
            <input type="checkbox" id="python-show-venv" ${answers.pythonShowVenv ? 'checked' : ''}>
            <span class="toggle-slider"></span>
          </label>
        </div>
      </div>
    `;
    container.appendChild(pySection);
  }

  // Memory settings (only if memory module selected)
  if (modules.includes('memory')) {
    const memSection = document.createElement('div');
    memSection.className = 'detail-section';
    memSection.innerHTML = `
      <h3>メモリ使用量</h3>
      <div class="detail-row">
        <label for="memory-threshold">表示する閾値 (%)</label>
        <div class="detail-control">
          <input type="range" id="memory-threshold" min="0" max="100" step="5" value="${answers.memoryThreshold}">
          <span id="memory-threshold-val">${answers.memoryThreshold}%</span>
        </div>
      </div>
    `;
    container.appendChild(memSection);
  }

  // Time format (only if time module selected)
  if (modules.includes('time')) {
    const timeSection = document.createElement('div');
    timeSection.className = 'detail-section';
    timeSection.innerHTML = `
      <h3>時刻フォーマット</h3>
      <div class="detail-row">
        <div class="time-format-options">
          <label class="format-option ${answers.timeFormat === '%H:%M' ? 'selected' : ''}">
            <input type="radio" name="time-format" value="%H:%M" ${answers.timeFormat === '%H:%M' ? 'checked' : ''}>
            <span>HH:MM</span>
            <small>14:30</small>
          </label>
          <label class="format-option ${answers.timeFormat === '%H:%M:%S' ? 'selected' : ''}">
            <input type="radio" name="time-format" value="%H:%M:%S" ${answers.timeFormat === '%H:%M:%S' ? 'checked' : ''}>
            <span>HH:MM:SS</span>
            <small>14:30:05</small>
          </label>
          <label class="format-option ${answers.timeFormat === '%I:%M %p' ? 'selected' : ''}">
            <input type="radio" name="time-format" value="%I:%M %p" ${answers.timeFormat === '%I:%M %p' ? 'checked' : ''}>
            <span>12h</span>
            <small>02:30 PM</small>
          </label>
        </div>
      </div>
    `;
    container.appendChild(timeSection);
  }

  // Cmd duration threshold (only if cmd_duration selected)
  if (modules.includes('cmd_duration')) {
    const durationSection = document.createElement('div');
    durationSection.className = 'detail-section';
    durationSection.innerHTML = `
      <h3>コマンド実行時間</h3>
      <div class="detail-row">
        <label for="cmd-min-time">最低表示時間</label>
        <div class="detail-control">
          <input type="range" id="cmd-min-time" min="500" max="10000" step="500" value="${answers.cmdDurationMinTime}">
          <span id="cmd-min-time-val">${answers.cmdDurationMinTime / 1000}秒</span>
        </div>
      </div>
    `;
    container.appendChild(durationSection);
  }

  // Right prompt
  const rightCandidates = [];
  if (modules.includes('time')) rightCandidates.push({ value: 'time', label: '時刻' });
  if (modules.includes('battery')) rightCandidates.push({ value: 'battery', label: 'バッテリー' });
  if (modules.includes('cmd_duration')) rightCandidates.push({ value: 'cmd_duration', label: 'コマンド実行時間' });
  if (modules.includes('jobs')) rightCandidates.push({ value: 'jobs', label: 'ジョブ数' });
  if (modules.includes('memory')) rightCandidates.push({ value: 'memory', label: 'メモリ使用量' });

  if (rightCandidates.length > 0) {
    const rightSection = document.createElement('div');
    rightSection.className = 'detail-section';
    let checkboxesHtml = rightCandidates.map(c => {
      const checked = answers.rightPromptModules.includes(c.value) ? 'checked' : '';
      return `
        <label class="right-prompt-option">
          <input type="checkbox" name="right-prompt" value="${c.value}" ${checked}>
          <span>${c.label}</span>
        </label>
      `;
    }).join('');
    rightSection.innerHTML = `
      <h3>右プロンプト</h3>
      <p class="detail-description">右側に表示するモジュールを選択（選択しない場合は左に表示）</p>
      <div class="detail-row">
        <div class="right-prompt-options">${checkboxesHtml}</div>
      </div>
    `;
    container.appendChild(rightSection);
  }

  // Show placeholder if no modules for extra settings
  if (container.children.length === 1 && modules.length === 0) {
    const note = document.createElement('p');
    note.className = 'detail-note';
    note.textContent = 'モジュールを選択すると追加の設定が表示されます。';
    container.appendChild(note);
  }

  // Attach event listeners
  setupDetailListeners();
}

function setupDetailListeners() {
  const truncLen = document.getElementById('dir-trunc-len');
  if (truncLen) {
    truncLen.addEventListener('input', () => {
      answers.dirTruncationLength = parseInt(truncLen.value, 10);
      document.getElementById('dir-trunc-len-val').textContent = truncLen.value;
    });
  }

  const truncRepo = document.getElementById('dir-trunc-repo');
  if (truncRepo) {
    truncRepo.addEventListener('change', () => {
      answers.dirTruncateToRepo = truncRepo.checked;
    });
  }

  const gitBranchTrunc = document.getElementById('git-branch-trunc');
  if (gitBranchTrunc) {
    gitBranchTrunc.addEventListener('input', () => {
      answers.gitBranchTruncation = parseInt(gitBranchTrunc.value, 10);
      document.getElementById('git-branch-trunc-val').textContent = gitBranchTrunc.value;
    });
  }

  const gitShowStash = document.getElementById('git-show-stash');
  if (gitShowStash) {
    gitShowStash.addEventListener('change', () => {
      answers.gitShowStash = gitShowStash.checked;
    });
  }

  const pythonShowVenv = document.getElementById('python-show-venv');
  if (pythonShowVenv) {
    pythonShowVenv.addEventListener('change', () => {
      answers.pythonShowVenv = pythonShowVenv.checked;
    });
  }

  const memoryThreshold = document.getElementById('memory-threshold');
  if (memoryThreshold) {
    memoryThreshold.addEventListener('input', () => {
      answers.memoryThreshold = parseInt(memoryThreshold.value, 10);
      document.getElementById('memory-threshold-val').textContent = memoryThreshold.value + '%';
    });
  }

  document.querySelectorAll('input[name="time-format"]').forEach(radio => {
    radio.addEventListener('change', () => {
      answers.timeFormat = radio.value;
      document.querySelectorAll('.format-option').forEach(fo => fo.classList.remove('selected'));
      radio.closest('.format-option').classList.add('selected');
    });
  });

  const cmdMinTime = document.getElementById('cmd-min-time');
  if (cmdMinTime) {
    cmdMinTime.addEventListener('input', () => {
      answers.cmdDurationMinTime = parseInt(cmdMinTime.value, 10);
      document.getElementById('cmd-min-time-val').textContent = (cmdMinTime.value / 1000) + '秒';
    });
  }

  document.querySelectorAll('input[name="right-prompt"]').forEach(cb => {
    cb.addEventListener('change', () => {
      const val = cb.value;
      if (cb.checked) {
        if (!answers.rightPromptModules.includes(val)) {
          answers.rightPromptModules.push(val);
        }
      } else {
        answers.rightPromptModules = answers.rightPromptModules.filter(v => v !== val);
      }
    });
  });
}

// ── Config generation ─────────────────────────────────
function getCharacter() {
  if (answers.character === 'custom' && answers.customCharacter) {
    return answers.customCharacter;
  }
  return answers.character;
}

function getColor() {
  if (answers.customColor) return answers.customColor;
  return answers.color;
}

function generateConfig() {
  const { style, modules } = answers;
  const character = getCharacter();
  const color = getColor();
  const lines = [];

  lines.push('# Starship Configuration');
  lines.push('# Generated by Starship Config Generator');
  lines.push('');

  // Format string
  const isRight = (mod) => answers.rightPromptModules.includes(mod);
  const leftModules = modules.filter(m => !isRight(m));
  const rightModules = modules.filter(m => isRight(m));

  const formatParts = buildFormatParts(style, leftModules);
  if (style === 'multiline') {
    lines.push('format = """');
    lines.push(formatParts.join(''));
    lines.push('"""');
  } else {
    lines.push(`format = "${formatParts.join('')}"`);
  }
  lines.push('');

  // Right prompt
  if (rightModules.length > 0) {
    const rightParts = [];
    if (rightModules.includes('jobs')) rightParts.push('$jobs');
    if (rightModules.includes('memory')) rightParts.push('$memory_usage');
    if (rightModules.includes('cmd_duration')) rightParts.push('$cmd_duration');
    if (rightModules.includes('time')) rightParts.push('$time');
    if (rightModules.includes('battery')) rightParts.push('$battery');
    lines.push(`right_format = "${rightParts.join('')}"`);
    lines.push('');
  }

  // Character
  lines.push('[character]');
  lines.push(`success_symbol = "[${character}](bold ${color})"`);
  lines.push(`error_symbol = "[${character}](bold red)"`);
  lines.push('');

  // Directory
  lines.push('[directory]');
  lines.push(`style = "bold ${color}"`);
  lines.push(`truncation_length = ${answers.dirTruncationLength}`);
  lines.push(`truncate_to_repo = ${answers.dirTruncateToRepo}`);
  lines.push('');

  // Git
  if (modules.includes('git')) {
    lines.push('[git_branch]');
    if (style === 'nerd') {
      lines.push('symbol = " "');
    } else if (style === 'bracket') {
      lines.push('format = "[[$symbol$branch](bold purple)]($style) "');
    }
    lines.push('style = "bold purple"');
    lines.push(`truncation_length = ${answers.gitBranchTruncation}`);
    lines.push('');

    lines.push('[git_status]');
    lines.push('style = "bold red"');
    if (answers.gitShowStash) {
      lines.push('stashed = "📦 "');
    }
    if (style === 'nerd') {
      lines.push('conflicted = " "');
      lines.push('ahead = " ${count} "');
      lines.push('behind = " ${count} "');
      lines.push('untracked = " "');
      if (answers.gitShowStash) {
        lines.push('stashed = " ${count} "');
      }
      lines.push('modified = " "');
      lines.push('staged = " "');
      lines.push('deleted = " "');
    }
    lines.push('');
  }

  // Language modules
  if (modules.includes('node')) {
    lines.push('[nodejs]');
    if (style === 'nerd') {
      lines.push('symbol = " "');
    }
    lines.push('style = "bold green"');
    lines.push('');
  }

  if (modules.includes('python')) {
    lines.push('[python]');
    if (style === 'nerd') {
      lines.push('symbol = " "');
    }
    lines.push('style = "bold yellow"');
    lines.push('detect_extensions = ["py"]');
    if (!answers.pythonShowVenv) {
      lines.push('format = "via [${symbol}${pyenv_prefix}(${version})]($style) "');
    }
    lines.push('');
  }

  if (modules.includes('golang')) {
    lines.push('[golang]');
    if (style === 'nerd') {
      lines.push('symbol = " "');
    }
    lines.push('style = "bold cyan"');
    lines.push('');
  }

  if (modules.includes('rust')) {
    lines.push('[rust]');
    if (style === 'nerd') {
      lines.push('symbol = " "');
    }
    lines.push('style = "bold red"');
    lines.push('');
  }

  if (modules.includes('docker')) {
    lines.push('[docker_context]');
    if (style === 'nerd') {
      lines.push('symbol = " "');
    }
    lines.push('style = "bold blue"');
    lines.push('');
  }

  if (modules.includes('aws')) {
    lines.push('[aws]');
    if (style === 'nerd') {
      lines.push('symbol = " "');
    }
    lines.push('style = "bold yellow"');
    lines.push('');
  }

  if (modules.includes('kubernetes')) {
    lines.push('[kubernetes]');
    lines.push('disabled = false');
    if (style === 'nerd') {
      lines.push('symbol = "☸ "');
    }
    lines.push('style = "bold blue"');
    lines.push('');
  }

  if (modules.includes('terraform')) {
    lines.push('[terraform]');
    if (style === 'nerd') {
      lines.push('symbol = "💠 "');
    }
    lines.push('style = "bold purple"');
    lines.push('');
  }

  if (modules.includes('java')) {
    lines.push('[java]');
    if (style === 'nerd') {
      lines.push('symbol = " "');
    }
    lines.push('style = "bold red"');
    lines.push('');
  }

  if (modules.includes('ruby')) {
    lines.push('[ruby]');
    if (style === 'nerd') {
      lines.push('symbol = " "');
    }
    lines.push('style = "bold red"');
    lines.push('');
  }

  if (modules.includes('php')) {
    lines.push('[php]');
    if (style === 'nerd') {
      lines.push('symbol = " "');
    }
    lines.push('style = "bold purple"');
    lines.push('');
  }

  if (modules.includes('package')) {
    lines.push('[package]');
    lines.push('disabled = false');
    if (style === 'nerd') {
      lines.push('symbol = "📦 "');
    }
    lines.push('style = "bold 208"');
    lines.push('');
  }

  if (modules.includes('hostname')) {
    lines.push('[hostname]');
    lines.push('ssh_only = true');
    lines.push('style = "bold green"');
    lines.push('');
  }

  if (modules.includes('username')) {
    lines.push('[username]');
    lines.push('show_always = false');
    lines.push('style_user = "bold yellow"');
    lines.push('style_root = "bold red"');
    lines.push('');
  }

  if (modules.includes('jobs')) {
    lines.push('[jobs]');
    if (style === 'nerd') {
      lines.push('symbol = " "');
    }
    lines.push('style = "bold blue"');
    lines.push('threshold = 1');
    lines.push('');
  }

  if (modules.includes('memory')) {
    lines.push('[memory_usage]');
    lines.push('disabled = false');
    if (style === 'nerd') {
      lines.push('symbol = "󰍛 "');
    }
    lines.push('style = "bold dimmed white"');
    lines.push(`threshold = ${answers.memoryThreshold}`);
    lines.push('');
  }

  if (modules.includes('time')) {
    lines.push('[time]');
    lines.push('disabled = false');
    lines.push(`format = "[$time]($style) "`);
    lines.push(`time_format = "${answers.timeFormat}"`);
    lines.push('style = "bold dimmed white"');
    lines.push('');
  }

  if (modules.includes('battery')) {
    lines.push('[battery]');
    lines.push('full_symbol = "🔋"');
    lines.push('charging_symbol = "⚡"');
    lines.push('discharging_symbol = "💀"');
    lines.push('');
    lines.push('[[battery.display]]');
    lines.push('threshold = 30');
    lines.push('style = "bold red"');
    lines.push('');
  }

  if (modules.includes('cmd_duration')) {
    lines.push('[cmd_duration]');
    lines.push(`min_time = ${answers.cmdDurationMinTime}`);
    lines.push('format = "took [$duration]($style) "');
    lines.push('style = "bold yellow"');
    lines.push('');
  }

  return lines.join('\n');
}

function buildFormatParts(style, modules) {
  const parts = [];

  // Prefix modules (username@hostname before directory)
  const addPrefixModules = (p) => {
    if (modules.includes('username')) p.push('$username');
    if (modules.includes('hostname')) p.push('$hostname');
  };

  // Suffix info modules (after language/cloud modules)
  const addSuffixModules = (p) => {
    if (modules.includes('jobs')) p.push('$jobs');
    if (modules.includes('memory')) p.push('$memory_usage');
    if (modules.includes('cmd_duration')) p.push('$cmd_duration');
    if (modules.includes('time')) p.push('$time');
    if (modules.includes('battery')) p.push('$battery');
  };

  if (style === 'multiline') {
    // Line 1: info
    addPrefixModules(parts);
    parts.push('$directory');
    if (modules.includes('git')) parts.push('$git_branch$git_status');
    addModuleVars(parts, modules);
    addSuffixModules(parts);
    parts.push('\\n');
    // Line 2: prompt
    parts.push('$character');
  } else if (style === 'bracket') {
    addPrefixModules(parts);
    parts.push('\\[');
    parts.push('$directory');
    parts.push('\\] ');
    if (modules.includes('git')) parts.push('$git_branch$git_status');
    addModuleVars(parts, modules);
    addSuffixModules(parts);
    parts.push('$character');
  } else {
    // plain / nerd
    addPrefixModules(parts);
    parts.push('$directory');
    if (modules.includes('git')) parts.push('$git_branch$git_status');
    addModuleVars(parts, modules);
    addSuffixModules(parts);
    parts.push('$character');
  }

  return parts;
}

function addModuleVars(parts, modules) {
  const langModules = ['node', 'python', 'golang', 'rust', 'java', 'ruby', 'php', 'docker', 'aws', 'kubernetes', 'terraform', 'package'];
  const varMap = {
    node: '$nodejs',
    python: '$python',
    golang: '$golang',
    rust: '$rust',
    java: '$java',
    ruby: '$ruby',
    php: '$php',
    docker: '$docker_context',
    aws: '$aws',
    kubernetes: '$kubernetes',
    terraform: '$terraform',
    package: '$package',
  };
  for (const m of langModules) {
    if (modules.includes(m)) parts.push(varMap[m]);
  }
}

// ── Prompt preview ────────────────────────────────────
function buildPromptPreview() {
  const { style, modules } = answers;
  const character = getCharacter();
  const color = getColor();

  const colorMap = {
    cyan: '#56d4dd',
    green: '#3fb950',
    blue: '#58a6ff',
    purple: '#bc8cff',
    yellow: '#d29922',
    red: '#f85149',
    white: '#e6edf3',
  };
  const hex = colorMap[color] || color;

  const isRight = (mod) => answers.rightPromptModules.includes(mod);

  // Build module spans
  const dir = `<span style="color:${hex};font-weight:bold">~/projects/my-app</span>`;

  const gitBranch = (modules.includes('git') && !isRight('git'))
    ? `<span style="color:#bc8cff;font-weight:bold">${style === 'nerd' ? ' ' : 'on '}main</span>`
    : '';
  const gitStatus = (modules.includes('git') && !isRight('git'))
    ? `<span style="color:#f85149"> [+2 ~1]</span>`
    : '';

  const nodeVer = (modules.includes('node') && !isRight('node'))
    ? `<span style="color:#3fb950"> ${style === 'nerd' ? ' ' : ''}v20.11.0</span>`
    : '';

  const pythonVer = (modules.includes('python') && !isRight('python'))
    ? `<span style="color:#d29922"> ${style === 'nerd' ? ' ' : ''}3.12.0</span>`
    : '';

  const goVer = (modules.includes('golang') && !isRight('golang'))
    ? `<span style="color:#56d4dd"> ${style === 'nerd' ? ' ' : ''}1.22</span>`
    : '';

  const rustVer = (modules.includes('rust') && !isRight('rust'))
    ? `<span style="color:#f85149"> ${style === 'nerd' ? ' ' : ''}1.77</span>`
    : '';

  const dockerCtx = (modules.includes('docker') && !isRight('docker'))
    ? `<span style="color:#58a6ff"> ${style === 'nerd' ? ' ' : ''}default</span>`
    : '';

  const awsProfile = (modules.includes('aws') && !isRight('aws'))
    ? `<span style="color:#d29922"> ${style === 'nerd' ? ' ' : ''}dev</span>`
    : '';

  const k8sCtx = (modules.includes('kubernetes') && !isRight('kubernetes'))
    ? `<span style="color:#58a6ff"> ${style === 'nerd' ? '☸ ' : ''}minikube</span>`
    : '';

  const tfWorkspace = (modules.includes('terraform') && !isRight('terraform'))
    ? `<span style="color:#bc8cff"> ${style === 'nerd' ? '💠 ' : ''}default</span>`
    : '';

  const javaVer = (modules.includes('java') && !isRight('java'))
    ? `<span style="color:#f85149"> ${style === 'nerd' ? ' ' : ''}21.0.1</span>`
    : '';

  const rubyVer = (modules.includes('ruby') && !isRight('ruby'))
    ? `<span style="color:#f85149"> ${style === 'nerd' ? ' ' : ''}3.3.0</span>`
    : '';

  const phpVer = (modules.includes('php') && !isRight('php'))
    ? `<span style="color:#bc8cff"> ${style === 'nerd' ? ' ' : ''}8.3.0</span>`
    : '';

  const packageVer = (modules.includes('package') && !isRight('package'))
    ? `<span style="color:#dd6620"> ${style === 'nerd' ? '📦 ' : ''}v1.0.0</span>`
    : '';

  const hostnameStr = (modules.includes('hostname'))
    ? `<span style="color:#3fb950">@myhost</span>`
    : '';

  const usernameStr = (modules.includes('username'))
    ? `<span style="color:#d29922">user</span>`
    : '';

  const jobsPart = (modules.includes('jobs') && !isRight('jobs'))
    ? `<span style="color:#58a6ff"> ${style === 'nerd' ? ' ' : ''}1</span>`
    : '';

  const memoryPart = (modules.includes('memory') && !isRight('memory'))
    ? `<span style="color:#8b949e"> ${style === 'nerd' ? '󰍛 ' : ''}52%</span>`
    : '';

  // Build time string based on format
  let timeStr = '14:30';
  if (answers.timeFormat === '%H:%M:%S') timeStr = '14:30:05';
  else if (answers.timeFormat === '%I:%M %p') timeStr = '02:30 PM';

  const timePart = (modules.includes('time') && !isRight('time'))
    ? `<span style="color:#8b949e">${timeStr}</span> `
    : '';

  const durationPart = (modules.includes('cmd_duration') && !isRight('cmd_duration'))
    ? `<span style="color:#d29922">took 3s</span> `
    : '';

  const batteryPart = (modules.includes('battery') && !isRight('battery'))
    ? `<span style="color:#3fb950">🔋</span> `
    : '';

  const charSpan = `<span style="color:${hex};font-weight:bold">${character === 'custom' && answers.customCharacter ? answers.customCharacter : character}</span>`;

  const allLangModules = nodeVer + pythonVer + goVer + rustVer + javaVer + rubyVer + phpVer + dockerCtx + awsProfile + k8sCtx + tfWorkspace + packageVer;
  const prefixPart = (usernameStr || hostnameStr) ? `${usernameStr}${hostnameStr} ` : '';
  const infoPart = jobsPart + memoryPart;

  // Left prompt
  let preview = '';
  if (style === 'multiline') {
    preview = `${prefixPart}${dir} ${gitBranch}${gitStatus}${allLangModules}${infoPart} ${durationPart}${timePart}${batteryPart}\n${charSpan} `;
  } else if (style === 'bracket') {
    preview = `${prefixPart}[${dir}] ${gitBranch}${gitStatus}${allLangModules}${infoPart} ${durationPart}${timePart}${batteryPart}${charSpan} `;
  } else {
    preview = `${prefixPart}${dir} ${gitBranch}${gitStatus}${allLangModules}${infoPart} ${durationPart}${timePart}${batteryPart}${charSpan} `;
  }

  // Right prompt
  const rightParts = [];
  if (modules.includes('jobs') && isRight('jobs')) {
    rightParts.push(`<span style="color:#58a6ff">${style === 'nerd' ? ' ' : ''}1</span>`);
  }
  if (modules.includes('memory') && isRight('memory')) {
    rightParts.push(`<span style="color:#8b949e">${style === 'nerd' ? '󰍛 ' : ''}52%</span>`);
  }
  if (modules.includes('cmd_duration') && isRight('cmd_duration')) {
    rightParts.push(`<span style="color:#d29922">took 3s</span>`);
  }
  if (modules.includes('time') && isRight('time')) {
    rightParts.push(`<span style="color:#8b949e">${timeStr}</span>`);
  }
  if (modules.includes('battery') && isRight('battery')) {
    rightParts.push(`<span style="color:#3fb950">🔋</span>`);
  }

  let rightPreview = '';
  if (rightParts.length > 0) {
    rightPreview = `<div style="display:flex;justify-content:space-between;align-items:center"><span>${preview}</span><span>${rightParts.join(' ')}</span></div>`;
  }

  if (rightPreview) return rightPreview;
  return preview;
}

// ── Result rendering ──────────────────────────────────
function renderResult() {
  const config = generateConfig();
  document.getElementById('config-output').innerHTML = highlightToml(config);
  const previewHtml = buildPromptPreview();
  document.getElementById('prompt-preview').innerHTML =
    '<div style="color:#8b949e;font-size:0.75rem;margin-bottom:0.5rem">プレビュー (イメージ)</div>' +
    previewHtml +
    '<span style="animation:blink 1s step-end infinite">▌</span>';
}

// ── Copy / Download ───────────────────────────────────
function copyConfig() {
  const text = document.getElementById('config-output').innerText;
  navigator.clipboard.writeText(text).then(() => {
    showToast('コピーしました');
  }).catch(() => {
    showToast('コピーに失敗しました');
  });
}

function downloadConfig() {
  const text = document.getElementById('config-output').innerText;
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'starship.toml';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
