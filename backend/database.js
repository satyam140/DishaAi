// backend/database.js

import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export async function setupDatabase() {
  const db = await open({
    filename: './database.db', // This file will be your database
    driver: sqlite3.Database
  });

  // Create a 'users' table if it doesn't exist
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      academic_details TEXT 
    )
  `);

  console.log('Database setup complete.');
  return db;
}