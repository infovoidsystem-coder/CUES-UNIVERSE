import {episodes, available} from './content'

export type Mode = 'horizontal' | 'vertical'
export type Reading = {episode: string; page: string}
export type Progress = {last?: Reading; positions: Record<string,string>; completed: string[]; mode: Mode}
const key = 'austral-progress-v1'

export function load(): Progress {
  const fallback: Progress = {positions: {}, completed: [], mode: 'horizontal'}
  try {
    const raw = JSON.parse(localStorage.getItem(key) ?? 'null')
    if (!raw || typeof raw !== 'object') return fallback
    const positions: Record<string,string> = {}
    for (const episode of episodes.filter(available)) {
      const page = raw.positions?.[episode.id]
      if (episode.pages.some(item => item.id === page)) positions[episode.id] = page
    }
    const last = raw.last
    return {
      positions,
      completed: Array.isArray(raw.completed) ? raw.completed.filter((id: string) => episodes.some(e => e.id === id && e.status === 'publicado')) : [],
      mode: raw.mode === 'vertical' ? 'vertical' : 'horizontal',
      last: last && positions[last.episode] === last.page && typeof last.page === 'string' ? last : undefined,
    }
  } catch { return fallback }
}
export function save(progress: Progress) {
  try { localStorage.setItem(key, JSON.stringify(progress)) } catch { /* Storage may be disabled. */ }
}
