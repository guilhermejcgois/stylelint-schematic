/**
 * Some utils taken from angular-eslint that takes from various parts of Nx:
 * https://github.com/nrwl/nx
 *
 * Thanks, Nrwl (and angular-eslint too) folks!
 */
import stripJsonComments from 'strip-json-comments';

import type { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';

function serializeJson(json: unknown): string {
  return `${JSON.stringify(json, null, 2)}\n`;
}


/**
 * This method is specifically for reading JSON files in a Tree
 * @param host The host tree
 * @param path The path to the JSON file
 * @returns The JSON data in the file.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function readJsonInTree<T = any>(host: Tree, path: string): T {
  if (!host.exists(path)) {
    throw new Error(`Cannot find ${path}`);
  }
  const contents = stripJsonComments(
    (host.read(path) as Buffer).toString('utf-8'),
  );
  try {
    return JSON.parse(contents);
  } catch (e) {
    throw new Error(
      `Cannot parse ${path}: ${e instanceof Error ? e.message : ''}`,
    );
  }
}

/**
 * This method is specifically for updating JSON in a Tree
 * @param path Path of JSON file in the Tree
 * @param callback Manipulation of the JSON data
 * @returns A rule which updates a JSON file file in a Tree
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function updateJsonInTree<T = any, O = T>(
  path: string,
  callback: (json: T, context: SchematicContext) => O,
): Rule {
  return (host: Tree, context: SchematicContext): Tree => {
    if (!host.exists(path)) {
      host.create(path, serializeJson(callback({} as T, context)));
      return host;
    }
    host.overwrite(
      path,
      serializeJson(callback(readJsonInTree(host, path), context)),
    );
    return host;
  };
}

export function getWorkspacePath(host: Tree) {
  const possibleFiles = ['/workspace.json', '/angular.json', '/.angular.json'];
  return possibleFiles.filter((path) => host.exists(path))[0];
}

export function createRootStyleLintConfig(isSassProject: boolean) {
  return {
    extends: isSassProject ? 'stylelint-config-sass-guidelines' : 'stylelint-config-standard',
    plugins: [
      'stylelint-order',
      'stylelint-config-rational-order/plugin'
    ],
    rules: {
      'selector-pseudo-element-no-unknown': [true, {
        'ignorePseudoElements': ['/^ng-/', 'pseudo-element']
      }],
      'order/properties-alphabetical-order': null,
      'order/properties-order': [],
      'plugin/rational-order': [true, {
        'border-in-box-model': false,
        'empty-line-between-groups': true
      }],
      'selector-max-id': 1
    }
  };
}

export function createRootStyleLintConfigFile(isSassProject: boolean): Rule {
  return () => {
    return updateJsonInTree('.stylelintrc.json', () =>
      createRootStyleLintConfig(isSassProject),
    );
  };
}

export function sortObjectByKeys(
  obj: Record<string, unknown>,
): Record<string, unknown> {
  return Object.keys(obj)
    .sort()
    .reduce((result, key) => {
      return {
        ...result,
        [key]: obj[key],
      };
    }, {});
}
