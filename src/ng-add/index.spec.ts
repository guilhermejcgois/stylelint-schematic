import * as path from 'node:path';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';

const collectionPath = path.join(__dirname, '../collection.json');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const packageJSON = require('../../package.json');

const stylelintVersion = packageJSON.devDependencies['stylelint'];
const stylelintOrderVersion = packageJSON.devDependencies['stylelint-order'];
const stylelintConfigCssVersion = packageJSON.devDependencies['stylelint-config-standard'];
const stylelintSemanticGroups = packageJSON.devDependencies['stylelint-semantic-groups'];
const stylelintConfigSassVersion = packageJSON.devDependencies['stylelint-config-sass-guidelines'];

describe('ng-add', () => {
  let workspaceTree: UnitTestTree;

  beforeEach(() => {
    workspaceTree = new UnitTestTree(Tree.empty());
    workspaceTree.create(
      'package.json',
      JSON.stringify({
        // In a real workspace ng-add seems to add @angular-eslint/schematics to dependencies first
        dependencies: {
          '@guilhermejcgois/stylelint-schematic': packageJSON.version,
        },
      }),
    );
    workspaceTree.create(
      'angular.json',
      JSON.stringify({
        $schema: './node_modules/@angular/cli/lib/config/schema.json',
        version: 1,
        newProjectRoot: 'projects',
        cli: {
          defaultCollection: '@schematics/angular',
        },
        projects: {
          foo: {
            projectType: 'application',
            schematics: {},
            root: '',
            sourceRoot: 'src',
            prefix: 'app',
            architect: {
              build: {},
              serve: {},
              'extract-i18n': {},
              test: {},
              e2e: {},
            },
          },
        },
      }),
    );
  });

  it('should add stylelint dependencies for non-SASS project', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner
      .runSchematicAsync('ng-add', { }, workspaceTree)
      .toPromise();

      const projectPackageJSON = JSON.parse(tree.readContent('/package.json'));
      const devDeps = projectPackageJSON.devDependencies;

      expect(devDeps['stylelint']).toEqual(`^${stylelintVersion}`);
      expect(devDeps['stylelint-order']).toEqual(`^${stylelintOrderVersion}`);
      expect(devDeps['stylelint-semantic-groups']).toEqual(`^${stylelintSemanticGroups}`);
      expect(devDeps['stylelint-config-standard']).toEqual(`^${stylelintConfigCssVersion}`);
  });

  it('should add stylelint dependencies for SASS project', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner
      .runSchematicAsync('ng-add', { sass: true }, workspaceTree)
      .toPromise();

      const projectPackageJSON = JSON.parse(tree.readContent('/package.json'));
      const devDeps = projectPackageJSON.devDependencies;

      expect(devDeps['stylelint']).toEqual(`^${stylelintVersion}`);
      expect(devDeps['stylelint-order']).toEqual(`^${stylelintOrderVersion}`);
      expect(devDeps['stylelint-semantic-groups']).toEqual(`^${stylelintSemanticGroups}`);
      expect(devDeps['stylelint-config-sass-guidelines']).toEqual(`^${stylelintConfigSassVersion}`);
  });
});
