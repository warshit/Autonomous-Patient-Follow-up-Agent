import { getDatabase } from '../db/database';
import { Doctor, Alert, RoutingHistoryItem } from '../types';

/**
 * Doctor Routing Service
 * Handles automatic alert assignment and escalation logic
 */
export class RoutingService {
  /**
   * Find the best available doctor for alert assignment
   * Priority: AVAILABLE doctors with lowest active alert count
   */
  findBestAvailableDoctor(): Doctor | null {
    const db = getDatabase();

    // Get all available doctors with their active alert counts
    const query = `
      SELECT 
        d.*,
        COUNT(a.id) as active_alerts
      FROM doctors d
      LEFT JOIN alerts a ON d.id = a.assigned_doctor_id AND a.status = 'PENDING'
      WHERE d.status = 'AVAILABLE'
      GROUP BY d.id
      ORDER BY active_alerts ASC, d.created_at ASC
      LIMIT 1
    `;

    const doctor = db.prepare(query).get() as (Doctor & { active_alerts: number }) | undefined;

    if (!doctor) {
      console.warn('⚠️  No available doctors found for routing');
      return null;
    }

    console.log(`✅ Selected doctor: ${doctor.name} (${doctor.active_alerts} active alerts)`);
    return doctor;
  }

  /**
   * Assign alert to a specific doctor
   */
  assignAlertToDoctor(alertId: string, doctorId: string, reason: string): void {
    const db = getDatabase();

    const alert = db.prepare('SELECT * FROM alerts WHERE id = ?').get(alertId) as Alert | undefined;
    if (!alert) {
      throw new Error(`Alert ${alertId} not found`);
    }

    const doctor = db.prepare('SELECT * FROM doctors WHERE id = ?').get(doctorId) as Doctor | undefined;
    if (!doctor) {
      throw new Error(`Doctor ${doctorId} not found`);
    }

    // Add routing history entry
    const routingHistory: RoutingHistoryItem[] = JSON.parse(alert.routing_history);
    routingHistory.push({
      timestamp: new Date().toISOString(),
      action: 'ASSIGNED',
      actor: 'System',
      details: reason,
      to_doctor_id: doctorId,
    });

    // Update alert
    db.prepare(`
      UPDATE alerts 
      SET assigned_doctor_id = ?, routing_history = ?
      WHERE id = ?
    `).run(doctorId, JSON.stringify(routingHistory), alertId);

    console.log(`✅ Alert ${alertId} assigned to ${doctor.name}`);
  }

  /**
   * Automatically route a new alert
   * Returns the assigned doctor ID or null if escalated
   */
  autoRouteAlert(alertId: string, patientId: string, severity: string): string | null {
    const db = getDatabase();

    // Get patient's assigned doctor
    const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(patientId) as any;
    const assignedDoctorId = patient?.assigned_doctor_id;

    const routingHistory: RoutingHistoryItem[] = [];

    // Try to assign to patient's doctor first
    if (assignedDoctorId) {
      const assignedDoctor = db.prepare('SELECT * FROM doctors WHERE id = ?').get(assignedDoctorId) as Doctor | undefined;

      if (assignedDoctor && assignedDoctor.status === 'AVAILABLE') {
        routingHistory.push({
          timestamp: new Date().toISOString(),
          action: 'AUTO_ROUTED',
          actor: 'System',
          details: `Routed to assigned doctor ${assignedDoctor.name}`,
          to_doctor_id: assignedDoctor.id,
        });

        db.prepare(`
          UPDATE alerts 
          SET assigned_doctor_id = ?, routing_history = ?
          WHERE id = ?
        `).run(assignedDoctor.id, JSON.stringify(routingHistory), alertId);

        console.log(`✅ Alert auto-routed to assigned doctor: ${assignedDoctor.name}`);
        return assignedDoctor.id;
      } else {
        routingHistory.push({
          timestamp: new Date().toISOString(),
          action: 'ROUTING_ATTEMPT',
          actor: 'System',
          details: `Assigned doctor ${assignedDoctor?.name || 'unknown'} is ${assignedDoctor?.status || 'unavailable'}`,
          from_doctor_id: assignedDoctorId,
        });
      }
    }

    // Find any available doctor
    const availableDoctor = this.findBestAvailableDoctor();

    if (availableDoctor) {
      routingHistory.push({
        timestamp: new Date().toISOString(),
        action: 'AUTO_ROUTED',
        actor: 'System',
        details: `Routed to available doctor ${availableDoctor.name}`,
        to_doctor_id: availableDoctor.id,
      });

      db.prepare(`
        UPDATE alerts 
        SET assigned_doctor_id = ?, routing_history = ?
        WHERE id = ?
      `).run(availableDoctor.id, JSON.stringify(routingHistory), alertId);

      console.log(`✅ Alert auto-routed to available doctor: ${availableDoctor.name}`);
      return availableDoctor.id;
    }

    // No doctors available - escalate
    routingHistory.push({
      timestamp: new Date().toISOString(),
      action: 'ESCALATED',
      actor: 'System',
      details: 'No available doctors. Alert escalated to admin.',
    });

    db.prepare(`
      UPDATE alerts 
      SET status = 'ESCALATED', routing_history = ?
      WHERE id = ?
    `).run(JSON.stringify(routingHistory), alertId);

    console.warn(`⚠️  Alert ${alertId} escalated - no available doctors`);
    return null;
  }

