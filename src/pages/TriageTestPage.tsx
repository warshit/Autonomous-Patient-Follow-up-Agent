import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';

interface TriageResult {
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  risk_score: number;
  confidence_level: 'LOW' | 'MEDIUM' | 'HIGH';
  symptoms_identified: string[];
  trend_analysis: 'improving' | 'stable' | 'worsening' | 'unclear';
  complication_category: string;
  clinical_reasoning: string;
  alert_required: boolean;
}

export default function TriageTestPage() {
  const [patientMessage, setPatientMessage] = useState('');
  const [surgeryType, setSurgeryType] = useState('');
  const [daysSinceSurgery, setDaysSinceSurgery] = useState('');
  const [riskFactors, setRiskFactors] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TriageResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!patientMessage || !surgeryType || !daysSinceSurgery) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Create a temporary patient for testing
      const testPatientId = 'TEST-' + Date.now();
      
      // First create a test patient
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      
      await fetch(`${API_URL}/patients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test Patient',
          phone: `+1-555-${Date.now().toString().slice(-4)}`,
          surgery_type: surgeryType,
          surgery_date: new Date(Date.now() - parseInt(daysSinceSurgery) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          known_risk_factors: riskFactors || null,
        })
      });

      // Now analyze the message
      const response = await fetch(`${API_URL}/triage/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: testPatientId,
          patient_message: patientMessage,
          create_alert: false, // Don't create alerts for test patients
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Analysis failed' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      setResult(data.triage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed. Make sure the backend is running and your Gemini API key is configured.');
    } finally {
      setLoading(false);
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'LOW':
        return <CheckCircle className="w-6 h-6 text-emerald-600" />;
      case 'MEDIUM':
        return <AlertTriangle className="w-6 h-6 text-amber-600" />;
      case 'HIGH':
        return <AlertCircle className="w-6 h-6 text-red-600" />;
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
      <div>
        <h1 className="text-2xl font-bold text-slate-900">AI Triage Test</h1>
        <p className="text-slate-500">Test the HealthGuard AI triage system</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="message">Patient Message *</Label>
              <Textarea
                id="message"
                placeholder="e.g., I'm feeling a lot of pain and my leg is very swollen..."
                value={patientMessage}
                onChange={(e) => setPatientMessage(e.target.value)}
                rows={4}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="surgery">Surgery Type *</Label>
              <Input
                id="surgery"
                placeholder="e.g., Hip Replacement"
                value={surgeryType}
                onChange={(e) => setSurgeryType(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="days">Days Since Surgery *</Label>
              <Input
                id="days"
                type="number"
                placeholder="e.g., 3"
                value={daysSinceSurgery}
                onChange={(e) => setDaysSinceSurgery(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="risk">Known Risk Factors (Optional)</Label>
              <Textarea
                id="risk"
                placeholder="e.g., Diabetes, hypertension..."
                value={riskFactors}
                onChange={(e) => setRiskFactors(e.target.value)}
                rows={2}
                className="mt-1"
              />
            </div>

            <Button 
              onClick={handleAnalyze} 
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Analyze Patient'
              )}
            </Button>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle>Triage Results</CardTitle>
          </CardHeader>
          <CardContent>
            {!result && !loading && (
              <div className="text-center py-12 text-slate-400">
                <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Enter patient information and click Analyze</p>
              </div>
            )}

            {result && (
              <div className="space-y-4">
                {/* Risk Level */}
                <div className={`p-4 rounded-lg border-2 ${getRiskColor(result.risk_level)}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getRiskIcon(result.risk_level)}
                      <span className="text-lg font-bold">{result.risk_level} RISK</span>
                    </div>
                    <span className="text-2xl font-bold">{result.risk_score}</span>
                  </div>
                  <p className="text-sm">Confidence: {result.confidence_level}</p>
                </div>

                {/* Alert Required */}
                {result.alert_required && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <span className="text-sm font-semibold text-red-700">Doctor Alert Required</span>
                  </div>
                )}

                {/* Clinical Reasoning */}
                <div>
                  <Label className="text-xs text-slate-500 uppercase">Clinical Reasoning</Label>
                  <p className="mt-1 text-sm text-slate-700">{result.clinical_reasoning}</p>
                </div>

                {/* Symptoms */}
                <div>
                  <Label className="text-xs text-slate-500 uppercase">Symptoms Identified</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {result.symptoms_identified.map((symptom, idx) => (
                      <Badge key={idx} variant="outline">{symptom}</Badge>
                    ))}
                  </div>
                </div>

                {/* Trend & Category */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-slate-500 uppercase">Trend</Label>
                    <p className="mt-1 text-sm font-medium text-slate-900 capitalize">
                      {result.trend_analysis}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-500 uppercase">Category</Label>
                    <p className="mt-1 text-sm font-medium text-slate-900 capitalize">
                      {result.complication_category.replace('_', ' ')}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Example Scenarios */}
      <Card>
        <CardHeader>
          <CardTitle>Example Scenarios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start text-left"
              onClick={() => {
                setPatientMessage("I'm feeling okay, just a bit sore around the incision. Pain is about 3/10.");
                setSurgeryType("Appendectomy");
                setDaysSinceSurgery("2");
                setRiskFactors("");
              }}
            >
              <Badge className="mb-2 bg-emerald-100 text-emerald-700">Low Risk</Badge>
              <span className="text-sm">Normal recovery scenario</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start text-left"
              onClick={() => {
                setPatientMessage("My pain has been getting worse over the last day. It's now around 6/10 and the area feels warm.");
                setSurgeryType("Hip Replacement");
                setDaysSinceSurgery("4");
                setRiskFactors("Diabetes");
              }}
            >
              <Badge className="mb-2 bg-amber-100 text-amber-700">Medium Risk</Badge>
              <span className="text-sm">Worsening symptoms</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start text-left"
              onClick={() => {
                setPatientMessage("I have severe pain (9/10), high fever of 39.5°C, and the wound is leaking pus. I feel dizzy.");
                setSurgeryType("Spinal Fusion");
                setDaysSinceSurgery("5");
                setRiskFactors("Hypertension");
              }}
            >
              <Badge className="mb-2 bg-red-100 text-red-700">High Risk</Badge>
              <span className="text-sm">Critical infection signs</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
