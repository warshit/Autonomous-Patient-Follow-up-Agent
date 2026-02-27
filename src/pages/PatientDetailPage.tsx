import { useParams } from 'react-router-dom';
import { patients, chatHistory } from '@/lib/mockData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress'; // We need to create this
import { 
  User, 
  Calendar, 
  Phone, 
  MessageSquare, 
  ShieldAlert, 
  TrendingUp, 
  Thermometer,
  Activity,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock recovery data for the chart
const recoveryTrend = [
  { day: 'Day 1', score: 40 },
  { day: 'Day 2', score: 45 },
  { day: 'Day 3', score: 35 }, // Dip
  { day: 'Day 4', score: 50 },
  { day: 'Day 5', score: 60 },
  { day: 'Day 6', score: 45 }, // Current dip
];

export default function PatientDetailPage() {
  const { id } = useParams();
  // In a real app, fetch by ID. Here we just grab the first high risk one for demo if ID matches, else find.
  const patient = patients.find(p => p.id === id) || patients[1]; 

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">{patient.name}</h1>
            <Badge variant="outline" className="text-slate-500">{patient.id}</Badge>
            <Badge variant={
              patient.riskStatus === 'High' ? 'danger' : 
              patient.riskStatus === 'Medium' ? 'warning' : 'success'
            }>
              {patient.riskStatus} Risk
            </Badge>
          </div>
          <p className="text-slate-500 mt-1">
            {patient.surgeryType} • {patient.age} Years Old • {patient.doctor}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Phone className="w-4 h-4 mr-2" /> Call Patient
          </Button>
          <Button variant="destructive">
            <ShieldAlert className="w-4 h-4 mr-2" /> Escalate Case
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Metrics & Profile */}
        <div className="space-y-6">
          {/* Key Metrics */}
          <Card className="shadow-md border-slate-200">
            <CardHeader>
              <CardTitle>Current Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between mb-2 text-sm">
                  <span className="text-slate-600">Recovery Score</span>
                  <span className="font-bold text-slate-900">{patient.recoveryScore}/100</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-4">
                  <div 
                    className={`h-full rounded-full ${
                      patient.recoveryScore > 80 ? 'bg-emerald-500' : 
                      patient.recoveryScore > 50 ? 'bg-amber-500' : 'bg-red-500'
                    }`} 
                    style={{ width: `${patient.recoveryScore}%` }} 
                  />
                </div>
                
                {/* Recovery Trend Mini Chart */}
                <div className="h-32 w-full mt-4">
                  <p className="text-xs font-medium text-slate-500 mb-2">7-Day Trend</p>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={recoveryTrend}>
                      <Line 
                        type="monotone" 
                        dataKey="score" 
                        stroke="#2563eb" 
                        strokeWidth={2} 
                        dot={false}
                      />
                      <Tooltip 
                        contentStyle={{ fontSize: '12px', padding: '4px 8px' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-2 text-slate-500 mb-2">
                    <Activity className="w-4 h-4" />
                    <span className="text-xs font-medium uppercase">Pain Level</span>
                  </div>
                  <div className="text-2xl font-bold text-slate-900">{patient.symptoms.pain}/10</div>
                  <div className="text-xs text-slate-500 mt-1">Reported 15m ago</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-2 text-slate-500 mb-2">
                    <Thermometer className="w-4 h-4" />
                    <span className="text-xs font-medium uppercase">Fever</span>
                  </div>
                  <div className={`text-2xl font-bold ${patient.symptoms.fever ? 'text-red-600' : 'text-slate-900'}`}>
                    {patient.symptoms.fever ? 'Yes' : 'No'}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Temp: 39.2°C</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-md">
                  <span className="text-sm text-slate-600">Swelling</span>
                  <Badge variant={patient.symptoms.swelling === 'Severe' ? 'danger' : 'outline'}>
                    {patient.symptoms.swelling}
                  </Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-md">
                  <span className="text-sm text-slate-600">Mobility</span>
                  <span className="text-sm font-medium text-slate-900">{patient.symptoms.mobility}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-md">
                  <span className="text-sm text-slate-600">Meds Taken</span>
                  {patient.symptoms.medication ? (
                    <Badge variant="success" className="gap-1"><CheckCircle2 className="w-3 h-3" /> Yes</Badge>
                  ) : (
                    <Badge variant="danger">Missed</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Analysis */}
          <Card className="shadow-md border-slate-200 bg-gradient-to-br from-white to-blue-50/50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <CardTitle>AI Risk Analysis</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-white rounded-lg border border-blue-100 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-500">Risk Confidence</span>
                  <span className="text-sm font-bold text-blue-600">94%</span>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">
                  Patient is exhibiting signs of <span className="font-semibold text-red-600">post-operative infection</span>. 
                  Combination of high fever (39.2°C) and increasing pain levels (8/10) on Day 6 is anomalous.
                </p>
              </div>
              
              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">Recommended Actions</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm text-slate-700">
                    <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                    Immediate tele-consultation required.
                  </li>
                  <li className="flex items-start gap-2 text-sm text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                    Prescribe antibiotics if infection confirmed.
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Middle Column: Chat */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="h-[600px] flex flex-col shadow-md border-slate-200">
            <CardHeader className="border-b border-slate-100 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base">WhatsApp Follow-up</CardTitle>
                    <CardDescription>Automated Session #42 • Today</CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Active Session
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
              {chatHistory.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex ${msg.sender === 'patient' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] ${msg.sender === 'ai' ? 'w-full max-w-full' : ''}`}>
                    {msg.sender === 'ai' ? (
                      <div className="bg-slate-100 border border-slate-200 rounded-lg p-3 my-2 flex gap-3">
                        <div className="p-1.5 bg-slate-200 rounded-md h-fit">
                          <ShieldAlert className="w-4 h-4 text-slate-600" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-700 uppercase mb-1">AI Internal Log</p>
                          <p className="text-sm text-slate-600">{msg.text}</p>
                        </div>
                      </div>
                    ) : (
                      <div className={`rounded-2xl px-4 py-3 shadow-sm ${
                        msg.sender === 'patient' 
                          ? 'bg-green-100 text-slate-900 rounded-tr-none' 
                          : 'bg-white text-slate-900 border border-slate-100 rounded-tl-none'
                      }`}>
                        <p className="text-sm">{msg.text}</p>
                        <p className={`text-[10px] mt-1 text-right ${
                          msg.sender === 'patient' ? 'text-green-700/70' : 'text-slate-400'
                        }`}>
                          {msg.time}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
            <div className="p-4 border-t border-slate-100 bg-white rounded-b-xl">
              <div className="flex gap-2">
                <Input placeholder="Type a manual message to override AI..." className="flex-1" />
                <Button>Send</Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
