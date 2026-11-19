// Decodificador de códigos de falla. Datos: src/data/codigos.json (sección 9 de la base).
import data from '../data/codigos.json';

const WA = 'https://wa.me/5493624624466?text=';
const VALID = /^[PBCU][0-3][0-9A-F]{3}$/;

function find(code) {
  for (const e of data.codigos) {
    if (e.codigos?.includes(code) || (e.prefijo && code.startsWith(e.prefijo))) return e;
  }
  return null;
}

function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
}

function parts(code) {
  const [l, o, s] = code;
  const sys = data.sistemas[l];
  const sub =
    l === 'P' && o === '0'
      ? data.subsistemasP0[s] || 'Subsistema no listado en la norma genérica'
      : 'El subsistema depende del sistema y de la marca';
  return [
    { ch: l, k: 'Sistema', v: `${sys.nombre} (${sys.en})` },
    { ch: o, k: 'Quién lo define', v: data.origen[o] },
    { ch: s, k: 'Subsistema', v: sub },
    { ch: code.slice(3), k: 'Falla puntual', v: 'Indica el componente o la falla exacta' },
  ];
}

export function initDecoder({ form, input, chips, out }) {
  data.ejemplos.forEach((c) => {
    const b = el('button', 'chip mono', c);
    b.type = 'button';
    b.addEventListener('click', () => {
      input.value = c;
      run(c);
    });
    chips.append(b);
  });

  input.addEventListener('input', () => {
    input.value = input.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5);
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    run(input.value.trim().toUpperCase());
  });

  function run(code) {
    out.replaceChildren();
    if (!VALID.test(code)) {
      const p = el('p', 'dec-err');
      p.append('Ese código no tiene el formato estándar. Son 5 caracteres: una letra (P, B, C o U) y cuatro más, por ejemplo ', el('b', 'mono', 'P0303'), '.');
      out.append(p);
      return;
    }
    const entry = find(code);
    const generic = code[1] === '0' && code[0] === 'P';

    const row = el('div', 'dec-parts');
    parts(code).forEach((p) => {
      const card = el('div', 'dec-part');
      card.append(el('span', 'dec-ch mono', p.ch), el('span', 'dec-k', p.k), el('span', 'dec-v', p.v));
      row.append(card);
    });

    const res = el('div', 'dec-res');
    if (entry) {
      let title = entry.significado.replace('{n}', code.slice(-1));
      if (entry.detalle?.[code]) title += ` (${entry.detalle[code]})`;
      res.append(el('span', 'dec-code mono', code), el('h3', 'dec-title', title));
      res.append(el('p', 'dec-sub', 'Causas típicas, de más a menos comunes:'));
      const ul = el('ol', 'dec-causes');
      entry.causas.forEach((c) => ul.append(el('li', null, c)));
      res.append(ul);
      if (entry.nota) res.append(el('p', 'dec-note', entry.nota));
    } else {
      res.append(el('span', 'dec-code mono', code), el('h3', 'dec-title', 'No lo tenemos en la lista de códigos comunes'));
      res.append(el('p', 'dec-sub', 'Arriba tenés lo que dice su estructura. Mandanos el código y lo vemos con tu auto.'));
    }
    if (!generic) {
      res.append(el('p', 'dec-note', 'Los códigos que empiezan con P1, B, C y U suelen depender de la marca. El significado exacto se confirma con el escaneo de tu auto.'));
    }
    res.append(el('p', 'dec-warn', 'Un código no es un diagnóstico: indica dónde mirar, no qué pieza cambiar.'));

    const a = el('a', 'btn btn-wa');
    a.href = WA + encodeURIComponent(`ESCANEO - Me salió el código ${code}`);
    a.target = '_blank';
    a.rel = 'noopener';
    a.append(el('span', null, `Consultar por ${code}`));
    res.append(a);

    out.append(row, res);
    [...row.children, res].forEach((n) => n.classList.add('dec-in'));
  }

  run('P0303');
  input.value = 'P0303';
}
