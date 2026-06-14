/* ── TOUCH DETECTION ── */
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

/* ── STARFIELD ── */
function createStarfield(containerId, count = 200) {
  const container = document.getElementById(containerId);
  if (!container) return;
  for (let i = 0; i < count; i++) {
    const s = document.createElement('div');
    s.style.cssText = [
      'position:absolute;background:white;border-radius:50%',
      `width:${Math.random() * 2.5 + 0.5}px`,
      `height:${Math.random() * 2.5 + 0.5}px`,
      `top:${Math.random() * 100}%`,
      `left:${Math.random() * 100}%`,
      `opacity:${Math.random() * 0.6 + 0.1}`,
      `animation:twinkle ${(Math.random() * 4 + 2).toFixed(1)}s infinite alternate`,
      `animation-delay:${(Math.random() * 5).toFixed(1)}s`,
    ].join(';');
    container.appendChild(s);
  }
}

/* ── COUNTER ANIMATION ── */
function animateCounters(selector) {
  document.querySelectorAll(selector).forEach(el => {
    const target = +el.dataset.target;
    if (!target) return;
    let current = 0;
    const step = target / 60;
    const id = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = Math.floor(current) + (target >= 100 ? '+' : '');
      if (current >= target) clearInterval(id);
    }, 20);
  });
}

/* ── UI HELPERS ── */
function flash(element, color, intensity = 0.3, duration = 80) {
  if (!element) element = document.getElementById('flash');
  if (!element) return;
  element.style.background = color;
  element.style.opacity = intensity;
  const t = element._flashTimer;
  if (t) clearTimeout(t);
  element._flashTimer = setTimeout(() => { element.style.opacity = 0; }, duration);
}

function showAnnounce(text, sub, color, duration, anT, anS) {
  const at = anT || document.getElementById('anT') || document.getElementById('annText');
  const as = anS || document.getElementById('anS') || document.getElementById('annSub');
  if (!at) return;
  at.textContent = text;
  at.style.color = color;
  at.style.textShadow = `0 0 40px ${color}`;
  at.style.opacity = '1';
  at.style.transform = 'scale(1)';
  if (as) {
    as.textContent = sub || '';
    as.style.opacity = sub ? '1' : '0';
  }
  if (duration < 9999) {
    clearTimeout(at._hideTimer);
    at._hideTimer = setTimeout(() => {
      at.style.opacity = '0';
      at.style.transform = 'scale(0.5)';
      if (as) as.style.opacity = '0';
    }, duration);
  }
}

/* ── TOUCH CONTROLS ── */
class TouchControls {
  constructor(gameId, config) {
    this.gameId = gameId;
    this.config = config;
    this.el = null;
    this.activeTouches = {};
    this.keys = {};
    this.setup();
  }

  setup() {
    if (!isTouchDevice) return;
    this.el = document.createElement('div');
    this.el.className = 'touch-controls active';
    this.el.id = `touch-${this.gameId}`;

    const defs = this.config;
    defs.forEach(def => {
      const btn = document.createElement('div');
      btn.className = 'touch-btn';
      btn.textContent = def.icon;
      btn.style.cssText = def.style;
      btn.dataset.key = def.key;
      this.el.appendChild(btn);
    });

    document.body.appendChild(this.el);
    this.bindEvents();
  }

  bindEvents() {
    this.el.addEventListener('touchstart', e => {
      e.preventDefault();
      const t = e.changedTouches[0];
      const el = document.elementFromPoint(t.clientX, t.clientY);
      if (el && el.classList.contains('touch-btn')) {
        const key = el.dataset.key;
        this.keys[key] = true;
        el.classList.add('pressed');
        if (this.config.find(d => d.key === key)?.action) {
          this.config.find(d => d.key === key).action();
        }
      }
    }, { passive: false });

    this.el.addEventListener('touchend', e => {
      e.preventDefault();
      const t = e.changedTouches[0];
      const el = document.elementFromPoint(t.clientX, t.clientY);
      if (el && el.classList.contains('touch-btn')) {
        const key = el.dataset.key;
        this.keys[key] = false;
        el.classList.remove('pressed');
      }
    }, { passive: false });

    this.el.addEventListener('touchcancel', e => {
      this.el.querySelectorAll('.touch-btn').forEach(b => {
        this.keys[b.dataset.key] = false;
        b.classList.remove('pressed');
      });
    });
  }

  isPressed(key) {
    return this.keys[key] || false;
  }

  destroy() {
    if (this.el && this.el.parentNode) {
      this.el.parentNode.removeChild(this.el);
    }
  }
}

/* ── CANVAS RESIZE ── */
function setupCanvas(canvas) {
  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);
  return resize;
}

/* ── EXPOSE ── */
window.shared = {
  isTouchDevice,
  createStarfield,
  animateCounters,
  flash,
  showAnnounce,
  TouchControls,
  setupCanvas,
};
