import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { recoveryData } from '@/lib/mockData';
import { Calendar, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdmin } from '@/context/AdminContext';
import { useMemo } from 'react';

export default function AnalyticsPage() {
  const { patients, alerts } = useAdmin();

  const riskDistribution = useMemo(() => {
    const counts = { High: 0, Medium: 0, Low: 0 };
    patients.forEach(p => {
      if (p.riskStatus === 'High') counts.High++;
      else if (p.riskStatus === 'Medium') counts.Medium++;
      else counts.Low++;
    });

    return [
      { name: 'Low Risk', value: counts.Low, color: '#10b981' },
      { name: 'Medium Risk', value: counts.Medium, color: '#f59e0b' },
      { name: 'High Risk', value: counts.High, color: '#ef4444' },
    ];
  }, [patients]);

  const symptomFrequency = useMemo(() => {
    const counts: Record<string, number> = { Pain: 0, Fever: 0, Swelling: 0, Medication: 0, Other: 0 };
    alerts.forEach(a => {
      const reason = a.reason.toLowerCase();
      if (reason.includes('pain')) counts.Pain++;
      else if (reason.includes('fever')) counts.Fever++;
      else if (reason.includes('swelling')) counts.Swelling++;
      else if (reason.includes('medication')) counts.Medication++;
      else counts.Other++;
    });

    return Object.entries(counts)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({ name, value }));
  }, [alerts]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Analytics Dashboard</h1>
          <p className="text-slate-500">Deep dive into patient recovery trends and system performance.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="h-9">
            <Calendar className="w-4 h-4 mr-2" /> Last 30 Days
          </Button>
          <Button className="h-9">
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh Data
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recovery Progress Over Time */}
        <Card className="shadow-md border-slate-200">
          <CardHeader>
            <CardTitle>Average Recovery Progress</CardTitle>
            <CardDescription>Patient recovery scores over the first week post-op</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={recoveryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  itemStyle={{ color: '#0f172a' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#2563eb" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }} 
                  activeDot={{ r: 6 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Symptom Frequency */}
        <Card className="shadow-md border-slate-200">
          <CardHeader>
            <CardTitle>Reported Symptoms Frequency</CardTitle>
            <CardDescription>Most common complaints based on active alerts</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={symptomFrequency} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} width={80} />
                <Tooltip 
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Risk Distribution */}
        <Card className="shadow-md border-slate-200 lg:col-span-1">
          <CardHeader>
            <CardTitle>Patient Risk Distribution</CardTitle>
            <CardDescription>Current risk stratification of active patients</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {riskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* AI Performance Metrics */}
        <Card className="shadow-md border-slate-200 lg:col-span-1">
          <CardHeader>
            <CardTitle>AI Diagnostic Accuracy</CardTitle>
            <CardDescription>Comparison of AI predictions vs Doctor confirmations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-slate-700">True Positives (Correct Alerts)</span>
                <span className="font-bold text-emerald-600">92%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[92%]" />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-slate-700">False Positives (Unnecessary Alerts)</span>
                <span className="font-bold text-amber-600">5%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 w-[5%]" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-slate-700">Missed Detections</span>
                <span className="font-bold text-red-600">3%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 w-[3%]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
