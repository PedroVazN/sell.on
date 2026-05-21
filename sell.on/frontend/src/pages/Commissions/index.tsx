import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Trash2,
  Upload,
  Download,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import {
  apiService,
  CommissionRow,
  CommissionMeta,
  CommissionValidationStatus,
} from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToastContext } from '../../contexts/ToastContext';
import { useConfirm } from '../../contexts/ConfirmContext';
import { formatCurrency } from '../../utils/formatters';
import * as S from './styles';

const STATUS_LABEL: Record<CommissionValidationStatus, string> = {
  em_analise: 'Em análise',
  aprovado: 'Aprovado',
  reprovado: 'Reprovado',
};

const STATUS_OPTIONS: CommissionValidationStatus[] = [
  'em_analise',
  'aprovado',
  'reprovado',
];

function currentMonthYYYYMM(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

function fmtDate(value?: string | null) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('pt-BR');
}

export const Commissions: React.FC = () => {
  const { user } = useAuth();
  const { success: showSuccess, error: showError } = useToastContext();
  const { confirm } = useConfirm();

  const [month, setMonth] = useState<string>(currentMonthYYYYMM());
  const [rows, setRows] = useState<CommissionRow[]>([]);
  const [meta, setMeta] = useState<CommissionMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingNfId, setSavingNfId] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [validatingId, setValidatingId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [nfDraft, setNfDraft] = useState<Record<string, string>>({});
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});

  const isAdmin = user?.role === 'admin';
  const canExport = isAdmin;
  const canValidate = isAdmin;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiService.getCommissions(month);
      if (res.success) {
        const list = res.data || [];
        setRows(list);
        setMeta(res.meta || null);
        setNfDraft(
          list.reduce<Record<string, string>>((acc, row) => {
            acc[row.proposalId] = row.commission.nfNumber || '';
            return acc;
          }, {})
        );
      }
    } catch (err) {
      showError('Comissões', err instanceof Error ? err.message : 'Erro ao carregar');
    } finally {
      setLoading(false);
    }
  }, [month, showError]);

  useEffect(() => {
    load();
  }, [load]);

  const replaceRow = (updated: CommissionRow) => {
    setRows((prev) => prev.map((r) => (r.proposalId === updated.proposalId ? updated : r)));
    setNfDraft((prev) => ({ ...prev, [updated.proposalId]: updated.commission.nfNumber || '' }));
  };

  const handleSaveNf = async (row: CommissionRow) => {
    const value = (nfDraft[row.proposalId] || '').trim();
    if (value === (row.commission.nfNumber || '')) return;
    setSavingNfId(row.proposalId);
    try {
      const res = await apiService.updateCommissionNf(row.proposalId, value);
      if (res.success && res.data) {
        replaceRow(res.data);
        showSuccess('Comissões', 'NF atualizada');
      }
    } catch (err) {
      showError('Comissões', err instanceof Error ? err.message : 'Erro ao salvar NF');
    } finally {
      setSavingNfId(null);
    }
  };

  const handleUpload = async (row: CommissionRow, file: File) => {
    setUploadingId(row.proposalId);
    try {
      const res = await apiService.uploadCommissionAttachment(row.proposalId, file);
      if (res.success && res.data) {
        replaceRow(res.data);
        showSuccess('Comissões', 'Anexo enviado');
      }
    } catch (err) {
      showError('Comissões', err instanceof Error ? err.message : 'Erro ao enviar');
    } finally {
      setUploadingId(null);
      const input = fileInputs.current[row.proposalId];
      if (input) input.value = '';
    }
  };

  const handleDeleteAttachment = async (row: CommissionRow, attachmentId: string) => {
    const ok = await confirm({
      title: 'Excluir anexo?',
      message: 'Esta ação não pode ser desfeita.',
      confirmLabel: 'Excluir',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      const res = await apiService.deleteCommissionAttachment(row.proposalId, attachmentId);
      if (res.success && res.data) {
        replaceRow(res.data);
        showSuccess('Comissões', 'Anexo removido');
      }
    } catch (err) {
      showError('Comissões', err instanceof Error ? err.message : 'Erro ao excluir');
    }
  };

  const handleValidate = async (row: CommissionRow, status: CommissionValidationStatus) => {
    if (row.commission.validationStatus === status) return;
    setValidatingId(row.proposalId);
    try {
      const res = await apiService.validateCommission(row.proposalId, status);
      if (res.success && res.data) {
        replaceRow(res.data);
        showSuccess('Comissões', `Status alterado para ${STATUS_LABEL[status]}`);
      }
    } catch (err) {
      showError('Comissões', err instanceof Error ? err.message : 'Erro ao validar');
    } finally {
      setValidatingId(null);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await apiService.downloadCommissionsCsv(month);
      showSuccess('Comissões', 'Relatório CSV baixado');
    } catch (err) {
      showError('Comissões', err instanceof Error ? err.message : 'Erro ao exportar');
    } finally {
      setExporting(false);
    }
  };

  const totals = useMemo(() => {
    const value = rows.reduce((acc, r) => acc + (Number(r.total) || 0), 0);
    const byStatus: Record<string, number> = { em_analise: 0, aprovado: 0, reprovado: 0 };
    rows.forEach((r) => {
      byStatus[r.commission.validationStatus] = (byStatus[r.commission.validationStatus] || 0) + 1;
    });
    return { value, proposals: rows.length, byStatus };
  }, [rows]);

  return (
    <S.Container>
      <S.Header>
        <div>
          <S.Title>Comissões</S.Title>
          <S.Subtitle>
            Propostas ganhas do mês selecionado. {isAdmin
              ? 'Você vê e valida todas. Vendedor anexa NF nas suas próprias.'
              : 'Você vê e anexa NF apenas das suas propostas ganhas.'}
          </S.Subtitle>
        </div>
        <S.Toolbar>
          <S.Field>
            <S.Label htmlFor="month">Mês</S.Label>
            <S.MonthInput
              id="month"
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            />
          </S.Field>
          <S.Button type="button" onClick={load} disabled={loading}>
            <RefreshCw size={16} />
            Atualizar
          </S.Button>
          {canExport && (
            <S.Button type="button" $primary onClick={handleExport} disabled={exporting || rows.length === 0}>
              {exporting ? <Loader2 size={16} /> : <Download size={16} />}
              Exportar CSV
            </S.Button>
          )}
        </S.Toolbar>
      </S.Header>

      <S.SummaryRow>
        <S.SummaryCard>
          <S.SummaryLabel>Propostas ganhas</S.SummaryLabel>
          <S.SummaryValue>{totals.proposals}</S.SummaryValue>
        </S.SummaryCard>
        <S.SummaryCard>
          <S.SummaryLabel>Valor total</S.SummaryLabel>
          <S.SummaryValue>{formatCurrency(totals.value)}</S.SummaryValue>
        </S.SummaryCard>
        <S.SummaryCard>
          <S.SummaryLabel>Aprovadas</S.SummaryLabel>
          <S.SummaryValue style={{ color: '#15803d' }}>
            {totals.byStatus.aprovado || 0}
          </S.SummaryValue>
        </S.SummaryCard>
        <S.SummaryCard>
          <S.SummaryLabel>Em análise</S.SummaryLabel>
          <S.SummaryValue style={{ color: '#92400e' }}>
            {totals.byStatus.em_analise || 0}
          </S.SummaryValue>
        </S.SummaryCard>
        <S.SummaryCard>
          <S.SummaryLabel>Reprovadas</S.SummaryLabel>
          <S.SummaryValue style={{ color: '#b91c1c' }}>
            {totals.byStatus.reprovado || 0}
          </S.SummaryValue>
        </S.SummaryCard>
      </S.SummaryRow>

      {loading ? (
        <S.Empty>
          <Loader2 size={24} style={{ verticalAlign: 'middle', marginRight: 8 }} />
          Carregando comissões...
        </S.Empty>
      ) : rows.length === 0 ? (
        <S.Empty>Nenhuma proposta ganha neste mês.</S.Empty>
      ) : (
        <S.TableWrapper>
          <S.Table>
            <thead>
              <tr>
                <th>Proposta</th>
                <th>Fechada em</th>
                <th>Vendedor</th>
                <th>Distribuidor</th>
                <th>Cliente</th>
                <th style={{ textAlign: 'right' }}>Valor</th>
                <th>NF</th>
                <th>Anexos (até {meta?.maxAttachments ?? 2})</th>
                <th>Validação</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const reachedMax =
                  row.commission.attachments.length >= (meta?.maxAttachments ?? 2);
                const canEdit = row.canEdit;
                return (
                  <tr key={row.proposalId}>
                    <td>
                      <strong>{row.proposalNumber}</strong>
                    </td>
                    <td>{fmtDate(row.closedAt)}</td>
                    <td>{row.seller.name}</td>
                    <td>{row.distributor.name}</td>
                    <td>{row.client.name}</td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      {formatCurrency(row.total)}
                    </td>
                    <td>
                      <S.NfInput
                        type="text"
                        value={nfDraft[row.proposalId] ?? ''}
                        onChange={(e) =>
                          setNfDraft((prev) => ({
                            ...prev,
                            [row.proposalId]: e.target.value,
                          }))
                        }
                        onBlur={() => canEdit && handleSaveNf(row)}
                        placeholder="Número da NF"
                        disabled={!canEdit || savingNfId === row.proposalId}
                        maxLength={80}
                      />
                    </td>
                    <td>
                      <S.AttachmentList>
                        {row.commission.attachments.map((att) => (
                          <S.AttachmentChip key={att._id}>
                            <a
                              href={att.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              title={att.fileName}
                            >
                              <ExternalLink size={12} style={{ marginRight: 4 }} />
                              {att.fileName}
                            </a>
                            {canEdit && (
                              <S.IconBtn
                                $danger
                                type="button"
                                title="Excluir anexo"
                                onClick={() => handleDeleteAttachment(row, att._id)}
                              >
                                <Trash2 size={12} />
                              </S.IconBtn>
                            )}
                          </S.AttachmentChip>
                        ))}
                        {canEdit && !reachedMax && (
                          <>
                            <S.UploadInput
                              type="file"
                              ref={(el) => {
                                fileInputs.current[row.proposalId] = el;
                              }}
                              id={`file-${row.proposalId}`}
                              accept=".pdf,.png,.jpg,.jpeg,.webp,.xls,.xlsx,.csv,application/pdf,image/*"
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) handleUpload(row, f);
                              }}
                              disabled={uploadingId === row.proposalId}
                            />
                            <S.UploadLabel
                              htmlFor={`file-${row.proposalId}`}
                              className={uploadingId === row.proposalId ? 'disabled' : ''}
                            >
                              {uploadingId === row.proposalId ? (
                                <Loader2 size={12} />
                              ) : (
                                <Upload size={12} />
                              )}
                              {uploadingId === row.proposalId ? 'Enviando...' : 'Anexar NF'}
                            </S.UploadLabel>
                          </>
                        )}
                        {row.commission.attachments.length === 0 && !canEdit && (
                          <span style={{ fontSize: 12, opacity: 0.7 }}>—</span>
                        )}
                      </S.AttachmentList>
                    </td>
                    <td>
                      <S.ValidationGroup>
                        <S.StatusBadge $status={row.commission.validationStatus}>
                          {row.commission.validationLabel}
                        </S.StatusBadge>
                        {row.commission.validatedBy && (
                          <span style={{ fontSize: 11, opacity: 0.8 }}>
                            por {row.commission.validatedBy.name} ·{' '}
                            {fmtDate(row.commission.validatedAt)}
                          </span>
                        )}
                        {canValidate && (
                          <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
                            {STATUS_OPTIONS.map((status) => {
                              const Icon =
                                status === 'aprovado'
                                  ? CheckCircle2
                                  : status === 'reprovado'
                                    ? XCircle
                                    : Clock;
                              const active = row.commission.validationStatus === status;
                              return (
                                <S.Button
                                  key={status}
                                  type="button"
                                  $primary={active && status === 'aprovado'}
                                  $danger={active && status === 'reprovado'}
                                  onClick={() => handleValidate(row, status)}
                                  disabled={validatingId === row.proposalId || active}
                                  style={{ padding: '4px 8px', fontSize: 11 }}
                                  title={STATUS_LABEL[status]}
                                >
                                  <Icon size={12} />
                                  {STATUS_LABEL[status]}
                                </S.Button>
                              );
                            })}
                          </div>
                        )}
                      </S.ValidationGroup>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </S.Table>
        </S.TableWrapper>
      )}
    </S.Container>
  );
};

export default Commissions;
