// Tablero interactivo: testigos que se tocan para ver qué significan y qué tan urgentes son.
const shapes = {
  engine: '<path d="M9 7h12l4 5h5v12h-5l-3 4H10l-4-5H2V12h4l3-5Zm4-4h8M17 3v4M30 15h3v6"/>',
  oil: '<path d="m3 13 7-4 12 4 5-4 3 3-7 8H9L3 13Zm9-4V5h8M7 7l4 3M29 20s-4 5-4 7a4 4 0 0 0 8 0c0-2-4-7-4-7Z"/>',
  temp: '<path d="M13 22V6a4 4 0 0 1 8 0v16a7 7 0 1 1-8 0ZM17 11v15M23 9h5M23 15h5M2 31q4-4 8 0t8 0t8 0t8 0"/>',
  battery: '<path d="M3 10h30v19H3ZM8 10V6h5v4M23 10V6h5v4M7 19h8M11 15v8M23 19h6"/>',
  brake: '<circle cx="18" cy="18" r="10"/><path d="M18 12v8m0 4v1M5 7a17 17 0 0 0 0 22M31 7a17 17 0 0 1 0 22"/>',
  abs: '<circle cx="18" cy="18" r="12"/><path d="M3 8a19 19 0 0 0 0 20M33 8a19 19 0 0 1 0 20"/><text x="18" y="21" text-anchor="middle" fill="currentColor" stroke="none" font-size="10">ABS</text>',
  airbag: '<circle cx="11" cy="7" r="3"/><circle cx="25" cy="16" r="7"/><path d="m9 14 5 8-3 9M5 16v10h13M14 22l6 7"/>',
  stability: '<path d="m9 17 3-7h13l3 7v9H8v-9Zm1 1h16M11 26v3M25 26v3M7 2q-6 3 0 6M29 2q-6 3 0 6M8 32q4-3 8 0t8 0"/>',
  tire: '<path d="M9 5C2 13 2 23 8 29h20c6-6 6-16-1-24M9 29v3M15 29v3M21 29v3M27 29v3M18 10v10m0 4v1"/>',
  beam: '<path d="M18 7c19 0 19 22 0 22ZM3 8h10M3 14h10M3 20h10M3 26h10"/>',
  cruise: '<path d="M5 27a15 15 0 1 1 26 0M18 5v4M7 11l4 3M29 11l-4 3M4 21h5M27 21h5M18 23l8-9"/><circle cx="18" cy="23" r="3"/>',
};
const lamps = [
  ['Check engine', 'amber', 'engine', 'Hay una falla de motor o emisiones. Conviene escanear pronto.'],
  ['Presión de aceite', 'red', 'oil', 'Puede faltar presión de aceite. Frená en un lugar seguro, apagá el motor y revisá antes de seguir.'],
  ['Temperatura', 'red', 'temp', 'El motor puede estar recalentando. Frená en un lugar seguro y revisá antes de seguir.'],
  ['Batería', 'red', 'battery', 'Puede haber una falla en el sistema de carga. Frená en un lugar seguro y revisalo.'],
  ['Frenos', 'red', 'brake', 'Puede indicar freno de mano activado o una falla del sistema. Si sigue prendido al liberarlo, frená y revisá.'],
  ['ABS', 'amber', 'abs', 'Puede estar desactivada la asistencia antibloqueo. Manejate con precaución y revisá el sistema.'],
  ['Airbag', 'amber', 'airbag', 'El sistema de airbag puede tener una falla y no actuar como corresponde. Conviene revisarlo pronto.'],
  ['Control de estabilidad', 'amber', 'stability', 'Si queda fijo, el sistema puede estar desactivado o tener una falla. Si titila, puede estar interviniendo.'],
  ['Presión de neumáticos', 'amber', 'tire', 'Revisá la presión de los neumáticos. También puede haber una falla del sensor.'],
  ['Luces altas', 'blue', 'beam', 'Las luces altas están encendidas. Bajalas cuando puedas encandilar a otra persona.'],
  ['Control de crucero', 'green', 'cruise', 'El control de crucero está activado o listo para usarse, según el vehículo.'],
];
const BLINK = 'Falla de combustión grave que puede dañar el catalizador. Bajá la carga del motor y revisá cuanto antes.';
const URGENCY = { red: 'Frená y revisá', amber: 'Precaución, escaneá pronto', blue: 'Informativo', green: 'Informativo' };
const icon = (key) => `<svg viewBox="0 0 36 36" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${shapes[key]}</svg>`;

export function initTablero(root) {
  if (!root || root.dataset.initialized) return;
  root.dataset.initialized = 'true';
  root.innerHTML = `
    <div class="tb on-dark">
      <div class="tb-top"><span>TESTIGOS DEL TABLERO</span><span>DEMO INTERACTIVA</span></div>
      <div class="tb-lamps" role="group" aria-label="Testigos del tablero">${lamps.map(([name, color, key], i) => `<button type="button" class="tb-lamp tb-${color}" data-lamp="${i}" aria-pressed="false">${icon(key)}<span>${name}</span></button>`).join('')}</div>
    </div>
    <div class="tb-detail">
      <div class="tb-icon on-dark"></div>
      <p class="tb-urgency" aria-live="polite"></p>
      <h3 aria-live="polite"></h3>
      <p class="tb-explanation" aria-live="polite"></p>
      <div class="tb-actions">
        <div class="seg-group tb-toggle" role="group" aria-label="Estado del check engine"><button type="button" class="seg" data-mode="fixed">Fija</button><button type="button" class="seg" data-mode="blink">Titilando</button></div>
        <a class="btn btn-ghost" target="_blank" rel="noopener">¿Se te prendió esta? Escribinos</a>
      </div>
    </div>
    <p class="note">Los símbolos y colores exactos cambian según la marca. El manual de tu auto es la referencia final.</p>`;

  const buttons = [...root.querySelectorAll('.tb-lamp')];
  const detail = root.querySelector('.tb-detail');
  const toggle = root.querySelector('.tb-toggle');
  const modes = [...toggle.querySelectorAll('button')];
  let selected = 0;
  let blinking = false;

  function render() {
    const [name, color, key, explanation] = lamps[selected];
    buttons.forEach((b, i) => {
      b.classList.toggle('is-selected', i === selected);
      b.classList.toggle('is-blinking', i === 0 && selected === 0 && blinking);
      b.setAttribute('aria-pressed', String(i === selected));
    });
    detail.className = `tb-detail tb-${color}`;
    detail.querySelector('.tb-icon').innerHTML = icon(key);
    detail.querySelector('h3').textContent = name;
    detail.querySelector('.tb-urgency').textContent = URGENCY[color];
    detail.querySelector('.tb-explanation').textContent = selected === 0 && blinking ? BLINK : explanation;
    toggle.hidden = selected !== 0;
    modes.forEach((b) => b.setAttribute('aria-pressed', String((b.dataset.mode === 'blink') === blinking)));
    detail.querySelector('a').href = `https://wa.me/5493624624466?text=${encodeURIComponent(`ESCANEO - Se me prendió el testigo de ${name}`)}`;
  }
  buttons.forEach((b, i) => b.addEventListener('click', () => { selected = i; render(); }));
  modes.forEach((b) => b.addEventListener('click', () => { blinking = b.dataset.mode === 'blink'; render(); }));
  render();
}
