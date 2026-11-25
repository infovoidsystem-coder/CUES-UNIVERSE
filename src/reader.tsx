import {useEffect, useRef, useState} from 'react'
import type {Dispatch, SetStateAction} from 'react'
import {Link, useParams} from 'react-router-dom'
import {available, episodes, media} from './content'
import type {Episode, Page} from './content'
import type {Progress} from './progress'
import {Artwork} from './artwork'

type Props = {progress: Progress; update: Dispatch<SetStateAction<Progress>>}
export function Reader(props: Props) {
  const {id} = useParams()
  const episode = episodes.find(item => item.id === id)
  if (!episode || !available(episode)) return <section className="layout"><h1>Episodio no disponible</h1><Link to="/biblioteca">Volver a biblioteca</Link></section>
  return <Chapter key={episode.id} episode={episode} {...props}/>
}
function ReadingPage({page, eager}: {page: Page; eager: boolean}) {
  const illustratedSequence = Boolean(page.image && page.panels.some(panel => panel.description))
  const overlay = Boolean(page.image) && !illustratedSequence
  return <figure className={overlay ? "page" : "page script-page"}>
    {page.image ? <Artwork art={page.image} alt={page.alt} eager={eager}/> : <figcaption className="script-heading"><small>Ilustración pendiente</small><h2>{page.alt}</h2>{page.notes && <p>{page.notes}</p>}</figcaption>}
    {page.panels.map((panel, panelIndex) => <div key={panel.id} className={overlay ? 'panel overlay' : 'panel'} style={overlay ? {left: panel.x + '%', top: panel.y + '%', width: panel.width + '%', minHeight: panel.height + '%'} : undefined}>
      {panel.description && !/^\d{2}-\d{2}$/.test(panel.id) && <div className="script-description"><span aria-hidden="true">{panelIndex + 1}</span><p>{panel.description}</p></div>}
      {panel.lines.map((line,i) => <p key={i} className={line.kind}>{line.speaker && <strong>{line.speaker} · </strong>}{line.text}</p>)}
    </div>)}
  </figure>
}
function Chapter({episode, progress, update}: Props & {episode: Episode}) {
  const [index, setIndex] = useState(() => Math.max(0, episode.pages.findIndex(page => page.id === progress.positions[episode.id])))
  const [zoom, setZoom] = useState(1)
  const [notice, setNotice] = useState('')
  const reader = useRef<HTMLElement>(null)
  const stream = useRef<HTMLDivElement>(null)
  const currentIndex = useRef(index)
  currentIndex.current = index
  const touch = useRef<{x: number; y: number} | null>(null)
  const vertical = progress.mode === 'vertical'
  const last = episode.pages.length - 1
  const page = episode.pages[index]
  const nextEpisode = episodes.find(item => item.season === episode.season && item.number === episode.number + 1 && available(item))
  useEffect(() => {
    update(previous => {
      if (previous.last?.episode === episode.id && previous.last.page === page.id) return previous
      return {...previous, last: {episode: episode.id, page: page.id}, positions: {...previous.positions, [episode.id]: page.id}}
    })
    for (const next of episode.pages.slice(index + 1, index + 3)) {
      if (!next.image) continue
      const image = new Image()
      image.src = media(next.image.webp ?? next.image.jpeg!)
    }
  }, [episode, index, page.id, update])

  useEffect(() => {
    if (!vertical || !stream.current) return
    const root = stream.current
    const pages = [...root.querySelectorAll<HTMLElement>('[data-page]')]
    const target = pages[currentIndex.current]
    root.scrollTop = target.offsetTop
    const observePage = () => {
      const marker = root.scrollTop + root.clientHeight * 0.35
      let active = 0
      for (const [i, el] of pages.entries()) if (el.offsetTop <= marker) active = i
      if (root.scrollTop > 0 && root.scrollHeight - root.clientHeight - root.scrollTop < 2) active = pages.length - 1
      setIndex(active)
    }
    root.addEventListener('scroll', observePage, {passive: true})
    return () => root.removeEventListener('scroll', observePage)
  }, [vertical, episode])
  useEffect(() => {
    if (!vertical) stream.current?.scrollTo(0, 0)
  }, [index, vertical])
  function move(offset: number) {
    const next = Math.min(last, Math.max(0, currentIndex.current + offset))
    if (vertical && stream.current) {
      const target = stream.current.querySelector<HTMLElement>('[data-page="' + next + '"]')
      if (target) stream.current.scrollTop = target.offsetTop
    }
    setIndex(next)
  }
  async function fullScreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen()
      else await reader.current?.requestFullscreen()
    } catch { setNotice('La pantalla completa no está disponible en este dispositivo.') }
  }
  return <section className="reader" ref={reader} tabIndex={0} onKeyDown={event => {
    if (event.target !== event.currentTarget || vertical) return
    if (event.key === 'ArrowLeft') move(-1)
    if (event.key === 'ArrowRight') move(1)
  }}>
    <header className="reader-bar"><Link to={'/biblioteca/' + episode.season}>← Biblioteca</Link><h1>{episode.title ?? 'Episodio ' + episode.number}</h1>
      <div className="controls">
        <button onClick={() => {setZoom(1); update(old => ({...old, mode: vertical ? 'horizontal' : 'vertical'}))}}>{vertical ? 'Cambiar a horizontal' : 'Cambiar a vertical'}</button>
        <button disabled={zoom <= 1} onClick={() => setZoom(value => Math.max(1, value - .25))} aria-label="Alejar">−</button>
        <button disabled={zoom >= 2} onClick={() => setZoom(value => Math.min(2, value + .25))} aria-label="Acercar">+</button>
        {document.fullscreenEnabled && <button onClick={fullScreen}>Pantalla completa</button>}
      </div>
      {episode.status === 'vista-previa' && <small>Edición en desarrollo · Páginas ilustradas y guion de manga</small>}
      {notice && <small role="status">{notice}</small>}
    </header>
    <div className={'stream ' + (vertical ? 'vertical' : zoom === 1 ? 'horizontal fit-page' : 'horizontal')} ref={stream}
      onTouchStart={event => { touch.current = event.touches.length === 1 ? {x:event.touches[0].clientX,y:event.touches[0].clientY} : null }}
      onTouchEnd={event => {
        const start = touch.current
        touch.current = null
        if (vertical || zoom > 1 || !start) return
        const dx = event.changedTouches[0].clientX - start.x
        const dy = event.changedTouches[0].clientY - start.y
        if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) move(dx < 0 ? 1 : -1)
      }}>
      {(vertical ? episode.pages : [page]).map((item,i) => <div className="page-holder" style={{width: (zoom * 100) + '%'}} key={item.id} data-page={vertical ? i : index}><ReadingPage page={item} eager={item.id === page.id}/></div>)}
    </div>
    <footer className="reader-footer">
      <button disabled={!index} onClick={() => move(-1)}>← Anterior</button>
      <span aria-live="polite">{index + 1} / {episode.pages.length}</span>
      {index === last && nextEpisode
        ? <Link className="outline" to={'/leer/' + nextEpisode.id}>Episodio {nextEpisode.number} →</Link>
        : <button disabled={index === last} onClick={() => move(1)}>Siguiente →</button>}
      {index === last && episode.status === 'publicado' && <button disabled={progress.completed.includes(episode.id)} onClick={() => update(old => ({...old, completed: [...old.completed, episode.id]}))}>{progress.completed.includes(episode.id) ? 'Completado' : 'Marcar como leído'}</button>}
    </footer>
  </section>
}
