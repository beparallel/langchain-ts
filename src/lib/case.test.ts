import { toCamelCase, toPascalCase, toUpperCase } from './case.js'

describe('Case Conversion Functions', () => {
    describe('toCamelCase', () => {
        test('converts space-separated words to camelCase', () => {
            expect(toCamelCase('hello world')).toBe('helloWorld')
            expect(toCamelCase('foo bar baz')).toBe('fooBarBaz')
        })

        test('converts hyphen-separated words to camelCase', () => {
            expect(toCamelCase('hello-world')).toBe('helloWorld')
            expect(toCamelCase('foo-bar-baz')).toBe('fooBarBaz')
        })

        test('converts underscore-separated words to camelCase', () => {
            expect(toCamelCase('hello_world')).toBe('helloWorld')
            expect(toCamelCase('foo_bar_baz')).toBe('fooBarBaz')
        })

        test('converts mixed separators to camelCase', () => {
            expect(toCamelCase('hello-world_test case')).toBe('helloWorldTestCase')
        })

        test('handles single words', () => {
            expect(toCamelCase('hello')).toBe('hello')
            expect(toCamelCase('HELLO')).toBe('hello')
        })

        test('handles empty and whitespace strings', () => {
            expect(toCamelCase('')).toBe('')
            expect(toCamelCase('   ')).toBe('')
        })

        test('trims leading and trailing whitespace', () => {
            expect(toCamelCase('  hello world  ')).toBe('helloWorld')
        })
    })

    describe('toPascalCase', () => {
        test('converts space-separated words to PascalCase', () => {
            expect(toPascalCase('hello world')).toBe('HelloWorld')
            expect(toPascalCase('foo bar baz')).toBe('FooBarBaz')
        })

        test('converts hyphen-separated words to PascalCase', () => {
            expect(toPascalCase('hello-world')).toBe('HelloWorld')
            expect(toPascalCase('foo-bar-baz')).toBe('FooBarBaz')
        })

        test('converts underscore-separated words to PascalCase', () => {
            expect(toPascalCase('hello_world')).toBe('HelloWorld')
            expect(toPascalCase('foo_bar_baz')).toBe('FooBarBaz')
        })

        test('converts mixed separators to PascalCase', () => {
            expect(toPascalCase('hello-world_test case')).toBe('HelloWorldTestCase')
        })

        test('handles single words', () => {
            expect(toPascalCase('hello')).toBe('Hello')
            expect(toPascalCase('HELLO')).toBe('Hello')
        })

        test('handles empty and whitespace strings', () => {
            expect(toPascalCase('')).toBe('')
            expect(toPascalCase('   ')).toBe('')
        })

        test('trims leading and trailing whitespace', () => {
            expect(toPascalCase('  hello world  ')).toBe('HelloWorld')
        })
    })

    describe('toUpperCase', () => {
        test('converts space-separated words to UPPER_CASE', () => {
            expect(toUpperCase('hello world')).toBe('HELLO_WORLD')
            expect(toUpperCase('foo bar baz')).toBe('FOO_BAR_BAZ')
        })

        test('converts hyphen-separated words to UPPER_CASE', () => {
            expect(toUpperCase('hello-world')).toBe('HELLO_WORLD')
            expect(toUpperCase('foo-bar-baz')).toBe('FOO_BAR_BAZ')
        })

        test('converts underscore-separated words to UPPER_CASE', () => {
            expect(toUpperCase('hello_world')).toBe('HELLO_WORLD')
            expect(toUpperCase('foo_bar_baz')).toBe('FOO_BAR_BAZ')
        })

        test('converts mixed separators to UPPER_CASE', () => {
            expect(toUpperCase('hello-world_test case')).toBe('HELLO_WORLD_TEST_CASE')
        })

        test('handles single words', () => {
            expect(toUpperCase('hello')).toBe('HELLO')
            expect(toUpperCase('HELLO')).toBe('HELLO')
        })

        test('handles empty and whitespace strings', () => {
            expect(toUpperCase('')).toBe('')
            expect(toUpperCase('   ')).toBe('')
        })

        test('trims leading and trailing whitespace', () => {
            expect(toUpperCase('  hello world  ')).toBe('HELLO_WORLD')
        })
    })
})
