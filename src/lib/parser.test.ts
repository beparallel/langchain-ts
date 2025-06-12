import { ChatPromptTemplate } from '@langchain/core/prompts'
import * as hub from 'langchain/hub'
import { Client } from 'langsmith'
import { extractPrompts } from './parser.js'

// Mock the external dependencies
jest.mock('langchain/hub')
jest.mock('langsmith')

const mockHub = jest.mocked(hub)
const MockClient = jest.mocked(Client)

describe('Parser Module', () => {
    describe('extractPrompts', () => {
        const mockApiKey = 'test-api-key'
        const mockTag = 'test-tag'

        let mockClientInstance: {
            listPrompts: jest.MockedFunction<any>
        }

        beforeEach(() => {
            jest.clearAllMocks()

            // Create mock client instance
            mockClientInstance = {
                listPrompts: jest.fn(),
            }

            // Mock the Client constructor
            MockClient.mockImplementation(() => mockClientInstance as any)

            // Mock console methods
            jest.spyOn(console, 'debug').mockImplementation(() => {})
            jest.spyOn(console, 'error').mockImplementation(() => {})
        })

        afterEach(() => {
            jest.restoreAllMocks()
        })

        test('should extract prompts successfully', async () => {
            // Arrange
            const mockPrompts = [{ repo_handle: 'prompt1' }, { repo_handle: 'prompt2' }]

            const mockTemplate1 = {} as ChatPromptTemplate
            const mockTemplate2 = {} as ChatPromptTemplate

            mockClientInstance.listPrompts.mockResolvedValue(mockPrompts)
            mockHub.pull.mockResolvedValueOnce(mockTemplate1).mockResolvedValueOnce(mockTemplate2)

            // Act
            const result = await extractPrompts({
                langchainApiKey: mockApiKey,
                langchainTag: mockTag,
            })

            // Assert
            expect(MockClient).toHaveBeenCalledWith({ apiKey: mockApiKey })
            expect(mockClientInstance.listPrompts).toHaveBeenCalledWith({
                isPublic: false,
                isArchived: false,
                sortField: 'updated_at',
            })
            expect(mockHub.pull).toHaveBeenCalledTimes(2)
            expect(mockHub.pull).toHaveBeenNthCalledWith(1, 'prompt1:test-tag')
            expect(mockHub.pull).toHaveBeenNthCalledWith(2, 'prompt2:test-tag')
            expect(result).toEqual([mockTemplate1, mockTemplate2])
        })

        test('should handle empty prompts list', async () => {
            // Arrange
            mockClientInstance.listPrompts.mockResolvedValue([])

            // Act
            const result = await extractPrompts({
                langchainApiKey: mockApiKey,
                langchainTag: mockTag,
            })

            // Assert
            expect(result).toEqual([])
            expect(mockHub.pull).not.toHaveBeenCalled()
        })

        test('should handle hub.pull errors gracefully', async () => {
            // Arrange
            const mockPrompts = [{ repo_handle: 'prompt1' }, { repo_handle: 'prompt2' }, { repo_handle: 'prompt3' }]

            const mockTemplate1 = {} as ChatPromptTemplate
            const mockTemplate3 = {} as ChatPromptTemplate

            mockClientInstance.listPrompts.mockResolvedValue(mockPrompts)
            mockHub.pull
                .mockResolvedValueOnce(mockTemplate1)
                .mockRejectedValueOnce(new Error('Failed to pull prompt2'))
                .mockResolvedValueOnce(mockTemplate3)

            // Act
            const result = await extractPrompts({
                langchainApiKey: mockApiKey,
                langchainTag: mockTag,
            })

            // Assert
            expect(result).toEqual([mockTemplate1, mockTemplate3])
            expect(console.error).toHaveBeenCalledWith(new Error('Failed to pull prompt2'))
        })

        test('should handle Client.listPrompts error', async () => {
            // Arrange
            const error = new Error('API Error')
            mockClientInstance.listPrompts.mockRejectedValue(error)

            // Act & Assert
            await expect(
                extractPrompts({
                    langchainApiKey: mockApiKey,
                    langchainTag: mockTag,
                }),
            ).rejects.toThrow('API Error')
        })

        test('should use correct parameters for Client initialization', async () => {
            // Arrange
            mockClientInstance.listPrompts.mockResolvedValue([])

            // Act
            await extractPrompts({
                langchainApiKey: 'custom-key',
                langchainTag: mockTag,
            })

            // Assert
            expect(MockClient).toHaveBeenCalledWith({ apiKey: 'custom-key' })
        })

        test('should use correct tag in hub.pull calls', async () => {
            // Arrange
            const mockPrompts = [{ repo_handle: 'test-prompt' }]
            const mockTemplate = {} as ChatPromptTemplate

            mockClientInstance.listPrompts.mockResolvedValue(mockPrompts)
            mockHub.pull.mockResolvedValue(mockTemplate)

            // Act
            await extractPrompts({
                langchainApiKey: mockApiKey,
                langchainTag: 'custom-tag',
            })

            // Assert
            expect(mockHub.pull).toHaveBeenCalledWith('test-prompt:custom-tag')
        })

        test('should log debug messages for each prompt', async () => {
            // Arrange
            const mockPrompts = [{ repo_handle: 'prompt1' }, { repo_handle: 'prompt2' }]

            mockClientInstance.listPrompts.mockResolvedValue(mockPrompts)
            mockHub.pull.mockResolvedValue({} as ChatPromptTemplate)

            // Act
            await extractPrompts({
                langchainApiKey: mockApiKey,
                langchainTag: mockTag,
            })

            // Assert
            expect(console.debug).toHaveBeenCalledWith('Generating prompt prompt1')
            expect(console.debug).toHaveBeenCalledWith('Generating prompt prompt2')
        })

        test('should handle all prompts failing to pull', async () => {
            // Arrange
            const mockPrompts = [{ repo_handle: 'prompt1' }, { repo_handle: 'prompt2' }]

            mockClientInstance.listPrompts.mockResolvedValue(mockPrompts)
            mockHub.pull.mockRejectedValueOnce(new Error('Error 1')).mockRejectedValueOnce(new Error('Error 2'))

            // Act
            const result = await extractPrompts({
                langchainApiKey: mockApiKey,
                langchainTag: mockTag,
            })

            // Assert
            expect(result).toEqual([])
            expect(console.error).toHaveBeenCalledTimes(2)
        })
    })
})
