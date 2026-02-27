// API client for HealthGuard AI Backend

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface TriageAnalysisRequest {
  patient_id: string;
  patient_message: string;
  create_alert?: boolean;
}

export interface TriageAnalysisResponse {
  triage: {
    risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
    risk_score: number;
    confidence_level: 'LOW' | 'MEDIUM' | 'HIGH';
    symptoms_identified: string[];
    trend_analysis: 'improving' | 'stable' | 'worsening' | 'unclear';
    complication_category: string;
    clinical_reasoning: string;
    alert_required: boolean;
  };
  alert: any | null;
  patient_updated: {
    risk_status: string;
    recovery_score: number;
  };
}

export interface BatchTriageRequest {
  analyses: Array<{
    patient_id: string;
    patient_message: string;
  }>;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // Triage endpoints
  async analyzeTriage(data: TriageAnalysisRequest): Promise<TriageAnalysisResponse> {
    return this.request<TriageAnalysisResponse>('/triage/analyze', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async batchTriage(data: BatchTriageRequest) {
    return this.request('/triage/batch', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Patient endpoints
  async getPatients() {
    return this.request('/patients', { method: 'GET' });
  }

  async getPatient(id: string) {
    return this.request(`/patients/${id}`, { method: 'GET' });
  }

  async createPatient(data: any) {
    return this.request('/patients', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePatient(id: string, data: any) {
    return this.request(`/patients/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deletePatient(id: string) {
    return this.request(`/patients/${id}`, { method: 'DELETE' });
  }

  async sendWhatsAppMessage(patientId: string, message: string) {
    return this.request(`/patients/${patientId}/send-message`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  // Alert endpoints
  async getAlerts(filters?: { status?: string; severity?: string; doctor_id?: string }) {
    const params = new URLSearchParams(filters as any);
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/alerts${query}`, { method: 'GET' });
  }

  async getAlert(id: string) {
    return this.request(`/alerts/${id}`, { method: 'GET' });
  }

  async updateAlert(id: string, data: { action: string; doctor_id?: string; note?: string; resolved_by?: string }) {
    return this.request(`/alerts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteAlert(id: string) {
    return this.request(`/alerts/${id}`, { method: 'DELETE' });
  }

  // Doctor endpoints
  async getDoctors() {
    return this.request('/doctors', { method: 'GET' });
  }

  async getDoctor(id: string) {
    return this.request(`/doctors/${id}`, { method: 'GET' });
  }

  async createDoctor(data: any) {
    return this.request('/doctors', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateDoctor(id: string, data: any) {
    return this.request(`/doctors/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteDoctor(id: string) {
    return this.request(`/doctors/${id}`, { method: 'DELETE' });
  }

  // Analytics endpoints
  async getAnalyticsSummary() {
    return this.request('/analytics/summary', { method: 'GET' });
  }

  // Health check
  async healthCheck() {
    return this.request('/health', { method: 'GET' });
  }
}

// Export singleton instance
export const api = new ApiClient(API_BASE_URL);

export default api;
