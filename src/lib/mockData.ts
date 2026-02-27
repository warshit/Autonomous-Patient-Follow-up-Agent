import { 
  Users, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  Clock,
  Calendar,
  FileText,
  MessageSquare,
  ShieldAlert,
  Stethoscope,
  Database,
  Server,
  Smartphone
} from 'lucide-react';

export const currentUser = {
  name: "Dr. Sarah Mitchell",
  role: "Senior Surgeon",
  hospital: "St. Mary's General Hospital",
  avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=200&h=200&auto=format&fit=crop"
};

export const adminUser = {
  name: "Admin User",
  role: "System Administrator",
  hospital: "St. Mary's General Hospital",
  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&h=200&auto=format&fit=crop"
};

export const stats = [
  {
    title: "Total Patients",
    value: "1,248",
    change: "+12%",
    trend: "up",
    icon: Users,
    color: "text-blue-600",
    bg: "bg-blue-50"
  },
  {
    title: "Active Monitoring",
    value: "142",
    change: "+5%",
    trend: "up",
    icon: Activity,
    color: "text-emerald-600",
    bg: "bg-emerald-50"
  },
  {
    title: "High Risk Alerts",
    value: "7",
    change: "-2",
    trend: "down",
    icon: AlertTriangle,
    color: "text-red-600",
    bg: "bg-red-50"
  },
  {
    title: "Today's Check-ins",
    value: "89%",
    change: "+4%",
    trend: "up",
    icon: CheckCircle,
    color: "text-indigo-600",
    bg: "bg-indigo-50"
  },
  {
    title: "Avg Recovery Score",
    value: "8.4",
    change: "+0.2",
    trend: "up",
    icon: TrendingUp,
    color: "text-teal-600",
    bg: "bg-teal-50"
  }
];

export const adminStats = [
  {
    title: "Total Doctors",
    value: "48",
    change: "+2",
    trend: "up",
    icon: Stethoscope,
    color: "text-blue-600",
    bg: "bg-blue-50"
  },
  {
    title: "Available Now",
    value: "12",
    change: "-3",
    trend: "down",
    icon: Clock,
    color: "text-emerald-600",
    bg: "bg-emerald-50"
  },
  {
    title: "Messages Sent",
    value: "1,842",
    change: "+15%",
    trend: "up",
    icon: MessageSquare,
    color: "text-indigo-600",
    bg: "bg-indigo-50"
  },
  {
    title: "System Health",
    value: "99.9%",
    change: "Stable",
    trend: "flat",
    icon: Server,
    color: "text-teal-600",
    bg: "bg-teal-50"
  }
];

export const systemHealth = [
  { name: "Twilio Gateway", status: "Operational", latency: "45ms", icon: Smartphone },
  { name: "AI Inference Engine", status: "Operational", latency: "120ms", icon: Activity },
  { name: "Patient Database", status: "Operational", latency: "12ms", icon: Database },
];

export const doctors = [
  {
    id: "D-101",
    name: "Dr. Sarah Mitchell",
    specialization: "Orthopedics",
    status: "Available",
    workingHours: "08:00 - 16:00",
    patientsCount: 24,
    alertsHandled: 156,
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=200&h=200&auto=format&fit=crop",
    email: "s.mitchell@hospital.com",
    phone: "+1 (555) 123-4567"
  },
  {
    id: "D-102",
    name: "Dr. Alan Grant",
    specialization: "General Surgery",
    status: "In Consultation",
    workingHours: "09:00 - 17:00",
    patientsCount: 18,
    alertsHandled: 98,
    avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=200&h=200&auto=format&fit=crop",
    email: "a.grant@hospital.com",
    phone: "+1 (555) 234-5678"
  },
  {
    id: "D-103",
    name: "Dr. Emily Wong",
    specialization: "Neurology",
    status: "Off Duty",
    workingHours: "07:00 - 15:00",
    patientsCount: 12,
    alertsHandled: 45,
    avatar: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=200&h=200&auto=format&fit=crop",
    email: "e.wong@hospital.com",
    phone: "+1 (555) 345-6789"
  },
  {
    id: "D-104",
    name: "Dr. James Wilson",
    specialization: "Cardiology",
    status: "On Leave",
    workingHours: "08:00 - 16:00",
    patientsCount: 30,
    alertsHandled: 210,
    avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=200&h=200&auto=format&fit=crop",
    email: "j.wilson@hospital.com",
    phone: "+1 (555) 456-7890"
  },
  {
    id: "D-105",
    name: "Dr. Lisa Cuddy",
    specialization: "Endocrinology",
    status: "Available",
    workingHours: "10:00 - 18:00",
    patientsCount: 15,
    alertsHandled: 67,
    avatar: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?q=80&w=200&h=200&auto=format&fit=crop",
    email: "l.cuddy@hospital.com",
    phone: "+1 (555) 567-8901"
  }
];

