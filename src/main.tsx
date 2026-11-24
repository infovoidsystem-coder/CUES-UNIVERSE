import {createRoot} from 'react-dom/client'
import {HashRouter, Link, NavLink, Route, Routes, useParams} from 'react-router-dom'
import {useEffect, useState} from 'react'
import {available, characters, episodes, media, seasons, universe} from './content'
import type {Episode} from './content'
import {Artwork} from './artwork'
import {load, save} from './progress'
import {Reader} from './reader'
import './style.css'

const episodeName = (episode: Episode) => episode.title ?? 'Título pendiente'
const readerLink = (id: string) => '/leer/' + id

function EpisodeCard({episode}: {episode: Episode}) {
  return <article className="episode">
    {episode.cover ? <Artwork art={episode.cover} alt={'Portada de ' + episodeName(episode)}/> : <div className="cover"><span>Portada pendiente</span></div>}
    <div className="episode-body">
      <small>Episodio {episode.number} · {episode.status.replaceAll('-', ' ')}</small>
      <h3>{episodeName(episode)}</h3>
      {episode.synopsis && <p>{episode.synopsis}</p>}
      {available(episode) && <Link to={readerLink(episode.id)}>Leer episodio →</Link>}
    </div>
  </article>
}
function SeasonLinks() {
  return <div className="seasons">{seasons.map(s => <Link className={'season season-' + s.id} key={s.id} to={'/biblioteca/' + s.id}>
    <small>Temporada {s.id}</small><strong>{s.element}</strong><span aria-hidden="true">↗</span>
  </Link>)}</div>
}
function Home({last}: {last?: string}) {
  const released = episodes.filter(e => e.status === 'publicado' && available(e)).at(-1)
  const preview = episodes.find(available)
  return <>
    <section className="hero">
      <div className="hero-copy">
        <small>CUE’S UNIVERSE <span aria-hidden="true">/</span> MANGA DIGITAL</small>
        <h1>AUSTRAL<span>.</span></h1>
        <p>En una ciudad donde OMNIA controla la memoria y la percepción, CUE descubre en la música una forma de recuperar su autonomía.</p>
        <div className="actions">
          {last || preview ? <Link className="primary" to={readerLink(last ?? preview!.id)}>{last ? 'Continuar leyendo' : released ? 'Empezar a leer' : 'Leer temporada 1'} →</Link> : null}
          <Link className="outline" to="/biblioteca">Explorar biblioteca</Link>
        </div>
      </div>
    </section>
    <section className="layout"><h2>Temporadas</h2><SeasonLinks/></section>
    {(released ?? preview) && <section className="layout"><h2>{released ? 'Último episodio' : 'Vista previa editorial'}</h2><div className="grid"><EpisodeCard episode={(released ?? preview)!}/></div></section>}
  </>
}
function Library() {
  const {season} = useParams()
  const selection = seasons.find(s => String(s.id) === season)
  const shown = selection ? [selection] : seasons
  return <section className="layout">
    <h1>Biblioteca</h1><SeasonLinks/>
    {shown.map(s => {
      const entries = episodes.filter(e => e.season === s.id)
      return <section className="library-season" key={s.id}><h2>Temporada {s.id} <span>· {s.element}</span></h2>
        {entries.length ? <div className="grid">{entries.map(e => <EpisodeCard key={e.id} episode={e}/>)}</div> : <p>Episodios pendientes de publicación.</p>}
      </section>
    })}
  </section>
}
function Characters({completed}: {completed: string[]}) {
  return <section className="layout"><h1>Personajes</h1><p>Las fichas se amplían al completar episodios publicados.</p>
    <div className="grid">{characters.map(character => {
      const visible = character.entries.filter(entry => entry.requires.every(id => completed.includes(id)))
      if (!visible.length) return null
      return <article className="episode episode-body" key={character.id}>
        {character.portrait ? <Artwork art={character.portrait} alt={character.name}/> : <small>Retrato pendiente</small>}<h2>{character.name}</h2>
        {visible.map(entry => <p key={entry.text}>{entry.text}</p>)}
      </article>
    })}</div>
  </section>
}
function Universe() {
  return <section className="layout"><h1>Universo</h1><div className="grid">{universe.map(item => <article className="episode episode-body" key={item.title}><h2>{item.title}</h2><p>{item.text}</p></article>)}</div></section>
}
function About() {
  return <section className="layout"><h1>Acerca de</h1><h2>AUSTRAL — CUE’S UNIVERSE</h2><p>Creación y universo original de Santiago Silberstein.</p>
    <p><a href="https://github.com/infovoidsystem-coder/CUES-UNIVERSE">Repositorio del manga</a></p>
    <p>El enlace oficial de apoyo está pendiente de confirmación.</p>
  </section>
}
function App() {
  const [progress, setProgress] = useState(load)
  useEffect(() => save(progress), [progress])
  return <HashRouter>
    <header className="top"><Link to="/" className="brand">A<span>.</span> AUSTRAL</Link>
      <nav aria-label="Navegación principal">{[['/','Inicio'],['/biblioteca','Biblioteca'],['/personajes','Personajes'],['/universo','Universo'],['/acerca','Acerca de']].map(([url,label]) => <NavLink end={url === '/'} to={url} key={url}>{label}</NavLink>)}</nav>
    </header>
    <main><Routes>
      <Route path="/" element={<Home last={progress.last?.episode}/>}/>
      <Route path="/biblioteca/:season?" element={<Library/>}/>
      <Route path="/leer/:id" element={<Reader progress={progress} update={setProgress}/>}/>
      <Route path="/personajes" element={<Characters completed={progress.completed}/>}/>
      <Route path="/universo" element={<Universe/>}/>
      <Route path="/acerca" element={<About/>}/>
      <Route path="*" element={<div className="layout"><h1>Página no encontrada</h1><Link to="/">Volver al inicio</Link></div>}/>
    </Routes></main>
  </HashRouter>
}
createRoot(document.getElementById('root')!).render(<App/>)
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(media('sw.js')).catch(error => console.error('Service worker:', error))
  })
}
