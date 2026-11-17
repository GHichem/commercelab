#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/5436ddd9d73171a26cd167637c7fd584cbffc0a9618be61d1adfeaff8c1f9ac5/contract';
import endContract from '../../snapshots/5436ddd9d73171a26cd167637c7fd584cbffc0a9618be61d1adfeaff8c1f9ac5/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/ed1ebf7bc94e00b55ecd36a233c5f5262ec50e192ce40c3ecf22b9a3b142e099/contract';
import startContract from '../../snapshots/ed1ebf7bc94e00b55ecd36a233c5f5262ec50e192ce40c3ecf22b9a3b142e099/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'Order',
        column: col('idempotencyKey', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addUnique({
        schema: 'public',
        table: 'Order',
        constraint: 'Order_idempotencyKey_key',
        columns: ['idempotencyKey'],
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
