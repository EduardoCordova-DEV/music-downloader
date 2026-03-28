require('dotenv').config()

const AUDD_TOKEN = process.env.AUDD_API_TOKEN

const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const { spawn } = require('child_process')
const cors = require('cors')
const path = require('path')
const os = require('os')
const fs = require('fs')

// ─── App Setup ───────────────────────────────────────────────────────────────
const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: { origin: '*' },
})

app.use(cors())
app.use(express.json())

// // ─── Download folder: C:\Users\<user>\Downloads ───────────────────────────────
const DOWNLOAD_DIR = path.join(os.homedir(), 'Downloads')

if (!fs.existsSync(DOWNLOAD_DIR)) {
  fs.mkdirSync(DOWNLOAD_DIR, { recursive: true })
}

// ─── Utility: parse yt-dlp progress line ─────────────────────────────────────
// yt-dlp outputs lines like: [download]  45.3% of   5.23MiB at  1.20MiB/s ETA 00:03
function parseProgress(line) {
  const match = line.match(/\[download\]\s+([\d.]+)%/)
  if (match) return parseFloat(match[1])
  return null
}

// ─── Route: GET /api/health ───────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', downloadDir: DOWNLOAD_DIR })
})

// ─── Route: POST /api/info ────────────────────────────────────────────────────
// Body: { url: "https://..." }
// Returns: { title, duration, thumbnail, uploader, webpage_url }
app.post('/api/info', (req, res) => {
  const { url } = req.body

  if (!url || !url.startsWith('http')) {
    return res.status(400).json({ error: 'URL inválida.' })
  }

  const args = ['--dump-json', '--no-playlist', url]
  const proc = spawn('yt-dlp', args)

  let output = ''
  let errorOutput = ''

  proc.stdout.on('data', (data) => {
    output += data.toString()
  })

  proc.stderr.on('data', (data) => {
    errorOutput += data.toString()
  })

  proc.on('close', (code) => {
    if (code !== 0) {
      console.error('yt-dlp error:', errorOutput)
      return res
        .status(500)
        .json({ error: 'No se pudo obtener información del video.' })
    }

    try {
      const info = JSON.parse(output)
      res.json({
        title: info.title || 'Sin título',
        duration: info.duration || 0, // segundos
        thumbnail: info.thumbnail || null,
        uploader: info.uploader || info.channel || 'Desconocido',
        webpage_url: info.webpage_url || url,
        ext: info.ext || 'wav',
      })
    } catch (e) {
      res
        .status(500)
        .json({ error: 'Error al parsear la respuesta de yt-dlp.' })
    }
  })
})

