import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Upload, Trash2, ExternalLink, FileText, Loader2 } from 'lucide-react';
import {
  apiService,
  ProposalAttachment,
  ProposalAttachmentCategory,
  ProposalAttachmentsMeta,
} from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToastContext } from '../../contexts/ToastContext';
import { useConfirm } from '../../contexts/ConfirmContext';
import * as S from './styles';

const CATEGORIES: { value: ProposalAttachmentCategory; label: string }[] = [
  { value: 'nf', label: 'Nota fiscal' },
  { value: 'contrato', label: 'Contrato' },
  { value: 'catalogo', label: 'Catálogo' },
  { value: 'planilha', label: 'Planilha' },
  { value: 'imagem', label: 'Imagem' },
  { value: 'outro', label: 'Outro' },
];

const ACCEPT =
  '.pdf,.png,.jpg,.jpeg,.webp,.gif,.xls,.xlsx,.csv,.doc,.docx,application/pdf,image/*';

const MAX_MB = 4;

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function uploaderName(att: ProposalAttachment) {
  const u = att.uploadedBy;
  if (u && typeof u === 'object' && 'name' in u) return u.name;
  return '—';
}

interface ProposalAttachmentsProps {
  proposalId: string;
}

export const ProposalAttachments: React.FC<ProposalAttachmentsProps> = ({ proposalId }) => {
  const { user } = useAuth();
  const { success: showSuccess, error: showError } = useToastContext();
  const { confirm } = useConfirm();
  const fileRef = useRef<HTMLInputElement>(null);

  const [list, setList] = useState<ProposalAttachment[]>([]);
  const [meta, setMeta] = useState<ProposalAttachmentsMeta>({
    canUpload: false,
    canDeleteAny: false,
  });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [category, setCategory] = useState<ProposalAttachmentCategory>('nf');
  const [description, setDescription] = useState('');

  const load = useCallback(async () => {
    if (!proposalId) return;
    setLoading(true);
    try {
      const res = await apiService.getProposalAttachments(proposalId);
      if (res.success) {
        setList(res.data || []);
        if (res.meta) setMeta(res.meta);
        else {
          const isAdmin = user?.role === 'admin';
          const isVendedor = user?.role === 'vendedor';
          setMeta({
            canUpload: isAdmin || isVendedor,
            canDeleteAny: isAdmin,
          });
        }
      }
    } catch (err) {
      showError('Anexos', err instanceof Error ? err.message : 'Erro ao carregar anexos');
    } finally {
      setLoading(false);
    }
  }, [proposalId, showError, user?.role]);

  useEffect(() => {
    load();
  }, [load]);

  const canDeleteAttachment = (att: ProposalAttachment) => {
    if (meta.canDeleteAny) return true;
    if (!meta.canUpload) return false;
    const uid = user?._id;
    const up = att.uploadedBy;
    const upId = typeof up === 'object' && up && '_id' in up ? up._id : null;
    return uid && upId && uid === upId;
  };

  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      showError('Anexos', 'Selecione um arquivo');
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      showError('Anexos', `Arquivo maior que ${MAX_MB}MB`);
      return;
    }

    setUploading(true);
    try {
      const res = await apiService.uploadProposalAttachment(
        proposalId,
        file,
        category,
        description
      );
      if (res.success && res.data) {
        setList((prev) => [res.data!, ...prev]);
        showSuccess('Anexos', 'Arquivo enviado com sucesso');
        if (fileRef.current) fileRef.current.value = '';
        setDescription('');
      }
    } catch (err) {
      showError('Anexos', err instanceof Error ? err.message : 'Erro ao enviar');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (att: ProposalAttachment) => {
    const ok = await confirm({
      title: 'Excluir anexo',
      message: `Remover "${att.fileName}"? Esta ação não pode ser desfeita.`,
      confirmLabel: 'Excluir',
      variant: 'danger',
    });
    if (!ok) return;

    try {
      const res = await apiService.deleteProposalAttachment(proposalId, att._id);
      if (res.success) {
        setList((prev) => prev.filter((a) => a._id !== att._id));
        showSuccess('Anexos', 'Anexo removido');
      }
    } catch (err) {
      showError('Anexos', err instanceof Error ? err.message : 'Erro ao excluir');
    }
  };

  return (
    <S.Wrapper>
      {meta.canUpload ? (
        <>
          <S.UploadRow>
            <S.Field style={{ flex: '2 1 200px' }}>
              <S.Label>Arquivo (PDF, imagem, planilha — máx. {MAX_MB}MB)</S.Label>
              <S.Input
                ref={fileRef}
                type="file"
                accept={ACCEPT}
                disabled={uploading}
              />
            </S.Field>
            <S.Field>
              <S.Label>Tipo</S.Label>
              <S.Select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProposalAttachmentCategory)}
                disabled={uploading}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </S.Select>
            </S.Field>
            <S.Field style={{ flex: '2 1 180px' }}>
              <S.Label>Descrição (opcional)</S.Label>
              <S.Input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex.: NF 12345"
                disabled={uploading}
                maxLength={500}
              />
            </S.Field>
            <S.UploadButton type="button" onClick={handleUpload} disabled={uploading}>
              {uploading ? <Loader2 size={16} /> : <Upload size={16} />}
              {uploading ? 'Enviando...' : 'Enviar'}
            </S.UploadButton>
          </S.UploadRow>
          <S.Hint>
            Armazenamento na nuvem (Cloudinary). Metadados salvos no MongoDB.
          </S.Hint>
        </>
      ) : (
        <S.ReadOnlyBadge>Somente visualização de anexos</S.ReadOnlyBadge>
      )}

      {loading ? (
        <S.Empty>
          <Loader2 size={18} style={{ verticalAlign: 'middle', marginRight: 8 }} />
          Carregando anexos...
        </S.Empty>
      ) : list.length === 0 ? (
        <S.Empty>Nenhum anexo nesta proposta.</S.Empty>
      ) : (
        <S.List>
          {list.map((att) => (
            <S.Item key={att._id}>
              <FileText size={20} color="#6b7280" style={{ flexShrink: 0 }} />
              <S.ItemInfo>
                <S.ItemName href={att.url} target="_blank" rel="noopener noreferrer">
                  {att.fileName}
                </S.ItemName>
                <S.ItemMeta>
                  {att.categoryLabel || att.category} · {formatBytes(att.size)} ·{' '}
                  {uploaderName(att)} ·{' '}
                  {new Date(att.createdAt).toLocaleString('pt-BR')}
                  {att.description ? ` · ${att.description}` : ''}
                </S.ItemMeta>
              </S.ItemInfo>
              <S.ItemActions>
                <S.IconButton
                  type="button"
                  title="Abrir"
                  onClick={() => window.open(att.url, '_blank')}
                >
                  <ExternalLink size={16} />
                </S.IconButton>
                {canDeleteAttachment(att) && (
                  <S.IconButton
                    type="button"
                    $danger
                    title="Excluir"
                    onClick={() => handleDelete(att)}
                  >
                    <Trash2 size={16} />
                  </S.IconButton>
                )}
              </S.ItemActions>
            </S.Item>
          ))}
        </S.List>
      )}
    </S.Wrapper>
  );
};
