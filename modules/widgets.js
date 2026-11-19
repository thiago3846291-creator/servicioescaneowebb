// Detector de fallas borradas: demo de los monitores de autoprueba.
function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
}

const MONITORS = [
  ['Fallas de combustión', 'continuo'],
  ['Sistema de combustible', 'continuo'],
  ['Componentes', 'continuo'],
  ['Catalizador', 'no continuo'],
  ['Vapores de combustible (EVAP)', 'no continuo'],
  ['Sensor de oxígeno', 'no continuo'],
  ['Calefactor del sensor de oxígeno', 'no continuo'],
  ['EGR', 'no continuo'],
];
const OK = 'Monitores completos y luz prendida: la falla está a la vista.';
const BAD = 'La luz está apagada y parece todo bien. Pero con los monitores en "no listo" y pocos kilómetros desde el borrado, la conclusión es clara: borraron las fallas hace poco.';

export function initMonitors(root, reduced) {
  if (!root || root.dataset.initialized) return;
  root.dataset.initialized = 'true';
  const head = el('div', 'mon-head');
  head.append(
    el('h3', null, 'Así se ve un auto al que le borraron las fallas'),
    el('p', null, 'Borrar los códigos apaga la luz del tablero, pero todos los monitores de autoprueba vuelven a "no listo". Hacen falta varios días de manejo para que se completen de nuevo.')
  );
  const ctl = el('div', 'mon-ctl seg-group');
  ctl.setAttribute('role', 'group');
  ctl.setAttribute('aria-label', 'Estado del auto de la demo');
  const bOk = el('button', 'seg', 'Auto sin tocar');
  const bErase = el('button', 'seg', 'Borrar códigos');
  bOk.type = bErase.type = 'button';
  ctl.append(bOk, bErase);
  head.append(ctl);

  const panel = el('div', 'mon-panel');
  const list = el('ul', 'mon-list');
  const rows = MONITORS.map(([name, kind]) => {
    const li = el('li', 'mon-row ok');
    const l = el('span', 'mon-name', name);
    l.append(el('small', null, kind));
    li.append(l, el('b', 'mon-state', 'LISTO'));
    list.append(li);
    return li;
  });
  const side = el('div', 'mon-side');
  const lamp = el('div', 'mon-lamp on');
  lamp.append(el('i'), el('span', null, 'Check engine'), el('b', null, 'PRENDIDA'));
  const pid = el('div', 'mon-pid');
  pid.append(el('span', 'mon-pid-k', 'Distancia desde que se borraron los códigos'), el('b', 'mon-pid-v mono', '—'), el('small', null, '*Valor de ejemplo. Es un dato del estándar (PID 0x31) y no todos los autos lo informan.'));
  const verdict = el('div', 'mon-verdict ok');
  verdict.setAttribute('aria-live', 'polite');
  verdict.append(el('i'), el('p', null, OK));
  side.append(lamp, pid, verdict);
  panel.append(list, side);
  root.append(head, panel, el('p', 'note', 'Demostración con datos de ejemplo. No es el escaneo de un auto real.'));

  let timers = [];
  function apply(erased) {
    timers.forEach(clearTimeout);
    timers = [];
    bOk.setAttribute('aria-pressed', String(!erased));
    bErase.setAttribute('aria-pressed', String(erased));
    lamp.classList.toggle('on', !erased);
    lamp.querySelector('b').textContent = erased ? 'APAGADA' : 'PRENDIDA';
    rows.forEach((li, i) => {
      const flip = () => {
        li.classList.toggle('ok', !erased);
        li.classList.toggle('bad', erased);
        li.querySelector('.mon-state').textContent = erased ? 'NO LISTO' : 'LISTO';
      };
      if (reduced) flip();
      else timers.push(setTimeout(flip, 120 + i * 110));
    });
    const end = () => {
      pid.querySelector('.mon-pid-v').textContent = erased ? '12 km*' : '—';
      pid.classList.toggle('hot', erased);
      verdict.className = `mon-verdict ${erased ? 'bad' : 'ok'}`;
      verdict.querySelector('p').textContent = erased ? BAD : OK;
    };
    if (reduced) end();
    else timers.push(setTimeout(end, 160 + rows.length * 110));
  }
  bOk.addEventListener('click', () => apply(false));
  bErase.addEventListener('click', () => apply(true));
  apply(false);
}
