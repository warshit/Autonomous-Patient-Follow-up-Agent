import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { doctors as initialDoctors, patients as initialPatients, alerts as initialAlerts, adminStats, systemHealth } from '@/lib/mockData';

// Types
export type DoctorStatus = 'Available' | 'In Consultation' | 'Off Duty' | 'On Leave';

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  status: DoctorStatus;
  workingHours: string;
  patientsCount: number;
  alertsHandled: number;
  avatar: string;
  email: string;
  phone: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  surgeryType: string;
  surgeryDate: string;
  daysPostOp: number;
  lastResponse: string;
  riskStatus: 'Low' | 'Medium' | 'High';
  doctor: string; // Doctor Name
  doctorId?: string; // Doctor ID for linking
  recoveryScore: number;
  symptoms: any;
}

export interface Alert {
  id: string;
  patientId: string;
  patientName: string;
  reason: string;
  severity: 'Low' | 'Medium' | 'High';
  time: string;
  status: 'Pending' | 'Resolved' | 'Escalated';
  routedTo: string; // Doctor Name
  doctorStatus: string;
  history?: AlertHistoryItem[];
}

export interface AlertHistoryItem {
  step: string;
  time: string;
  actor: string;
  details: string;
  status: 'completed' | 'current' | 'pending';
  icon?: any;
}

export interface MessageTemplate {
  id: string;
  name: string;
  content: string;
}

export interface AppConfig {
  aiConfig: {
    riskThresholds: { low: number; medium: number; high: number };
    symptomWeights: { pain: number; fever: number; swelling: number; mobility: number };
    autoEscalation: boolean;
  };
  messageTemplates: MessageTemplate[];
  messaging: {
    whatsapp: boolean;
    smsFallback: boolean;
    checkInFrequency: string;
  };
}

interface AdminContextType {
  doctors: Doctor[];
  patients: Patient[];
  alerts: Alert[];
  config: AppConfig;
  stats: any[];
  
  // Doctor Actions
  addDoctor: (doctor: Omit<Doctor, 'id' | 'patientsCount' | 'alertsHandled'>) => void;
  updateDoctor: (id: string, updates: Partial<Doctor>) => void;
  deleteDoctor: (id: string) => void;
  toggleDoctorStatus: (id: string, status: DoctorStatus) => void;

  // Patient Actions
  addPatient: (patient: Omit<Patient, 'id' | 'daysPostOp' | 'recoveryScore'>) => void;
  updatePatient: (id: string, updates: Partial<Patient>) => void;
  deletePatient: (id: string) => void;
  assignDoctorToPatient: (patientId: string, doctorId: string) => void;

  // Alert Actions
  addAlert: (alert: Alert) => void;
  updateAlert: (id: string, updates: Partial<Alert>) => void;
  resolveAlert: (id: string) => void;
  simulateHighRiskAlert: () => void;
  reassignAlert: (alertId: string, doctorId: string, note: string) => void;

