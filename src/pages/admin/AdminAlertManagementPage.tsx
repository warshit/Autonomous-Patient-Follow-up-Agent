import { useState } from 'react';
import { useAdmin, Alert } from '@/context/AdminContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, Clock, Bell, UserPlus, History, GitMerge, User, Bot, PlayCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export default function AdminAlertManagementPage() {
  const { alerts, doctors, simulateHighRiskAlert, reassignAlert, resolveAlert } = useAdmin();
  const [filter, setFilter] = useState('All');
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [isReassignDialogOpen, setIsReassignDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [reassignNote, setReassignNote] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  const filteredAlerts = alerts.filter(alert => filter === 'All' || alert.status === filter);

  const handleReassignClick = (alert: Alert) => {
    setSelectedAlert(alert);
    const currentDoc = doctors.find(d => d.name === alert.routedTo);
    setSelectedDoctor(currentDoc?.id || '');
    setReassignNote('');
    setIsReassignDialogOpen(true);
  };

  const handleHistoryClick = (alert: Alert) => {
    setSelectedAlert(alert);
    setIsHistoryDialogOpen(true);
  };

  const handleConfirmReassign = () => {
    if (selectedAlert && selectedDoctor) {
      setIsAssigning(true);
      // Simulate API delay
      setTimeout(() => {
        reassignAlert(selectedAlert.id, selectedDoctor, reassignNote);
        setIsAssigning(false);
        setIsReassignDialogOpen(false);
      }, 800);
    }
  };

  const getDoctorStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'In Consultation': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'Off Duty': return 'text-slate-500 bg-slate-100 border-slate-200';
      case 'On Leave': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Alert Management</h1>
          <p className="text-slate-500">Monitor, route, and resolve high-priority patient incidents.</p>
        </div>
        <div className="flex gap-2 items-center">
          <Button 
            className="bg-red-600 hover:bg-red-700 text-white mr-4 shadow-md shadow-red-900/20"
            onClick={simulateHighRiskAlert}
          >
            <PlayCircle className="w-4 h-4 mr-2" /> Simulate High Risk Alert
          </Button>
          <div className="h-8 w-px bg-slate-200 mx-2 hidden sm:block"></div>
          <Button variant={filter === 'All' ? 'default' : 'outline'} onClick={() => setFilter('All')}>All</Button>
          <Button variant={filter === 'Pending' ? 'default' : 'outline'} onClick={() => setFilter('Pending')}>Pending</Button>
          <Button variant={filter === 'Resolved' ? 'default' : 'outline'} onClick={() => setFilter('Resolved')}>Resolved</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <p className="text-slate-500">No alerts found matching the current filter.</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <Card key={alert.id} className={`border-l-4 ${
              alert.severity === 'High' ? 'border-l-red-500' : 
              alert.severity === 'Medium' ? 'border-l-amber-500' : 
              'border-l-blue-500'
            }`}>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row justify-between gap-6">
                  {/* Alert Details */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                          alert.severity === 'High' ? 'bg-red-100 text-red-600' : 
                          alert.severity === 'Medium' ? 'bg-amber-100 text-amber-600' : 
                          'bg-blue-100 text-blue-600'
                        }`}>
                          {alert.severity === 'High' ? <AlertTriangle className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-slate-900">{alert.reason}</h3>
                          <div className="flex items-center gap-2 text-sm text-slate-500">
                            <Clock className="w-3 h-3" />
                            <span>Triggered {alert.time}</span>
                            <span>•</span>
                            <span>ID: {alert.id}</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant={
                        alert.severity === 'High' ? 'danger' : 
                        alert.severity === 'Medium' ? 'warning' : 'info'
                      } className="px-3 py-1">
                        {alert.severity} Priority
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
                      <div>
                        <p className="text-xs font-medium text-slate-500 uppercase mb-1">Patient</p>
                        <p className="font-medium text-slate-900">{alert.patientName}</p>
                        <p className="text-xs text-slate-500">ID: {alert.patientId}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-500 uppercase mb-1">Current Assignment</p>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-900">{alert.routedTo}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded border ${getDoctorStatusColor(alert.doctorStatus)}`}>
                            {alert.doctorStatus}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col justify-center gap-3 min-w-[200px]">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => handleReassignClick(alert)}
                      disabled={alert.status === 'Resolved'}
                    >
                      <UserPlus className="w-4 h-4 mr-2" /> Reassign Doctor
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => handleHistoryClick(alert)}
                    >
                      <History className="w-4 h-4 mr-2" /> View History
                    </Button>
                    <Button 
                      className={`w-full justify-start ${alert.status === 'Resolved' ? 'bg-slate-100 text-slate-500 hover:bg-slate-200' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}
                      disabled={alert.status === 'Resolved'}
                      onClick={() => resolveAlert(alert.id)}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" /> 
                      {alert.status === 'Resolved' ? 'Resolved' : 'Mark Resolved'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Reassign Dialog */}
      <Dialog open={isReassignDialogOpen} onOpenChange={setIsReassignDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Reassign Alert</DialogTitle>
            <DialogDescription>
              Manually override the auto-routing for this alert.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select Doctor</Label>
              <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a doctor" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map(doc => (
                    <SelectItem key={doc.id} value={doc.id}>
                      <div className="flex items-center justify-between w-full gap-2">
                        <span>{doc.name}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded border ${getDoctorStatusColor(doc.status)}`}>
                          {doc.status}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedDoctor && doctors.find(d => d.id === selectedDoctor)?.status !== 'Available' && (
                <div className="flex items-center gap-2 text-amber-600 text-sm mt-1 bg-amber-50 p-2 rounded">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Warning: This doctor is currently {doctors.find(d => d.id === selectedDoctor)?.status.toLowerCase()}.</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Reassignment Note</Label>
              <Input 
                placeholder="Reason for reassignment..." 
                value={reassignNote}
                onChange={(e) => setReassignNote(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReassignDialogOpen(false)} disabled={isAssigning}>Cancel</Button>
            <Button onClick={handleConfirmReassign} disabled={isAssigning}>
              {isAssigning ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                  Assigning...
                </>
              ) : (
                'Confirm Assignment'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Alert History</DialogTitle>
            <DialogDescription>
              Routing and assignment log for Alert #{selectedAlert?.id}
            </DialogDescription>
          </DialogHeader>
          
          <div className="relative border-l-2 border-slate-200 ml-4 space-y-8 py-4 my-2 max-h-[60vh] overflow-y-auto pr-2">
            {selectedAlert?.history?.map((item, index) => (
              <div key={index} className="relative ml-8">
                <span className={`absolute -left-[41px] top-0 h-6 w-6 rounded-full border-2 border-white flex items-center justify-center shadow-sm ${
                  item.status === 'completed' ? 'bg-blue-100 text-blue-600' : 
                  item.status === 'current' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'
                }`}>
                  <GitMerge className="w-3 h-3" />
                </span>
                <div className="flex flex-col -mt-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-900">{item.step}</h3>
                    <time className="text-xs text-slate-500 font-medium">{item.time}</time>
                  </div>
                  <div className="flex items-center gap-2 mt-1 mb-2">
                    <Badge variant="secondary" className="text-[10px] py-0 h-5 font-normal text-slate-600">
                      {item.actor === 'AI System' || item.actor === 'System' ? <Bot className="w-3 h-3 mr-1" /> : <User className="w-3 h-3 mr-1" />}
                      {item.actor}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-md border border-slate-100">
                    {item.details}
                  </p>
                </div>
              </div>
            ))}
            {(!selectedAlert?.history || selectedAlert.history.length === 0) && (
              <p className="text-sm text-slate-500 italic ml-8">No history available.</p>
            )}
          </div>

          <DialogFooter>
            <Button onClick={() => setIsHistoryDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
