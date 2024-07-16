#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

import config from './config.js';
import frontMatter from './utils/front-matter.js';
import json from './utils/json.js';
import promptKeyworkDescription from './prompts/azion-seo-meta-keywords-description.js';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function openapiSuggestion({ model, messages, response_format }) {
  const completion = await client.chat.completions.create({ model, messages, response_format });
  return completion.choices[0];
};

async function processDirectory(directory) {
  fs.readdir(directory, { withFileTypes: true }, async (err, entries) => {
    if (err) {
      console.error('Error reading directory:', err);
      return;
    }

    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        await processDirectory(fullPath);
      } else if (entry.isFile() && (entry.name.endsWith('.md') || entry.name.endsWith('.mdx'))) {
        const { params, mainContent } = await frontMatter.extractData(fullPath);

        console.log('\n[fullPath]: ', fullPath)
        console.log(`[request]: meta_tags: ${params.meta_tags}`);
        console.log(`[request]: meta_description: ${params.description}`);

        const messages = promptKeyworkDescription(params, mainContent);
        const suggestion = await openapiSuggestion({
          messages: messages,
          model: "gpt-4-turbo",
          response_format: {
            type: "json_object"
          }
        });

        let data = {};
        data.filePath = fullPath;
        // data.url = `https://www.azion.com/[lang]//${params.permalink}`;

        data.suggest = JSON.parse(suggestion.message.content) || {};
        data.suggest.meta_description_length = data.suggest.meta_description?.length;

        data.current = {};
        data.current.meta_description = params.description;
        data.current.meta_keywords = params.meta_tags;

        console.log(`\n[response]: ${JSON.stringify(data.suggest)}`);

        if (!fs.existsSync(config.output)) {
          fs.mkdirSync(config.output, { recursive: true });
        }

        await json.toFile(data, `${config.output}/${entry.name}.json`);
      }
    }
  });
}

async function processFiles() {
  await processDirectory(config.input);
};

await processFiles();
