import seasons from './editorial/temporadas.json'
import characterData from './editorial/personajes.json'
import universe from './editorial/universo.json'

export type Art = {avif?: string; width: number; height: number} & ({webp: string; jpeg?: string} | {webp?: string; jpeg: string})
export type Panel = {id: string; x: number; y: number; width: number; height: number; lines: {kind: 'dialogue' | 'broadcast' | 'narration' | 'sfx' | 'impact'; text: string; speaker?: string}[]}
export type Page = {id: string; image: Art | null; alt: string; notes?: string; panels: Panel[]; audio: {kind: 'voice' | 'music' | 'sfx'; file: string; startMs: number}[]}
export type Episode = {id: string; season: number; number: number; title: string | null; synopsis: string | null; status: 'en-producción' | 'vista-previa' | 'publicado'; cover: Art | null; pages: Page[]}
const modules = import.meta.glob<Episode>('./editorial/episodios/*.json', {eager: true, import: 'default'})
export const episodes = Object.values(modules).sort((a,b) => a.season - b.season || a.number - b.number)
export const available = (episode: Episode) => episode.status !== 'en-producción' && episode.pages.length > 0
export const media = (path: string) => import.meta.env.BASE_URL + path
export const characters: {id: string; name: string; portrait: Art | null; entries: {text: string; requires: string[]}[]}[] = characterData
export {seasons, universe}
