import fs from 'fs';
import matter from 'gray-matter';

/**
 *
 *
 *
*/
async function getFrontMatter(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const { data:params, content:mainContent } = matter(fileContent);

  return { params, mainContent:mainContent.trim() };
};

/**
 *
 * Used with entry from  fs.readdir
 * fs.readdir(directory, { withFileTypes: true }, async (err, entries) => {}
 *
*/
function isFile(entry) {
  const is = entry.isFile() && (entry.name.endsWith('.md') || entry.name.endsWith('.mdx'))

  return is;
};


export default {
  getFrontMatter,
  isFile
};
