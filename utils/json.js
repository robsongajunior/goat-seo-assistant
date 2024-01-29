import fs from 'fs';


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


export default { toFile: jsonToFile };
