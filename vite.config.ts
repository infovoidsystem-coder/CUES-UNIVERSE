import { defineConfig } from 'vite'
import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'

export default defineConfig({
  base: './',
  plugins: [{
    name: 'version-austral-worker',
    closeBundle() {
      const path = 'dist/sw.js'
      const worker = readFileSync(path, 'utf8')
      const revision = createHash('sha256').update(readFileSync('dist/index.html')).update(worker).digest('hex').slice(0, 16)
      writeFileSync(path, worker.replace("'v1'", JSON.stringify(revision)))
    },
  }],
})
