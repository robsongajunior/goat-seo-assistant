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

import openia from './services/openia.js';


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
      } else if (config.file.type === 'markdown' && markdown.isFile(entry)) {
        const { params, mainContent } = await markdown.getFrontMatter(fullPath);
        const messages = promptKeyworkDescription(params, mainContent);
        const suggestion = await openia.getSuggestion(messages);
        const data = json.serializeDelivery(fullPath, params, suggestion);

        mkdir(config.output);
        touchFileResult(data, `${config.output}/${entry.name}.json`);
      } else if (config.file.type === 'json' && json.isFile(entry)) {
        //
        let jsonContentToMerge = {};
        try {
          const pathFormatted = fullPath.replace(/src\/content\/pages\/([^\/]+)/, 'src/i18n/$1/pages');
          jsonContentToMerge = json.read(pathFormatted);
        } catch(error) {
          console.error(error);
        }

        const jsonContent = {...json.read(fullPath), ...jsonContentToMerge};
        const params = {
          description: jsonContent.description,
          meta_tags: jsonContent.meta_tags
        };

        const markdownContent = json.toMarkdown(jsonContent);
        const messages = promptKeyworkDescription(params, markdownContent);
        const suggestion = await openia.getSuggestion(messages);
        const data = json.serializeDelivery(fullPath, params, suggestion);
        const dist = `${config.output}${directory.replace(config.input, '')}`;

        mkdir(dist);
        touchFileResult(data, `${dist}/${entry.name}`);
      }
    };
  });
}

async function processFiles() {
  await processDirectory(config.input);
};


///////////////////////
// PLAY IN THE GAME //
/////////////////////

await processFiles();
