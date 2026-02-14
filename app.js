// ── State ──────────────────────────────────────────────
const TOTAL_STEPS = 6;
let currentStep = 0;
const answers = {
  style: null,
  character: null,
  customCharacter: '',
  color: null,
  customColor: '',
  modules: [],
  // Detail settings
  dirTruncationLength: 3,
  dirTruncateToRepo: true,
  timeFormat: '%H:%M',
  cmdDurationMinTime: 2000,
  rightPromptModules: [],
};

// ── Progress bar ──────────────────────────────────────
function renderProgress() {
  const bar = document.getElementById('progress');
  bar.innerHTML = '';
  for (let i = 0; i < TOTAL_STEPS; i++) {
    const el = document.createElement('div');
    el.className = 'progress-step';
    if (i < currentStep) el.classList.add('done');
    if (i === currentStep) el.classList.add('active');
    bar.appendChild(el);
  }
}

// ── Step navigation ───────────────────────────────────
function showStep(index) {
  document.querySelectorAll('.step').forEach((s, i) => {
    s.classList.toggle('visible', i === index);
  });
  currentStep = index;
  renderProgress();

  // Build detail settings when entering step 4
  if (index === 4) {
    buildDetailSettings();
  }

  if (index === TOTAL_STEPS - 1) {
    renderResult();
  }
}

function nextStep() {
  if (currentStep < TOTAL_STEPS - 1) showStep(currentStep + 1);
}

function prevStep() {
  if (currentStep > 0) showStep(currentStep - 1);
}

function goToStart() {
  answers.style = null;
  answers.character = null;
  answers.customCharacter = '';
  answers.color = null;
  answers.customColor = '';
  answers.modules = [];
  answers.dirTruncationLength = 3;
  answers.dirTruncateToRepo = true;
  answers.timeFormat = '%H:%M';
  answers.cmdDurationMinTime = 2000;
  answers.rightPromptModules = [];
  document.querySelectorAll('.option.selected').forEach(o => o.classList.remove('selected'));
  document.querySelectorAll('.color-swatch.selected').forEach(o => o.classList.remove('selected'));
  const customCharInput = document.getElementById('custom-char-input');
  if (customCharInput) customCharInput.value = '';
  const customColorInput = document.getElementById('custom-color-input');
  if (customColorInput) customColorInput.value = '#';
  const customColorPreview = document.getElementById('custom-color-preview');
  if (customColorPreview) customColorPreview.style.background = 'transparent';
  updateNextButton(0);
  updateNextButton(1);
  updateNextButton(2);
  showStep(0);
}

function updateNextButton(stepIndex) {
  const btn = document.getElementById(`btn-next-${stepIndex}`);
  if (!btn) return;
  const stepEl = document.getElementById(`step-${stepIndex}`);
  const container = stepEl.querySelector('[data-type]');
  const type = container?.dataset.type;
  if (type === 'radio' || type === 'color') {
    const key = container.dataset.key;
    btn.disabled = answers[key] === null;
  }
}

