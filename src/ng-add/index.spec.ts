import * as path from 'node:path';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';

const collectionPath = path.join(__dirname, '../collection.json');

describe('ng-stylelint', () => {
  it('works', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner
      .runSchematicAsync('ng-stylelint', {}, Tree.empty())
      .toPromise();

    expect(tree.files).toEqual([]);
  });
});
