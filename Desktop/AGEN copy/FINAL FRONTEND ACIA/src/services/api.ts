import { trackEvent } from './telemetry';

// Mock delay helper
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- Types ---
export interface Source {
  id: string;
  title: string;
  url: string;
  snippet: string;
  timestamp: string;
  type: 'News' | 'Webpage' | 'Product Page' | 'Social Media';
}

export interface InsightExplanation {
  markdown: string;
}

export interface SnoozeResult {
  snoozedUntil: string;
}

export interface ReportJob {
  jobId: string;
  status: 'pending' | 'completed';
  downloadUrl?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

// --- Mock API ---
export const api = {
  // Insights
  getSources: async (insightId: string): Promise<Source[]> => {
    trackEvent('insight_get_sources', { insightId });
    await delay(800);
    return [
      { id: '1', title: 'TechCrunch Article', url: 'https://techcrunch.com/...', snippet: '...competitor pracing strategy...', timestamp: '2h ago', type: 'News' },
      { id: '2', title: 'Amazon Product Page', url: 'https://amazon.com/...', snippet: '...price dropped to $1149...', timestamp: 'Today, 9:30 AM', type: 'Product Page' },
      { id: '3', title: 'Twitter Thread', url: 'https://twitter.com/...', snippet: '...users complaining about heat...', timestamp: 'Yesterday', type: 'Social Media' },
    ];
  },

  explainInsight: async (insightId: string, level: string = 'detailed'): Promise<InsightExplanation> => {
    trackEvent('insight_explain', { insightId, level });
    await delay(1500);
    return {
      markdown: `### Explanation\n\nThis insight was generated based on a correlation between **price drops** on Amazon and increased **negative sentiment** regarding battery life on social media.\n\n*   **Primary Driver**: Amazon price adjustment (-12%).\n*   **Secondary Signal**: Competitor X marketing push.\n\nConfidence is high (92%) due to multiple source corroboration.`
    };
  },

  // Alerts
  resolveAlert: async (alertId: string): Promise<void> => {
    trackEvent('alert_resolve', { alertId });
    await delay(400); // Fast optimistic
    // 10% chance of failure to test rollback
    if (Math.random() < 0.1) {
      throw new Error("Failed to resolve alert");
    }
  },

  undoResolveAlert: async (alertId: string): Promise<void> => {
    trackEvent('alert_undo_resolve', { alertId });
    await delay(400);
  },

  snoozeAlert: async (alertId: string, durationMinutes: number): Promise<SnoozeResult> => {
    trackEvent('alert_snooze', { alertId, durationMinutes });
    await delay(600);
    const date = new Date(Date.now() + durationMinutes * 60000);
    return { snoozedUntil: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
  },

  // Reports
  createReport: async (title: string): Promise<string> => { // Returns ID
    trackEvent('report_create_draft', { title });
    await delay(500);
    return "rpt_" + Math.random().toString(36).substr(2, 9);
  },

  exportReport: async (reportId: string): Promise<ReportJob> => {
    trackEvent('report_export_start', { reportId });
    await delay(2000);
    return {
      jobId: 'job_123',
      status: 'completed',
      downloadUrl: '#' // Mock link
    };
  },

  // Documents
  addToReport: async (docId: string, reportId?: string): Promise<void> => {
    trackEvent('doc_add_to_report', { docId, reportId });
    await delay(300);
  },

  // Share
  shareResource: async (type: string, id: string): Promise<string> => {
    trackEvent('resource_share', { type, id });
    await delay(800);
    return `https://rivalscan.ai/share/${type}/${id}?token=abc123xyz`;
  },

  // Global
  getNotifications: async (): Promise<Notification[]> => {
    // trackEvent('notifications_fetch'); // Reduce noise
    await delay(200);
    return [
      { id: '1', title: 'Export Ready', message: 'Your Weekly Summary is ready to download.', time: '2m ago', read: false },
      { id: '2', title: 'New Alert', message: 'Price drop detected for Samsung S24.', time: '1h ago', read: false }
    ];
  },

  markNotificationRead: async (id: string): Promise<void> => {
    trackEvent('notification_mark_read', { id });
    await delay(200);
  },

  logout: async (): Promise<void> => {
    trackEvent('auth_logout');
    await delay(500);
  },

  queueSnapshot: async (): Promise<void> => {
    trackEvent('snapshot_queue');
    await delay(1000);
  },

  // --- ACIA Backend Integration ---
  API_BASE_URL: "http://localhost:8000",

  createAnalysisJob: async (domain: string, competitor: string): Promise<{ job_id: string; status: string }> => {
    trackEvent('analysis_create', { domain, competitor });
    const response = await fetch(`${api.API_BASE_URL}/api/analysis/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domain, competitor })
    });
    if (!response.ok) throw new Error('Failed to create analysis job');
    return response.json();
  },

  getJobStatus: async (jobId: string): Promise<{ job_id: string; status: string; progress: number }> => {
    const response = await fetch(`${api.API_BASE_URL}/api/jobs/${jobId}/status`);
    if (!response.ok) throw new Error('Failed to fetch job status');
    return response.json();
  },

  getAnalysisOverview: async (jobId: string): Promise<any> => {
    const response = await fetch(`${api.API_BASE_URL}/api/analysis/${jobId}/overview`);
    if (!response.ok) throw new Error('Failed to fetch overview');
    return response.json();
  },

  getAnalysisOfferings: async (jobId: string): Promise<any> => {
    const response = await fetch(`${api.API_BASE_URL}/api/analysis/${jobId}/offerings`);
    if (!response.ok) throw new Error('Failed to fetch offerings');
    return response.json();
  },

  getAnalysisSignals: async (jobId: string): Promise<any> => {
    const response = await fetch(`${api.API_BASE_URL}/api/analysis/${jobId}/market-signals`);
    if (!response.ok) throw new Error('Failed to fetch market signals');
    return response.json();
  },

  getAnalysisSentiment: async (jobId: string): Promise<any> => {
    const response = await fetch(`${api.API_BASE_URL}/api/analysis/${jobId}/sentiment`);
    if (!response.ok) throw new Error('Failed to fetch sentiment');
    return response.json();
  },
  
  getAnalysisAlerts: async (jobId: string): Promise<any> => {
    const response = await fetch(`${api.API_BASE_URL}/api/analysis/${jobId}/alerts`);
    if (!response.ok) throw new Error('Failed to fetch alerts');
    return response.json();
  },

  exportAnalysisPdf: async (jobId: string, includeSections: string[] = ["overview","offerings","market-signals","sentiment"]): Promise<Blob> => {
    const response = await fetch(`${api.API_BASE_URL}/api/analysis/${jobId}/export/pdf`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ include_sections: includeSections })
    });
    if (!response.ok) throw new Error('Failed to export PDF');
    const blob = await response.blob();
    return blob;
  },

  // Chat: Salaar (Business Advisor)
  chatSalaar: async (message: string): Promise<{ reply: string }> => {
    const response = await fetch(`${api.API_BASE_URL}/api/chat/salaar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    if (!response.ok) throw new Error('Failed to get chat reply');
    return response.json();
  }
};
