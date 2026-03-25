import { DataSource } from 'typeorm';
import { Calculation } from '@/entities/Calculation';
import path from 'path';

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: process.env.DATABASE_URL?.replace('sqlite:', '') || 'database.sqlite',
  entities: [Calculation],
  synchronize: true, // Auto-create tables (use migrations in production)
  logging: false,
});
