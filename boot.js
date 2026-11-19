// Entrada mínima: solo estilos y la fuente. El JavaScript de la página se pide
// después del primer pintado, así el título (LCP) aparece sin esperar a nada.
import '@fontsource-variable/inter/opsz.css';
import './styles/base.css';

const start = () => import('./main.js');
requestAnimationFrame(() => setTimeout(start, 0));
