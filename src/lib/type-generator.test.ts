import { ChatPromptTemplate } from '@langchain/core/prompts'
import fs from 'fs'
import { generateTypes } from './type-generator.js'

// Mock fs module
jest.mock('fs')
const mockedFs = fs as jest.Mocked<typeof fs>

describe('Type Generator', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('generateTypes', () => {
        test('generates types for a simple prompt with basic schema', () => {
            const mockPrompt = {
                inputVariables: ['name', 'age'],
                metadata: { lc_hub_repo: 'simple-prompt' },
                toJSON: () => ({
                    kwargs: {
                        schema_: {
                            title: 'SimpleOutput',
                            type: 'object',
                            properties: {
                                greeting: { type: 'string', description: 'A greeting message' },
                                isValid: { type: 'boolean' },
                            },
                            required: ['greeting'],
                        },
                    },
                }),
            } as unknown as ChatPromptTemplate

            const outputPath = '/test/output.ts'
            generateTypes([mockPrompt], outputPath)

            expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
                outputPath,
                expect.stringContaining('export enum PromptName {'),
                'utf-8',
            )

            const generatedContent = mockedFs.writeFileSync.mock.calls[0][1] as string

            // Check enum generation
            expect(generatedContent).toContain('SIMPLE_PROMPT = "simple-prompt"')

            // Check interface generation
            expect(generatedContent).toContain('export interface SimplePromptVariable {')
            expect(generatedContent).toContain('name: any')
            expect(generatedContent).toContain('age: any')

            // Check output interface
            expect(generatedContent).toContain('export interface SimplePromptOutput')
            expect(generatedContent).toContain('greeting: string')
            expect(generatedContent).toContain('isValid?: boolean')

            // Check wrapper interface
            expect(generatedContent).toContain('export interface SimplePromptOutputWrapper {')
            expect(generatedContent).toContain('SimpleOutput: SimplePromptOutput')

            // Check Zod schema
            expect(generatedContent).toContain('export const simplePromptOutputSchema = z.object({')
            expect(generatedContent).toContain('greeting: z.string().describe(`A greeting message`)')
            expect(generatedContent).toContain('isValid: z.boolean().optional()')
        })

        test('generates types for prompt with array schema', () => {
            const mockPrompt = {
                inputVariables: ['items'],
                metadata: { lc_hub_repo: 'array-prompt' },
                toJSON: () => ({
                    kwargs: {
                        schema_: {
                            title: 'ArrayOutput',
                            type: 'object',
                            properties: {
                                items: {
                                    type: 'array',
                                    items: { type: 'string' },
                                },
                                numbers: {
                                    type: 'array',
                                    items: { type: 'number' },
                                },
                            },
                            required: ['items'],
                        },
                    },
                }),
            } as unknown as ChatPromptTemplate

            generateTypes([mockPrompt], '/test/array-output.ts')

            const generatedContent = mockedFs.writeFileSync.mock.calls[0][1] as string

            expect(generatedContent).toContain('items: string[]')
            expect(generatedContent).toContain('numbers?: number[]')
            expect(generatedContent).toContain('items: z.array(z.string())')
            expect(generatedContent).toContain('numbers: z.array(z.number()).optional()')
        })

        test('generates types for prompt with nested object schema', () => {
            const mockPrompt = {
                inputVariables: ['data'],
                metadata: { lc_hub_repo: 'nested-prompt' },
                toJSON: () => ({
                    kwargs: {
                        schema_: {
                            title: 'NestedOutput',
                            type: 'object',
                            properties: {
                                user: {
                                    type: 'object',
                                    properties: {
                                        name: { type: 'string' },
                                        details: {
                                            type: 'object',
                                            properties: {
                                                age: { type: 'number' },
                                                active: { type: 'boolean' },
                                            },
                                            required: ['age'],
                                        },
                                    },
                                    required: ['name', 'details'],
                                },
                            },
                            required: ['user'],
                        },
                    },
                }),
            } as unknown as ChatPromptTemplate

            generateTypes([mockPrompt], '/test/nested-output.ts')

            const generatedContent = mockedFs.writeFileSync.mock.calls[0][1] as string

            expect(generatedContent).toContain('user: {')
            expect(generatedContent).toContain('name: string')
            expect(generatedContent).toContain('details: {')
            expect(generatedContent).toContain('age: number')
            expect(generatedContent).toContain('active?: boolean')
        })

        test('generates types for multiple prompts', () => {
            const mockPrompt1 = {
                inputVariables: ['input1'],
                metadata: { lc_hub_repo: 'first-prompt' },
                toJSON: () => ({
                    kwargs: {
                        schema_: {
                            title: 'FirstOutput',
                            type: 'object',
                            properties: {
                                result: { type: 'string' },
                            },
                            required: ['result'],
                        },
                    },
                }),
            } as unknown as ChatPromptTemplate

            const mockPrompt2 = {
                inputVariables: ['input2'],
                metadata: { lc_hub_repo: 'second-prompt' },
                toJSON: () => ({
                    kwargs: {
                        schema_: {
                            title: 'SecondOutput',
                            type: 'object',
                            properties: {
                                count: { type: 'number' },
                            },
                            required: ['count'],
                        },
                    },
                }),
            } as unknown as ChatPromptTemplate

            generateTypes([mockPrompt1, mockPrompt2], '/test/multiple-output.ts')

            const generatedContent = mockedFs.writeFileSync.mock.calls[0][1] as string

            // Check both prompts are included in enum
            expect(generatedContent).toContain('FIRST_PROMPT = "first-prompt"')
            expect(generatedContent).toContain('SECOND_PROMPT = "second-prompt"')

            // Check both interfaces are generated
            expect(generatedContent).toContain('export interface FirstPromptVariable')
            expect(generatedContent).toContain('export interface SecondPromptVariable')
            expect(generatedContent).toContain('export interface FirstPromptOutput')
            expect(generatedContent).toContain('export interface SecondPromptOutput')
        })

        test('handles prompt with no schema gracefully', () => {
            const mockPrompt = {
                inputVariables: ['input'],
                metadata: { lc_hub_repo: 'no-schema-prompt' },
                toJSON: () => ({
                    kwargs: {
                        schema_: null,
                    },
                }),
            } as unknown as ChatPromptTemplate

            generateTypes([mockPrompt], '/test/no-schema-output.ts')

            const generatedContent = mockedFs.writeFileSync.mock.calls[0][1] as string

            expect(generatedContent).toContain('NO_SCHEMA_PROMPT = "no-schema-prompt"')
            expect(generatedContent).toContain('export interface NoSchemaPromptVariable')
        })

        test('handles prompt with undefined schema gracefully', () => {
            const mockPrompt = {
                inputVariables: ['input'],
                metadata: { lc_hub_repo: 'undefined-schema-prompt' },
                toJSON: () => ({
                    kwargs: {
                        schema_: undefined,
                    },
                }),
            } as unknown as ChatPromptTemplate

            generateTypes([mockPrompt], '/test/undefined-schema-output.ts')

            const generatedContent = mockedFs.writeFileSync.mock.calls[0][1] as string

            expect(generatedContent).toContain('UNDEFINED_SCHEMA_PROMPT = "undefined-schema-prompt"')
            expect(generatedContent).toContain('export interface UndefinedSchemaPromptVariable')
        })

        test('handles all supported data types', () => {
            const mockPrompt = {
                inputVariables: ['data'],
                metadata: { lc_hub_repo: 'all-types-prompt' },
                toJSON: () => ({
                    kwargs: {
                        schema_: {
                            title: 'AllTypesOutput',
                            type: 'object',
                            properties: {
                                stringField: { type: 'string' },
                                numberField: { type: 'number' },
                                booleanField: { type: 'boolean' },
                                nullField: { type: 'null' },
                                unknownField: { type: 'unknown' },
                            },
                            required: ['stringField', 'numberField'],
                        },
                    },
                }),
            } as unknown as ChatPromptTemplate

            generateTypes([mockPrompt], '/test/all-types-output.ts')

            const generatedContent = mockedFs.writeFileSync.mock.calls[0][1] as string

            expect(generatedContent).toContain('stringField: string')
            expect(generatedContent).toContain('numberField: number')
            expect(generatedContent).toContain('booleanField?: boolean')
            expect(generatedContent).toContain('nullField?: null')
            expect(generatedContent).toContain('unknownField?: any')

            // Check Zod types
            expect(generatedContent).toContain('stringField: z.string()')
            expect(generatedContent).toContain('numberField: z.number()')
            expect(generatedContent).toContain('booleanField: z.boolean().optional()')
            expect(generatedContent).toContain('nullField: z.null().optional()')
            expect(generatedContent).toContain('unknownField: z.any().optional()')
        })

        test('includes file header and imports', () => {
            const mockPrompt = {
                inputVariables: ['test'],
                metadata: { lc_hub_repo: 'test-prompt' },
                toJSON: () => ({
                    kwargs: {
                        schema_: {
                            title: 'TestOutput',
                            type: 'object',
                            properties: {
                                value: { type: 'string' },
                            },
                        },
                    },
                }),
            } as unknown as ChatPromptTemplate

            generateTypes([mockPrompt], '/test/header-test.ts')

            const generatedContent = mockedFs.writeFileSync.mock.calls[0][1] as string

            expect(generatedContent).toContain('// Auto-generated file by @beparallel/langchain-ts. Do not edit.')
            expect(generatedContent).toContain(
                '// For more information, visit https://github.com/beparallel/langchain-ts',
            )
            expect(generatedContent).toContain('import { z } from "zod";')
        })

        test('handles empty prompts array', () => {
            generateTypes([], '/test/empty-output.ts')

            const generatedContent = mockedFs.writeFileSync.mock.calls[0][1] as string

            expect(generatedContent).toContain('export enum PromptName {')
            expect(generatedContent).toContain('// Auto-generated file by @beparallel/langchain-ts. Do not edit.')
            expect(generatedContent).toContain('import { z } from "zod";')
            // Should not contain any specific prompt interfaces
            expect(generatedContent).not.toContain('export interface')
        })

        test('handles prompt with empty input variables', () => {
            const mockPrompt = {
                inputVariables: [],
                metadata: { lc_hub_repo: 'empty-vars-prompt' },
                toJSON: () => ({
                    kwargs: {
                        schema_: {
                            title: 'EmptyVarsOutput',
                            type: 'object',
                            properties: {
                                result: { type: 'string' },
                            },
                        },
                    },
                }),
            } as unknown as ChatPromptTemplate

            generateTypes([mockPrompt], '/test/empty-vars-output.ts')

            const generatedContent = mockedFs.writeFileSync.mock.calls[0][1] as string

            expect(generatedContent).toContain('export interface EmptyVarsPromptVariable {')
            // Should have empty interface body
            expect(generatedContent).toMatch(/export interface EmptyVarsPromptVariable \{\s*\}/)
        })
    })
})
