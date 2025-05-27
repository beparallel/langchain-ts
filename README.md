# @beparallel/langchain-ts

A TypeScript tool for extracting Langchain prompts and generating corresponding TypeScript types.

# Features

- Extracts prompts from Langchain Hub
- Generates TypeScript interfaces for prompt inputs and outputs
- Automatically handles JSON schema conversion
- Command-line interface for easy integration

# Installation

1. Install the package

```bash
pnpm i @beparallel/langchain-ts
```

2. Set the environment variables in your `.env` file

```bash
LANGCHAIN_API_KEY=your_api_key
LANGCHAIN_TAG=your_tag
```

3. Set up the script in your `package.json` file

```bash
"scripts": {
  ...
  "prompt:generate": "dotenv -f .env.* run -- npx langchain-types --file=X"
}
```

Where X = the path to the file where you want to save the types.

4. Run the script

```bash
pnpm prompt:generate
```

# Contributing

## Installation

```bash
pnpm i
```

## Usage

1. Add the environment variables in your `.env` file

```bash
LANGCHAIN_API_KEY=your_api_key
LANGCHAIN_TAG=your_tag
```

2. Export them

```bash
export LANGCHAIN_API_KEY=your_api_key
export LANGCHAIN_TAG=your_tag
```

3. Run the script

```bash
pnpm prompt:generate
```

### Release

1. Update the version in the `package.json` file.
2. Run the following command to update the types.

```bash
pnpm prepublish
```

3. Run npm publish command

```bash
npm publish --access public
```

4. Commit and push the changes.
5. Create a new release on GitHub.

# License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
