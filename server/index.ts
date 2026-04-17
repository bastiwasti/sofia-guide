import express from 'express'
import { getLocations, getLocationById, createLocation, deleteLocation } from './routes/locations'
import { getCategories, createCategory } from './routes/categories'
import { getNotes, createNote, deleteNote } from './routes/notes'
import { join } from 'path'

const app = express()
const PORT = process.env.PORT || 3002
const isDev = process.env.NODE_ENV !== 'production'

app.use(express.json())

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200)
  }
  next()
})

app.get('/api/locations', getLocations)
app.get('/api/locations/:id', getLocationById)
app.post('/api/locations', createLocation)
app.delete('/api/locations/:id', deleteLocation)

app.get('/api/categories', getCategories)
app.post('/api/categories', createCategory)

app.get('/api/notes', getNotes)
app.post('/api/notes', createNote)
app.delete('/api/notes/:id', deleteNote)

if (isDev) {
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
  })
}

if (!isDev) {
  const distPath = join(__dirname, '../dist')
  app.use(express.static(distPath))
  
  app.get('/*path', (_req, res) => {
    res.sendFile(join(distPath, 'index.html'))
  })
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`Environment: ${isDev ? 'development' : 'production'}`)
})
