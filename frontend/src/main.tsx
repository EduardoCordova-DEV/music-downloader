import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { YtdlpApp } from './YtdlpApp'
import { Toaster } from '@/components/ui/sonner'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div className="min-h-screen flex flex-col">
      <YtdlpApp />
      <Toaster />
    </div>
  </StrictMode>,
)
