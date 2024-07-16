#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

import frontMatter from './utils/front-matter.js';
import json from './utils/json.js';
import promptKeyworkDescription from './prompts/azion-seo-meta-keywords-description.js';

const lang = 'pt-br';
const folderPath = `/Users/robson.junior/dev/docs/src/content/docs/${lang}/pages`;
const distPath = `./dist/docs/${lang}/round/01/pages/`;
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function openapiSuggestion({ model, messages }) {
  const completion = await client.chat.completions.create({ model, messages });
  return completion.choices[0];
};

function checkPathType(path) {
  fs.stat(path, (err, stats) => {
    if (err) {
      if (err.code === 'ENOENT') {
        console.error('Path does not exist:', path);
      } else {
        console.error('Error accessing path:', err);
      }

      return;
    }

    if (stats.isFile()) {
      console.log(path, 'is a file');
    } else if (stats.isDirectory()) {
      console.log(path, 'is a directory');
    } else {
      console.log(path, 'is neither a file nor a directory'); // e.g., symbolic link
    }
  });
}

function recursiveProcessFile(entries) {
  // console.log(entries);

  entries.map(entry => {
    let p = `${entry.path}/${entry.name}`;
    checkPathType(p);
  });
};

async function processFiles() {
  fs.readdir(folderPath, { withFileTypes: true }, async (err, entries) => {
    if (err) {
      console.error('Error reading directory:', err);
      return;
    }

    recursiveProcessFile(entries);

    let i = 0;
    for (const entry of entries) {
      if (
        entry.isFile() &&
        (entry.name.endsWith('.md') || entry.name.endsWith('.mdx'))
      ) {
        i++;

        const filePath = path.join(folderPath, entry.name);
        const { params, mainContent } = await frontMatter.extractData(filePath);

        console.log('');
        console.log(`[REQUEST]: meta_tags: ${params.meta_tags}`);
        console.log(`[REQUEST]: meta_description: ${params.description}`);

        const messages = promptKeyworkDescription(params, mainContent)
        const suggestion = await openapiSuggestion({
          messages: messages,
          model: "gpt-4-turbo",
          response_format: {
            type: "json_object"
          }
        });

        let data = {};
        data.filePath = filePath;
        data.url = `https://www.azion.com/${lang}/${lang === 'en' ? 'documentation' : 'documentacao'}${params.permalink}`;

        data.suggest = JSON.parse(suggestion.message.content) || {};
        data.suggest.meta_description_length = data.suggest.meta_description.length;

        data.current = {};
        data.current.meta_description = params.description;
        data.current.meta_keywords = params.meta_tags;

        console.log(`[RESPONSE]: ${JSON.stringify(data.suggest)}`);

        await json.toFile(data, `${distPath}/${entry.name}.json`);
      }
    }
  })
};

processFiles();
