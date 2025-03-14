import fs from 'fs'
import path from 'path'

export const createOutputDirectories = (OUTPUT_DIR) => {
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true })
    }

    const PNGS_DIR = path.join(OUTPUT_DIR, 'pngs')
    if (!fs.existsSync(PNGS_DIR)) {
        fs.mkdirSync(PNGS_DIR, { recursive: true })
    }

    const META_DIR = path.join(OUTPUT_DIR, 'meta')
    if (!fs.existsSync(META_DIR)) {
        fs.mkdirSync(META_DIR, { recursive: true })
    }
}
