// ── State ──────────────────────────────────────────────
let selectedTool = null; // 'starship' or 'tmux'
const TOTAL_STEPS = 6;
const TMUX_TOTAL_STEPS = 5;
let currentStep = 0;

// Starship answers
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

// tmux answers
const tmuxAnswers = {
  prefix: null,
  mouse: true,
  baseIndex: true,
  renumber: true,
  autoRename: false,
  visualBell: true,
  historyLimit: 10000,
  theme: null,
  paneBorder: false,
  activeBorder: true,
  statusPosition: null,
  statusModules: [],
  statusInterval: 5,
  statusLeftLength: 40,
  statusRightLength: 50,
  statusJustify: 'centre',
  splitKeys: null,
  extraBindings: [],
};

// ── Tool Selection ────────────────────────────────────
function selectTool() {
  const toolOption = document.querySelector('.option[data-value="starship"].selected') ||
                      document.querySelector('.option[data-value="tmux"].selected');
  if (!toolOption) return;

  selectedTool = toolOption.dataset.value;

  // Hide tool selection
  document.getElementById('step-tool-selection').classList.remove('visible');

  // Show appropriate steps (clear inline styles so CSS classes control visibility)
  if (selectedTool === 'starship') {
    document.querySelectorAll('.starship-step').forEach(s => s.style.display = '');
    document.querySelectorAll('.tmux-step').forEach(s => s.style.display = 'none');
    showStep(0);
  } else if (selectedTool === 'tmux') {
    document.querySelectorAll('.starship-step').forEach(s => s.style.display = 'none');
    document.querySelectorAll('.tmux-step').forEach(s => s.style.display = '');
    showTmuxStep(0);
  }
}

function goBackToToolSelection() {
  selectedTool = null;
  currentStep = 0;
  document.querySelectorAll('.step').forEach(s => s.classList.remove('visible'));
  document.getElementById('step-tool-selection').classList.add('visible');
  document.getElementById('progress').innerHTML = '';
}

// ── Progress bar ──────────────────────────────────────
function renderProgress() {
  const bar = document.getElementById('progress');
  bar.innerHTML = '';
  const totalSteps = selectedTool === 'tmux' ? TMUX_TOTAL_STEPS : TOTAL_STEPS;
  for (let i = 0; i < totalSteps; i++) {
    const el = document.createElement('div');
    el.className = 'progress-step';
    if (i < currentStep) el.classList.add('done');
    if (i === currentStep) el.classList.add('active');
    bar.appendChild(el);
  }
}

