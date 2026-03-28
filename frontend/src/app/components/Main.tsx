import { useState } from 'react'
import { DownloadInput } from './DownloadInput'
import { MusicCardSkeleton } from './MusicCardSkeleton'
import { MusicCard } from './MusicCard'
import { fetchSongInfo, startDownload, formatDuration } from '@/lib/api'
import { getSocket } from '@/lib/socket'
import type { SongInfo } from '@/lib/api'
import type { Socket } from 'socket.io-client'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:3001'

interface Props {
  title: string
  subtitle?: string
}

function waitForConnection(socket: Socket, timeoutMs = 5000): Promise<void> {
  return new Promise((resolve, reject) => {
    if (socket.connected) return resolve()
    const timer = setTimeout(
      () => reject(new Error('No se pudo conectar al servidor.')),
      timeoutMs,
    )
    socket.once('connect', () => {
      clearTimeout(timer)
      resolve()
    })
  })
}

// Dispara la descarga en el browser igual que un <a download> normal
function triggerBrowserDownload(filename: string) {
  const url = `${BACKEND_URL}/api/file/${encodeURIComponent(filename)}`
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

export const Main = ({ title = 'Download HQ Music', subtitle = '' }: Props) => {
  const [isLoading, setIsLoading] = useState(false)
  const [showCard, setShowCard] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [songInfo, setSongInfo] = useState<SongInfo | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async (url: string) => {
    setIsLoading(true)
    setShowCard(false)
    setDownloadProgress(0)
    setSongInfo(null)
    setError(null)
    setIsDownloading(false)

    try {
      // Paso 1: obtener info → llenar Card
      const info = await fetchSongInfo(url)
      setSongInfo(info)
      setShowCard(true)
      setIsLoading(false)

      // Paso 2: esperar socket
      const socket = getSocket()
      await waitForConnection(socket)

      setIsDownloading(true)

      socket.off('progress')
      socket.on(
        'progress',
        ({
          percent,
          filename,
        }: {
          percent: number
          filename: string | null
        }) => {
          setDownloadProgress(Math.round(percent))

          if (percent >= 100) {
            socket.off('progress')
            setIsDownloading(false)

            // Disparar descarga en el browser cuando yt-dlp termina
            if (filename) {
              triggerBrowserDownload(filename)
            }
          }
        },
      )

      await startDownload(url, socket.id!)
    } catch (err) {
      const socket = getSocket()
      socket.off('progress')
      setIsDownloading(false)
      setIsLoading(false)
      const msg = err instanceof Error ? err.message : 'Error desconocido'
      setError(msg)
    }
  }

  const musicCardData = songInfo
    ? {
        coverUrl: songInfo.thumbnail ?? '',
        title: songInfo.title,
        artist: songInfo.uploader,
        duration: formatDuration(songInfo.duration),
        bpm: 0,
        musicKey: '',
        genre: '',
      }
    : null

  return (
    <main className="container mx-auto px-4 py-12 relative z-10">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-4xl font-bold text-white">{title}</h2>
          <p className="text-muted-white text-lg">{subtitle}</p>
        </div>

        <DownloadInput
          placeholder="Youtube/SoundCloud URL here..."
          onDownload={handleDownload}
          isLoading={isLoading || isDownloading}
        />

        {isLoading && (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <MusicCardSkeleton />
          </div>
        )}

        {error && !isLoading && (
          <div className="animate-in fade-in slide-in-from-bottom-4 text-center text-red-400 text-sm">
            {error}
          </div>
        )}

        {showCard && !isLoading && musicCardData && (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <MusicCard
              {...musicCardData}
              downloadProgress={downloadProgress}
              isDownloading={isDownloading}
            />
          </div>
        )}
      </div>
    </main>
  )
}
