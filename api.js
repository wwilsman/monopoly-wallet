import { Router } from 'express'
import path from 'path'
import fs from 'fs'

const router = Router()

// Get a list of available themes
router.get('/themes', (req, res) => {
  let themeDir = './public/themes'

  let themes = fs.readdirSync(themeDir).filter((file) => {
    return fs.statSync(path.join(themeDir, file, 'config.json')).isFile()
  })

  return res.json({ themes })
})

// Export the router
export default router