// ── Step navigation ───────────────────────────────────
function showStep(index) {
  document.querySelectorAll('.starship-step').forEach((s, i) => {
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

function showTmuxStep(index) {
  document.querySelectorAll('.tmux-step').forEach((s, i) => {
    s.classList.toggle('visible', i === index);
  });
  currentStep = index;
  renderProgress();

  if (index === TMUX_TOTAL_STEPS - 1) {
    renderTmuxResult();
  }
}

function nextStep() {
  if (selectedTool === 'tmux') {
    if (currentStep < TMUX_TOTAL_STEPS - 1) showTmuxStep(currentStep + 1);
  } else {
    if (currentStep < TOTAL_STEPS - 1) showStep(currentStep + 1);
  }
}

function prevStep() {
  if (currentStep > 0) {
    if (selectedTool === 'tmux') {
      showTmuxStep(currentStep - 1);
    } else {
      showStep(currentStep - 1);
    }
  }
}

function goToStart() {
  // Reset starship answers
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

  // Reset tmux answers
  tmuxAnswers.prefix = null;
  tmuxAnswers.mouse = true;
  tmuxAnswers.baseIndex = true;
  tmuxAnswers.renumber = true;
  tmuxAnswers.autoRename = false;
  tmuxAnswers.visualBell = true;
  tmuxAnswers.historyLimit = 10000;
  tmuxAnswers.theme = null;
  tmuxAnswers.paneBorder = false;
  tmuxAnswers.activeBorder = true;
  tmuxAnswers.statusPosition = null;
  tmuxAnswers.statusModules = [];
  tmuxAnswers.statusInterval = 5;
  tmuxAnswers.statusLeftLength = 40;
  tmuxAnswers.statusRightLength = 50;
  tmuxAnswers.statusJustify = 'centre';
  tmuxAnswers.splitKeys = null;
  tmuxAnswers.extraBindings = [];

  document.querySelectorAll('.option.selected').forEach(o => o.classList.remove('selected'));
  document.querySelectorAll('.color-swatch.selected').forEach(o => o.classList.remove('selected'));
  const customCharInput = document.getElementById('custom-char-input');
  if (customCharInput) customCharInput.value = '';
  const customColorInput = document.getElementById('custom-color-input');
  if (customColorInput) customColorInput.value = '#';
  const customColorPreview = document.getElementById('custom-color-preview');
  if (customColorPreview) customColorPreview.style.background = 'transparent';

  // Reset tmux DOM elements
  const tmuxToggles = {
    'tmux-mouse': true,
    'tmux-base-index': true,
    'tmux-renumber': true,
    'tmux-auto-rename': false,
    'tmux-visual-bell': true,
    'tmux-pane-border': false,
    'tmux-active-border': true,
  };
  for (const [id, defaultVal] of Object.entries(tmuxToggles)) {
    const el = document.getElementById(id);
    if (el) el.checked = defaultVal;
  }

  const tmuxRanges = {
    'tmux-history-limit': { value: 10000, display: 'tmux-history-limit-val', suffix: '' },
    'tmux-status-interval': { value: 5, display: 'tmux-status-interval-val', suffix: '秒' },
    'tmux-status-left-length': { value: 40, display: 'tmux-status-left-length-val', suffix: '' },
    'tmux-status-right-length': { value: 50, display: 'tmux-status-right-length-val', suffix: '' },
  };
  for (const [id, cfg] of Object.entries(tmuxRanges)) {
    const el = document.getElementById(id);
    if (el) el.value = cfg.value;
    const display = document.getElementById(cfg.display);
    if (display) display.textContent = cfg.value + cfg.suffix;
  }

  const tmuxJustify = document.getElementById('tmux-status-justify');
  if (tmuxJustify) tmuxJustify.value = 'centre';

  // Go back to tool selection
  goBackToToolSelection();
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

        // Tool selection
        if (key === 'tool') {
          const btn = document.getElementById('btn-select-tool');
          if (btn) btn.disabled = false;
          return;
        }

        // tmux options
        if (key.startsWith('tmux-')) {
          const tmuxKey = key.replace('tmux-', '').replace(/-([a-z])/g, (_, c) => c.toUpperCase());
          tmuxAnswers[tmuxKey] = option.dataset.value;
          const stepEl = option.closest('.step');
          const stepId = stepEl?.id;
          if (stepId === 'tmux-step-0') updateTmuxNextButton(0);
          if (stepId === 'tmux-step-1') updateTmuxNextButton(1);
          if (stepId === 'tmux-step-2') updateTmuxNextButton(2);
          return;
        }

        // Starship options
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

        // tmux checkboxes
        if (key.startsWith('tmux-')) {
          const tmuxKey = key.replace('tmux-', '').replace(/-([a-z])/g, (_, c) => c.toUpperCase());
          if (option.classList.contains('selected')) {
            if (!tmuxAnswers[tmuxKey].includes(val)) tmuxAnswers[tmuxKey].push(val);
          } else {
            tmuxAnswers[tmuxKey] = tmuxAnswers[tmuxKey].filter(v => v !== val);
          }
          return;
        }

        // Starship checkboxes
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

  // tmux specific listeners
  setupTmuxListeners();
}

// ── tmux option listeners ─────────────────────────────
function setupTmuxListeners() {
  const tmuxMouse = document.getElementById('tmux-mouse');
  if (tmuxMouse) {
    tmuxMouse.addEventListener('change', () => {
      tmuxAnswers.mouse = tmuxMouse.checked;
    });
  }

  const tmuxBaseIndex = document.getElementById('tmux-base-index');
  if (tmuxBaseIndex) {
    tmuxBaseIndex.addEventListener('change', () => {
      tmuxAnswers.baseIndex = tmuxBaseIndex.checked;
    });
  }

  const tmuxRenumber = document.getElementById('tmux-renumber');
  if (tmuxRenumber) {
    tmuxRenumber.addEventListener('change', () => {
      tmuxAnswers.renumber = tmuxRenumber.checked;
    });
  }

  const tmuxPaneBorder = document.getElementById('tmux-pane-border');
  if (tmuxPaneBorder) {
    tmuxPaneBorder.addEventListener('change', () => {
      tmuxAnswers.paneBorder = tmuxPaneBorder.checked;
    });
  }

  const tmuxActiveBorder = document.getElementById('tmux-active-border');
  if (tmuxActiveBorder) {
    tmuxActiveBorder.addEventListener('change', () => {
      tmuxAnswers.activeBorder = tmuxActiveBorder.checked;
    });
  }

  const tmuxStatusInterval = document.getElementById('tmux-status-interval');
  if (tmuxStatusInterval) {
    tmuxStatusInterval.addEventListener('input', () => {
      tmuxAnswers.statusInterval = parseInt(tmuxStatusInterval.value, 10);
      document.getElementById('tmux-status-interval-val').textContent = tmuxStatusInterval.value + '秒';
    });
  }

  const tmuxAutoRename = document.getElementById('tmux-auto-rename');
  if (tmuxAutoRename) {
    tmuxAutoRename.addEventListener('change', () => {
      tmuxAnswers.autoRename = tmuxAutoRename.checked;
    });
  }

  const tmuxVisualBell = document.getElementById('tmux-visual-bell');
  if (tmuxVisualBell) {
    tmuxVisualBell.addEventListener('change', () => {
      tmuxAnswers.visualBell = tmuxVisualBell.checked;
    });
  }

  const tmuxHistoryLimit = document.getElementById('tmux-history-limit');
  if (tmuxHistoryLimit) {
    tmuxHistoryLimit.addEventListener('input', () => {
      tmuxAnswers.historyLimit = parseInt(tmuxHistoryLimit.value, 10);
      document.getElementById('tmux-history-limit-val').textContent = tmuxHistoryLimit.value;
    });
  }

  const tmuxStatusLeftLength = document.getElementById('tmux-status-left-length');
  if (tmuxStatusLeftLength) {
    tmuxStatusLeftLength.addEventListener('input', () => {
      tmuxAnswers.statusLeftLength = parseInt(tmuxStatusLeftLength.value, 10);
      document.getElementById('tmux-status-left-length-val').textContent = tmuxStatusLeftLength.value;
    });
  }

  const tmuxStatusRightLength = document.getElementById('tmux-status-right-length');
  if (tmuxStatusRightLength) {
    tmuxStatusRightLength.addEventListener('input', () => {
      tmuxAnswers.statusRightLength = parseInt(tmuxStatusRightLength.value, 10);
      document.getElementById('tmux-status-right-length-val').textContent = tmuxStatusRightLength.value;
    });
  }

  const tmuxStatusJustify = document.getElementById('tmux-status-justify');
  if (tmuxStatusJustify) {
    tmuxStatusJustify.addEventListener('change', () => {
      tmuxAnswers.statusJustify = tmuxStatusJustify.value;
    });
  }
}

function updateTmuxNextButton(stepIndex) {
  const btn = document.getElementById(`btn-tmux-next-${stepIndex}`);
  if (!btn) return;

  if (stepIndex === 0) {
    btn.disabled = tmuxAnswers.prefix === null;
  } else if (stepIndex === 1) {
    btn.disabled = tmuxAnswers.theme === null;
  } else if (stepIndex === 2) {
    btn.disabled = tmuxAnswers.statusPosition === null;
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
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}

function copyConfig() {
  const text = document.getElementById('config-output').textContent;
  navigator.clipboard.writeText(text).then(() => {
    showToast('コピーしました');
  }).catch(() => {
    showToast('コピーに失敗しました');
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

// ── tmux config generation ───────────────────────────
function generateTmuxConfig() {
  const lines = [];

  lines.push('# tmux Configuration');
  lines.push('# Generated by Dotfiles Config Generator');
  lines.push('');

  // Prefix key
  if (tmuxAnswers.prefix && tmuxAnswers.prefix !== 'C-b') {
    lines.push('# Change prefix key');
    lines.push('unbind C-b');
    lines.push(`set -g prefix ${tmuxAnswers.prefix}`);
    lines.push(`bind ${tmuxAnswers.prefix} send-prefix`);
    lines.push('');
  }

  // Basic settings
  lines.push('# Basic settings');
  if (tmuxAnswers.mouse) {
    lines.push('set -g mouse on');
  }
  if (tmuxAnswers.baseIndex) {
    lines.push('set -g base-index 1');
    lines.push('setw -g pane-base-index 1');
  }
  if (tmuxAnswers.renumber) {
    lines.push('set -g renumber-windows on');
  }
  if (!tmuxAnswers.autoRename) {
    lines.push('setw -g automatic-rename off');
    lines.push('setw -g allow-rename off');
  }
  if (tmuxAnswers.visualBell) {
    lines.push('set -g visual-bell on');
    lines.push('set -g bell-action any');
  }
  lines.push('set -g escape-time 10');
  lines.push(`set -g history-limit ${tmuxAnswers.historyLimit}`);
  lines.push('');

  // Colors
  lines.push('# Colors');
  lines.push('set -g default-terminal "screen-256color"');
  lines.push('');

  // Theme
  const theme = tmuxAnswers.theme;
  if (theme && theme !== 'default') {
    lines.push(`# ${theme.charAt(0).toUpperCase() + theme.slice(1)} theme`);
    const themeColors = getThemeColors(theme);
    lines.push(`set -g status-style "bg=${themeColors.statusBg},fg=${themeColors.statusFg}"`);
    if (tmuxAnswers.activeBorder) {
      lines.push(`set -g pane-active-border-style "fg=${themeColors.activeBorder}"`);
    }
    lines.push(`set -g pane-border-style "fg=${themeColors.border}"`);
    lines.push(`set -g window-status-current-style "bg=${themeColors.activeBg},fg=${themeColors.activeFg}"`);
    lines.push('');
  } else if (tmuxAnswers.activeBorder) {
    lines.push('# Active pane border');
    lines.push('set -g pane-active-border-style "fg=green"');
    lines.push('');
  }

  // Status bar
  lines.push('# Status bar');
  lines.push(`set -g status-position ${tmuxAnswers.statusPosition || 'bottom'}`);
  lines.push(`set -g status-interval ${tmuxAnswers.statusInterval}`);
  lines.push(`set -g status-justify ${tmuxAnswers.statusJustify}`);
  lines.push(`set -g status-left-length ${tmuxAnswers.statusLeftLength}`);
  lines.push(`set -g status-right-length ${tmuxAnswers.statusRightLength}`);

  const leftParts = [];
  const rightParts = [];

  if (tmuxAnswers.statusModules.includes('session')) {
    leftParts.push('[#S]');
  }
  if (tmuxAnswers.statusModules.includes('hostname')) {
    rightParts.push('#H');
  }
  if (tmuxAnswers.statusModules.includes('datetime')) {
    rightParts.push('%Y-%m-%d %H:%M');
  }
  if (tmuxAnswers.statusModules.includes('load')) {
    rightParts.push('#(uptime | cut -d "," -f 3-)');
  }

  if (leftParts.length > 0) {
    lines.push(`set -g status-left "${leftParts.join(' ')} "`);
  }
  if (rightParts.length > 0) {
    lines.push(`set -g status-right " ${rightParts.join(' | ')}"`);
  }
  lines.push('');

  // Split keys
  const splitKeys = tmuxAnswers.splitKeys;
  if (splitKeys && splitKeys !== 'default') {
    lines.push('# Pane splitting');
    if (splitKeys === 'vim') {
      lines.push('bind | split-window -h');
      lines.push('bind - split-window -v');
    } else if (splitKeys === 'intuitive') {
      lines.push('bind h split-window -h');
      lines.push('bind v split-window -v');
    } else if (splitKeys === 'terminal') {
      lines.push('bind d split-window -h');
      lines.push('bind D split-window -v');
    }
    lines.push('unbind \'"\'');
    lines.push('unbind %');
    lines.push('');
  }

  // Extra bindings
  const extraBindings = tmuxAnswers.extraBindings;
  if (extraBindings.length > 0) {
    lines.push('# Additional keybindings');

    if (extraBindings.includes('vim-navigation')) {
      lines.push('# Vim-style pane navigation');
      lines.push('bind h select-pane -L');
      lines.push('bind j select-pane -D');
      lines.push('bind k select-pane -U');
      lines.push('bind l select-pane -R');
    }

    if (extraBindings.includes('vim-resize')) {
      lines.push('# Vim-style pane resizing');
      lines.push('bind -r H resize-pane -L 5');
      lines.push('bind -r J resize-pane -D 5');
      lines.push('bind -r K resize-pane -U 5');
      lines.push('bind -r L resize-pane -R 5');
    }

    if (extraBindings.includes('reload')) {
      lines.push('# Reload configuration');
      lines.push('bind r source-file ~/.tmux.conf \\; display "Config reloaded!"');
    }

    if (extraBindings.includes('copy-mode-vi')) {
      lines.push('# Vi mode for copy');
      lines.push('setw -g mode-keys vi');
      lines.push('bind -T copy-mode-vi v send-keys -X begin-selection');
      lines.push('bind -T copy-mode-vi y send-keys -X copy-selection-and-cancel');
    }

    if (extraBindings.includes('swap-panes')) {
      lines.push('# Swap panes');
      lines.push('bind { swap-pane -U');
      lines.push('bind } swap-pane -D');
    }

    if (extraBindings.includes('synchronize')) {
      lines.push('# Synchronize panes');
      lines.push('bind S setw synchronize-panes');
    }

    if (extraBindings.includes('window-move')) {
      lines.push('# Window navigation with Shift+arrows');
      lines.push('bind -n S-Left previous-window');
      lines.push('bind -n S-Right next-window');
    }

    if (extraBindings.includes('new-window')) {
      lines.push('# New window (tab) with prefix + t');
      lines.push('bind t new-window');
    }

    lines.push('');
  }

  return lines.join('\n');
}

function getThemeColors(theme) {
  const themes = {
    nord: {
      statusBg: '#2E3440',
      statusFg: '#D8DEE9',
      activeBorder: '#88C0D0',
      border: '#4C566A',
      activeBg: '#5E81AC',
      activeFg: '#ECEFF4',
    },
    dracula: {
      statusBg: '#282a36',
      statusFg: '#f8f8f2',
      activeBorder: '#bd93f9',
      border: '#44475a',
      activeBg: '#bd93f9',
      activeFg: '#282a36',
    },
    gruvbox: {
      statusBg: '#282828',
      statusFg: '#ebdbb2',
      activeBorder: '#fe8019',
      border: '#3c3836',
      activeBg: '#fe8019',
      activeFg: '#282828',
    },
    github: {
      statusBg: '#161b22',
      statusFg: '#e6edf3',
      activeBorder: '#dd6620',
      border: '#30363d',
      activeBg: '#dd6620',
      activeFg: '#ffffff',
    },
  };
  return themes[theme] || themes.github;
}

// ── tmux result rendering ─────────────────────────────
function renderTmuxResult() {
  const config = generateTmuxConfig();
  document.getElementById('tmux-config-output').textContent = config;
}

function copyTmuxConfig() {
  const text = document.getElementById('tmux-config-output').textContent;
  navigator.clipboard.writeText(text).then(() => {
    showToast('コピーしました');
  }).catch(() => {
    showToast('コピーに失敗しました');
  });
}

function downloadTmuxConfig() {
  const text = document.getElementById('tmux-config-output').textContent;
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = '.tmux.conf';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── Init ──────────────────────────────────────────────
// Hide all tool-specific steps initially
document.querySelectorAll('.starship-step, .tmux-step').forEach(s => {
  s.style.display = 'none';
});

renderProgress();
setupOptions();
