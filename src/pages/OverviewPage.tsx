import { stats, alerts } from '@/lib/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Activity, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function OverviewPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
        <p className="text-slate-500">Welcome back, Dr. Mitchell. Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="border-none shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                {stat.trend === 'up' ? (
                  <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                    {stat.change}
                  </span>
                ) : (
                  <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full">
                    {stat.change}
                  </span>
                )}
              </div>
              <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
              <p className="text-sm text-slate-500 font-medium">{stat.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Alerts */}
        <Card className="lg:col-span-2 border-slate-200 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Alerts</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard/alerts">
                View All <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alerts.slice(0, 3).map((alert) => (
                <div key={alert.id} className="flex items-start p-4 rounded-lg bg-slate-50 border border-slate-100">
                  <div className={`mt-1 w-2 h-2 rounded-full mr-4 ${
                    alert.severity === 'High' ? 'bg-red-500' : 
                    alert.severity === 'Medium' ? 'bg-amber-500' : 'bg-blue-500'
                  }`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-slate-900">{alert.patientName}</h4>
                      <span className="text-xs text-slate-500 flex items-center">
                        <Clock className="w-3 h-3 mr-1" /> {alert.time}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{alert.reason}</p>
                    <div className="flex items-center space-x-2">
                      <Badge variant={
                        alert.severity === 'High' ? 'danger' : 
                        alert.severity === 'Medium' ? 'warning' : 'info'
                      }>
                        {alert.severity} Priority
                      </Badge>
                      <Badge variant="outline">{alert.status}</Badge>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" asChild>
                    <Link to={`/dashboard/patients/${alert.patientId}`}>Review</Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Check-in Flow Visualization */}
        <Card className="border-slate-200 shadow-md">
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative pl-8 space-y-8 before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              <div className="relative">
                <div className="absolute -left-8 top-1 w-7 h-7 rounded-full bg-blue-100 border-2 border-blue-600 flex items-center justify-center z-10">
                  <Activity className="w-3 h-3 text-blue-600" />
                </div>
                <h4 className="text-sm font-semibold text-slate-900">Automated Check-ins</h4>
                <p className="text-xs text-slate-500 mt-1">142 messages sent today at 09:00 AM</p>
              </div>
              
              <div className="relative">
                <div className="absolute -left-8 top-1 w-7 h-7 rounded-full bg-emerald-100 border-2 border-emerald-600 flex items-center justify-center z-10">
                  <div className="w-2 h-2 bg-emerald-600 rounded-full" />
                </div>
                <h4 className="text-sm font-semibold text-slate-900">Patient Responses</h4>
                <p className="text-xs text-slate-500 mt-1">126 responses received (89%)</p>
              </div>

              <div className="relative">
                <div className="absolute -left-8 top-1 w-7 h-7 rounded-full bg-purple-100 border-2 border-purple-600 flex items-center justify-center z-10">
                  <div className="w-2 h-2 bg-purple-600 rounded-full" />
                </div>
                <h4 className="text-sm font-semibold text-slate-900">AI Analysis</h4>
                <p className="text-xs text-slate-500 mt-1">Processing complete. 7 anomalies detected.</p>
              </div>

              <div className="relative">
                <div className="absolute -left-8 top-1 w-7 h-7 rounded-full bg-amber-100 border-2 border-amber-600 flex items-center justify-center z-10">
                  <div className="w-2 h-2 bg-amber-600 rounded-full" />
                </div>
                <h4 className="text-sm font-semibold text-slate-900">Doctor Alerts</h4>
                <p className="text-xs text-slate-500 mt-1">3 high priority alerts require attention</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