  // Config Actions
  updateConfig: (updates: Partial<AppConfig>) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [doctors, setDoctors] = useState<Doctor[]>(initialDoctors as Doctor[]);
  const [patients, setPatients] = useState<Patient[]>(initialPatients as Patient[]);
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts as Alert[]);
  const [config, setConfig] = useState<AppConfig>({
    aiConfig: {
      riskThresholds: { low: 40, medium: 70, high: 100 },
      symptomWeights: { pain: 80, fever: 90, swelling: 60, mobility: 50 },
      autoEscalation: true,
    },
    messageTemplates: [
      { id: '1', name: "Daily Check-in", content: "Hello {name}, this is your daily check-in. How are you feeling today?" },
      { id: '2', name: "High Risk Alert", content: "URGENT: {name}, we detected concerning symptoms. A doctor will contact you shortly." },
      { id: '3', name: "Post-Op Reminder", content: "Hi {name}, please remember to take your medication as prescribed." }
    ],
    messaging: {
      whatsapp: true,
      smsFallback: true,
      checkInFrequency: 'Daily'
    }
  });

  // Derived Stats
  const stats = [
    {
      title: "Total Patients",
      value: patients.length.toString(),
      change: "+2%", // Dynamic calc omitted for brevity
      trend: "up",
      icon: adminStats[0].icon, // Reuse icons from mock
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      title: "Available Doctors",
      value: doctors.filter(d => d.status === 'Available').length.toString(),
      change: "Live",
      trend: "flat",
      icon: adminStats[1].icon,
      color: "text-emerald-600",
      bg: "bg-emerald-50"
    },
    {
      title: "Active Alerts",
      value: alerts.filter(a => a.status === 'Pending').length.toString(),
      change: "Urgent",
      trend: alerts.filter(a => a.status === 'Pending').length > 5 ? "down" : "up",
      icon: adminStats[2].icon,
      color: "text-red-600",
      bg: "bg-red-50"
    },
    {
      title: "System Health",
      value: "99.9%",
      change: "Stable",
      trend: "flat",
      icon: adminStats[3].icon,
      color: "text-teal-600",
      bg: "bg-teal-50"
    }
  ];

  // Doctor Actions
  const addDoctor = (newDoc: Omit<Doctor, 'id' | 'patientsCount' | 'alertsHandled'>) => {
    const id = `D-${Date.now()}`;
    setDoctors([...doctors, { ...newDoc, id, patientsCount: 0, alertsHandled: 0 }]);
  };

  const updateDoctor = (id: string, updates: Partial<Doctor>) => {
    setDoctors(doctors.map(d => d.id === id ? { ...d, ...updates } : d));
  };

  const deleteDoctor = (id: string) => {
    setDoctors(doctors.filter(d => d.id !== id));
  };

  const toggleDoctorStatus = (id: string, status: DoctorStatus) => {
    updateDoctor(id, { status });
  };

  // Patient Actions
  const addPatient = (newPatient: Omit<Patient, 'id' | 'daysPostOp' | 'recoveryScore'>) => {
    const id = `P-${Date.now()}`;
    setPatients([...patients, { ...newPatient, id, daysPostOp: 0, recoveryScore: 100 }]);
  };

  const updatePatient = (id: string, updates: Partial<Patient>) => {
    setPatients(patients.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deletePatient = (id: string) => {
    setPatients(patients.filter(p => p.id !== id));
  };

  const assignDoctorToPatient = (patientId: string, doctorId: string) => {
    const doctor = doctors.find(d => d.id === doctorId);
    if (doctor) {
      // Update patient
      updatePatient(patientId, { doctor: doctor.name, doctorId: doctor.id });
      // Update doctor stats (simple increment for now)
      updateDoctor(doctorId, { patientsCount: doctor.patientsCount + 1 });
    }
  };

  // Alert Actions
  const addAlert = (alert: Alert) => {
    setAlerts([alert, ...alerts]);
  };

  const updateAlert = (id: string, updates: Partial<Alert>) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const resolveAlert = (id: string) => {
    updateAlert(id, { status: 'Resolved' });
  };

  const simulateHighRiskAlert = () => {
    const randomPatient = patients[Math.floor(Math.random() * patients.length)];
    
    // Auto-routing logic
    let assignedDoctor = doctors.find(d => d.name === randomPatient.doctor);
    let routedTo = assignedDoctor?.name || "Unassigned";
    let doctorStatus = assignedDoctor?.status || "Unknown";
    let routingNote = "Routed to assigned doctor.";

    if (assignedDoctor?.status !== 'Available') {
      // Find backup
      const backupDoctor = doctors.find(d => d.status === 'Available');
      if (backupDoctor) {
        routedTo = backupDoctor.name;
        doctorStatus = backupDoctor.status;
        routingNote = `Assigned doctor ${assignedDoctor?.name} unavailable (${assignedDoctor?.status}). Auto-routed to ${backupDoctor.name}.`;
      } else {
        routedTo = "Admin Escalation";
        doctorStatus = "System";
        routingNote = "No doctors available. Escalated to Admin.";
      }
    }

    const newAlert: Alert = {
      id: `A-${Date.now()}`,
      patientId: randomPatient.id,
      patientName: randomPatient.name,
      reason: "Simulated High Risk Event (Vital Signs)",
      severity: 'High',
      time: 'Just now',
      status: 'Pending',
      routedTo,
      doctorStatus,
      history: [
        {
          step: 'Alert Triggered',
          time: 'Just now',
          actor: 'AI System',
          details: 'Detected critical anomaly in vital signs.',
          status: 'completed'
        },
        {
          step: 'Auto-Routing',
          time: 'Just now',
          actor: 'System',
          details: routingNote,
          status: 'completed'
        }
      ]
    };

    addAlert(newAlert);
  };

  const reassignAlert = (alertId: string, doctorId: string, note: string) => {
    const doctor = doctors.find(d => d.id === doctorId);
    const alert = alerts.find(a => a.id === alertId);
    
    if (doctor && alert) {
      const newHistoryItem: AlertHistoryItem = {
        step: 'Manual Reassignment',
        time: 'Just now',
        actor: 'Admin',
        details: `Reassigned from ${alert.routedTo} to ${doctor.name}. Note: ${note}`,
        status: 'completed'
      };

      updateAlert(alertId, {
        routedTo: doctor.name,
        doctorStatus: doctor.status,
        history: [...(alert.history || []), newHistoryItem]
      });
    }
  };

  // Config Actions
  const updateConfig = (updates: Partial<AppConfig>) => {
    setConfig({ ...config, ...updates });
  };

  return (
    <AdminContext.Provider value={{
      doctors,
      patients,
      alerts,
      config,
      stats,
      addDoctor,
      updateDoctor,
      deleteDoctor,
      toggleDoctorStatus,
      addPatient,
      updatePatient,
      deletePatient,
      assignDoctorToPatient,
      addAlert,
      updateAlert,
      resolveAlert,
      simulateHighRiskAlert,
      reassignAlert,
      updateConfig
    }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
