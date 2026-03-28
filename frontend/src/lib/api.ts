const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:3001'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SongInfo {
  title: string
  duration: number // segundos
  thumbnail: string | null
  uploader: string
  webpage_url: string
  ext: string
}

export interface DownloadResult {
  success: boolean
  message: string
  filename: string | null
  downloadDir: string
}

// ─── GET song info ────────────────────────────────────────────────────────────
// Fil the Card with data from the song without download anything yet
export async function fetchSongInfo(url: string): Promise<SongInfo> {
  const res = await fetch(`${BACKEND_URL}/api/info`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Error desconocido' }))
    throw new Error(err.error ?? 'No se pudo obtener la información')
  }

  return res.json() as Promise<SongInfo>
}

// ─── Start download ───────────────────────────────────────────────────────────
// Trigger the download from the backend; get the progress through WebSocket
export async function startDownload(
  url: string,
  socketId: string,
): Promise<DownloadResult> {
  const res = await fetch(`${BACKEND_URL}/api/download`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, socketId }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Error desconocido' }))
    throw new Error(err.error ?? 'La descarga falló')
  }

  return res.json() as Promise<DownloadResult>
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Format seconds to → "3:45"
export function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}
