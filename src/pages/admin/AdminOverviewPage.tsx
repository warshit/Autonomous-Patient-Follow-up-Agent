import { useAdmin } from '@/context/AdminContext';
import { alerts, systemHealth } from '@/lib/mockData'; // Keep systemHealth mock for now
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Clock, CheckCircle2, AlertTriangle, Activity, Server, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function AdminOverviewPage() {
  const { stats, alerts: contextAlerts } = useAdmin();

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">System Overview</h1>
          <p className="text-slate-500 mt-1">Real-time monitoring of hospital operations and AI agents.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
            Last updated: Just now
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="border-none shadow-sm hover:shadow-xl transition-all duration-300 group overflow-hidden relative">
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.bg} group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                {stat.trend === 'up' ? (
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                    {stat.change}
                  </span>
                ) : stat.trend === 'down' ? (
                  <span className="text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-full border border-red-100">
                    {stat.change}
                  </span>
                ) : (
                  <span className="text-xs font-bold text-slate-600 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100">
                    {stat.change}
                  </span>
                )}
              </div>
              <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{stat.value}</h3>
              <p className="text-sm text-slate-500 font-medium mt-1">{stat.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* System Health */}
        <Card className="border-slate-200/60 shadow-sm">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50">
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {systemHealth.map((service, index) => (
                <div key={index} className="flex items-center justify-between p-6 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-slate-100 rounded-lg">
                      <service.icon className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{service.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">Latency: <span className="font-mono">{service.latency}</span></p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-sm font-medium text-emerald-700">
                      {service.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Alerts Activity */}
        <Card className="lg:col-span-2 border-slate-200/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 bg-slate-50/50">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              Recent Alert Routing
            </CardTitle>
            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50" asChild>
              <Link to="/admin/alerts">
                View All Activity <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {contextAlerts.slice(0, 3).map((alert) => (
                <div key={alert.id} className="group flex items-start p-4 rounded-xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all duration-200">
                  <div className={`mt-1.5 w-2.5 h-2.5 rounded-full mr-4 shadow-sm ${
                    alert.severity === 'High' ? 'bg-red-500 shadow-red-200' : 
                    alert.severity === 'Medium' ? 'bg-amber-500 shadow-amber-200' : 'bg-blue-500 shadow-blue-200'
                  }`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">{alert.reason}</h4>
                      <span className="text-xs text-slate-400 flex items-center bg-slate-50 px-2 py-1 rounded-full">
                        <Clock className="w-3 h-3 mr-1" /> {alert.time}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600 mb-3">
                      <span className="flex items-center gap-1">
                        <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">P</span>
                        {alert.patientName}
                      </span>
                      <ArrowRight className="w-3 h-3 text-slate-300" />
                      <span className="flex items-center gap-1 font-medium text-slate-900">
                        <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">D</span>
                        {alert.routedTo}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        alert.severity === 'High' ? 'danger' : 
                        alert.severity === 'Medium' ? 'warning' : 'info'
                      } className="rounded-md px-2">
                        {alert.severity} Priority
                      </Badge>
                      <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">
                        {alert.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
