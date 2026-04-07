import { ChatPromptTemplate } from '@langchain/core/prompts'
import fs from 'fs'
import path from 'path'
import { exportPrompts } from './prompt-exporter.js'

jest.mock('fs')
const mockedFs = fs as jest.Mocked<typeof fs>

describe('Prompt Exporter', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockedFs.existsSync.mockReturnValue(false)
    })

    test('creates tag subdirectory if it does not exist', () => {
        exportPrompts([], '/test/prompts', 'latest')

        expect(mockedFs.mkdirSync).toHaveBeenCalledWith(
            path.join('/test/prompts', 'latest'),
            { recursive: true },
        )
    })

    test('skips mkdir if tag directory already exists', () => {
        mockedFs.existsSync.mockReturnValue(true)

        exportPrompts([], '/test/prompts', 'latest')

        expect(mockedFs.mkdirSync).not.toHaveBeenCalled()
    })

    test('writes each prompt as a JSON file under the tag directory', () => {
        const jsonData = { id: ['langchain', 'prompts', 'ChatPromptTemplate'], kwargs: { messages: [] } }
        const mockPrompt = {
            metadata: { lc_hub_repo: 'my-prompt' },
            toJSON: () => jsonData,
        } as unknown as ChatPromptTemplate

        exportPrompts([mockPrompt], '/out', 'staging')

        expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
            path.join('/out', 'staging', 'my-prompt.json'),
            JSON.stringify(jsonData, null, 2),
            'utf-8',
        )
    })

    test('skips prompts with no lc_hub_repo metadata', () => {
        const warnSpy = jest.spyOn(console, 'warn').mockImplementation()

        const mockPrompt = {
            metadata: {},
            toJSON: () => ({}),
        } as unknown as ChatPromptTemplate

        exportPrompts([mockPrompt], '/out', 'latest')

        expect(mockedFs.writeFileSync).not.toHaveBeenCalled()
        expect(warnSpy).toHaveBeenCalledWith('Skipping prompt with no lc_hub_repo metadata')

        warnSpy.mockRestore()
    })

    test('handles empty prompts array', () => {
        const logSpy = jest.spyOn(console, 'log').mockImplementation()

        exportPrompts([], '/out', 'latest')

        expect(mockedFs.writeFileSync).not.toHaveBeenCalled()
        expect(logSpy).toHaveBeenCalledWith(`✅ Exported 0 prompt(s) to ${path.join('/out', 'latest')}`)

        logSpy.mockRestore()
    })

    test('handles multiple prompts', () => {
        const mockPrompt1 = {
            metadata: { lc_hub_repo: 'first-prompt' },
            toJSON: () => ({ id: 'first' }),
        } as unknown as ChatPromptTemplate

        const mockPrompt2 = {
            metadata: { lc_hub_repo: 'second-prompt' },
            toJSON: () => ({ id: 'second' }),
        } as unknown as ChatPromptTemplate

        exportPrompts([mockPrompt1, mockPrompt2], '/out', 'latest')

        expect(mockedFs.writeFileSync).toHaveBeenCalledTimes(2)
        expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
            path.join('/out', 'latest', 'first-prompt.json'),
            JSON.stringify({ id: 'first' }, null, 2),
            'utf-8',
        )
        expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
            path.join('/out', 'latest', 'second-prompt.json'),
            JSON.stringify({ id: 'second' }, null, 2),
            'utf-8',
        )
    })

    test('sanitizes prompt names containing slashes', () => {
        const mockPrompt = {
            metadata: { lc_hub_repo: 'org/my-prompt' },
            toJSON: () => ({ id: 'test' }),
        } as unknown as ChatPromptTemplate

        exportPrompts([mockPrompt], '/out', 'latest')

        expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
            path.join('/out', 'latest', 'org-my-prompt.json'),
            JSON.stringify({ id: 'test' }, null, 2),
            'utf-8',
        )
    })
})
