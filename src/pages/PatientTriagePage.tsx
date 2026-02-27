import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { 
  ArrowLeft, 
  Send, 
  Loader2, 
  AlertCircle, 
  CheckCircle, 
  AlertTriangle,
  User,
  Calendar,
  Activity
} from 'lucide-react';

export default function PatientTriagePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [patientMessage, setPatientMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Mock patient data - in real app, fetch from API
  const patient = {
    id: id || 'P-1001',
    name: 'James Wilson',
    age: 45,
    surgeryType: 'ACL Reconstruction',
    surgeryDate: '2023-10-15',
    daysPostOp: 3,
    riskStatus: 'Low',
    recoveryScore: 92,
  };

  const handleAnalyze = async () => {
    if (!patientMessage.trim()) {
      setError('Please enter a patient message');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await api.analyzeTriage({
        patient_id: patient.id,
        patient_message: patientMessage,
        create_alert: true,
      });

      setResult(response);
      setPatientMessage(''); // Clear input after successful analysis
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'LOW':
        return <CheckCircle className="w-5 h-5 text-emerald-600" />;
      case 'MEDIUM':
        return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      case 'HIGH':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'LOW':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'MEDIUM':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'HIGH':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/patients')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Patients
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Patient Triage</h1>
            <p className="text-slate-500">Analyze patient check-in messages</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Info */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-2" />
              Patient Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs text-slate-500 uppercase">Name</Label>
              <p className="text-sm font-semibold text-slate-900">{patient.name}</p>
            </div>
            <div>
              <Label className="text-xs text-slate-500 uppercase">Age</Label>
              <p className="text-sm text-slate-700">{patient.age} years</p>
            </div>
            <div>
              <Label className="text-xs text-slate-500 uppercase">Surgery Type</Label>
              <p className="text-sm text-slate-700">{patient.surgeryType}</p>
            </div>
            <div>
              <Label className="text-xs text-slate-500 uppercase">Surgery Date</Label>
              <div className="flex items-center space-x-2 mt-1">
                <Calendar className="w-4 h-4 text-slate-400" />
                <p className="text-sm text-slate-700">{patient.surgeryDate}</p>
              </div>
            </div>
            <div>
              <Label className="text-xs text-slate-500 uppercase">Days Post-Op</Label>
              <p className="text-sm text-slate-700">{patient.daysPostOp} days</p>
            </div>
            <div>
              <Label className="text-xs text-slate-500 uppercase">Current Status</Label>
              <div className="flex items-center space-x-2 mt-1">
                <Activity className="w-4 h-4 text-slate-400" />
                <Badge variant="outline">{patient.riskStatus} Risk</Badge>
              </div>
            </div>
            <div>
              <Label className="text-xs text-slate-500 uppercase">Recovery Score</Label>
              <p className="text-2xl font-bold text-slate-900">{patient.recoveryScore}</p>
            </div>
          </CardContent>
        </Card>

        {/* Triage Input & Results */}
        <div className="lg:col-span-2 space-y-6">
          {/* Input */}
          <Card>
            <CardHeader>
              <CardTitle>Patient Message</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="message">Enter patient's check-in message</Label>
                <Textarea
                  id="message"
                  placeholder="e.g., I'm feeling a lot of pain today, around 7/10. The area is swollen and warm to touch..."
                  value={patientMessage}
                  onChange={(e) => setPatientMessage(e.target.value)}
                  rows={4}
                  className="mt-2"
                  disabled={loading}
                />
              </div>

              <Button 
                onClick={handleAnalyze} 
                disabled={loading || !patientMessage.trim()}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Analyze Message
                  </>
                )}
              </Button>

              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-start">
                  <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                  {error}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results */}
          {result && (
            <Card>
              <CardHeader>
                <CardTitle>Triage Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Risk Level */}
                <div className={`p-4 rounded-lg border-2 ${getRiskColor(result.triage.risk_level)}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getRiskIcon(result.triage.risk_level)}
                      <span className="text-lg font-bold">{result.triage.risk_level} RISK</span>
                    </div>
                    <span className="text-2xl font-bold">{result.triage.risk_score}</span>
                  </div>
                  <p className="text-sm">Confidence: {result.triage.confidence_level}</p>
                </div>

                {/* Alert Status */}
                {result.alert && (
                  <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                      <div>
                        <p className="font-semibold text-red-700">Alert Created</p>
                        <p className="text-sm text-red-600 mt-1">
                          Alert ID: {result.alert.id} - Routed to {result.alert.assigned_doctor_name || 'Available Doctor'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Clinical Reasoning */}
                <div>
                  <Label className="text-xs text-slate-500 uppercase">Clinical Reasoning</Label>
                  <p className="mt-2 text-sm text-slate-700 p-3 bg-slate-50 rounded-lg">
                    {result.triage.clinical_reasoning}
                  </p>
                </div>

                {/* Symptoms */}
                <div>
                  <Label className="text-xs text-slate-500 uppercase">Symptoms Identified</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {result.triage.symptoms_identified.map((symptom: string, idx: number) => (
                      <Badge key={idx} variant="outline">{symptom}</Badge>
                    ))}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <Label className="text-xs text-slate-500 uppercase">Trend Analysis</Label>
                    <p className="mt-1 text-sm font-medium text-slate-900 capitalize">
                      {result.triage.trend_analysis}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-500 uppercase">Category</Label>
                    <p className="mt-1 text-sm font-medium text-slate-900 capitalize">
                      {result.triage.complication_category.replace('_', ' ')}
                    </p>
                  </div>
                </div>

                {/* Patient Update Info */}
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700">
                    Patient record updated: Risk Status → {result.patient_updated.risk_status}, 
                    Recovery Score → {result.patient_updated.recovery_score}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
