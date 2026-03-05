import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { apiService } from '../services/api';
import type {
  FunnelFilters,
  FunnelViewMode,
  LossReason,
  Opportunity,
  OpportunityActivity,
  PipelineStage,
} from '../types/funnel';

interface FunnelContextValue {
  stages: PipelineStage[];
  opportunities: Opportunity[];
  lossReasons: LossReason[];
  filters: FunnelFilters;
  viewMode: FunnelViewMode;
  loading: boolean;
  error: string | null;
  setFilters: (f: Partial<FunnelFilters>) => void;
  setViewMode: (m: FunnelViewMode) => void;
  fetchStages: () => Promise<void>;
  fetchOpportunities: () => Promise<void>;
  fetchLossReasons: () => Promise<void>;
  fetchAll: () => Promise<void>;
  moveDeal: (opportunityId: string, stageId: string) => Promise<void>;
  createDeal: (data: Parameters<typeof apiService.createOpportunity>[0]) => Promise<Opportunity | null>;
  updateDeal: (id: string, data: Parameters<typeof apiService.updateOpportunity>[1]) => Promise<Opportunity | null>;
  markWon: (id: string) => Promise<void>;
  markLost: (id: string, lossReasonId: string) => Promise<void>;
  convertToSale: (id: string, customerId: string) => Promise<{ saleId: string; saleNumber: string } | null>;
  getOpportunityById: (id: string) => Promise<Opportunity | null>;
  addActivity: (opportunityId: string, data: { type: 'task' | 'call' | 'message'; title: string; due_at?: string; notes?: string }) => Promise<OpportunityActivity | null>;
  deleteDeal: (id: string) => Promise<void>;
}

const FunnelContext = createContext<FunnelContextValue | null>(null);

const defaultFilters: FunnelFilters = {};

export function FunnelProvider({ children }: { children: React.ReactNode }) {
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [lossReasons, setLossReasons] = useState<LossReason[]>([]);
  const [filters, setFiltersState] = useState<FunnelFilters>(defaultFilters);
  const [viewMode, setViewMode] = useState<FunnelViewMode>('kanban');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setFilters = useCallback((f: Partial<FunnelFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...f }));
  }, []);

  const fetchStages = useCallback(async () => {
    try {
      setError(null);
      const res = await apiService.getFunnelStages();
      if (res.success && res.data) setStages(res.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar estágios');
    }
  }, []);

  const fetchOpportunities = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiService.getOpportunities({
        seller: filters.sellerId,
        stage: filters.stageId,
        status: filters.status,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
        search: filters.search,
      });
      if (res.success && res.data) setOpportunities(res.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar oportunidades');
    } finally {
      setLoading(false);
    }
  }, [filters.sellerId, filters.stageId, filters.status, filters.dateFrom, filters.dateTo, filters.search]);

  const fetchLossReasons = useCallback(async () => {
    try {
      const res = await apiService.getLossReasons();
      if (res.success && res.data) setLossReasons(res.data);
    } catch {
      // opcional
    }
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchStages(), fetchLossReasons()]);
    await fetchOpportunities();
    setLoading(false);
  }, [fetchStages, fetchLossReasons, fetchOpportunities]);

  const moveDeal = useCallback(async (opportunityId: string, stageId: string) => {
    const prev = [...opportunities];
    setOpportunities((current) =>
      current.map((o) =>
        o._id === opportunityId ? { ...o, stage: { ...o.stage, _id: stageId } as PipelineStage } : o
      )
    );
    try {
      const res = await apiService.moveOpportunityStage(opportunityId, stageId);
      if (res.success && res.data) {
        setOpportunities((current) => current.map((o) => (o._id === opportunityId ? res.data! : o)));
      }
    } catch {
      setOpportunities(prev);
      throw new Error('Falha ao mover oportunidade');
    }
  }, [opportunities]);

  const createDeal = useCallback(
    async (data: Parameters<typeof apiService.createOpportunity>[0]) => {
      try {
        const res = await apiService.createOpportunity(data);
        if (res.success && res.data) {
          setOpportunities((curr) => [res.data!, ...curr]);
          return res.data;
        }
      } catch {
        // caller can show toast
      }
      return null;
    },
    []
  );

  const updateDeal = useCallback(async (id: string, data: Parameters<typeof apiService.updateOpportunity>[1]) => {
    try {
      const res = await apiService.updateOpportunity(id, data);
      if (res.success && res.data) {
        setOpportunities((curr) => curr.map((o) => (o._id === id ? res.data! : o)));
        return res.data;
      }
    } catch {
      //
    }
    return null;
  }, []);

  const markWon = useCallback(async (id: string) => {
    const res = await apiService.setOpportunityStatus(id, 'won');
    if (res.success && res.data) setOpportunities((curr) => curr.map((o) => (o._id === id ? res.data! : o)));
  }, []);

  const markLost = useCallback(async (id: string, lossReasonId: string) => {
    const res = await apiService.setOpportunityStatus(id, 'lost', lossReasonId);
    if (res.success && res.data) setOpportunities((curr) => curr.map((o) => (o._id === id ? res.data! : o)));
  }, []);

  const convertToSale = useCallback(async (id: string, customerId: string) => {
    try {
      const res = await apiService.convertOpportunityToSale(id, customerId);
      if (res.success && res.data) {
        setOpportunities((curr) => curr.map((o) => (o._id === id ? res.data!.opportunity : o)));
        const sale = res.data.sale;
        return sale ? { saleId: sale._id, saleNumber: sale.saleNumber } : null;
      }
    } catch {
      //
    }
    return null;
  }, []);

  const getOpportunityById = useCallback(async (id: string) => {
    try {
      const res = await apiService.getOpportunity(id);
      return res.success ? res.data : null;
    } catch {
      return null;
    }
  }, []);

  const addActivity = useCallback(async (opportunityId: string, data: { type: 'task' | 'call' | 'message'; title: string; due_at?: string; notes?: string }) => {
    try {
      const res = await apiService.createOpportunityActivity(opportunityId, data);
      if (res.success && res.data) return res.data;
    } catch {
      //
    }
    return null;
  }, []);

  const deleteDeal = useCallback(async (id: string) => {
    await apiService.deleteOpportunity(id);
    setOpportunities((curr) => curr.filter((o) => o._id !== id));
  }, []);

  const value = useMemo<FunnelContextValue>(
    () => ({
      stages,
      opportunities,
      lossReasons,
      filters,
      viewMode,
      loading,
      error,
      setFilters,
      setViewMode,
      fetchStages,
      fetchOpportunities,
      fetchLossReasons,
      fetchAll,
      moveDeal,
      createDeal,
      updateDeal,
      markWon,
      markLost,
      convertToSale,
      getOpportunityById,
      addActivity,
      deleteDeal,
    }),
    [
      stages,
      opportunities,
      lossReasons,
      filters,
      viewMode,
      loading,
      error,
      setFilters,
      fetchStages,
      fetchOpportunities,
      fetchLossReasons,
      fetchAll,
      moveDeal,
      createDeal,
      updateDeal,
      markWon,
      markLost,
      convertToSale,
      getOpportunityById,
      addActivity,
      deleteDeal,
    ]
  );

  return <FunnelContext.Provider value={value}>{children}</FunnelContext.Provider>;
}

export function useFunnel() {
  const ctx = useContext(FunnelContext);
  if (!ctx) throw new Error('useFunnel must be used within FunnelProvider');
  return ctx;
}
