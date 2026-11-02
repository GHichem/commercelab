#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/0baf82cd833c359c0f668fd7dd6f304162e99aa0ff35373a6898a6b108911582/contract';
import startContract from '../../snapshots/0baf82cd833c359c0f668fd7dd6f304162e99aa0ff35373a6898a6b108911582/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/99c792da6c30868965c4c621bac3d23a270dd03792a63be3c07b3cb0d8d7d06e/contract';
import endContract from '../../snapshots/99c792da6c30868965c4c621bac3d23a270dd03792a63be3c07b3cb0d8d7d06e/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  col,
  fn,
  lit,
  primaryKey,
  sql,
} from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'ProductImage',
        columns: [
          col('altText', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('position', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('productId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('storagePath', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createIndex({
        schema: 'public',
        table: 'ProductImage',
        index: 'ProductImage_productId_idx_5858600a',
        columns: ['productId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'ProductImage',
        foreignKey: {
          name: 'ProductImage_productId_fkey',
          columns: ['productId'],
          references: { schema: 'public', table: 'Product', columns: ['id'] },
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
