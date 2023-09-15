const fs = require('fs');
const path = require('path');

function deleteFolderSync(path) {
  if (fs.existsSync(path)) {
    fs.rmdirSync(path, {recursive: true});
  }
}

function copyFolderSync(source, target) {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, {recursive: true});
  }

  fs.readdirSync(source).forEach((file) => {
    const sourcePath = path.join(source, file);
    const targetPath = path.join(target, file);

    if (fs.lstatSync(sourcePath).isDirectory()) {
      copyFolderSync(sourcePath, targetPath);
    } else {
      fs.copyFileSync(sourcePath, targetPath);
    }
  });
}

deleteFolderSync('./src/assets/libs');
deleteFolderSync('./src/assets/blocks');

copyFolderSync('../lib/dygraphs', './src/assets/libs/dygraphs');
copyFolderSync('../scripts', './src/assets/blocks');
