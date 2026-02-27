import { Router, Request, Response } from 'express';
import { getDatabase } from '../db/database';
import { AnalyticsSummary } from '../types';

const router = Router();

/**
 * GET /analytics/summary
 * Get comprehensive analytics summary
 */
router.get('/summary', (req: Request, res: Response) => {
  try {
    const db = getDatabase();

    // Total patients
    const totalPatients = db.prepare('SELECT COUNT(*) as count FROM patients').get() as { count: number };

    // Active alerts (PENDING)
    const activeAlerts = db.prepare("SELECT COUNT(*) as count FROM alerts WHERE status = 'PENDING'").get() as { count: number };

    // Risk status counts
    const highRiskCount = db.prepare("SELECT COUNT(*) as count FROM patients WHERE risk_status = 'HIGH'").get() as { count: number };
    const mediumRiskCount = db.prepare("SELECT COUNT(*) as count FROM patients WHERE risk_status = 'MEDIUM'").get() as { count: number };
    const lowRiskCount = db.prepare("SELECT COUNT(*) as count FROM patients WHERE risk_status = 'LOW'").get() as { count: number };

    // Average recovery score
    const avgRecoveryScore = db.prepare('SELECT AVG(recovery_score) as avg FROM patients').get() as { avg: number };

    // Alerts by severity
    const alertsBySeverity = db.prepare(`
      SELECT 
        severity,
        COUNT(*) as count
      FROM alerts
      GROUP BY severity
    `).all() as Array<{ severity: string; count: number }>;

    const severityCounts = {
      LOW: 0,
      MEDIUM: 0,
      HIGH: 0,
    };

    alertsBySeverity.forEach(item => {
      severityCounts[item.severity as keyof typeof severityCounts] = item.count;
    });

    // Alerts by status
    const alertsByStatus = db.prepare(`
      SELECT 
        status,
        COUNT(*) as count
      FROM alerts
      GROUP BY status
    `).all() as Array<{ status: string; count: number }>;

    const statusCounts = {
      PENDING: 0,
      RESOLVED: 0,
      ESCALATED: 0,
    };

    alertsByStatus.forEach(item => {
      statusCounts[item.status as keyof typeof statusCounts] = item.count;
    });

    // Doctor availability
    const doctorStats = db.prepare(`
      SELECT 
        status,
        COUNT(*) as count
      FROM doctors
      GROUP BY status
    `).all() as Array<{ status: string; count: number }>;

    const doctorCounts = {
      AVAILABLE: 0,
      BUSY: 0,
      OFFLINE: 0,
    };

    doctorStats.forEach(item => {
      doctorCounts[item.status as keyof typeof doctorCounts] = item.count;
    });

    const summary: AnalyticsSummary = {
      total_patients: totalPatients.count,
      active_alerts: activeAlerts.count,
      high_risk_count: highRiskCount.count,
      medium_risk_count: mediumRiskCount.count,
      low_risk_count: lowRiskCount.count,
      average_recovery_score: Math.round(avgRecoveryScore.avg || 0),
      alerts_by_severity: severityCounts,
      alerts_by_status: statusCounts,
      doctors_available: doctorCounts.AVAILABLE,
      doctors_busy: doctorCounts.BUSY,
      doctors_offline: doctorCounts.OFFLINE,
    };

    res.json(summary);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

export default router;