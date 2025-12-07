#!/usr/bin/env node

import { getCli } from './cli';
import { run } from './app';

async function main() {
  try {
    const options = await getCli();
    await run(options);
  } catch (error) {
    console.error('Fatal error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main();
