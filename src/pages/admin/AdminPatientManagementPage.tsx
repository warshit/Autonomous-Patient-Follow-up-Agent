import { useState } from 'react';
import { useAdmin, Patient } from '@/context/AdminContext';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, MoreHorizontal, UserPlus, Users, Activity, AlertTriangle, Edit2, Trash2, Edit, MessageSquare, Send } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Textarea } from "@/components/ui/textarea";
import { api } from '@/lib/api';

export default function AdminPatientManagementPage() {
  const { patients, doctors, addPatient, updatePatient, deletePatient, assignDoctorToPatient } = useAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('All');
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isWhatsAppDialogOpen, setIsWhatsAppDialogOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [whatsappMessage, setWhatsappMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState<string | null>(null);

  // New Patient State
  const [newPatient, setNewPatient] = useState({
    name: '',
    age: '',
    surgeryType: '',
    surgeryDate: '',
    riskStatus: 'Low',
    doctor: '',
    doctorId: ''
  });

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          patient.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = riskFilter === 'All' || patient.riskStatus === riskFilter;
    return matchesSearch && matchesRisk;
  });

  const handleAssignDoctor = (patient: any) => {
    setSelectedPatient(patient);
    setSelectedDoctorId(patient.doctorId || '');
    setIsAssignDialogOpen(true);
  };

  const confirmAssignment = () => {
    if (selectedPatient && selectedDoctorId) {
      assignDoctorToPatient(selectedPatient.id, selectedDoctorId);
      setIsAssignDialogOpen(false);
    }
  };

  const handleAddPatient = () => {
    const doctor = doctors.find(d => d.id === newPatient.doctorId);
    addPatient({
      name: newPatient.name,
      age: parseInt(newPatient.age) || 0,
      surgeryType: newPatient.surgeryType,
      surgeryDate: newPatient.surgeryDate,
      riskStatus: newPatient.riskStatus as any,
      doctor: doctor?.name || 'Unassigned',
      doctorId: newPatient.doctorId,
      lastResponse: 'Just now',
      symptoms: { pain: 0, fever: false, swelling: 'None', mobility: 'Good', medication: true }
    });
    setIsAddDialogOpen(false);
    setNewPatient({ name: '', age: '', surgeryType: '', surgeryDate: '', riskStatus: 'Low', doctor: '', doctorId: '' });
  };

  const handleEditClick = (patient: Patient) => {
    setEditingPatient(patient);
    setIsEditDialogOpen(true);
  };

  const handleUpdatePatient = () => {
    if (editingPatient) {
      updatePatient(editingPatient.id, editingPatient);
      setIsEditDialogOpen(false);
      setEditingPatient(null);
    }
  };

  const handleOpenWhatsAppDialog = (patient: any) => {
    setSelectedPatient(patient);
    setWhatsappMessage('');
    setIsWhatsAppDialogOpen(true);
  };

  const handleSendWhatsApp = async () => {
    if (!selectedPatient || !whatsappMessage.trim()) {
      alert('Please enter a message');
      return;
    }

    setIsSendingMessage(true);

    try {
      await api.sendWhatsAppMessage(selectedPatient.id, whatsappMessage);
      
      // Show success notification
      setNotificationMessage(`✅ Message sent successfully to ${selectedPatient.name}`);
      setTimeout(() => setNotificationMessage(null), 3000);

      setIsWhatsAppDialogOpen(false);
      setWhatsappMessage('');
      setSelectedPatient(null);
    } catch (error) {
      console.error('Failed to send WhatsApp:', error);
      alert('Failed to send message. Please try again later.');
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Summary Stats
  const totalPatients = patients.length;
  const highRiskPatients = patients.filter(p => p.riskStatus === 'High').length;
  const recoveringPatients = patients.filter(p => p.riskStatus === 'Low').length;

  return (
    <div className="space-y-8">
      {/* Success Notification Banner */}
      {notificationMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-in slide-in-from-top">
          {notificationMessage}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Patient Administration</h1>
          <p className="text-slate-500 mt-1">Manage patient records, risk monitoring, and doctor assignments.</p>
        </div>
        <Button 
          className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-900/20 rounded-full px-6"
          onClick={() => setIsAddDialogOpen(true)}
        >
          <UserPlus className="w-4 h-4 mr-2" /> Register New Patient
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Patients</p>
              <h3 className="text-2xl font-bold text-slate-900">{totalPatients}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-red-50 rounded-xl text-red-600">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">High Risk</p>
              <h3 className="text-2xl font-bold text-slate-900">{highRiskPatients}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Recovering Well</p>
              <h3 className="text-2xl font-bold text-slate-900">{recoveringPatients}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-white flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search patients by name or ID..." 
              className="pl-10 bg-slate-50 border-transparent focus:bg-white transition-all rounded-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <select 
              className="h-10 rounded-full border-none bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer hover:bg-slate-100 transition-colors"
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
            >
              <option value="All">All Risks</option>
              <option value="Low">Low Risk</option>
              <option value="Medium">Medium Risk</option>
              <option value="High">High Risk</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto bg-white">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-semibold tracking-wider">Patient</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Surgery Info</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Assigned Doctor</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Risk Status</th>
                <th className="px-6 py-4 font-semibold tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredPatients.map((patient) => (
                <tr key={patient.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-sm">
                        {patient.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 text-base">{patient.name}</div>
                        <div className="text-xs text-slate-500 font-mono">{patient.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-slate-900 font-medium">{patient.surgeryType}</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      <span className="font-medium text-blue-600">Day {patient.daysPostOp}</span> post-op
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 group/edit">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-100">
                        <span className="text-slate-700 font-medium text-xs">{patient.doctor}</span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 text-slate-300 hover:text-blue-600 opacity-0 group-hover/edit:opacity-100 transition-opacity"
                        onClick={() => handleAssignDoctor(patient)}
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                      patient.riskStatus === 'High' ? 'bg-red-50 text-red-700 border-red-100' : 
                      patient.riskStatus === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-100' : 
                      'bg-emerald-50 text-emerald-700 border-emerald-100'
                    }`}>
                      {patient.riskStatus} Risk
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-100 rounded-full">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4 text-slate-400" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleOpenWhatsAppDialog(patient)}>
                          <MessageSquare className="w-4 h-4 mr-2" /> Send WhatsApp
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditClick(patient)}>
                          <Edit className="w-4 h-4 mr-2" /> Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAssignDoctor(patient)}>Reassign Doctor</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600 focus:text-red-700 focus:bg-red-50" onClick={() => deletePatient(patient.id)}>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Patient
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Assign Doctor Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Assign Doctor</DialogTitle>
            <DialogDescription>
              Select a doctor to assign to <span className="font-medium text-slate-900">{selectedPatient?.name}</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="doctor">Select Medical Professional</Label>
              <Select value={selectedDoctorId} onValueChange={setSelectedDoctorId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a doctor" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map(doc => (
                    <SelectItem key={doc.id} value={doc.id}>
                      <div className="flex items-center justify-between w-full gap-2">
                        <span>{doc.name}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded border ${
                          doc.status === 'Available' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                          'bg-slate-50 text-slate-500 border-slate-200'
                        }`}>
                          {doc.status}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>Cancel</Button>
            <Button type="submit" onClick={confirmAssignment}>Confirm Assignment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Patient Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Register New Patient</DialogTitle>
            <DialogDescription>
              Enter patient details to start monitoring.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={newPatient.name} onChange={(e) => setNewPatient({...newPatient, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input id="age" type="number" value={newPatient.age} onChange={(e) => setNewPatient({...newPatient, age: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="surgeryType">Surgery Type</Label>
                <Input id="surgeryType" value={newPatient.surgeryType} onChange={(e) => setNewPatient({...newPatient, surgeryType: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="surgeryDate">Surgery Date</Label>
                <Input id="surgeryDate" type="date" value={newPatient.surgeryDate} onChange={(e) => setNewPatient({...newPatient, surgeryDate: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="initialDoctor">Assign Doctor</Label>
              <Select value={newPatient.doctorId} onValueChange={(val) => setNewPatient({...newPatient, doctorId: val})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a doctor" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map(doc => (
                    <SelectItem key={doc.id} value={doc.id}>{doc.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddPatient}>Register Patient</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Patient Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Patient Details</DialogTitle>
            <DialogDescription>
              Update the patient's record.
            </DialogDescription>
          </DialogHeader>
          {editingPatient && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Full Name</Label>
                  <Input id="edit-name" value={editingPatient.name} onChange={(e) => setEditingPatient({...editingPatient, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-age">Age</Label>
                  <Input id="edit-age" type="number" value={editingPatient.age} onChange={(e) => setEditingPatient({...editingPatient, age: parseInt(e.target.value) || 0})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-surgeryType">Surgery Type</Label>
                  <Input id="edit-surgeryType" value={editingPatient.surgeryType} onChange={(e) => setEditingPatient({...editingPatient, surgeryType: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-surgeryDate">Surgery Date</Label>
                  <Input id="edit-surgeryDate" type="date" value={editingPatient.surgeryDate} onChange={(e) => setEditingPatient({...editingPatient, surgeryDate: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-riskStatus">Risk Status</Label>
                <Select value={editingPatient.riskStatus} onValueChange={(val: any) => setEditingPatient({...editingPatient, riskStatus: val})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select risk level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low Risk</SelectItem>
                    <SelectItem value="Medium">Medium Risk</SelectItem>
                    <SelectItem value="High">High Risk</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdatePatient}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send WhatsApp Dialog */}
      <Dialog open={isWhatsAppDialogOpen} onOpenChange={setIsWhatsAppDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Send WhatsApp Message</DialogTitle>
            <DialogDescription>
              Send a custom message to <span className="font-medium text-slate-900">{selectedPatient?.name}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="whatsapp-message">Message</Label>
              <Textarea
                id="whatsapp-message"
                placeholder="Type your message here..."
                value={whatsappMessage}
                onChange={(e) => setWhatsappMessage(e.target.value)}
                rows={6}
                className="resize-none"
              />
              <p className="text-xs text-slate-500">
                This message will be sent via WhatsApp to {selectedPatient?.phone}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsWhatsAppDialogOpen(false)}
              disabled={isSendingMessage}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSendWhatsApp}
              disabled={isSendingMessage || !whatsappMessage.trim()}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSendingMessage ? (
                <>Sending...</>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
