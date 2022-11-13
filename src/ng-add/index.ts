/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { addDependenciesToPackageJson, convertNxGenerator, generateFiles, joinPathFragments } from '@nrwl/devkit';
import type { Tree } from '@nrwl/devkit';

import type { Schema } from './schema';

// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
const packageJson = require('../../package.json');

export function ngAddGenerator(tree: Tree, { sass: isSass }: Schema) {
  if (!tree.exists('package.json')) {
    throw new Error(
      'Could not find a `package.json` file at the root of your workspace',
    );
  }

  const configLib = isSass ? 'stylelint-config-sass-guidelines' : 'stylelint-config-standard';
  addDependenciesToPackageJson(tree, {}, {
    stylelint: `^${packageJson.devDependencies.stylelint}`,
    'stylelint-order': `^${packageJson.devDependencies['stylelint-order']}`,
    'stylelint-semantic-groups': `^${packageJson.devDependencies['stylelint-semantic-groups']}`,
    [configLib]: `^${packageJson.devDependencies[configLib]}`,
  });

  generateFiles(tree, joinPathFragments(__dirname, './files'), '.', {
    isSassProject: isSass
  });
}

export const ngAdd = convertNxGenerator(ngAddGenerator);
