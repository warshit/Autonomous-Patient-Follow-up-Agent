import { useState, useEffect } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Save, RefreshCw, MessageSquare, Brain, GitMerge, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

export default function ConfigurationPage() {
  const { config, updateConfig } = useAdmin();
  const [localConfig, setLocalConfig] = useState(config);
  const [isSaving, setIsSaving] = useState(false);

  // Sync local state when context config changes
  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  const handleRiskThresholdChange = (key: 'low' | 'medium' | 'high', value: number[]) => {
    setLocalConfig(prev => ({
      ...prev,
      aiConfig: {
        ...prev.aiConfig,
        riskThresholds: {
          ...prev.aiConfig.riskThresholds,
          [key]: value[0]
        }
      }
    }));
  };

  const handleTemplateChange = (id: string, content: string) => {
    setLocalConfig(prev => ({
      ...prev,
      messageTemplates: prev.messageTemplates.map(t => 
        t.id === id ? { ...t, content } : t
      )
    }));
  };

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API delay
    setTimeout(() => {
      updateConfig(localConfig);
      setIsSaving(false);
    }, 800);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">System Configuration</h1>
          <p className="text-slate-500">Manage AI settings, messaging templates, and routing logic.</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" /> Save Changes
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="messaging" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="messaging">Messaging</TabsTrigger>
          <TabsTrigger value="ai">AI Risk</TabsTrigger>
          <TabsTrigger value="routing">Routing</TabsTrigger>
        </TabsList>

        {/* Messaging Configuration */}
        <TabsContent value="messaging" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                Messaging Settings
              </CardTitle>
              <CardDescription>Configure automated patient communication.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">WhatsApp Integration</Label>
                  <p className="text-sm text-slate-500">Enable automated WhatsApp messages via Twilio.</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">SMS Fallback</Label>
                  <p className="text-sm text-slate-500">Send SMS if WhatsApp delivery fails.</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="font-medium text-slate-900">Message Templates</h3>
                {localConfig.messageTemplates.map((template) => (
                  <div key={template.id} className="space-y-2">
                    <Label>{template.name}</Label>
                    <Textarea 
                      className="min-h-[80px]"
                      value={template.content}
                      onChange={(e) => handleTemplateChange(template.id, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Risk Configuration */}
        <TabsContent value="ai" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-600" />
                AI Risk Parameters
              </CardTitle>
              <CardDescription>Adjust sensitivity and thresholds for risk detection.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <Label>Low Risk Threshold (0-{localConfig.aiConfig.riskThresholds.low})</Label>
                  <span className="text-sm font-medium text-slate-900">{localConfig.aiConfig.riskThresholds.low}</span>
                </div>
                <Slider 
                  value={[localConfig.aiConfig.riskThresholds.low]} 
                  onValueChange={(val) => handleRiskThresholdChange('low', val)}
                  max={100} 
                  step={1} 
                  className="w-full" 
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <Label>Medium Risk Threshold ({localConfig.aiConfig.riskThresholds.low}-{localConfig.aiConfig.riskThresholds.medium})</Label>
                  <span className="text-sm font-medium text-slate-900">{localConfig.aiConfig.riskThresholds.medium}</span>
                </div>
                <Slider 
                  value={[localConfig.aiConfig.riskThresholds.medium]} 
                  onValueChange={(val) => handleRiskThresholdChange('medium', val)}
                  max={100} 
                  step={1} 
                  className="w-full" 
                />
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="font-medium text-slate-900">Symptom Weights</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label>Pain Level Impact</Label>
                    <Slider defaultValue={[80]} max={100} step={1} />
                  </div>
                  <div className="space-y-3">
                    <Label>Fever Impact</Label>
                    <Slider defaultValue={[90]} max={100} step={1} />
                  </div>
                  <div className="space-y-3">
                    <Label>Swelling Impact</Label>
                    <Slider defaultValue={[60]} max={100} step={1} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Routing Simulation */}
        <TabsContent value="routing" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitMerge className="w-5 h-5 text-amber-600" />
                Alert Routing Logic
              </CardTitle>
              <CardDescription>Visual flow of how alerts are routed to medical staff.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative py-8 px-4">
                <div className="flex flex-col items-center space-y-8">
                  {/* Step 1 */}
                  <div className="relative z-10 bg-white p-4 rounded-xl border-2 border-red-100 shadow-sm w-64 text-center">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-bold">TRIGGER</div>
                    <AlertTriangle className="w-6 h-6 text-red-500 mx-auto mb-2" />
                    <h4 className="font-bold text-slate-900">High Risk Alert</h4>
                    <p className="text-xs text-slate-500">AI detects anomaly</p>
                  </div>

                  {/* Arrow */}
                  <div className="h-8 w-0.5 bg-slate-200"></div>

                  {/* Step 2 */}
                  <div className="relative z-10 bg-white p-4 rounded-xl border-2 border-blue-100 shadow-sm w-64 text-center">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold">CHECK 1</div>
                    <RefreshCw className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                    <h4 className="font-bold text-slate-900">Check Assigned Doctor</h4>
                    <p className="text-xs text-slate-500">Is Dr. Mitchell available?</p>
                  </div>

                  {/* Arrow Split */}
                  <div className="relative w-full max-w-md h-8">
                    <div className="absolute left-1/2 top-0 h-4 w-0.5 bg-slate-200 -translate-x-1/2"></div>
                    <div className="absolute left-1/4 top-4 right-1/4 h-0.5 bg-slate-200"></div>
                    <div className="absolute left-1/4 top-4 h-4 w-0.5 bg-slate-200"></div>
                    <div className="absolute right-1/4 top-4 h-4 w-0.5 bg-slate-200"></div>
                  </div>

                  <div className="flex justify-center gap-16 w-full">
                    {/* Path A */}
                    <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 w-48 text-center">
                      <CheckCircle className="w-5 h-5 text-emerald-600 mx-auto mb-2" />
                      <h4 className="font-bold text-emerald-900 text-sm">Available</h4>
                      <p className="text-xs text-emerald-700">Route to Doctor</p>
                    </div>

                    {/* Path B */}
                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 w-48 text-center">
                      <Clock className="w-5 h-5 text-amber-600 mx-auto mb-2" />
                      <h4 className="font-bold text-amber-900 text-sm">Unavailable</h4>
                      <p className="text-xs text-amber-700">Route to Backup</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
