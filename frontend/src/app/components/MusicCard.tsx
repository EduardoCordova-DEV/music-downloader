import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { KeyBadge } from './KeyBadge'
import { Clock, Music2, CheckCircle2, FolderOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'

interface MusicCardProps {
  coverUrl: string
  title: string
  artist: string
  duration: string
  bpm?: number
  musicKey?: string
  genre?: string
  downloadProgress: number
  isDownloading?: boolean
  onOpenFolder?: () => void
}

export const MusicCard = ({
  coverUrl,
  title,
  artist,
  duration,
  bpm = 0,
  musicKey = '',
  genre = '',
  downloadProgress,
  isDownloading = false,
  onOpenFolder,
}: MusicCardProps) => {
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    if (downloadProgress >= 100) {
      const timer = setTimeout(() => setIsComplete(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [downloadProgress])

  useEffect(() => {
    if (downloadProgress === 0) setIsComplete(false)
  }, [downloadProgress])

  const renderBottom = () => {
    if (isComplete) {
      return (
        <div className="flex items-center justify-end pt-1">
          <div className="flex items-center gap-2 text-sm text-spotify-green font-medium">
            <CheckCircle2 className="h-4 w-4" />
            Downloaded successfully
          </div>
        </div>
      )
    }

    // Muestra la barra desde el inicio — ya sea en 0% esperando o subiendo
    return (
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            {isDownloading ? 'Descargando...' : 'Preparando descarga...'}
          </span>
          <span className="text-primary font-semibold">
            {downloadProgress}%
          </span>
        </div>
        <Progress value={downloadProgress} className="h-2" />
      </div>
    )
  }

  return (
    <Card className="p-6 space-y-4 bg-card border-border transition-all hover:border-primary/50">
      <div className="flex gap-4">
        <img
          src={coverUrl}
          alt={`${title} cover`}
          className="h-32 w-32 rounded-md object-cover shadow-lg"
        />
        <div className="flex-1 space-y-2">
          <h3 className="text-xl font-bold text-foreground line-clamp-1">
            {title}
          </h3>
          <p className="text-muted-foreground">{artist}</p>
          <div className="flex flex-wrap gap-2 pt-1">
            <Badge variant="secondary" className="gap-1">
              <Clock className="h-3 w-3" />
              {duration}
            </Badge>
            {bpm > 0 && (
              <Badge variant="secondary" className="gap-1">
                <Music2 className="h-3 w-3" />
                {bpm} BPM
              </Badge>
            )}
            {musicKey && <KeyBadge musicKey={musicKey} />}
            {genre && <Badge variant="outline">{genre}</Badge>}
          </div>
        </div>
      </div>

      {renderBottom()}
    </Card>
  )
}
