import { useState } from 'react';
import { patients } from '@/lib/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PatientsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('All');

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          patient.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = riskFilter === 'All' || patient.riskStatus === riskFilter;
    return matchesSearch && matchesRisk;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Patient Monitoring</h1>
          <p className="text-slate-500">Track recovery progress and risk status.</p>
        </div>
        <Button>
          + Add New Patient
        </Button>
      </div>

      <Card className="shadow-md border-slate-200">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Search by name or ID..." 
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <select 
                className="h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
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
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 font-medium">Patient</th>
                  <th className="px-6 py-3 font-medium">Surgery</th>
                  <th className="px-6 py-3 font-medium">Post-Op Day</th>
                  <th className="px-6 py-3 font-medium">Last Response</th>
                  <th className="px-6 py-3 font-medium">Risk Status</th>
                  <th className="px-6 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{patient.name}</div>
                      <div className="text-xs text-slate-500">{patient.id}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{patient.surgeryType}</td>
                    <td className="px-6 py-4 text-slate-600">Day {patient.daysPostOp}</td>
                    <td className="px-6 py-4 text-slate-600">{patient.lastResponse}</td>
                    <td className="px-6 py-4">
                      <Badge variant={
                        patient.riskStatus === 'High' ? 'danger' : 
                        patient.riskStatus === 'Medium' ? 'warning' : 'success'
                      }>
                        {patient.riskStatus}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/dashboard/patients/${patient.id}`}>
                          <Eye className="w-4 h-4 mr-2" /> Details
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredPatients.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              No patients found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
