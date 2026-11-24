# Edición de episodios

1. Creá un JSON en src/editorial/episodios/ tomando el episodio 1 como ejemplo. Conservá los identificadores de episodios y páginas ya publicados para preservar el progreso.
2. Completá season, number, title, synopsis, status, cover y pages. Estados: en-producción (sin lector), vista-previa (prueba sin desbloqueos) y publicado (lectura completa).
3. Exportá ilustraciones desde originales aprobados como WebP, opcionalmente AVIF. Guardalas en public/media/imagenes/ con nombres versionados. Usá rutas relativas como media/imagenes/t1-e1-p01-v1.webp. Declarar dimensiones reales y texto alternativo.
4. Cada viñeta de panels admite id, x, y, width y height en porcentajes y, para páginas sin ilustración, una description que se muestra en el lector. Cada entrada de lines tiene text, speaker opcional y kind: dialogue (globo), broadcast (altavoz), narration (cartela negra con letras blancas), sfx (sonido) o impact (golpe). Si el arte incluye globos, evitá duplicarlos.
5. audio permite reservar eventos con kind voice, music o sfx, file y startMs. La reproducción sincronizada está prevista para una versión futura.
6. En personajes.json, cada ficha puede tener entradas de historia, habilidades, relaciones o evolución. En requires, indicá los episodios publicados que el lector debe haber marcado como leídos. Guardá identidades, desenlaces y otros spoilers todavía inéditos en editorial/privado/ con los guiones. El filtro de interfaz no oculta datos de los archivos públicos a quien inspeccione el código.
7. Ejecutá npm run build. Probá la lectura horizontal y vertical, cambios de zoom, recarga y persistencia del avance. Revisá que los globos sigan legibles en pantalla chica.

## Episodio 1

Los identificadores persecucion y pasado representan dos bloques de ingreso de ilustraciones. La paginación y el desglose de viñetas quedan pendientes de aprobación. El bloque persecucion está previsto para reutilizarse visualmente al abrir el episodio 6. Los diálogos deben transcribirse del material aprobado.

## Archivos editoriales

- src/editorial/temporadas.json: catálogo.
- src/editorial/episodios/: metadatos, páginas, viñetas, diálogos y audio.
- src/editorial/personajes.json y universo.json: contenido visible en la aplicación.
- public/media/: imágenes y audio autorizados para publicación.
- editorial/referencias/: registro de fuentes y estado de referencias.
- editorial/privado/: área local ignorada por Git para material de producción.
