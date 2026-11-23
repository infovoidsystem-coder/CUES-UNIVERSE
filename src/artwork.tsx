import {media} from './content'
import type {Art} from './content'

export function Artwork({art, alt, eager = false}: {art: Art; alt: string; eager?: boolean}) {
  return <picture>
    {art.avif && <source type="image/avif" srcSet={media(art.avif)}/>}
    <img src={media(art.webp ?? art.jpeg!)} alt={alt} width={art.width} height={art.height} loading={eager ? 'eager' : 'lazy'} decoding="async"/>
  </picture>
}
