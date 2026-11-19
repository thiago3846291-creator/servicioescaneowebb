// Entradas al hacer scroll: bloques que aparecen y títulos que suben palabra por palabra.
// Solo se animan elementos que todavía están debajo de la pantalla: nada visible se oculta.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

function splitWords(node) {
  const words = [];
  const walk = (from, to) => {
    [...from.childNodes].forEach((c) => {
      if (c.nodeType !== 3) {
        const clone = c.cloneNode(false);
        to.append(clone);
        return walk(c, clone);
      }
      c.textContent.split(/(\s+)/).forEach((w) => {
        if (!w) return;
        if (/^\s+$/.test(w)) return to.append(' ');
        const outer = document.createElement('span');
        outer.className = 'w';
        outer.setAttribute('aria-hidden', 'true');
        const inner = document.createElement('span');
        inner.textContent = w;
        outer.append(inner);
        to.append(outer);
        words.push(inner);
      });
    });
  };
  const frag = document.createDocumentFragment();
  walk(node, frag);
  node.setAttribute('aria-label', node.textContent.trim());
  node.replaceChildren(frag);
  return words;
}

export function initAnim() {
  gsap.registerPlugin(ScrollTrigger);
  const below = (el) => el.getBoundingClientRect().top > window.innerHeight * 0.95;

  const blocks = [...document.querySelectorAll('[data-reveal]')].filter(below);
  gsap.set(blocks, { opacity: 0, y: 22 });
  ScrollTrigger.batch(blocks, {
    start: 'top 90%',
    once: true,
    onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.07, overwrite: true, clearProps: 'transform' }),
  });

  document.querySelectorAll('[data-words]').forEach((h) => {
    if (!below(h)) return;
    const words = splitWords(h);
    gsap.set(words, { yPercent: 108 });
    ScrollTrigger.create({
      trigger: h,
      start: 'top 90%',
      once: true,
      onEnter: () => gsap.to(words, { yPercent: 0, duration: 0.85, ease: 'power4.out', stagger: 0.045 }),
    });
  });

  // Los widgets cambian la altura de la página al cargarse.
  document.addEventListener('mm:layout', () => ScrollTrigger.refresh());
}