// ── Option click handlers ─────────────────────────────
function setupOptions() {
  // Radio options
  document.querySelectorAll('.options[data-type="radio"]').forEach(container => {
    const key = container.dataset.key;
    container.querySelectorAll('.option').forEach(option => {
      option.addEventListener('click', () => {
        container.querySelectorAll('.option').forEach(o => o.classList.remove('selected'));
        option.classList.add('selected');
        answers[key] = option.dataset.value;
        // Clear custom character if a preset is selected
        if (key === 'character' && option.dataset.value !== 'custom') {
          answers.customCharacter = '';
          const customInput = document.getElementById('custom-char-input');
          if (customInput) customInput.value = '';
        }
        const stepEl = option.closest('.step');
        const stepIndex = parseInt(stepEl.id.replace('step-', ''), 10);
        updateNextButton(stepIndex);
      });
    });
  });

  // Checkbox options
  document.querySelectorAll('.options[data-type="checkbox"]').forEach(container => {
    const key = container.dataset.key;
    container.querySelectorAll('.option').forEach(option => {
      option.addEventListener('click', () => {
        option.classList.toggle('selected');
        const val = option.dataset.value;
        if (option.classList.contains('selected')) {
          if (!answers[key].includes(val)) answers[key].push(val);
        } else {
          answers[key] = answers[key].filter(v => v !== val);
        }
      });
    });
  });

  // Color swatches
  document.querySelectorAll('.color-options[data-type="color"]').forEach(container => {
    const key = container.dataset.key;
    container.querySelectorAll('.color-swatch').forEach(swatch => {
      swatch.addEventListener('click', () => {
        container.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
        swatch.classList.add('selected');
        answers[key] = swatch.dataset.value;
        answers.customColor = '';
        const customInput = document.getElementById('custom-color-input');
        if (customInput) customInput.value = '#';
        const customPreview = document.getElementById('custom-color-preview');
        if (customPreview) customPreview.style.background = 'transparent';
        const stepEl = swatch.closest('.step');
        const stepIndex = parseInt(stepEl.id.replace('step-', ''), 10);
        updateNextButton(stepIndex);
      });
    });
  });

  // Custom character input
  const customCharInput = document.getElementById('custom-char-input');
  if (customCharInput) {
    customCharInput.addEventListener('input', () => {
      const val = customCharInput.value.trim();
      if (val) {
        answers.character = 'custom';
        answers.customCharacter = val;
        // Deselect preset options
        const container = customCharInput.closest('.step').querySelector('.options[data-type="radio"]');
        if (container) {
          container.querySelectorAll('.option').forEach(o => o.classList.remove('selected'));
        }
        updateNextButton(1);
      }
    });
  }

  // Custom color input
  const customColorInput = document.getElementById('custom-color-input');
  if (customColorInput) {
    customColorInput.addEventListener('input', () => {
      const val = customColorInput.value.trim();
      const customPreview = document.getElementById('custom-color-preview');
      if (/^#[0-9a-fA-F]{6}$/.test(val)) {
        answers.color = val;
        answers.customColor = val;
        if (customPreview) customPreview.style.background = val;
        // Deselect preset swatches
        document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
        updateNextButton(2);
      } else {
        if (customPreview) customPreview.style.background = 'transparent';
      }
    });
  }
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

  // Right prompt (only if time or battery selected)
  const rightCandidates = [];
  if (modules.includes('time')) rightCandidates.push({ value: 'time', label: '時刻' });
  if (modules.includes('battery')) rightCandidates.push({ value: 'battery', label: 'バッテリー' });
  if (modules.includes('cmd_duration')) rightCandidates.push({ value: 'cmd_duration', label: 'コマンド実行時間' });

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
    lines.push('');

    lines.push('[git_status]');
    lines.push('style = "bold red"');
    if (style === 'nerd') {
      lines.push('conflicted = " "');
      lines.push('ahead = " ${count} "');
      lines.push('behind = " ${count} "');
      lines.push('untracked = " "');
      lines.push('stashed = " "');
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

  if (style === 'multiline') {
    // Line 1: info
    parts.push('$directory');
    if (modules.includes('git')) parts.push('$git_branch$git_status');
    addModuleVars(parts, modules);
    if (modules.includes('cmd_duration')) parts.push('$cmd_duration');
    if (modules.includes('time')) parts.push('$time');
    if (modules.includes('battery')) parts.push('$battery');
    parts.push('\\n');
    // Line 2: prompt
    parts.push('$character');
  } else if (style === 'bracket') {
    parts.push('\\[');
    parts.push('$directory');
    parts.push('\\] ');
    if (modules.includes('git')) parts.push('$git_branch$git_status');
    addModuleVars(parts, modules);
    if (modules.includes('cmd_duration')) parts.push('$cmd_duration');
    if (modules.includes('time')) parts.push('$time');
    if (modules.includes('battery')) parts.push('$battery');
    parts.push('$character');
  } else {
    // plain / nerd
    parts.push('$directory');
    if (modules.includes('git')) parts.push('$git_branch$git_status');
    addModuleVars(parts, modules);
    if (modules.includes('cmd_duration')) parts.push('$cmd_duration');
    if (modules.includes('time')) parts.push('$time');
    if (modules.includes('battery')) parts.push('$battery');
    parts.push('$character');
  }

  return parts;
}

function addModuleVars(parts, modules) {
  const langModules = ['node', 'python', 'golang', 'rust', 'docker', 'aws', 'kubernetes', 'terraform'];
  const varMap = {
    node: '$nodejs',
    python: '$python',
    golang: '$golang',
    rust: '$rust',
    docker: '$docker_context',
    aws: '$aws',
    kubernetes: '$kubernetes',
    terraform: '$terraform',
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

  const langModules = nodeVer + pythonVer + goVer + rustVer + dockerCtx + awsProfile + k8sCtx + tfWorkspace;

  // Left prompt
  let preview = '';
  if (style === 'multiline') {
    preview = `${dir} ${gitBranch}${gitStatus}${langModules} ${durationPart}${timePart}${batteryPart}\n${charSpan} `;
  } else if (style === 'bracket') {
    preview = `[${dir}] ${gitBranch}${gitStatus}${langModules} ${durationPart}${timePart}${batteryPart}${charSpan} `;
  } else {
    preview = `${dir} ${gitBranch}${gitStatus}${langModules} ${durationPart}${timePart}${batteryPart}${charSpan} `;
  }

  // Right prompt
  const rightParts = [];
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
  document.getElementById('config-output').textContent = config;
  const previewHtml = buildPromptPreview();
  document.getElementById('prompt-preview').innerHTML =
    '<div style="color:#8b949e;font-size:0.75rem;margin-bottom:0.5rem">プレビュー (イメージ)</div>' +
    previewHtml +
    '<span style="animation:blink 1s step-end infinite">▌</span>';
}

// ── Copy / Download ───────────────────────────────────
function copyConfig() {
  const text = document.getElementById('config-output').textContent;
  navigator.clipboard.writeText(text).then(() => {
    const toast = document.getElementById('toast');
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
  });
}

function downloadConfig() {
  const text = document.getElementById('config-output').textContent;
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

// ── Init ──────────────────────────────────────────────
renderProgress();
setupOptions();
