import { useState } from 'react';
import { useAdmin, Doctor } from '@/context/AdminContext';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, Plus, MoreHorizontal, Phone, Mail, Clock, Stethoscope, UserCheck, CalendarOff, Trash2, Edit } from 'lucide-react';
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

export default function DoctorManagementPage() {
  const { doctors, addDoctor, updateDoctor, deleteDoctor, toggleDoctorStatus } = useAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [newDoctor, setNewDoctor] = useState({
    name: '',
    specialization: '',
    email: '',
    phone: '',
    workingHours: '09:00 - 17:00',
    status: 'Available',
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=200&h=200&auto=format&fit=crop'
  });

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || doctor.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'In Consultation': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Off Duty': return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'On Leave': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const handleAddDoctor = () => {
    addDoctor(newDoctor as any);
    setIsAddDialogOpen(false);
    setNewDoctor({
      name: '',
      specialization: '',
      email: '',
      phone: '',
      workingHours: '09:00 - 17:00',
      status: 'Available',
      avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=200&h=200&auto=format&fit=crop'
    });
  };

  const handleEditClick = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setIsEditDialogOpen(true);
  };

  const handleUpdateDoctor = () => {
    if (editingDoctor) {
      updateDoctor(editingDoctor.id, editingDoctor);
      setIsEditDialogOpen(false);
      setEditingDoctor(null);
    }
  };

  // Summary Stats
  const totalDoctors = doctors.length;
  const availableDoctors = doctors.filter(d => d.status === 'Available').length;
  const onLeaveDoctors = doctors.filter(d => d.status === 'On Leave').length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Doctor Management</h1>
          <p className="text-slate-500 mt-1">Manage medical staff, schedules, and patient assignments.</p>
        </div>
        <Button 
          className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-900/20 rounded-full px-6"
          onClick={() => setIsAddDialogOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" /> Add New Doctor
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Doctors</p>
              <h3 className="text-2xl font-bold text-slate-900">{totalDoctors}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Available Now</p>
              <h3 className="text-2xl font-bold text-slate-900">{availableDoctors}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-red-50 rounded-xl text-red-600">
              <CalendarOff className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">On Leave</p>
              <h3 className="text-2xl font-bold text-slate-900">{onLeaveDoctors}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-white flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search by name or specialization..." 
              className="pl-10 bg-slate-50 border-transparent focus:bg-white transition-all rounded-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <select 
              className="h-10 rounded-full border-none bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer hover:bg-slate-100 transition-colors"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Available">Available</option>
              <option value="In Consultation">In Consultation</option>
              <option value="Off Duty">Off Duty</option>
              <option value="On Leave">On Leave</option>
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto bg-white">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-semibold tracking-wider">Doctor</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Contact</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Status</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Work Hours</th>
                <th className="px-6 py-4 font-semibold tracking-wider text-center">Patients</th>
                <th className="px-6 py-4 font-semibold tracking-wider text-center">Alerts</th>
                <th className="px-6 py-4 font-semibold tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredDoctors.map((doctor) => (
                <tr key={doctor.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="relative">
                        <img className="h-12 w-12 rounded-full object-cover mr-4 border-2 border-white shadow-sm" src={doctor.avatar} alt={doctor.name} />
                        <span className={`absolute bottom-0 right-3 w-3 h-3 rounded-full border-2 border-white ${
                          doctor.status === 'Available' ? 'bg-emerald-500' : 
                          doctor.status === 'In Consultation' ? 'bg-amber-500' : 'bg-slate-300'
                        }`}></span>
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 text-base">{doctor.name}</div>
                        <div className="text-xs text-blue-600 font-medium bg-blue-50 inline-block px-2 py-0.5 rounded-full mt-1">
                          {doctor.specialization}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col space-y-1.5">
                      <div className="flex items-center text-xs text-slate-500 group-hover:text-slate-700 transition-colors">
                        <Mail className="w-3.5 h-3.5 mr-2 text-slate-400" /> {doctor.email}
                      </div>
                      <div className="flex items-center text-xs text-slate-500 group-hover:text-slate-700 transition-colors">
                        <Phone className="w-3.5 h-3.5 mr-2 text-slate-400" /> {doctor.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(doctor.status)}`}>
                      {doctor.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    <div className="flex items-center bg-slate-50 px-3 py-1.5 rounded-md w-fit">
                      <Clock className="w-3.5 h-3.5 mr-2 text-slate-400" />
                      <span className="text-xs font-medium">{doctor.workingHours}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-700 font-bold text-xs">
                      {doctor.patientsCount}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm font-medium text-slate-600">{doctor.alertsHandled}</span>
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
                        <DropdownMenuItem onClick={() => handleEditClick(doctor)}>
                          <Edit className="w-4 h-4 mr-2" /> Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleDoctorStatus(doctor.id, 'Available')}>Set Available</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleDoctorStatus(doctor.id, 'In Consultation')}>Set In Consultation</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleDoctorStatus(doctor.id, 'Off Duty')}>Set Off Duty</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600 focus:text-red-700 focus:bg-red-50" onClick={() => deleteDoctor(doctor.id)}>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Doctor
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

      {/* Add Doctor Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Doctor</DialogTitle>
            <DialogDescription>
              Enter the details for the new medical professional.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={newDoctor.name} onChange={(e) => setNewDoctor({...newDoctor, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialization">Specialization</Label>
                <Input id="specialization" value={newDoctor.specialization} onChange={(e) => setNewDoctor({...newDoctor, specialization: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={newDoctor.email} onChange={(e) => setNewDoctor({...newDoctor, email: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={newDoctor.phone} onChange={(e) => setNewDoctor({...newDoctor, phone: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="workingHours">Working Hours</Label>
              <Input id="workingHours" value={newDoctor.workingHours} onChange={(e) => setNewDoctor({...newDoctor, workingHours: e.target.value})} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddDoctor}>Add Doctor</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Doctor Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Doctor Details</DialogTitle>
            <DialogDescription>
              Update the information for this medical professional.
            </DialogDescription>
          </DialogHeader>
          {editingDoctor && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Full Name</Label>
                  <Input id="edit-name" value={editingDoctor.name} onChange={(e) => setEditingDoctor({...editingDoctor, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-specialization">Specialization</Label>
                  <Input id="edit-specialization" value={editingDoctor.specialization} onChange={(e) => setEditingDoctor({...editingDoctor, specialization: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input id="edit-email" type="email" value={editingDoctor.email} onChange={(e) => setEditingDoctor({...editingDoctor, email: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Phone</Label>
                  <Input id="edit-phone" value={editingDoctor.phone} onChange={(e) => setEditingDoctor({...editingDoctor, phone: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-workingHours">Working Hours</Label>
                <Input id="edit-workingHours" value={editingDoctor.workingHours} onChange={(e) => setEditingDoctor({...editingDoctor, workingHours: e.target.value})} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateDoctor}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
