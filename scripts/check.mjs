import {readFileSync, readdirSync, existsSync} from 'node:fs'
import {resolve, sep} from 'node:path'
const read = path => JSON.parse(readFileSync(path, 'utf8'))
const check = (condition, message) => { if (!condition) throw new Error(message) }
const root = resolve('public')
const media = path => typeof path === 'string' && resolve(root, path).startsWith(root + sep) && existsSync(resolve(root, path))
const art = (item, label) => {
  if (item === null) return
  check(item && (item.webp ? media(item.webp) && item.webp.endsWith('.webp') : media(item.jpeg) && item.jpeg.endsWith('.jpg')), label + ': imagen inválida')
  check(!item.avif || (media(item.avif) && item.avif.endsWith('.avif')), label + ': AVIF inválido')
  check(Number.isInteger(item.width) && item.width > 0 && Number.isInteger(item.height) && item.height > 0, label + ': dimensiones inválidas')
}
const folder = 'src/editorial/episodios'
const seasons = read('src/editorial/temporadas.json')
const episodes = readdirSync(folder).filter(file => file.endsWith('.json')).map(file => read(folder + '/' + file))
const ids = new Set()
for (const episode of episodes) {
  const {id, season, number, status, pages} = episode
  check(id === 't' + season + '-e' + number && !ids.has(id) && seasons.some(entry => entry.id === season), 'Episodio inválido o duplicado: ' + id)
  ids.add(id)
  check(['en-producción','vista-previa','publicado'].includes(status), id + ': estado inválido')
  check(Array.isArray(pages) && (status === 'en-producción' || pages.length > 0), id + ': faltan páginas')
  check(typeof episode.title === 'string' || status === 'en-producción', id + ': falta título')
  check(status !== 'publicado' || Boolean(episode.cover), id + ': falta portada')
  art(episode.cover, id)
  const pageIds = new Set()
  for (const page of pages) {
    check(typeof page.id === 'string' && page.id && !pageIds.has(page.id), id + ': página duplicada o sin ID')
    pageIds.add(page.id)
    check(Boolean(page.alt?.trim()), id + ': falta texto alternativo')
    check(status !== 'publicado' || Boolean(page.image), id + ': faltan ilustraciones')
    art(page.image, id + '/' + page.id)
    for (const panel of page.panels) {
      check([panel.x,panel.y,panel.width,panel.height].every(n => Number.isFinite(n) && n >= 0 && n <= 100), id + ': posición de viñeta inválida')
      check(panel.width > 0 && panel.height > 0 && panel.x + panel.width <= 100 && panel.y + panel.height <= 100, id + ': viñeta fuera de página')
      check(panel.lines.every(line => ['dialogue','narration'].includes(line.kind) && line.text?.trim()), id + ': diálogo inválido')
    }
    for (const cue of page.audio) check(['voice','music','sfx'].includes(cue.kind) && Number.isFinite(cue.startMs) && cue.startMs >= 0 && media(cue.file), id + ': audio inválido')
  }
}
for (const character of read('src/editorial/personajes.json')) {
  art(character.portrait, character.id)
  check(character.entries.every(entry => entry.requires.every(id => ids.has(id))), character.id + ': episodio de revelación inexistente')
}
console.log('Catálogo verificado:', seasons.length, 'temporadas y', episodes.length, 'episodios.')
