import { Button } from '@/components/ui/button'
import { Atom } from 'lucide-react'
import githubIcon from '/github-icon.svg'

interface Props {
  title?: string
  githubUrl?: string
}

export const Header = ({ title, githubUrl = '' }: Props) => {
  return (
    <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="bg-spotify-green p-1.5 rounded-md">
            <Atom className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-foreground tracking-tight">
            {title}
          </span>
        </div>
        {/* Nav actions */}
        <div className="flex items-center gap-2">
          {githubUrl.trim() && (
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground gap-2"
              asChild
            >
              <a href={githubUrl} target="_blank" rel="noreferrer">
                <img src={githubIcon} alt="GitHub" className="h-5 w-5 invert" />
                <span className="hidden sm:inline">GitHub</span>
              </a>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
