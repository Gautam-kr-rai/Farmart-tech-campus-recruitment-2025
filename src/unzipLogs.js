const yauzl = require("yauzl");
const fs = require("fs-extra");
const path = require("path");

const zipFilePath = path.join(__dirname, "../logs_2024.log.zip");
const extractTo = path.join(__dirname, "../logs");

// Ensure the logs directory exists
fs.ensureDirSync(extractTo);

yauzl.open(zipFilePath, { lazyEntries: true }, (err, zipfile) => {
  if (err) throw err;

  zipfile.readEntry();

  zipfile.on("entry", (entry) => {
    if (/\/$/.test(entry.fileName)) {
      // Directory
      fs.ensureDirSync(path.join(extractTo, entry.fileName));
      zipfile.readEntry();
    } else {
      // File
      zipfile.openReadStream(entry, (err, readStream) => {
        if (err) throw err;

        const outputPath = path.join(extractTo, entry.fileName);
        readStream.pipe(fs.createWriteStream(outputPath));

        readStream.on("end", () => {
          zipfile.readEntry();
        });
      });
    }
  });

  zipfile.on("end", () => {
    console.log(`✅ Logs extracted to: ${extractTo}`);
  });
});
