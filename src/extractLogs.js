const fs = require('fs');
const path = require('path');
const readline = require('readline');

async function processLogs(logsDir, date, topCount = 10) {
  const outputFilePath = path.join(__dirname, `../output/output_${date}.txt`);
  const writeStream = fs.createWriteStream(outputFilePath);
  let count = 0;

  console.log(`🔍 Searching logs for date: ${date}...`);

  // Add the new line to the start of the output file
  writeStream.write('--- Start of log extraction ---\n\n');

  // Read all files in logs directory
  const files = fs.readdirSync(logsDir);

  for (const file of files) {
    const filePath = path.join(logsDir, file);

    const rl = readline.createInterface({
      input: fs.createReadStream(filePath),
      crlfDelay: Infinity,
    });

    rl.on('line', (line) => {
      if (line.includes(date) && count < topCount) {
        writeStream.write(line + '\n');
        count++;
      }
    });

    // Wait for the file to be fully processed
    await new Promise((resolve) => rl.on('close', resolve));

    // Stop if we have written the required number of top logs
    if (count >= topCount) {
      break;
    }
  }

  writeStream.end();
  console.log(`✅ Extraction complete. ${count} top log entries saved to ${outputFilePath}`);
}

// Get the date from command-line args
const args = process.argv.slice(2);
if (args.length !== 1) {
  console.error('Usage: node src/extractLogs.js <YYYY-MM-DD>');
  process.exit(1);
}

const date = args[0];
if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
  console.error('Invalid date format. Use YYYY-MM-DD.');
  process.exit(1);
}

// Adjust the number of top logs you want to extract, here set to 10
processLogs(path.join(__dirname, '../logs'), date, 10);
