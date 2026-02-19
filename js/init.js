// ── Keyboard navigation ───────────────────────────────
document.addEventListener('keydown', (e) => {
  // Ignore when typing in input fields
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;

  if (e.key === 'Enter') {
    // Find the visible primary button and click it
    const visibleStep = document.querySelector('.step.visible');
    if (!visibleStep) return;
    const primaryBtn = visibleStep.querySelector('button.primary:not(:disabled)');
    if (primaryBtn) {
      e.preventDefault();
      primaryBtn.click();
    }
  } else if (e.key === 'Escape' || e.key === 'Backspace') {
    // Go back
    const visibleStep = document.querySelector('.step.visible');
    if (!visibleStep) return;
    const backBtn = visibleStep.querySelector('.nav button:not(.primary)');
    if (backBtn && backBtn.textContent.trim()) {
      e.preventDefault();
      backBtn.click();
    }
  }
});

// ── Init ──────────────────────────────────────────────
// Hide all tool-specific steps initially
document.querySelectorAll('.starship-step, .tmux-step, .zsh-step, .neovim-step').forEach(s => {
  s.style.display = 'none';
});

renderProgress();
setupOptions();
