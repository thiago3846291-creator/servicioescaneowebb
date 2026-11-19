// Lógica liviana de la página (sin librerías). Los widgets y GSAP se cargan aparte, cuando hacen falta.
const root = document.documentElement;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
const params = new URLSearchParams(location.search);
const store = {
  get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k, v) => { try { localStorage.setItem(k, v); } catch { /* modo privado */ } },
};

/* ---------- tema claro / oscuro ---------- */
const themeBtn = $('#theme-btn');
const themeMeta = $('meta[name="theme-color"]');
function setTheme(t, { save = false, smooth = true } = {}) {
  if (smooth) {
    root.classList.add('theming');
    setTimeout(() => root.classList.remove('theming'), 260);
  }
  root.dataset.theme = t;
  themeMeta.content = t === 'light' ? '#EEF1EE' : '#1E2B24';
  themeBtn.setAttribute('aria-label', t === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro');
  if (save) store.set('theme', t);
}
setTheme(root.dataset.theme, { smooth: false });
themeBtn.addEventListener('click', () => setTheme(root.dataset.theme === 'light' ? 'dark' : 'light', { save: true }));
// Sin elección guardada, sigue al sistema también si cambia con la página abierta.
window.matchMedia('(prefers-color-scheme: light)').addEventListener?.('change', (e) => {
  if (!store.get('theme') && !params.get('theme')) setTheme(e.matches ? 'light' : 'dark');
});

/* ---------- inicio 3: el haz recorre el tablero con el scroll ---------- */
function hero3() {
  const box = $('#hv3');
  const panel = $('.hv3-panel', box);
  const lamps = $$('.hv3-lamp', box).map((el) => [el, parseFloat(el.style.getPropertyValue('--at'))]);
  const hero = $('.hero');
  let raf = 0;
  const size = () => panel.style.setProperty('--pw', `${panel.clientWidth}px`);
  const set = (p) => {
    panel.style.setProperty('--p', p.toFixed(3));
    lamps.forEach(([el, at]) => el.classList.toggle('read', p >= at));
    box.classList.toggle('is-done', p >= 0.97);
  };
  const update = () => {
    raf = 0;
    const max = hero.offsetHeight - window.innerHeight;
    // Desde que el inicio llega arriba (la portada queda antes).
    set(motion.matches || max <= 40 ? 1 : Math.min(1, Math.max(0, (window.scrollY - hero.offsetTop) / max)));
  };
  const onScroll = () => { raf ||= requestAnimationFrame(update); };
  const onResize = () => { size(); onScroll(); };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize);
  size();
  update();
  return () => {
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onResize);
  };
}

/* ---------- inicio: el 1 es solo CSS; el 3 necesita el scroll (?hero=1|2|3 elige la versión) ---------- */
let stopHero = null;
function startHero() {
  stopHero?.();
  const n = root.dataset.hero;
  stopHero = n === '3' ? hero3() : null;
  if (n === '2') $('.hv2-img').loading = 'eager';
}
startHero();
motion.addEventListener?.('change', startHero);

/* ---------- portada: se difumina según cuánto bajaste respecto a su alto ---------- */
{
  const cover = $('#portada');
  const nav = $('#nav');
  let queued = false;
  const paint = () => {
    queued = false;
    const h = cover.offsetHeight;
    // La barra y el paginador cambian a vidrio opaco cuando ya no tienen la foto debajo.
    root.classList.toggle('past-cover', window.scrollY > h - nav.offsetHeight - 16);
    root.classList.toggle('scrolled', window.scrollY > 30);
    if (motion.matches) return cover.style.removeProperty('--cp');
    const p = Math.min(1, Math.max(0, window.scrollY / h));
    cover.style.setProperty('--cp', p.toFixed(3));
  };
  const onScroll = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(paint);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  motion.addEventListener?.('change', onScroll);
  paint();
}

/* ---------- indicador de secciones: sigue al scroll ---------- */
const secLinks = $$('#secnav a');
const secName = $('#secnav-name');
const setSection = (id) =>
  secLinks.forEach((a) => {
    const on = a.getAttribute('href') === '#' + id;
    a.classList.toggle('on', on);
    if (on) {
      a.setAttribute('aria-current', 'true');
      secName.textContent = a.dataset.name;
    } else a.removeAttribute('aria-current');
  });
// La sección "actual" es la que cruza el centro de la pantalla.
const secIO = new IntersectionObserver((entries) => entries.forEach((e) => e.isIntersecting && setSection(e.target.id)), { rootMargin: '-50% 0px -50% 0px' });
secLinks.forEach((a) => secIO.observe($(a.getAttribute('href'))));
setSection('portada');

/* ---------- brillo que sigue al mouse (solo escritorio) ---------- */
if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && !motion.matches) {
  const glow = $('.glow');
  let gx = 0, gy = 0, queued = false;
  window.addEventListener('pointermove', (e) => {
    gx = e.clientX;
    gy = e.clientY;
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      glow.style.setProperty('--mx', `${gx}px`);
      glow.style.setProperty('--my', `${gy}px`);
      glow.classList.add('on');
    });
  }, { passive: true });
}

/* ---------- WhatsApp flotante: aparece cuando los botones del inicio ya no se ven ---------- */
new IntersectionObserver(([e]) => $('#fab').classList.toggle('show', !e.isIntersecting && e.boundingClientRect.top < 0)).observe($('#hero-cta'));

/* ---------- widgets: cada uno se carga cuando su sección está por entrar ---------- */
const lazy = (el, load) => {
  const io = new IntersectionObserver((entries) => {
    if (!entries.some((e) => e.isIntersecting)) return;
    io.disconnect();
    load()
      .then(() => document.dispatchEvent(new Event('mm:layout')))
      .catch((err) => console.error(err));
  }, { rootMargin: '300px 0px' });
  io.observe(el);
};
lazy($('#tablero-root'), () => import('./modules/tablero.js').then((m) => m.initTablero($('#tablero-root'))));
lazy($('#dec-out'), () => import('./modules/decoder.js').then((m) => m.initDecoder({ form: $('#dec-form'), input: $('#dec-input'), chips: $('#dec-chips'), out: $('#dec-out') })));
lazy($('#monitors'), () => import('./modules/widgets.js').then((m) => m.initMonitors($('#monitors'), motion.matches)));

/* ---------- entradas con GSAP: se piden con el primer gesto (scroll, toque, tecla o mouse) ---------- */
if (!motion.matches) {
  const evs = ['scroll', 'wheel', 'touchstart', 'pointerdown', 'pointermove', 'keydown'];
  const go = () => {
    evs.forEach((e) => window.removeEventListener(e, go));
    import('./modules/anim.js').then((m) => m.initAnim()).catch((err) => console.error(err));
  };
  evs.forEach((e) => window.addEventListener(e, go, { passive: true }));
}
