#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/3bef3207674db2cd96c8faeea500983f62cc9653f677edddee7e6924a27b63f1/contract';
import endContract from '../../snapshots/3bef3207674db2cd96c8faeea500983f62cc9653f677edddee7e6924a27b63f1/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/9d30229873ac0d5de12b0ed0eda4dbea710173583e463f95ae9d9a4aaf4be870/contract';
import startContract from '../../snapshots/9d30229873ac0d5de12b0ed0eda4dbea710173583e463f95ae9d9a4aaf4be870/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, lit } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'Product',
        column: col('displayOrder', 'int4', {
          notNull: true,
          default: lit(0),
          codecRef: { codecId: 'pg/int4@1' },
        }),
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
