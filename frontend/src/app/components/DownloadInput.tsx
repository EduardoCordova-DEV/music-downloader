import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Download } from 'lucide-react'
import { cleanMediaUrl } from '@/utils/scripts'
import { Field, FieldLabel } from '@/components/ui/field'

interface Props {
  placeholder?: string
  onDownload: (url: string) => void
  isLoading: boolean
}

export const DownloadInput = ({
  placeholder = 'Search',
  onDownload,
  isLoading,
}: Props) => {
  const [url, setUrl] = useState('')
  const [isInvalid, setIsInvalid] = useState(false)

  const handleDownload = () => {
    const cleanedUrl = cleanMediaUrl(url)

    if (cleanedUrl) {
      onDownload(cleanedUrl)
      reset()
    } else {
      setIsInvalid(true)
      setUrl('')
      toast.error('URL Not valid', {
        position: 'bottom-right',
        onAutoClose: () => reset(),
        style: {
          background: '#ef4444',
          color: 'white',
          border: '1px solid #dc2626',
        },
      })
    }
  }

  const reset = () => {
    setUrl('')
    setIsInvalid(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-end gap-2">
        <Field data-invalid={isInvalid || undefined} className="flex-1 w-full">
          <FieldLabel
            htmlFor="download-input"
            className={`text-sm transition-opacity ${isInvalid ? 'opacity-100' : 'opacity-0 select-none'}`}
          >
            Invalid URL
          </FieldLabel>
          <Input
            id="download-input"
            type="url"
            placeholder={placeholder}
            value={url}
            onChange={(e) => {
              setUrl(e.target.value)
              setIsInvalid(false)
            }}
            className="bg-secondary border-border p-4"
            disabled={isLoading}
            aria-invalid={isInvalid}
          />
        </Field>
        <Button
          onClick={handleDownload}
          disabled={!url.trim() || isLoading}
          className="bg-spotify-green hover:bg-spotify-green-hover text-white gap-2 p-4 w-full sm:w-auto"
        >
          <Download className="h-4 w-4" />
          Download
        </Button>
      </div>
    </div>
  )
}
