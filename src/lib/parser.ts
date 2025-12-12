import { ChatPromptTemplate } from '@langchain/core/prompts'
import * as hub from 'langchain/hub'

import { Client } from 'langsmith'

export async function extractPrompts({
    langchainApiKey,
    langchainTag,
    promptName,
}: {
    langchainApiKey: string
    langchainTag: string
    promptName?: string
}): Promise<ChatPromptTemplate[]> {
    const client = new Client({ apiKey: langchainApiKey })

    const prompts = await client.listPrompts({
        isPublic: false,
        isArchived: false,
        sortField: 'updated_at',
    })
    const result: ChatPromptTemplate[] = []

    for await (const prompt of prompts) {
        if (promptName && !prompt.repo_handle.includes(promptName)) {
            continue
        }
        console.debug(`Generating prompt ${prompt.repo_handle}`)
        try {
            const chatPromptTemplate = await hub.pull<ChatPromptTemplate>(`${prompt.repo_handle}:${langchainTag}`)
            result.push(chatPromptTemplate)
        } catch (error) {
            console.error(error)
        }
    }

    return result
}
