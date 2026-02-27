import Database from 'better-sqlite3';
import { config } from '../config';
import path from 'path';
import fs from 'fs';

let db: Database.Database | null = null;

/**
 * Initialize and return the database connection
 */
export function getDatabase(): Database.Database {
  if (db) {
    return db;
  }

  // Ensure data directory exists
  const dataDir = path.dirname(config.databasePath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Create database connection
  db = new Database(config.databasePath, {
    verbose: config.nodeEnv === 'development' ? console.log : undefined,
  });

  // Enable foreign keys
  db.pragma('foreign_keys = ON');
  
  // Enable WAL mode for better concurrency
  db.pragma('journal_mode = WAL');

  console.log(`✅ Database connected: ${config.databasePath}`);

  return db;
}

/**
 * Close the database connection
 */
export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
    console.log('Database connection closed');
  }
}

/**
 * Initialize database schema
 */
export function initializeSchema(): void {
  const database = getDatabase();

  // DOCTORS table
  database.exec(`
    CREATE TABLE IF NOT EXISTS doctors (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      specialization TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('AVAILABLE', 'BUSY', 'OFFLINE')),
      email TEXT,
      phone TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  // PATIENTS table
  database.exec(`
    CREATE TABLE IF NOT EXISTS patients (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT NOT NULL UNIQUE,
      surgery_type TEXT NOT NULL,
      surgery_date TEXT NOT NULL,
      days_since_surgery INTEGER NOT NULL,
      recovery_score INTEGER NOT NULL DEFAULT 100,
      risk_status TEXT NOT NULL CHECK(risk_status IN ('LOW', 'MEDIUM', 'HIGH')) DEFAULT 'LOW',
      assigned_doctor_id TEXT,
      known_risk_factors TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (assigned_doctor_id) REFERENCES doctors(id) ON DELETE SET NULL
    )
  `);

  // Create index on phone for fast lookups
  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_patients_phone ON patients(phone)
  `);

  // ALERTS table
  database.exec(`
    CREATE TABLE IF NOT EXISTS alerts (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      severity TEXT NOT NULL CHECK(severity IN ('LOW', 'MEDIUM', 'HIGH')),
      status TEXT NOT NULL CHECK(status IN ('PENDING', 'RESOLVED', 'ESCALATED')),
      assigned_doctor_id TEXT,
      reason TEXT NOT NULL,
      routing_history TEXT NOT NULL DEFAULT '[]',
      triage_data TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      resolved_at TEXT,
      FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
      FOREIGN KEY (assigned_doctor_id) REFERENCES doctors(id) ON DELETE SET NULL
    )
  `);

  // Create indexes for alerts
  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_alerts_patient ON alerts(patient_id);
    CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
    CREATE INDEX IF NOT EXISTS idx_alerts_doctor ON alerts(assigned_doctor_id);
  `);

  // SYSTEM_CONFIG table
  database.exec(`
    CREATE TABLE IF NOT EXISTS system_config (
      id INTEGER PRIMARY KEY CHECK(id = 1),
      ai_low_threshold INTEGER NOT NULL DEFAULT 39,
      ai_medium_threshold INTEGER NOT NULL DEFAULT 69,
      auto_escalation_minutes INTEGER NOT NULL DEFAULT 15,
      message_templates TEXT NOT NULL DEFAULT '[]'
    )
  `);

  // Insert default config if not exists
  const configExists = database.prepare('SELECT id FROM system_config WHERE id = 1').get();
  if (!configExists) {
    const defaultTemplates = JSON.stringify([
      {
        id: '1',
        name: 'Daily Check-in',
        content: 'Hello {name}, this is your daily check-in. How are you feeling today?'
      },
      {
        id: '2',
        name: 'High Risk Alert',
        content: 'URGENT: {name}, we detected concerning symptoms. A doctor will contact you shortly.'
      },
      {
        id: '3',
        name: 'Post-Op Reminder',
        content: 'Hi {name}, please remember to take your medication as prescribed.'
      }
    ]);

    database.prepare(`
      INSERT INTO system_config (id, ai_low_threshold, ai_medium_threshold, auto_escalation_minutes, message_templates)
      VALUES (1, ?, ?, ?, ?)
    `).run(config.ai.lowThreshold, config.ai.mediumThreshold, config.ai.autoEscalationMinutes, defaultTemplates);
  }

  console.log('✅ Database schema initialized');
}

/**
 * Seed database with sample data for development
 */
export function seedDatabase(): void {
  const database = getDatabase();

  // Check if already seeded
  const doctorCount = database.prepare('SELECT COUNT(*) as count FROM doctors').get() as { count: number };
  if (doctorCount.count > 0) {
    console.log('Database already seeded, skipping...');
    return;
  }

  console.log('Seeding database with sample data...');

  // Insert sample doctors
  const insertDoctor = database.prepare(`
    INSERT INTO doctors (id, name, specialization, status, email, phone)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const doctors = [
    ['D-101', 'Dr. Sarah Mitchell', 'Orthopedics', 'AVAILABLE', 's.mitchell@hospital.com', '+1-555-0101'],
    ['D-102', 'Dr. Alan Grant', 'General Surgery', 'AVAILABLE', 'a.grant@hospital.com', '+1-555-0102'],
    ['D-103', 'Dr. Emily Wong', 'Neurology', 'BUSY', 'e.wong@hospital.com', '+1-555-0103'],
    ['D-104', 'Dr. James Wilson', 'Cardiology', 'OFFLINE', 'j.wilson@hospital.com', '+1-555-0104'],
  ];

  doctors.forEach(doctor => insertDoctor.run(...doctor));

  // Insert sample patients
  const insertPatient = database.prepare(`
    INSERT INTO patients (id, name, phone, surgery_type, surgery_date, days_since_surgery, recovery_score, risk_status, assigned_doctor_id, known_risk_factors)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const patients = [
    ['P-1001', 'James Wilson', '+1-555-1001', 'ACL Reconstruction', '2024-02-24', 3, 92, 'LOW', 'D-101', null],
    ['P-1002', 'Elena Rodriguez', '+1-555-1002', 'Hip Replacement', '2024-02-21', 6, 45, 'HIGH', 'D-101', 'Diabetes, Hypertension'],
    ['P-1003', 'Michael Chen', '+1-555-1003', 'Appendectomy', '2024-02-25', 2, 78, 'MEDIUM', 'D-102', null],
    ['P-1004', 'Sarah Johnson', '+1-555-1004', 'Gallbladder Removal', '2024-02-23', 4, 88, 'LOW', 'D-101', null],
  ];

  patients.forEach(patient => insertPatient.run(...patient));

  console.log('✅ Database seeded with sample data');
}
