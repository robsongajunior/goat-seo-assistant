import fs from 'fs';


/**
 *
 * Used with entry from  fs.readdir
 * fs.readdir(directory, { withFileTypes: true }, async (err, entries) => {}
 *
*/
function isFile(entry) {
  const is = entry.isFile() && (entry.name.endsWith('.json'));
  return is;
};

function jsonToFile(jsonObj, filePath) {
  const jsonString = JSON.stringify(jsonObj, null, 2);

  fs.writeFile(filePath, jsonString, 'utf8', (err) => {
    if (err) {
      console.error('An error occurred while writing JSON to file:', err);
    } else {
      console.log('JSON has been written successfully to', filePath);
    }
  });
};

function serializeDelivery(fullpath='', params={}, suggestion={}) {
  const json = JSON.parse(suggestion.message.content);

  return {
    filePath: fullpath,
    current: {
      meta_description: params.description,
      meta_keywords: params.meta_tags
    },
    suggest: {
      meta_keywords: json.meta_keywords,
      meta_description: json.meta_description,
      meta_description_length: json.meta_description?.length
    }
  }
};

function jsonToMarkdown(jsonData, indent = 0) {
  let markdown = "";

  if (typeof jsonData === "object" && !Array.isArray(jsonData)) {
    // Handle objects (dictionaries)
    for (const [key, value] of Object.entries(jsonData)) {
      markdown += "  ".repeat(indent) + `- **${key}**:`;

      if (typeof value === "object") {
        markdown += "\n" + jsonToMarkdown(value, indent + 1);
      } else {
        markdown += ` ${value}\n`;
      }
    }
  } else if (Array.isArray(jsonData)) {
    for (const item of jsonData) {
      markdown += "  ".repeat(indent) + "- ";

      if (typeof item === "object") {
        markdown += "\n" + jsonToMarkdown(item, indent + 1);
      } else {
        markdown += `${item}\n`;
      }
    }
  } else {
    markdown += jsonData;
  }

  return markdown;
}

function read(filePath, type='json') {
  const jsonStr = fs.readFileSync(filePath, 'utf-8');
  return type === 'json' ? JSON.parse(jsonStr) : jsonStr;
};

export default {
  toFile: jsonToFile,
  toMarkdown: jsonToMarkdown,
  serializeDelivery,
  isFile,
  read
};