export const patients = [
  {
    id: "P-1001",
    name: "James Wilson",
    age: 45,
    surgeryType: "ACL Reconstruction",
    surgeryDate: "2023-10-15",
    daysPostOp: 3,
    lastResponse: "2 hours ago",
    riskStatus: "Low",
    doctor: "Dr. Sarah Mitchell",
    recoveryScore: 92,
    symptoms: {
      pain: 3,
      fever: false,
      swelling: "Mild",
      mobility: "Good",
      medication: true
    }
  },
  {
    id: "P-1002",
    name: "Elena Rodriguez",
    age: 62,
    surgeryType: "Hip Replacement",
    surgeryDate: "2023-10-12",
    daysPostOp: 6,
    lastResponse: "15 mins ago",
    riskStatus: "High",
    doctor: "Dr. Sarah Mitchell",
    recoveryScore: 45,
    symptoms: {
      pain: 8,
      fever: true,
      swelling: "Severe",
      mobility: "Limited",
      medication: true
    }
  },
  {
    id: "P-1003",
    name: "Michael Chen",
    age: 28,
    surgeryType: "Appendectomy",
    surgeryDate: "2023-10-16",
    daysPostOp: 2,
    lastResponse: "1 day ago",
    riskStatus: "Medium",
    doctor: "Dr. Alan Grant",
    recoveryScore: 78,
    symptoms: {
      pain: 5,
      fever: false,
      swelling: "Moderate",
      mobility: "Moderate",
      medication: false
    }
  },
  {
    id: "P-1004",
    name: "Sarah Johnson",
    age: 35,
    surgeryType: "Gallbladder Removal",
    surgeryDate: "2023-10-14",
    daysPostOp: 4,
    lastResponse: "4 hours ago",
    riskStatus: "Low",
    doctor: "Dr. Sarah Mitchell",
    recoveryScore: 88,
    symptoms: {
      pain: 2,
      fever: false,
      swelling: "Mild",
      mobility: "Good",
      medication: true
    }
  },
  {
    id: "P-1005",
    name: "Robert Taylor",
    age: 58,
    surgeryType: "Spinal Fusion",
    surgeryDate: "2023-10-10",
    daysPostOp: 8,
    lastResponse: "30 mins ago",
    riskStatus: "Medium",
    doctor: "Dr. Emily Wong",
    recoveryScore: 65,
    symptoms: {
      pain: 6,
      fever: false,
      swelling: "Moderate",
      mobility: "Restricted",
      medication: true
    }
  }
];

export const alerts = [
  {
    id: "A-501",
    patientId: "P-1002",
    patientName: "Elena Rodriguez",
    reason: "High fever reported (39.2°C)",
    severity: "High",
    time: "15 mins ago",
    status: "Pending",
    routedTo: "Dr. Sarah Mitchell",
    doctorStatus: "Available"
  },
  {
    id: "A-502",
    patientId: "P-1003",
    patientName: "Michael Chen",
    reason: "Missed medication check-in",
    severity: "Medium",
    time: "2 hours ago",
    status: "Resolved",
    routedTo: "Dr. Alan Grant",
    doctorStatus: "In Consultation"
  },
  {
    id: "A-503",
    patientId: "P-1005",
    patientName: "Robert Taylor",
    reason: "Increased pain levels reported",
    severity: "Medium",
    time: "4 hours ago",
    status: "Pending",
    routedTo: "Dr. Emily Wong",
    doctorStatus: "Off Duty"
  },
  {
    id: "A-504",
    patientId: "P-1001",
    patientName: "James Wilson",
    reason: "Abnormal swelling reported",
    severity: "Low",
    time: "1 day ago",
    status: "Resolved",
    routedTo: "Dr. Sarah Mitchell",
    doctorStatus: "Available"
  }
];

export const chatHistory = [
  {
    id: 1,
    sender: "system",
    text: "Hello Elena, this is your daily check-in. How are you feeling today?",
    time: "09:00 AM"
  },
  {
    id: 2,
    sender: "patient",
    text: "I'm not feeling great. My leg hurts a lot more than yesterday.",
    time: "09:15 AM"
  },
  {
    id: 3,
    sender: "system",
    text: "I'm sorry to hear that. On a scale of 1-10, how would you rate your pain?",
    time: "09:15 AM"
  },
  {
    id: 4,
    sender: "patient",
    text: "It's about an 8. And I feel really hot and sweaty.",
    time: "09:16 AM"
  },
  {
    id: 5,
    sender: "ai",
    text: "Risk Assessment: High. Symptoms indicate potential infection (Fever + High Pain). Alerting Dr. Mitchell immediately.",
    time: "09:16 AM",
    isInternal: true
  },
  {
    id: 6,
    sender: "system",
    text: "Thank you for letting us know, Elena. I've alerted Dr. Mitchell about your symptoms. Please rest and monitor your temperature if possible. A nurse will call you shortly.",
    time: "09:17 AM"
  }
];

export const recoveryData = [
  { day: 'Day 1', score: 60 },
  { day: 'Day 2', score: 65 },
  { day: 'Day 3', score: 55 },
  { day: 'Day 4', score: 58 },
  { day: 'Day 5', score: 45 },
  { day: 'Day 6', score: 42 },
];

export const symptomFrequency = [
  { name: 'Pain', value: 45 },
  { name: 'Swelling', value: 30 },
  { name: 'Fever', value: 15 },
  { name: 'Nausea', value: 10 },
];

export const riskDistribution = [
  { name: 'Low Risk', value: 65, color: '#10b981' },
  { name: 'Medium Risk', value: 25, color: '#f59e0b' },
  { name: 'High Risk', value: 10, color: '#ef4444' },
];

export const messageTemplates = [
  { id: 1, name: "Daily Check-in", content: "Hello {name}, this is your daily check-in. How are you feeling today?" },
  { id: 2, name: "Medication Reminder", content: "Hi {name}, please remember to take your prescribed medication." },
  { id: 3, name: "High Pain Alert", content: "We noticed you reported high pain levels. A doctor has been notified." },
];

export const aiConfig = {
  riskThresholds: { low: 40, medium: 70, high: 100 },
  symptomWeights: { pain: 0.8, fever: 0.9, swelling: 0.6, mobility: 0.5 },
  autoEscalation: true
};
