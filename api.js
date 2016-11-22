import { Router } from 'express'
import path from 'path'
import fs from 'fs'

const router = Router()

// Get a list of available themes
router.get('/themes', (req, res) => {
  let themeDir = './public/themes'

  let themes = fs.readdirSync(themeDir).map((file) => {
    const theme = require('./' + path.join(themeDir, file, 'theme.json'))
    return { ...theme, _id: file }
  })

  return res.json({ themes })
})

// Export the router
export default router
