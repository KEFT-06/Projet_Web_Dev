import React, { useEffect, useMemo, useState } from 'react'

const FALLBACK_BG = '#cfbd97'
const FALLBACK_TEXT = '#000000'

export function ImageWithFallback(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const { src, alt, style, className, loading, decoding, ...rest } = props
  const [didError, setDidError] = useState(false)
  const [candidateIndex, setCandidateIndex] = useState(0)
  const [currentSrc, setCurrentSrc] = useState(src)
  const [candidates, setCandidates] = useState<string[]>([])

  useEffect(() => {
    // reset when src changes
    setCurrentSrc(src)
    setDidError(false)
    setCandidateIndex(0)
    // build candidates list
    const list: string[] = []
    if (typeof src === 'string' && src) {
      const isDataImages = src.startsWith('/data/images/')
      const filename = src.split('/').pop() || ''
      const hyphenToUnderscore = filename.replace(/-/g, '_')
      const underscoreToHyphen = filename.replace(/_/g, '-')
      // 1) original
      list.push(src)
      // 1b) base-url aware candidate for public folder
      if (isDataImages) list.push(`${import.meta.env.BASE_URL}data/images/${filename}`)
      // 2) build mirror
      if (isDataImages) list.push(`/build/data/images/${filename}`)
      // 3) hyphen/underscore variants
      if (filename.includes('-')) {
        if (isDataImages) list.push(`/data/images/${hyphenToUnderscore}`)
        list.push(`/build/data/images/${hyphenToUnderscore}`)
      }
      if (filename.includes('_')) {
        if (isDataImages) list.push(`/data/images/${underscoreToHyphen}`)
        list.push(`/build/data/images/${underscoreToHyphen}`)
      }
    }
    setCandidates(list)
  }, [src])

  const handleError = () => {
    // advance to next candidate if available
    const nextIndex = candidateIndex + 1
    if (nextIndex < candidates.length) {
      // log failed candidate for debugging
      try { console.warn('Image failed, trying next candidate', { failed: currentSrc, next: candidates[nextIndex] }) } catch {}
      setCandidateIndex(nextIndex)
      setCurrentSrc(candidates[nextIndex])
      return
    }
    try { console.error('All image candidates failed', { lastTried: currentSrc, candidates }) } catch {}
    setDidError(true)
  }

  const memoAlt = useMemo(() => alt, [alt])

  return didError ? (
    <div
      className={`inline-block text-center align-middle overflow-hidden ${className ?? ''}`}
      style={{ background: FALLBACK_BG, color: FALLBACK_TEXT, ...style }}
      data-original-url={src}
    >
      <div className="flex items-center justify-center w-full h-full p-4">
        <div className="w-full">
          <div className="text-sm opacity-80 mb-1">Affiche indisponible</div>
          <div className="font-semibold truncate" title={memoAlt as string}>{memoAlt}</div>
        </div>
      </div>
    </div>
  ) : (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      style={style}
      loading={loading ?? 'lazy'}
      decoding={decoding ?? 'async'}
      {...rest}
      onError={handleError}
    />
  )
}
