#!/usr/bin/env node

import { cli } from './cli';

cli(process.argv);

export * from './cli';