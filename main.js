import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';


////////////////////
// LOCAL IMPORTS //
//////////////////


import frontMatter from './utils/front-matter.js';
import json from './utils/json.js';


//////////////////////////
// GLOBAL CONFIGURATION //
//////////////////////////


const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const folderPath = './content';


////////////
// METHOS //
////////////


async function openapiSuggestion({ model, messages }) {
  const completion = await openai.chat.completions.create({ model, messages });
  return completion.choices[0];
};

async function processFiles() {
  fs.readdir(folderPath, { withFileTypes: true }, async (err, entries) => {
    if (err) {
      console.error('Error reading directory:', err);
      return;
    }

    for (const entry of entries) {
      if (entry.isFile() && (entry.name.endsWith('.md') || entry.name.endsWith('.mdx'))) {
        const filePath = path.join(folderPath, entry.name);
        const { params, mainContent } = await frontMatter.extractData(filePath);

        const messages = [
          {
            role: 'user',
            content: `I have the following post article:\n${mainContent}`,
          },
          {
            role: 'user',
            content: `In the above article we have the following description meta tag: "${params.description}"`,
          },
          {
            role: 'user',
            content: `In the above article we have the following meta keywords: "${params.meta_tags}"`,
          },
          {
            role: 'user',
            content: 'Extract and give me the better meta description with total 160 chars and the maximum meta keywords but the minimun tree from text using a json format with the respects attributes.',
          }
        ];

        const suggestion = await openapiSuggestion({
          model: 'gpt-3.5-turbo',
          messages: messages
        });
        const contentJson = JSON.parse(suggestion.message.content);

        let data = {};
        data.suggest = contentJson;
        data.filePath = filePath;

        data.current = {
          metaDescription: params.description,
          metaTags: params.meta_tags
        };

        await json.jsonToFile(data, 'result-test.json');
      }
    }
  })
};


//////////
// INIT //
//////////


processFiles();
