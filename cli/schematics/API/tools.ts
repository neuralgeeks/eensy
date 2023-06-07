/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { Collection } from '@angular-devkit/schematics'
import { FileSystemEngine } from '@angular-devkit/schematics/tools'

export function getCollection(
  engine: FileSystemEngine,
  collectionName: string
) {
  return engine.createCollection(collectionName)
}

export function getSchematic<T extends object, K extends object>(
  collection: Collection<T, K>,
  schematicName: string,
  allowPrivate: boolean
) {
  return collection.createSchematic(schematicName, allowPrivate)
}