// ─── Route: POST /api/download ────────────────────────────────────────────────
// Body: { url: "https://...", socketId: "abc123" }
// Streams progress via Socket.io → evento "progress"
// Emite "done" con el nombre del archivo al terminar
app.post('/api/download', (req, res) => {
  const { url, socketId } = req.body

  if (!url || !url.startsWith('http')) {
    return res.status(400).json({ error: 'URL inválida.' })
  }

  const socket = socketId ? io.sockets.sockets.get(socketId) : null

  const emitProgress = (percent, status, filename = null) => {
    if (socket) {
      socket.emit('progress', { percent, status, filename })
    }
  }

  // yt-dlp command exacto que usabas en CMD
  // -f bestaudio --extract-audio --audio-format wav --audio-quality 0
  const args = [
    '-f',
    'bestaudio',
    '--extract-audio',
    '--audio-format',
    'wav',
    '--audio-quality',
    '0',
    '--no-playlist',
    '-o',
    path.join(DOWNLOAD_DIR, '%(title)s.%(ext)s'),
    url,
  ]

  console.log('▶ Iniciando descarga:', url)
  emitProgress(0, 'Iniciando descarga...')

  const proc = spawn('yt-dlp', args)

  let lastFilename = null

  proc.stdout.on('data', (data) => {
    const lines = data.toString().split('\n')
    lines.forEach((line) => {
      if (!line.trim()) return
      console.log('[yt-dlp]', line)

      // Detectar progreso
      const percent = parseProgress(line)
      if (percent !== null) {
        emitProgress(percent, `Descargando... ${percent.toFixed(1)}%`)
      }

      // Detectar conversión a WAV
      if (line.includes('[ExtractAudio]') || line.includes('Destination:')) {
        emitProgress(95, 'Convirtiendo a WAV...')
        const destMatch = line.match(/Destination:\s+(.+\.wav)/i)
        if (destMatch) {
          lastFilename = path.basename(destMatch[1])
        }
      }

      // Detectar archivo ya existente
      if (line.includes('has already been downloaded')) {
        emitProgress(100, 'Archivo ya existía en Downloads.')
        const match = line.match(
          /\[download\] (.+) has already been downloaded/,
        )
        if (match) lastFilename = path.basename(match[1])
      }
    })
  })

  proc.stderr.on('data', (data) => {
    console.error('[yt-dlp stderr]', data.toString())
  })

  proc.on('close', (code) => {
    if (code === 0) {
      emitProgress(100, '¡Listo! Archivo guardado en Downloads.', lastFilename)
      console.log('✅ Descarga completada:', lastFilename || 'archivo.wav')
      res.json({
        success: true,
        message: 'Descarga completada.',
        filename: lastFilename,
        downloadDir: DOWNLOAD_DIR,
      })
    } else {
      emitProgress(0, 'Error durante la descarga.')
      res.status(500).json({ error: 'yt-dlp falló durante la descarga.' })
    }
  })

  proc.on('error', (err) => {
    console.error('Error al ejecutar yt-dlp:', err.message)
    emitProgress(0, 'Error: yt-dlp no encontrado.')
    res
      .status(500)
      .json({ error: 'yt-dlp no está instalado o no está en el PATH.' })
  })
})

// ─── Socket.io connection ─────────────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log('🔌 Cliente conectado:', socket.id)
  socket.on('disconnect', () => {
    console.log('🔌 Cliente desconectado:', socket.id)
  })
})

// ─── Start server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001
server.listen(PORT, () => {
  console.log(
    `🎵 Music Downloader Backend corriendo en http://localhost:${PORT}`,
  )
  console.log(`📁 Archivos guardados en: ${DOWNLOAD_DIR}`)
})

