#!/usr/bin/env node
/**
 * Database initialization script
 * Run with: npm run db:init
 */

import { initializeSchema, seedDatabase, closeDatabase } from './database';

async function main() {
  try {
    console.log('🚀 Initializing database...\n');
    
    initializeSchema();
    seedDatabase();
    
    console.log('\n✅ Database initialization complete!');
    
    closeDatabase();
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

main();
