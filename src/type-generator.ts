import { ChatPromptTemplate } from '@langchain/core/prompts';
import fs from 'fs';
import { toCamelCase, toPascalCase, toUpperCase } from './case.js';

export function generateTypes(
  prompts: ChatPromptTemplate[],
  outputPath: string,
) {
  const lines: string[] = [
    '// Auto-generated file by @beparallel/langchain-ts. Do not edit.\n',
    '// For more information, visit https://github.com/buildKiosk/langchain-ts\n\n',
    'import { z } from "zod";\n\n',
  ];

  lines.push('export enum PromptName {');

  for (const prompt of prompts) {
    const promptName = getPromptName(prompt);
    lines.push(`  ${toUpperCase(promptName)} = "${promptName}",`);
  }

  lines.push('}\n\n');

  for (const prompt of prompts) {
    const inputSchema = prompt.inputVariables;
    const promptName = getPromptName(prompt);
    const promptDict = prompt.toJSON();
    // @ts-ignore
    const schema = promptDict.kwargs.schema_;

    lines.push('\n');

    lines.push(`/***********************************************/`);
    lines.push(`// Prompt: ${promptName}`);
    lines.push(`/***********************************************/`);
    lines.push('\n');

    // Input variables
    lines.push(
      `export interface ${toPascalCase(promptName)}Variable {`,
      `  ${inputSchema.map((input) => `${input}: any`).join('\n  ')}`,
      '}',
    );

    lines.push('\n');

    // Output variables
    lines.push(jsonSchemaToType(schema, promptName));

    lines.push('\n');

    // Zod schema
    lines.push(jsonSchemaToZodType(schema, promptName));
  }

  fs.writeFileSync(outputPath, lines.join('\n'), 'utf-8');
}

const getPromptName = (prompt: ChatPromptTemplate) => {
  const promptName = String(prompt.metadata?.lc_hub_repo ?? '');
  return promptName;
};

type PromptOutputSchema = {
  title?: string;
  description?: string;
  type: string;
  properties?: Record<string, any>;
  required?: string[];
  items?: any;
  strict?: boolean;
  additionalProperties?: boolean;
};

function jsonSchemaToType(
  schema: PromptOutputSchema,
  promptName: string,
  rootName = 'Root',
): string {
  const parseSchema = (
    schema: PromptOutputSchema,
    name: string,
    increment: number,
  ): string => {
    if (schema.type === 'object' && schema.properties) {
      const required = schema.required || [];
      const props = Object.entries(schema.properties)
        .map(([key, value]: [string, any]) => {
          const optional = required.includes(key) ? '' : '?';
          return `${' '.repeat(increment + 1)}${key}${optional}: ${parseSchema(
            value,
            key,
            increment + 1,
          )}`;
        })
        .join('\n');
      return `{\n${' '.repeat(increment)}${props}${' '.repeat(increment)}\n}`;
    } else if (schema.type === 'array' && schema.items) {
      return `${parseSchema(schema.items, name, increment + 1)}[]`;
    } else if (schema.type === 'string') {
      return 'string';
    } else if (schema.type === 'number') {
      return 'number';
    } else if (schema.type === 'boolean') {
      return 'boolean';
    } else if (schema.type === 'null') {
      return 'null';
    } else {
      return 'any';
    }
  };

  if (!schema) {
    return '';
  }

  const typeDef = `${parseSchema(schema, rootName, 1)}`;

  return [
    `export interface ${toPascalCase(promptName)}Output`,
    `  ${typeDef}`,
    '',
    '',
    `export interface ${toPascalCase(promptName)}OutputWrapper {`,
    `  ${schema.title || rootName}: ${toPascalCase(promptName)}Output`,
    '}',
  ].join('\n');
}

function jsonSchemaToZodType(
  schema: PromptOutputSchema,
  promptName: string,
  rootName = 'Root',
): string {
  const parseSchema = (
    schema: PromptOutputSchema,
    name: string,
    increment: number,
  ): string => {
    if (schema.type === 'object' && schema.properties) {
      const required = schema.required || [];
      const props = Object.entries(schema.properties)
        .map(([key, value]: [string, any]) => {
          const zodType = parseSchema(value, key, increment + 1);
          let prop = `${' '.repeat(increment + 1)}${key}: z.${zodType}`;
          if (value.description) {
            prop += `.describe(\`${value.description}\`)`;
          }
          if (!required.includes(key)) {
            prop += '.optional()';
          }
          return prop;
        })
        .join(',\n');
      return `object({\n${props}\n${' '.repeat(increment)}})`;
    } else if (schema.type === 'array' && schema.items) {
      return `array(z.${parseSchema(schema.items, name, increment + 1)})`;
    } else if (schema.type === 'string') {
      return 'string()';
    } else if (schema.type === 'number') {
      return 'number()';
    } else if (schema.type === 'boolean') {
      return 'boolean()';
    } else if (schema.type === 'null') {
      return 'null()';
    } else {
      return 'any()';
    }
  };

  if (!schema) {
    return '';
  }

  const zodSchema = `z.${parseSchema(schema, rootName, 1)}`;
  return [
    `export const ${toCamelCase(promptName)}OutputSchema = ${zodSchema}`,
    '',
    `export const ${toPascalCase(promptName)}OutputWrapperSchema  = z.object({`,
    `  ${schema.title || rootName}: ${toCamelCase(promptName)}OutputSchema`,
    '})',
  ].join('\n');
}
