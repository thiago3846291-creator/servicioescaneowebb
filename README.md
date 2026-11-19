# Servicio de Escaneo Automotriz MM

Web del servicio de escaneo automotriz en Resistencia, Chaco. Hecha con [Vite](https://vite.dev) y JavaScript sin frameworks.

## Cómo correrla

Necesitás [Node.js](https://nodejs.org) 20 o más nuevo.

```bash
npm install
npm run dev
```

Se abre en `http://localhost:5173`.

## Publicarla

```bash
npm run build
```

Genera la carpeta `dist/`, que es la que se sube al hosting (Netlify, Vercel, GitHub Pages, etc.).

## Qué hay en cada carpeta

- `index.html`: la página y todos sus textos.
- `src/`: estilos (`styles/base.css`), lógica (`main.js`) y los widgets (`modules/`). Los códigos de falla del decodificador están en `src/data/codigos.json`.
- `public/img/`: fotos y la portada.
- `docs/`: la base de conocimiento de donde sale la información de la web.

## Opciones

- `?theme=light` o `?theme=dark`: fuerza el modo claro u oscuro.
- `?hero=1`, `?hero=2` o `?hero=3`: elige la versión del inicio.

