import inquirer from 'inquirer';
import { CliOptions, OutputFormat } from '../types/CliOptions';

export async function promptUserForOptions(): Promise<CliOptions> {
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'source',
      message: 'Select a news source:',
      choices: ['Tagesschau'],
      default: 'Tagesschau'
    },
    {
      type: 'input',
      name: 'time',
      message: 'Enter time (YYYY or YYYY-MM):',
      validate: (input: string) => {
        const yearRegex = /^\d{4}$/;
        const yearMonthRegex = /^\d{4}-\d{2}$/;

        if (yearRegex.test(input) || yearMonthRegex.test(input)) {
          return true;
        }
        return 'Please enter a valid format: YYYY or YYYY-MM';
      }
    },
    {
      type: 'list',
      name: 'format',
      message: 'Select output format:',
      choices: [
        {
          name: 'JSON - Save complete article data as JSON files',
          value: 'json'
        },
        {
          name: 'TXT - Save article title and text as plain text files',
          value: 'txt'
        }
      ],
      default: 'json'
    },
    {
      type: 'input',
      name: 'filters',
      message: 'Filter articles by keywords (comma-separated, use * for wildcards, leave empty for all):',
      default: ''
    }
  ]);

  return {
    source: answers.source,
    time: answers.time,
    format: answers.format as OutputFormat,
    filters: answers.filters || undefined
  };
}
