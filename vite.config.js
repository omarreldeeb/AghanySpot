import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const rootDir = path.dirname(fileURLToPath(import.meta.url))
const songsDir = path.resolve(rootDir, 'Songs')

function serveSongsMiddleware(dir) {
  return (req, res, next) => {
    const rel = decodeURIComponent((req.url ?? '').split('?')[0].replace(/^\//, ''))
    if (!rel) return next()

    const file = path.resolve(dir, rel)
    if (!file.startsWith(dir + path.sep) && file !== dir) {
      res.statusCode = 403
      res.end()
      return
    }

    fs.stat(file, (err, stat) => {
      if (err || !stat.isFile()) return next()

      res.setHeader('Content-Type', 'audio/mpeg')
      res.setHeader('Accept-Ranges', 'bytes')

      const range = req.headers.range
      if (range) {
        const [startStr, endStr] = range.replace(/bytes=/, '').split('-')
        const start = Number.parseInt(startStr, 10)
        const end = endStr ? Number.parseInt(endStr, 10) : stat.size - 1

        res.statusCode = 206
        res.setHeader('Content-Range', `bytes ${start}-${end}/${stat.size}`)
        res.setHeader('Content-Length', String(end - start + 1))
        fs.createReadStream(file, { start, end }).pipe(res)
        return
      }

      res.setHeader('Content-Length', String(stat.size))
      fs.createReadStream(file).pipe(res)
    })
  }
}

function songsPlugin() {
  return {
    name: 'aghanyspot-songs',
    configureServer(server) {
      server.middlewares.use('/Songs', serveSongsMiddleware(songsDir))
    },
    closeBundle() {
      if (!fs.existsSync(songsDir)) {
        console.warn('Songs directory not found; skipping asset copy for this build.')
        return
      }

      const distSongs = path.resolve(rootDir, 'dist/Songs')
      fs.mkdirSync(distSongs, { recursive: true })

      for (const file of fs.readdirSync(songsDir)) {
        if (!file.toLowerCase().endsWith('.mp3')) continue
        fs.copyFileSync(path.join(songsDir, file), path.join(distSongs, file))
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react(), songsPlugin()],
  server: {
    host: true,
    port: 5173,
    open: true,
    fs: {
      allow: [rootDir, songsDir],
    },
  },
  preview: {
    host: true,
    port: 4173,
  },
})
