#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';


/////////////
// CONFIG //
///////////

import config from './config.js';


////////////
// UTILS //
//////////

import markdown from './utils/markdown.js';
import json from './utils/json.js';


//////////////
// PROMPTS //
////////////

import promptKeyworkDescription from './prompts/azion-seo-meta-keywords-description.js';


///////////////////////
// CLIENT - OPEN IA //
/////////////////////

// in the terminal exec the command to export the the OPENAI_API_KEY variable
// export OPENAI_API_KEY="[openia_apikey]"
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function openapiSuggestion({ model, messages, response_format }) {
  const completion = await client.chat.completions.create({ model, messages, response_format });
  return completion.choices[0];
};


////////////////
// FUNCTIONS //
///////////////

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
        const { params, mainContent } = await markdown.getFrontMatter(fullPath);

        const messages = promptKeyworkDescription(params, mainContent);
        const suggestion = await openapiSuggestion({
          messages: messages,
          model: "gpt-4-turbo",
          response_format: {
            type: "json_object"
          }
        });

        const data = json.serializeDelivery(fullPath, params, suggestion);

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


///////////////////////
// PLAY IN THE GAME //
/////////////////////

await processFiles();
