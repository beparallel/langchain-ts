#! /usr/bin/env node

import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import { extractPrompts } from './lib/parser.js'
import { generateTypes } from './lib/type-generator.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function main() {
    const file = process.argv.find((arg) => arg.startsWith('--file='))
    if (!file) {
        console.error('File not provided, please provide a file with --file=')
        return
    }
    const filePath = file.split('=')[1]
    const arrayPath = __dirname.split('/')
    const firstNodeModulesIndex = arrayPath.findIndex((path) => path === 'node_modules')
    let outputPath = path.resolve(...arrayPath.slice(0, firstNodeModulesIndex + 1), filePath)

    outputPath = filePath

    const langchainApiKey = process.env.LANGCHAIN_API_KEY
    if (!langchainApiKey) {
        console.error('LANGCHAIN_API_KEY is not set')
        return
    }

    const tagArg = process.argv.find((arg) => arg.startsWith('--tag='))
    const langchainTag = tagArg ? tagArg.split('=')[1] : process.env.LANGCHAIN_TAG

    if (!langchainTag) {
        console.error('LANGCHAIN_TAG is not set')
        return
    }

    const nameArg = process.argv.find((arg) => arg.startsWith('--name='))
    const promptName = nameArg ? nameArg.split('=')[1] : undefined

    const prompts = await extractPrompts({
        langchainApiKey,
        langchainTag,
        promptName,
    })
    await generateTypes(prompts, outputPath)
    console.log(`✅ Types generated at ${outputPath}`)
}

main()
