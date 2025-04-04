import inquirer from 'inquirer'
import promptSync from 'prompt-sync'
import { getLayers } from './utils/layerUtils.js'
import { mergePNGs, calculateUniqueCombinations } from './utils/pngUtils.js'
import { createLayersDirectory } from './utils/layerUtils.js'
import { createOutputDirectories } from './utils/fileUtils.js'
import { OUTPUT_DIR, LAYERS_DIR } from './global/constants.js'
import { welcomeMessage } from './common/welcomeMessage.js'

const prompt = promptSync()

createOutputDirectories(OUTPUT_DIR)
createLayersDirectory(LAYERS_DIR)

welcomeMessage()

const collectionName = prompt('Enter the collection name: ')
const collectionDescription = prompt('Enter the collection description: ')

let attempts = 0
let size

do {
	size = parseInt(prompt('Enter the width. The height will be filled in automatically. Your value: '), 10)

	if (isNaN(size) || size <= 0) {
		console.error('Error: please enter a valid positive number for size.')
		attempts++
	} else {
		break
	}

	if (attempts >= 5) {
		console.error('Too many invalid attempts. Exiting...')
		process.exit(1)
	}
} while (true)

const layerSizes = {
	width: size,
	height: size
}

const layers = getLayers(LAYERS_DIR)
console.log('Available layers:', layers.join(', '))

const selectAllChoice = { name: 'Select All', value: '__all__' }
const choices = [selectAllChoice, ...layers.map(layer => ({ name: layer, value: layer }))]

const { layerOrder: selectedLayers } = await inquirer.prompt([
	{
		type: 'checkbox',
		name: 'layerOrder',
		message: 'Select layer order (Use SPACE to select and ENTER to confirm):',
		choices: choices,
		validate(answer) {
			if (answer.length < 1) {
				return 'You must choose at least one layer.'
			}
			return true
		}
	}
])

const layerOrder = selectedLayers.includes('__all__') ? layers : selectedLayers

console.log('Selected layer order:', layerOrder.join(', '))

const uniqueCount = calculateUniqueCombinations(layerOrder, LAYERS_DIR)
console.log(`Maximum number of unique NFTs: ${uniqueCount}`)

let nftCount
do {
	nftCount = parseInt(prompt(`Enter number of NFTs to generate (maximum ${uniqueCount}): `), 10)
} while (isNaN(nftCount) || nftCount < 1 || nftCount > uniqueCount)

let startNumber
do {
	startNumber = parseInt(prompt('Enter the starting number for JSON generation (default is 1): '), 10) || 1
} while (isNaN(startNumber) || startNumber < 1)

const usedCombinations = new Set()
for (let i = 0; i < nftCount; i++) {
	const currentNumber = startNumber + i
	process.stdout.write(`Generating NFT ${currentNumber}/${startNumber + nftCount - 1}... `)
	await mergePNGs(
		currentNumber,
		usedCombinations,
		layerSizes,
		layerOrder,
		collectionName,
		collectionDescription,
		LAYERS_DIR
	)
	process.stdout.write('✓\n')
}

console.log('Your PNGs have been compiled. Thank you for using.')