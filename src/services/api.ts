import axios from 'axios';
import type { DashboardPayload, OpenPosition, Trade, EquityPoint, DashboardMetrics } from '../types';
import { isDemoMode, generateDemoDashboardPayload } from './mockData';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const dashboardApi = {
  async getDashboard(): Promise<DashboardPayload> {
    if (isDemoMode()) {
      console.log('[DEMO] Using mock data for dashboard');
      return generateDemoDashboardPayload();
    }
    
    const response = await apiClient.get('/dashboard');
    return response.data;
  },

  async getDashboardWithFilters(params: {
    date_from?: string;
    date_to?: string;
    symbols?: string[];
    direction?: string;
    exit_reasons?: string[];
  }): Promise<DashboardPayload> {
    if (isDemoMode()) {
      console.log('[DEMO] Using mock data with filters:', params);
      // In demo mode, we ignore filters and return full data
      return generateDemoDashboardPayload();
    }
    
    const queryParams = new URLSearchParams();
    
    if (params.date_from) queryParams.append('date_from', params.date_from);
    if (params.date_to) queryParams.append('date_to', params.date_to);
    if (params.direction) queryParams.append('direction', params.direction);
    
    params.symbols?.forEach(sym => {
      if (sym.trim()) queryParams.append('symbols', sym.trim());
    });
    
    params.exit_reasons?.forEach(reason => {
      if (reason.trim()) queryParams.append('exit_reasons', reason.trim());
    });

    const response = await apiClient.get(`/dashboard?${queryParams.toString()}`);
    return response.data;
  },

  async getMetrics(): Promise<DashboardMetrics> {
    if (isDemoMode()) {
      const payload = generateDemoDashboardPayload();
      return payload.metrics;
    }
    
    const response = await apiClient.get('/metrics');
    return response.data;
  },

  async getPositions(): Promise<OpenPosition[]> {
    if (isDemoMode()) {
      const payload = generateDemoDashboardPayload();
      return payload.open_positions;
    }
    
    const response = await apiClient.get('/positions');
    return response.data;
  },

  async getTrades(limit: number = 100, filters?: {
    date_from?: string;
    date_to?: string;
    symbols?: string[];
    direction?: string;
    exit_reasons?: string[];
  }): Promise<Trade[]> {
    if (isDemoMode()) {
      const payload = generateDemoDashboardPayload();
      return payload.recent_trades.slice(0, limit);
    }
    
    const queryParams = new URLSearchParams();
    queryParams.append('limit', limit.toString());
    
    if (filters) {
      if (filters.date_from) queryParams.append('date_from', filters.date_from);
      if (filters.date_to) queryParams.append('date_to', filters.date_to);
      if (filters.direction) queryParams.append('direction', filters.direction);
      
      filters.symbols?.forEach(sym => {
        if (sym.trim()) queryParams.append('symbols', sym.trim());
      });
      
      filters.exit_reasons?.forEach(reason => {
        if (reason.trim()) queryParams.append('exit_reasons', reason.trim());
      });
    }

    const response = await apiClient.get(`/trades?${queryParams.toString()}`);
    return response.data;
  },

  async getEquity(filters?: {
    date_from?: string;
    date_to?: string;
    symbols?: string[];
    direction?: string;
    exit_reasons?: string[];
  }): Promise<EquityPoint[]> {
    if (isDemoMode()) {
      const payload = generateDemoDashboardPayload();
      return payload.equity_curve;
    }
    
    const queryParams = new URLSearchParams();
    
    if (filters) {
      if (filters.date_from) queryParams.append('date_from', filters.date_from);
      if (filters.date_to) queryParams.append('date_to', filters.date_to);
      if (filters.direction) queryParams.append('direction', filters.direction);
      
      filters.symbols?.forEach(sym => {
        if (sym.trim()) queryParams.append('symbols', sym.trim());
      });
      
      filters.exit_reasons?.forEach(reason => {
        if (reason.trim()) queryParams.append('exit_reasons', reason.trim());
      });
    }

    const response = await apiClient.get(`/equity?${queryParams.toString()}`);
    return response.data;
  },
};
