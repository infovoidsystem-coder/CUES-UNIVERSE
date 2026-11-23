# austral-manga

Manga digital instalable de AUSTRAL — CUE’S UNIVERSE. Primera entrega editorial con cuatro temporadas y seis episodios registrados en la primera. El episodio 1 abre una vista previa de dos bloques provisionales y espera las ilustraciones oficiales.

## Desarrollo

Requiere Node.js 24. Ejecutá:

```sh
npm install
npm run dev
npm run build
npm run preview
```

La compilación verifica el catálogo, revisa TypeScript y genera dist/. La PWA se prueba desde preview o HTTPS. En Chrome/Edge usá el control de instalación cuando aparezca. En Safari iOS usá Compartir → Agregar a inicio. Las páginas y medios visitados pueden quedar en caché para usar sin conexión. El avance se guarda en el navegador y dispositivo donde se lee.

## GitHub Desktop y Pages

La copia local apunta a https://github.com/infovoidsystem-coder/CUES-UNIVERSE.git. En GitHub Desktop usá File → Add Local Repository y seleccioná esta carpeta. Si el remoto ya tiene commits, hacé Fetch y conciliá su historial antes de subir. Si sigue vacío, subí la rama main sin crear otro repositorio.

En GitHub, dentro de Settings → Pages, elegí GitHub Actions como fuente. El flujo GitHub Pages despliega cada push a main. Podés iniciarlo desde Actions → GitHub Pages → Run workflow. La URL esperada es https://infovoidsystem-coder.github.io/CUES-UNIVERSE/ y queda confirmada cuando el job deploy termina correctamente.

## Contenido

Consultá [la guía editorial](editorial/GUIA.md) para publicar capítulos, preparar ilustraciones y controlar revelaciones.
