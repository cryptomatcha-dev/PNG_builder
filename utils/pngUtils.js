import fs from 'fs'
import path from 'path'
import { createCanvas, loadImage } from 'canvas'
import { PNGS_DIR, META_DIR } from '../global/constants.js'

export const calculateUniqueCombinations = (layerOrder, LAYERS_DIR) => {
	const layerCounts = layerOrder.map(layer =>
		fs.readdirSync(path.join(LAYERS_DIR, layer))
			.filter(file => file.toLowerCase().endsWith('.png')).length
	)
	return layerCounts.reduce((total, count) => total * count, 1)
}

export const mergePNGs = async (pngCount, usedCombinations, layerSizes, layerOrder, collectionName, collectionDescription, LAYERS_DIR) => {
	const selectedFiles = getUniqueCombination(usedCombinations, layerOrder, LAYERS_DIR)
	const outputFile = path.join(PNGS_DIR, `${pngCount}.png`)

	const canvas = createCanvas(layerSizes.width, layerSizes.height)
	const ctx = canvas.getContext('2d')

	for (const file of selectedFiles) {
		const image = await loadImage(file)
		ctx.drawImage(image, 0, 0, layerSizes.width, layerSizes.height)
	}

	const buffer = canvas.toBuffer('image/png')
	fs.writeFileSync(outputFile, buffer)
	console.log(`Merged PNG saved as ${outputFile}`)

	const jsonFileName = `${pngCount}.json`
	const jsonFilePath = path.join(META_DIR, jsonFileName)
	const attributes = layerOrder.map((layer, index) => ({
		trait_type: layer,
		value: path.basename(selectedFiles[index], '.png')
	}))

	const jsonData = {
		name: collectionName,
		description: collectionDescription,
		attributes
	}

	fs.writeFileSync(jsonFilePath, JSON.stringify(jsonData, null, 2))
	console.log(`JSON saved as ${jsonFilePath}`)
}

const getUniqueCombination = (usedCombinations, layerOrder, LAYERS_DIR) => {
	const inputFiles = layerOrder.map(layer => {
		const files = fs.readdirSync(path.join(LAYERS_DIR, layer))
			.filter(file => file.toLowerCase().endsWith('.png'))
		const randomIndex = Math.floor(Math.random() * files.length)
		return path.join(LAYERS_DIR, layer, files[randomIndex])
	})

	const combinationKey = JSON.stringify(inputFiles)
	if (usedCombinations.has(combinationKey)) {
		return getUniqueCombination(usedCombinations, layerOrder, LAYERS_DIR)
	}

	usedCombinations.add(combinationKey)
	return inputFiles
}