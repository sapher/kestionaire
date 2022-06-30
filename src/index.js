#! /usr/bin/env node
import inquirer from "inquirer";
import yaml from "yaml";
import fs from "fs/promises";
import path from "path";

/**
 * Read yaml input question file and return parsed object
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
 * Read that has been previously outputed in order to fill answers
 * @param filename
 */
async function readOutputFile(filename) {
  try {
    const fileContent = await fs.readFile(filename, { encoding: "utf-8" });
    const contentLines = fileContent.split("\n").filter((l) => l);
    return contentLines.reduce((prev, curr) => {
      const envVar = curr.split(/=(.*)/s, 2);
      if (envVar.length === 2) {
        const [key, value] = envVar;
        return { ...prev, [key]: value };
      }
      return { ...prev };
    }, {});
  } catch (e) {
    return [];
  }
}

/**
 * Update questions with previous answers
 * @param questions
 * @param answers
 */
function updateQuestionsWithPreviousAnswers(questions, answers) {
  const clone = [...questions];
  questions.forEach((q) => {
    Object.keys(answers).forEach((a) => {
      if (q.name.toLowerCase() === a.toLowerCase()) {
        q.default = answers[a];
        q.askAnswered = true;
      }
    });
  });
  return clone;
}

/**
 * Bootstrap function
 */
(async () => {
  try {
    const questionFilename = process.argv[2];
    const content = await readfile(questionFilename);
    const answerFilename = content.output;
    const prevAnswers = await readOutputFile(answerFilename);
    const questions = updateQuestionsWithPreviousAnswers(
      content.questions,
      prevAnswers
    );
    const answers = await inquirer.prompt(questions);
    await exportDotEnv(answerFilename, answers);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
})();
