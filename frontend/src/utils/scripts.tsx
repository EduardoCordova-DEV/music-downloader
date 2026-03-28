export function cleanMediaUrl(rawUrl: string): string | null {
  try {
    const url = new URL(rawUrl)

    // -----------------------
    // YOUTUBE
    // -----------------------
    if (url.hostname === 'www.youtube.com' || url.hostname === 'youtube.com') {
      const videoId = url.searchParams.get('v')

      if (!videoId) return null

      // 🔥 Solo construimos el URL con el videoId
      return `https://www.youtube.com/watch?v=${videoId}`
    }

    // -----------------------
    // SOUNDCLOUD
    // -----------------------
    if (url.hostname === 'soundcloud.com') {
      return `${url.origin}${url.pathname}`
    }

    return null
  } catch {
    return null
  }
}

export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00:00'

  const totalSeconds = Math.floor(seconds) // 🔥 truncamos decimales

  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const secs = totalSeconds % 60

  return [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    secs.toString().padStart(2, '0'),
  ].join(':')
}
