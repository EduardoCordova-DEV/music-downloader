import { Download } from 'lucide-react'

interface Props {
  title?: string
}

export const Footer = ({ title = '' }: Props) => {
  return (
    <footer className="border-t border-border bg-background/80 backdrop-blur-sm mt-auto">
      <div className="container mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>
            {title.trim() && `${title} — Powered by `}
            <a
              href="https://github.com/yt-dlp/yt-dlp"
              target="_blank"
              rel="noreferrer"
              className="text-spotify-green hover:underline"
            >
              yt-dlp
            </a>
          </span>
        </div>

        {/* Right */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <a
            href="https://github.com/EduardoCordova-DEV/music-downloader"
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground transition-colors flex items-center gap-1"
          >
            <Download className="h-3.5 w-3.5" />
            Repo
          </a>
          <span className="text-muted-foreground/50">
            © {new Date().getFullYear()} {title}
          </span>
        </div>
      </div>
    </footer>
  )
}
