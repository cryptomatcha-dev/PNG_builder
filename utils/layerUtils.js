import fs from 'fs'
import path from 'path'

export const getLayers = (LAYERS_DIR) => {
	return fs.readdirSync(LAYERS_DIR)
		.filter(file => {
			const layerPath = path.join(LAYERS_DIR, file)
			return fs.statSync(layerPath).isDirectory() &&
				fs.readdirSync(layerPath).some(innerFile => innerFile.toLowerCase().endsWith('.png'))
		})
}

export const createLayersDirectory = (LAYERS_DIR) => {
	if (!fs.existsSync(LAYERS_DIR)) {
		fs.mkdirSync(LAYERS_DIR, { recursive: true })
		console.log(`Directory created: ${LAYERS_DIR}`)
	} else {
		console.log(`Directory already exists: ${LAYERS_DIR}`)
	}
}