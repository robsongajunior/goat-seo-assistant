function checkEntryType(path) {
  fs.stat(path, (err, stats) => {
    if (err) {
      if (err.code === 'ENOENT') {
        console.error('Path does not exist:', path);
      } else {
        console.error('Error accessing path:', err);
      }

      return;
    }

    return stats.isFile() ? 'file' : ( stats.isDirectory() ? 'directory' : undefined )
  });
}

export {
  checkEntryType
};
