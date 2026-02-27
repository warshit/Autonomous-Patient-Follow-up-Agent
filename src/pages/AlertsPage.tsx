import { alerts } from '@/lib/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, Clock, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AlertsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Alerts & Notifications</h1>
          <p className="text-slate-500">Manage high-priority patient incidents.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Mark All Read</Button>
        </div>
      </div>

      <Card className="shadow-md border-slate-200">
        <CardHeader>
          <CardTitle>Active Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div 
                key={alert.id} 
                className={`flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg border ${
                  alert.severity === 'High' ? 'bg-red-50 border-red-100' : 
                  alert.severity === 'Medium' ? 'bg-amber-50 border-amber-100' : 
                  'bg-white border-slate-100'
                }`}
              >
                <div className="flex items-start gap-4 mb-4 md:mb-0">
                  <div className={`p-2 rounded-full ${
                    alert.severity === 'High' ? 'bg-red-100 text-red-600' : 
                    alert.severity === 'Medium' ? 'bg-amber-100 text-amber-600' : 
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {alert.severity === 'High' ? <AlertTriangle className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-900">{alert.reason}</h3>
                      <Badge variant={
                        alert.severity === 'High' ? 'danger' : 
                        alert.severity === 'Medium' ? 'warning' : 'info'
                      }>
                        {alert.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600">
                      Patient: <span className="font-medium">{alert.patientName}</span> • {alert.time}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/dashboard/patients/${alert.patientId}`}>View Patient</Link>
                  </Button>
                  <Button size="sm" variant={alert.status === 'Resolved' ? 'secondary' : 'default'}>
                    {alert.status === 'Resolved' ? 'Resolved' : 'Acknowledge'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
