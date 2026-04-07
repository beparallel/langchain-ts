#! /usr/bin/env node

import { extractPrompts } from './lib/parser.js'
import { exportPrompts } from './lib/prompt-exporter.js'
import { generateTypes } from './lib/type-generator.js'

async function main() {
    const fileArg = process.argv.find((arg) => arg.startsWith('--file='))
    const exportDirArg = process.argv.find((arg) => arg.startsWith('--export-dir='))

    if (!fileArg && !exportDirArg) {
        console.error('Please provide --file= and/or --export-dir=')
        return
    }

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

    if (fileArg) {
        const filePath = fileArg.split('=')[1]
        await generateTypes(prompts, filePath)
        console.log(`✅ Types generated at ${filePath}`)
    }

    if (exportDirArg) {
        const exportDir = exportDirArg.split('=')[1]
        exportPrompts(prompts, exportDir)
    }
}

main()
