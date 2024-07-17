#!/usr/bin/env node

import fs from 'fs';
import path from 'path';



/////////////
// CONFIG //
///////////

import config from './config.js';


///////////////
// SERVICES //
//////////////

import openia from './services/openia.js'


////////////
// UTILS //
//////////

import markdown from './utils/markdown.js';
import json from './utils/json.js';


//////////////
// PROMPTS //
////////////

import promptKeyworkDescription from './prompts/azion-seo-meta-keywords-description.js';


////////////////
// FUNCTIONS //
///////////////

function mkdir(folderPath) {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
};

async function touchFileResult(data, fileDist) {
  await json.toFile(data, fileDist);
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
      } else if (markdown.isFile(entry)) {
        const { params, mainContent } = await markdown.getFrontMatter(fullPath);
        const messages = promptKeyworkDescription(params, mainContent);
        const suggestion = await openia.getSuggestion(messages);
        const data = json.serializeDelivery(fullPath, params, suggestion);

        mkdir(config.output);
        touchFileResult(data, `${config.output}/${entry.name}.json`);
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