// ─── Route: POST /api/analyze ─────────────────────────────────────────────────
// Body: { filename: "nombre.wav" }
// Usa ffmpeg para extraer 10s del medio → manda ese snippet a AudD
app.post('/api/analyze', async (req, res) => {
  const { filename } = req.body

  if (!filename) {
    return res.status(400).json({ error: 'Se requiere el nombre del archivo.' })
  }

  const filepath = path.join(DOWNLOAD_DIR, filename)

  if (!fs.existsSync(filepath)) {
    return res.status(404).json({ error: `Archivo no encontrado: ${filename}` })
  }

  if (!AUDD_TOKEN) {
    return res
      .status(500)
      .json({ error: 'AUDD_API_TOKEN no configurado en .env' })
  }

  // Archivo temporal para el snippet — se borra al terminar
  const snippetPath = path.join(os.tmpdir(), `snippet_${Date.now()}.wav`)

  try {
    // ── Paso 1: obtener duración del archivo con ffprobe ──────────────────────
    const duration = await getAudioDuration(filepath)
    console.log(`⏱ Duración detectada: ${duration}s`)

    // Empezamos en el 25% de la canción para evitar intros/silencio
    const startTime = Math.floor(duration * 0.25)
    console.log(`✂️ Extrayendo 10s desde el segundo ${startTime}...`)

    // ── Paso 2: extraer 10s con ffmpeg → archivo WAV temporal válido ──────────
    await extractSnippet(filepath, snippetPath, startTime, 10)
    console.log(`📦 Snippet creado: ${snippetPath}`)

    // ── Paso 3: mandar el snippet a AudD ─────────────────────────────────────
    const snippetBuffer = fs.readFileSync(snippetPath)
    const form = new globalThis.FormData()
    const blob = new Blob([snippetBuffer], { type: 'audio/wav' })
    form.append('file', blob, 'snippet.wav')
    form.append('api_token', AUDD_TOKEN)
    form.append('return', 'apple_music,spotify')

    console.log(
      `🎵 Enviando ${(snippetBuffer.length / 1024).toFixed(0)}KB a AudD...`,
    )

    const auddRes = await fetch('https://api.audd.io/', {
      method: 'POST',
      body: form,
    })
    const auddData = await auddRes.json()
    console.log('AudD response:', JSON.stringify(auddData, null, 2))

    // Limpiar snippet temporal
    fs.unlinkSync(snippetPath)

    if (auddData.status !== 'success' || !auddData.result) {
      return res.status(404).json({
        error: 'AudD no pudo identificar la canción.',
        audd_status: auddData.status,
        audd_error: auddData.error ?? null,
      })
    }

    const result = auddData.result
    const spotifyData = result.spotify?.audio_features
    const appleData = result.apple_music

    res.json({
      title: result.title ?? null,
      artist: result.artist ?? null,
      album: result.album ?? null,
      genre: appleData?.genreNames?.[0] ?? null,
      bpm: spotifyData?.tempo ? Math.round(spotifyData.tempo) : null,
      key: spotifyData
        ? pitchClassToKey(spotifyData.key, spotifyData.mode)
        : null,
      label: result.label ?? null,
      release_date: result.release_date ?? null,
    })
  } catch (err) {
    // Limpiar snippet si existe
    if (fs.existsSync(snippetPath)) fs.unlinkSync(snippetPath)
    console.error('Analyze error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// ─── Helper: obtener duración con ffprobe ─────────────────────────────────────
function getAudioDuration(filepath) {
  return new Promise((resolve, reject) => {
    const proc = spawn('ffprobe', [
      '-v',
      'error',
      '-show_entries',
      'format=duration',
      '-of',
      'default=noprint_wrappers=1:nokey=1',
      filepath,
    ])
    let output = ''
    proc.stdout.on('data', (d) => (output += d.toString()))
    proc.on('close', (code) => {
      if (code !== 0) return reject(new Error('ffprobe falló'))
      const dur = parseFloat(output.trim())
      if (isNaN(dur)) return reject(new Error('No se pudo leer la duración'))
      resolve(dur)
    })
    proc.on('error', () => reject(new Error('ffprobe no encontrado en PATH')))
  })
}

// ─── Helper: extraer snippet con ffmpeg ───────────────────────────────────────
function extractSnippet(inputPath, outputPath, startSeconds, durationSeconds) {
  return new Promise((resolve, reject) => {
    const proc = spawn('ffmpeg', [
      '-y', // sobreescribir si existe
      '-ss',
      String(startSeconds), // tiempo de inicio
      '-i',
      inputPath, // archivo de entrada
      '-t',
      String(durationSeconds), // duración del snippet
      '-acodec',
      'pcm_s16le', // WAV estándar
      '-ar',
      '44100', // sample rate
      '-ac',
      '1', // mono (más pequeño, suficiente para fingerprint)
      outputPath,
    ])
    proc.on('close', (code) => {
      if (code !== 0)
        return reject(new Error('ffmpeg falló al extraer snippet'))
      resolve()
    })
    proc.on('error', () => reject(new Error('ffmpeg no encontrado en PATH')))
  })
}

// ─── Helper: pitch class → notación musical ───────────────────────────────────
function pitchClassToKey(pitchClass, mode) {
  const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  if (pitchClass < 0 || pitchClass > 11) return null
  return `${keys[pitchClass]}${mode === 1 ? '' : 'm'}`
}
