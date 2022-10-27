/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { chain } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';

import { createRootStyleLintConfigFile, sortObjectByKeys } from '../utils';
import type { Schema } from './schema';

// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
const packageJson = require('../../package.json');

function addStyleLintPackages(isSass: boolean) {
  return (host: Tree, context: SchematicContext) => {
    if (!host.exists('package.json')) {
      throw new Error(
        'Could not find a `package.json` file at the root of your workspace',
      );
    }

    const projectPackageJson = (host.read('package.json') as Buffer).toString(
      'utf-8',
    );
    const json = JSON.parse(projectPackageJson);
    json.devDependencies = json.devDependencies || {};
    json.devDependencies.stylelint = `^${packageJson.devDependencies.stylelint}`;
    json.devDependencies[
      'stylelint-order'
    ] = `^${packageJson.devDependencies['stylelint-order']}`;
    json.devDependencies[
      'stylelint-config-rational-order'
    ] = `^${packageJson.devDependencies['stylelint-config-rational-order']}`;
    const configLib = isSass ? 'stylelint-config-sass-guidelines' : 'stylelint-config-standard';
    json.devDependencies[
      configLib
    ] = `^${packageJson.devDependencies[configLib]}`;

    const lang = isSass ? 'scss' : 'css';
    json.scripts = json.scripts || {};
    json.scripts[`lint:${lang}`] = json.scripts[`lint:${lang}`] || `stylelint "src/**/*.${lang}"`;

    json.devDependencies = sortObjectByKeys(json.devDependencies);
    host.overwrite('package.json', JSON.stringify(json, null, 2));

    context.addTask(new NodePackageInstallTask());

    context.logger.info(`
All stylelint dependencies have been successfully installed and configured 🎉
`);

    return host;
  };
}

export function ngAdd({ sass }: Schema): Rule {
  return (tree: Tree, context: SchematicContext) => {
    console.log(`Is Sass? ${sass}`);
    return chain([
      addStyleLintPackages(sass),
      createRootStyleLintConfigFile(sass),
    ])(tree, context);
  };
}
