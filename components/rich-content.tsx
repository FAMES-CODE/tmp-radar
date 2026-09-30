/* eslint-disable @next/next/no-img-element */
import type { ReactNode } from "react"

const imageExtensions = /\.(?:avif|gif|jpe?g|png|svg|webp)(?:[?#].*)?$/i
const videoExtensions = /\.(?:m4v|mov|mp4|webm)(?:[?#].*)?$/i
const markdownToken =
  /\[!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)\]\((https?:\/\/[^\s)]+)\)|!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)|\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s<]+)/g

function safeUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.href
      : null
  } catch {
    return null
  }
}

function media(url: string, alt: string, key: string) {
  if (imageExtensions.test(url))
    return (
      <img
        className="rich-image"
        key={key}
        src={url}
        alt={alt}
        loading="lazy"
      />
    )
  if (videoExtensions.test(url))
    return (
      <video className="rich-video" key={key} controls preload="metadata">
        <source src={url} />
        Your browser cannot play this video.
      </video>
    )
  return null
}

function renderLine(line: string, lineIndex: number): ReactNode[] {
  const nodes: ReactNode[] = []
  let last = 0
  for (const match of line.matchAll(markdownToken)) {
    const index = match.index ?? 0
    if (index > last) nodes.push(line.slice(last, index))
    const [
      token,
      linkedAlt,
      linkedMedia,
      linkedHref,
      imageAlt,
      imageUrl,
      text,
      href,
      rawUrl,
    ] = match
    const url = safeUrl(linkedMedia ?? imageUrl ?? href ?? rawUrl ?? "")
    const destination = safeUrl(linkedHref ?? href ?? "")
    const key = `${lineIndex}-${index}`
    const item = url && media(url, linkedAlt ?? imageAlt ?? "", key)
    if (item)
      nodes.push(
        destination ? (
          <a href={destination} key={key} target="_blank" rel="noreferrer">
            {item}
          </a>
        ) : (
          item
        )
      )
    else if (url)
      nodes.push(
        <a
          className="rich-link"
          href={url}
          key={key}
          target="_blank"
          rel="noreferrer"
        >
          {text ?? url}
        </a>
      )
    else nodes.push(token)
    last = index + token.length
  }
  if (last < line.length) nodes.push(line.slice(last))
  return nodes
}

export function RichContent({ content }: { content: string }) {
  return (
    <div className="rich-content">
      {content.split(/\r?\n/).map((line, index) => (
        <p key={index}>{renderLine(line, index)}</p>
      ))}
    </div>
  )
}