  /**
   * Reassign alert to a different doctor (manual)
   */
  reassignAlert(alertId: string, newDoctorId: string, adminNote: string): void {
    const db = getDatabase();

    const alert = db.prepare('SELECT * FROM alerts WHERE id = ?').get(alertId) as Alert | undefined;
    if (!alert) {
      throw new Error(`Alert ${alertId} not found`);
    }

    const newDoctor = db.prepare('SELECT * FROM doctors WHERE id = ?').get(newDoctorId) as Doctor | undefined;
    if (!newDoctor) {
      throw new Error(`Doctor ${newDoctorId} not found`);
    }

    const routingHistory: RoutingHistoryItem[] = JSON.parse(alert.routing_history);
    routingHistory.push({
      timestamp: new Date().toISOString(),
      action: 'REASSIGNED',
      actor: 'Admin',
      details: `Manually reassigned to ${newDoctor.name}. Note: ${adminNote}`,
      from_doctor_id: alert.assigned_doctor_id || undefined,
      to_doctor_id: newDoctorId,
    });

    db.prepare(`
      UPDATE alerts 
      SET assigned_doctor_id = ?, status = 'PENDING', routing_history = ?
      WHERE id = ?
    `).run(newDoctorId, JSON.stringify(routingHistory), alertId);

    console.log(`✅ Alert ${alertId} reassigned to ${newDoctor.name}`);
  }

  /**
   * Resolve an alert
   */
  resolveAlert(alertId: string, resolvedBy: string): void {
    const db = getDatabase();

    const alert = db.prepare('SELECT * FROM alerts WHERE id = ?').get(alertId) as Alert | undefined;
    if (!alert) {
      throw new Error(`Alert ${alertId} not found`);
    }

    const routingHistory: RoutingHistoryItem[] = JSON.parse(alert.routing_history);
    routingHistory.push({
      timestamp: new Date().toISOString(),
      action: 'RESOLVED',
      actor: resolvedBy,
      details: 'Alert marked as resolved',
    });

    db.prepare(`
      UPDATE alerts 
      SET status = 'RESOLVED', resolved_at = datetime('now'), routing_history = ?
      WHERE id = ?
    `).run(JSON.stringify(routingHistory), alertId);

    console.log(`✅ Alert ${alertId} resolved by ${resolvedBy}`);
  }

  /**
   * Escalate an alert manually
   */
  escalateAlert(alertId: string, reason: string): void {
    const db = getDatabase();

    const alert = db.prepare('SELECT * FROM alerts WHERE id = ?').get(alertId) as Alert | undefined;
    if (!alert) {
      throw new Error(`Alert ${alertId} not found`);
    }

    const routingHistory: RoutingHistoryItem[] = JSON.parse(alert.routing_history);
    routingHistory.push({
      timestamp: new Date().toISOString(),
      action: 'ESCALATED',
      actor: 'System',
      details: reason,
    });

    db.prepare(`
      UPDATE alerts 
      SET status = 'ESCALATED', routing_history = ?
      WHERE id = ?
    `).run(JSON.stringify(routingHistory), alertId);

    console.log(`⚠️  Alert ${alertId} escalated: ${reason}`);
  }
}

// Singleton instance
let routingService: RoutingService | null = null;

export function getRoutingService(): RoutingService {
  if (!routingService) {
    routingService = new RoutingService();
  }
  return routingService;
}
