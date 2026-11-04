#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/99c792da6c30868965c4c621bac3d23a270dd03792a63be3c07b3cb0d8d7d06e/contract';
import startContract from '../../snapshots/99c792da6c30868965c4c621bac3d23a270dd03792a63be3c07b3cb0d8d7d06e/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/9d30229873ac0d5de12b0ed0eda4dbea710173583e463f95ae9d9a4aaf4be870/contract';
import endContract from '../../snapshots/9d30229873ac0d5de12b0ed0eda4dbea710173583e463f95ae9d9a4aaf4be870/contract.json' with { type: 'json' };
import { Migration, MigrationCLI } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.dropDefault({ schema: 'public', table: 'Product', column: 'createdAt' }),
      this.dropDefault({ schema: 'public', table: 'ProductImage', column: 'createdAt' }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
