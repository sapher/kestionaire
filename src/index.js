#! /usr/bin/env node
import inquirer from "inquirer";
import yaml from "yaml";
import fs from "fs/promises";
import path from "path";

/**
 * Read yaml input question file and parse
 * @param filename
 */
async function readfile(filename) {
  if (!filename) {
    throw new Error("No file passed in parameter");
  }
  const rawContent = await fs.readFile(filename, { encoding: "utf-8" });
  return yaml.parse(rawContent);
}

/**
 * Export answers to dot env file
 * @param answers
 */
async function exportDotEnv(filename, answers) {
  const lines = Object.entries(answers)
    .map(([key, value]) => `${key.toUpperCase()}=${value}`)
    .join("\n");

  // Test if folder exist
  const dirname = path.dirname(filename);
  let isExist;
  try {
    await fs.access(dirname);
    isExist = true;
  } catch {
    isExist = false;
  }

  // Create file if it doesn't exist
  if (!isExist) {
    await fs.mkdir(dirname, { recursive: true });
  }

  await fs.writeFile(filename, lines, { encoding: "utf-8" });
}

/**
 * Bootstrap function
 */
(async () => {
  try {
    const questionFile = process.argv[2];
    const content = await readfile(questionFile);
    const answers = await inquirer.prompt(content.questions);
    const answerFile = content.output;
    await exportDotEnv(answerFile, answers);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
})();
