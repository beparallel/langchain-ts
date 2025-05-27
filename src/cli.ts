#! /usr/bin/env node

import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { extractPrompts } from './parser.js';
import { generateTypes } from './type-generator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  const file = process.argv.find((arg) => arg.startsWith('--file='));
  if (!file) {
    console.error('File not provided, please provide a file with --file=');
    return;
  }
  const filePath = file.split('=')[1];
  const arrayPath = __dirname.split('/');
  const firstNodeModulesIndex = arrayPath.findIndex(
    (path) => path === 'node_modules',
  );
  let outputPath = path.resolve(
    ...arrayPath.slice(0, firstNodeModulesIndex + 1),
    filePath,
  );

  outputPath = filePath;

  const langchainApiKey = process.env.LANGCHAIN_API_KEY;
  if (!langchainApiKey) {
    console.error('LANGCHAIN_API_KEY is not set');
    return;
  }

  const langchainTag = process.env.LANGCHAIN_TAG;
  if (!langchainTag) {
    console.error('LANGCHAIN_TAG is not set');
    return;
  }

  const prompts = await extractPrompts({
    langchainApiKey,
    langchainTag,
  });
  await generateTypes(prompts, outputPath);
  console.log(`✅ Types generated at ${outputPath}`);
}

main();
