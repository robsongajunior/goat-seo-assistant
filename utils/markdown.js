import fs from 'fs';
import matter from 'gray-matter';


async function getFrontMatter(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const { data:params, content:mainContent } = matter(fileContent);

  return { params, mainContent:mainContent.trim() };
};


export default {
  getFrontMatter
};
