# @beparallel/langchain-ts

A CLI tool that pulls prompts from [LangSmith Hub](https://smith.langchain.com/) and generates TypeScript types and optional JSON exports for offline use.

## Features

- **Type generation** -- produces TypeScript interfaces, enums, and Zod schemas from prompt input/output schemas
- **Prompt export** -- serializes full prompt content to JSON files so you can load them offline without calling `pull()` at runtime
- **Filtering** -- narrow results to a specific prompt by name, or override the Hub tag
- **Composable flags** -- use `--file` and `--export-dir` independently or together in a single run

## Installation

Install the package:

```bash
pnpm i @beparallel/langchain-ts
```

## Configuration

Add the following environment variables (e.g. in a `.env` file):

| Variable           | Required | Description                                   |
| ------------------ | -------- | --------------------------------------------- |
| `LANGCHAIN_API_KEY`| Yes      | Your LangSmith API key                        |
| `LANGCHAIN_TAG`    | Yes      | The Hub tag to pull (e.g. `latest`, `staging`) |

```bash
LANGCHAIN_API_KEY=your_api_key
LANGCHAIN_TAG=your_tag
```

## Usage

At least one of `--file` or `--export-dir` is required.

### CLI flags

| Flag              | Description                                          |
| ----------------- | ---------------------------------------------------- |
| `--file=PATH`     | Output path for the generated TypeScript types file   |
| `--export-dir=DIR`| Directory to write per-prompt JSON files              |
| `--name=NAME`     | Filter prompts by name (partial match)                |
| `--tag=TAG`       | Override the `LANGCHAIN_TAG` environment variable      |

### Examples

```bash
# Generate types only
npx langchain-types --file=./prompt.types.ts

# Export prompts as JSON only
npx langchain-types --export-dir=./prompts/

# Both at once
npx langchain-types --file=./prompt.types.ts --export-dir=./prompts/

# Filter to a single prompt
npx langchain-types --file=./prompt.types.ts --name=my-prompt
```

### package.json scripts

A typical setup using [dotenv-cli](https://www.npmjs.com/package/dotenv-cli) to load env vars:

```json
{
  "scripts": {
    "prompt:generate": "dotenv -f .env run -- npx langchain-types --file=./types/prompts.ts",
    "prompt:export": "dotenv -f .env run -- npx langchain-types --export-dir=./prompts/",
    "prompt:all": "dotenv -f .env run -- npx langchain-types --file=./types/prompts.ts --export-dir=./prompts/"
  }
}
```

### How prompt export works

The `--export-dir` flag calls LangChain's `toJSON()` on each `ChatPromptTemplate` and writes the result to `<dir>/<tag>/<prompt-name>.json`, organized by tag. For example, with `--export-dir=./prompts/ --tag=staging`:

```
prompts/
  staging/
    my-prompt.json
    another-prompt.json
```

These files contain the full serialized representation (message templates, input variables, output schema) and can be loaded with LangChain's `load()` deserialization -- no network call to the Hub required.

## Programmatic API

The package also exports functions for use in your own scripts:

```typescript
import { extractPrompts, generateTypes, exportPrompts } from '@beparallel/langchain-ts'

const prompts = await extractPrompts({
  langchainApiKey: process.env.LANGCHAIN_API_KEY!,
  langchainTag: 'latest',
})

generateTypes(prompts, './prompt.types.ts')
exportPrompts(prompts, './prompts/', 'latest')
```

## Contributing

### Setup

```bash
pnpm i
```

### Environment

```bash
export LANGCHAIN_API_KEY=your_api_key
export LANGCHAIN_TAG=your_tag
```

### Running locally

```bash
pnpm prompt:generate
```

### Tests

```bash
pnpm test
```

### Release

Publishing is automated via GitHub Actions. When a `v*` tag is pushed, the workflow runs tests, builds, publishes to npm, and creates a GitHub release with auto-generated notes.

```bash
# Bump version (patch, minor, or major) -- this updates package.json and creates a git tag
npm version patch   # 1.1.0 -> 1.1.1
npm version minor   # 1.1.0 -> 1.2.0
npm version major   # 1.1.0 -> 2.0.0

# Push the commit and tag to trigger the publish workflow
git push --follow-tags
```

Prerequisites: the repo needs `NPM_TOKEN` configured in GitHub Secrets (Settings > Secrets and variables > Actions).

## Changelog

### 1.1.0

- Add `--export-dir` CLI flag to serialize prompts as JSON files for offline use
- Make `--file` optional (at least one of `--file` or `--export-dir` is now required)
- Add `exportPrompts()` to the programmatic API
- Clean up dead code in CLI entry point

### 1.0.0

- Upgrade to LangChain v1 (`@langchain/core` ^1.x, `langchain` ^1.x)

### 0.3.0

- Upgrade dependencies to latest versions
- Refactor parser module to use named import for `pull` from `langchain/hub`

### 0.2.8

- Add `--name` flag for filtering prompts by name (partial match)
- Add `--tag` flag for overriding `LANGCHAIN_TAG` from the command line

### 0.2.0

- Add ESLint, Jest, and Prettier configuration
- Introduce utility functions for case conversion
- Add unit tests for parser and type generator modules

### 0.1.0

- Initial release
- CLI for extracting LangSmith Hub prompts and generating TypeScript types
- Enum, interface, and Zod schema generation from prompt JSON schemas

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
