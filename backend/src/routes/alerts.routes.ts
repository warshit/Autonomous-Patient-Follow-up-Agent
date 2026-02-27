import { Router, Request, Response } from 'express';
import { getDatabase } from '../db/database';
import { getRoutingService } from '../services/routing.service';
import { Alert } from '../types';

const router = Router();

/**
 * GET /alerts
 * Get all alerts with optional filters
 */
router.get('/', (req: Request, res: Response) => {
  try {
    const { status, severity, doctor_id } = req.query;
    const db = getDatabase();

    let query = `
      SELECT 
        a.*,
        p.name as patient_name,
        p.phone as patient_phone,
        p.surgery_type,
        d.name as assigned_doctor_name,
        d.status as doctor_status
      FROM alerts a
      JOIN patients p ON a.patient_id = p.id
      LEFT JOIN doctors d ON a.assigned_doctor_id = d.id
      WHERE 1=1
    `;

    const params: any[] = [];

    if (status) {
      query += ' AND a.status = ?';
      params.push(status);
    }

    if (severity) {
      query += ' AND a.severity = ?';
      params.push(severity);
    }

    if (doctor_id) {
      query += ' AND a.assigned_doctor_id = ?';
      params.push(doctor_id);
    }

    query += ' ORDER BY a.created_at DESC';

    const alerts = db.prepare(query).all(...params);

    // Parse JSON fields
    const parsedAlerts = alerts.map((alert: any) => ({
      ...alert,
      routing_history: JSON.parse(alert.routing_history || '[]'),
      triage_data: alert.triage_data ? JSON.parse(alert.triage_data) : null,
    }));

    res.json(parsedAlerts);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

/**
 * GET /alerts/:id
 * Get alert by ID
 */
router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    const alert = db.prepare(`
      SELECT 
        a.*,
        p.name as patient_name,
        p.phone as patient_phone,
        p.surgery_type,
        p.days_since_surgery,
        d.name as assigned_doctor_name,
        d.status as doctor_status
      FROM alerts a
      JOIN patients p ON a.patient_id = p.id
      LEFT JOIN doctors d ON a.assigned_doctor_id = d.id
      WHERE a.id = ?
    `).get(id) as any;

    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    // Parse JSON fields
    alert.routing_history = JSON.parse(alert.routing_history || '[]');
    alert.triage_data = alert.triage_data ? JSON.parse(alert.triage_data) : null;

    res.json(alert);
  } catch (error) {
    console.error('Error fetching alert:', error);
    res.status(500).json({ error: 'Failed to fetch alert' });
  }
});

/**
 * PATCH /alerts/:id
 * Update alert (resolve, escalate, reassign)
 */
router.patch('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { action, doctor_id, note, resolved_by } = req.body;

    const db = getDatabase();

    // Check if alert exists
    const alert = db.prepare('SELECT * FROM alerts WHERE id = ?').get(id);
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    const routingService = getRoutingService();

    switch (action) {
      case 'resolve':
        if (!resolved_by) {
          return res.status(400).json({ error: 'resolved_by is required' });
        }
        routingService.resolveAlert(id, resolved_by);
        break;

      case 'escalate':
        const reason = note || 'Manual escalation';
        routingService.escalateAlert(id, reason);
        break;

      case 'reassign':
        if (!doctor_id) {
          return res.status(400).json({ error: 'doctor_id is required for reassignment' });
        }
        const adminNote = note || 'Manual reassignment';
        routingService.reassignAlert(id, doctor_id, adminNote);
        break;

      default:
        return res.status(400).json({ error: 'Invalid action. Use: resolve, escalate, or reassign' });
    }

    // Fetch updated alert
    const updatedAlert = db.prepare(`
      SELECT 
        a.*,
        p.name as patient_name,
        d.name as assigned_doctor_name
      FROM alerts a
      JOIN patients p ON a.patient_id = p.id
      LEFT JOIN doctors d ON a.assigned_doctor_id = d.id
      WHERE a.id = ?
    `).get(id) as any;

    updatedAlert.routing_history = JSON.parse(updatedAlert.routing_history || '[]');
    updatedAlert.triage_data = updatedAlert.triage_data ? JSON.parse(updatedAlert.triage_data) : null;

    console.log(`✅ Alert ${action}: ${id}`);
    res.json(updatedAlert);
  } catch (error) {
    console.error('Error updating alert:', error);
    res.status(500).json({ error: 'Failed to update alert' });
  }
});

/**
 * DELETE /alerts/:id
 * Delete alert (admin only)
 */
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    const alert = db.prepare('SELECT * FROM alerts WHERE id = ?').get(id);
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    db.prepare('DELETE FROM alerts WHERE id = ?').run(id);

    console.log(`✅ Alert deleted: ${id}`);
    res.json({ message: 'Alert deleted successfully' });
  } catch (error) {
    console.error('Error deleting alert:', error);
    res.status(500).json({ error: 'Failed to delete alert' });
  }
});

export default router;
