import { ChatPromptTemplate } from '@langchain/core/prompts'
import fs from 'fs'
import path from 'path'

export function exportPrompts(prompts: ChatPromptTemplate[], outputDir: string) {
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true })
    }

    let exported = 0

    for (const prompt of prompts) {
        const promptName = String(prompt.metadata?.lc_hub_repo ?? '').replace(/\//g, '-')
        if (!promptName) {
            console.warn('Skipping prompt with no lc_hub_repo metadata')
            continue
        }

        const data = prompt.toJSON()
        const filePath = path.join(outputDir, `${promptName}.json`)
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
        exported++
    }

    console.log(`✅ Exported ${exported} prompt(s) to ${outputDir}`)
}
