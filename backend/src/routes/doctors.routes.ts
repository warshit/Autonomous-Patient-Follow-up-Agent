import { Router, Request, Response } from 'express';
import { getDatabase } from '../db/database';
import { Doctor } from '../types';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

/**
 * GET /doctors
 * Get all doctors
 */
router.get('/', (req: Request, res: Response) => {
  try {
    const db = getDatabase();

    const doctors = db.prepare(`
      SELECT 
        d.*,
        COUNT(DISTINCT p.id) as patients_count,
        COUNT(DISTINCT CASE WHEN a.status = 'PENDING' THEN a.id END) as active_alerts_count
      FROM doctors d
      LEFT JOIN patients p ON d.id = p.assigned_doctor_id
      LEFT JOIN alerts a ON d.id = a.assigned_doctor_id
      GROUP BY d.id
      ORDER BY d.created_at DESC
    `).all();

    res.json(doctors);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ error: 'Failed to fetch doctors' });
  }
});

/**
 * GET /doctors/:id
 * Get doctor by ID
 */
router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    const doctor = db.prepare(`
      SELECT 
        d.*,
        COUNT(DISTINCT p.id) as patients_count,
        COUNT(DISTINCT CASE WHEN a.status = 'PENDING' THEN a.id END) as active_alerts_count
      FROM doctors d
      LEFT JOIN patients p ON d.id = p.assigned_doctor_id
      LEFT JOIN alerts a ON d.id = a.assigned_doctor_id
      WHERE d.id = ?
      GROUP BY d.id
    `).get(id);

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    // Get doctor's patients
    const patients = db.prepare(`
      SELECT * FROM patients WHERE assigned_doctor_id = ?
      ORDER BY risk_status DESC, created_at DESC
    `).all(id);

    // Get doctor's alerts
    const alerts = db.prepare(`
      SELECT 
        a.*,
        p.name as patient_name
      FROM alerts a
      JOIN patients p ON a.patient_id = p.id
      WHERE a.assigned_doctor_id = ?
      ORDER BY a.created_at DESC
      LIMIT 20
    `).all(id);

    res.json({
      ...doctor,
      patients,
      alerts,
    });
  } catch (error) {
    console.error('Error fetching doctor:', error);
    res.status(500).json({ error: 'Failed to fetch doctor' });
  }
});

/**
 * POST /doctors
 * Create new doctor
 */
router.post('/', (req: Request, res: Response) => {
  try {
    const { name, specialization, status, email, phone } = req.body;

    // Validation
    if (!name || !specialization) {
      return res.status(400).json({ error: 'Name and specialization are required' });
    }

    const validStatuses = ['AVAILABLE', 'BUSY', 'OFFLINE'];
    const doctorStatus = status || 'AVAILABLE';

    if (!validStatuses.includes(doctorStatus)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const db = getDatabase();
    const doctorId = `D-${uuidv4().substring(0, 8)}`;

    db.prepare(`
      INSERT INTO doctors (id, name, specialization, status, email, phone)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(doctorId, name, specialization, doctorStatus, email || null, phone || null);

    const doctor = db.prepare('SELECT * FROM doctors WHERE id = ?').get(doctorId);

    console.log(`✅ Doctor created: ${name} (${doctorId})`);
    res.status(201).json(doctor);
  } catch (error) {
    console.error('Error creating doctor:', error);
    res.status(500).json({ error: 'Failed to create doctor' });
  }
});

/**
 * PATCH /doctors/:id
 * Update doctor
 */
router.patch('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const db = getDatabase();

    // Check if doctor exists
    const doctor = db.prepare('SELECT * FROM doctors WHERE id = ?').get(id);
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    // Validate status if provided
    if (updates.status) {
      const validStatuses = ['AVAILABLE', 'BUSY', 'OFFLINE'];
      if (!validStatuses.includes(updates.status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }
    }

    // Build dynamic update query
    const allowedFields = ['name', 'specialization', 'status', 'email', 'phone'];
    const updateFields = Object.keys(updates).filter(key => allowedFields.includes(key));

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    const setClause = updateFields.map(field => `${field} = ?`).join(', ');
    const values = updateFields.map(field => updates[field]);

    db.prepare(`UPDATE doctors SET ${setClause} WHERE id = ?`).run(...values, id);

    const updatedDoctor = db.prepare('SELECT * FROM doctors WHERE id = ?').get(id);

    console.log(`✅ Doctor updated: ${id}`);
    res.json(updatedDoctor);
  } catch (error) {
    console.error('Error updating doctor:', error);
    res.status(500).json({ error: 'Failed to update doctor' });
  }
});

/**
 * DELETE /doctors/:id
 * Delete doctor
 */
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    const doctor = db.prepare('SELECT * FROM doctors WHERE id = ?').get(id);
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    // Check if doctor has assigned patients
    const patientCount = db.prepare('SELECT COUNT(*) as count FROM patients WHERE assigned_doctor_id = ?').get(id) as { count: number };
    
    if (patientCount.count > 0) {
      return res.status(409).json({ 
        error: 'Cannot delete doctor with assigned patients',
        patients_count: patientCount.count 
      });
    }

    db.prepare('DELETE FROM doctors WHERE id = ?').run(id);

    console.log(`✅ Doctor deleted: ${id}`);
    res.json({ message: 'Doctor deleted successfully' });
  } catch (error) {
    console.error('Error deleting doctor:', error);
    res.status(500).json({ error: 'Failed to delete doctor' });
  }
});

export default router;
