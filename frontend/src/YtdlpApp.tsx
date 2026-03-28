import { Main } from '@/app/components/Main'

import { Header } from './shared/components/Header'
import { Footer } from './shared/components/Footer'

export const YtdlpApp = () => {
  return (
    <>
      {/* Header */}
      <Header
        title="Music Downloader UI"
        githubUrl="https://github.com/EduardoCordova-DEV"
      />
      {/* Main */}
      <Main
        title="Music Downloader 🎧"
        subtitle="Download your favorite songs🎼"
      />
      {/* Footer */}
      <Footer title="Eduardo Cordova DEV" />
    </>
  )
}
