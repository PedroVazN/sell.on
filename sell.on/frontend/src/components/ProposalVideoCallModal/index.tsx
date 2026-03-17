import React, { useEffect, useState } from 'react';
import { Loader2, Video, X } from 'lucide-react';
import { apiService, Proposal, ProposalVideoRoom } from '../../services/api';
import { useToastContext } from '../../contexts/ToastContext';
import * as S from './styles';

interface ProposalVideoCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposal: Proposal;
}

export const ProposalVideoCallModal: React.FC<ProposalVideoCallModalProps> = ({
  isOpen,
  onClose,
  proposal,
}) => {
  const { error: showError } = useToastContext();
  const [loading, setLoading] = useState(false);
  const [embedLoading, setEmbedLoading] = useState(true);
  const [room, setRoom] = useState<ProposalVideoRoom | null>(null);

  useEffect(() => {
    if (!isOpen || !proposal?._id) return;
    let cancelled = false;

    const loadRoom = async () => {
      setLoading(true);
      setEmbedLoading(true);
      setRoom(null);
      try {
        const res = await apiService.getProposalVideoRoom(proposal._id);
        if (!cancelled && res.success) setRoom(res.data);
      } catch (err) {
        if (!cancelled) {
          showError('Erro na videochamada', err instanceof Error ? err.message : 'Não foi possível abrir a sala.');
          onClose();
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadRoom();
    return () => {
      cancelled = true;
    };
  }, [isOpen, proposal?._id, showError, onClose]);

  if (!isOpen) return null;

  const title = `Videochamada - ${proposal.proposalNumber || 'Proposta'}`;

  return (
    <S.Overlay onClick={onClose}>
      <S.ModalBox onClick={(e) => e.stopPropagation()}>
        <S.Header>
          <S.Title>
            <Video size={16} style={{ marginRight: 8, verticalAlign: 'text-bottom' }} />
            {title}
          </S.Title>
          <S.HeaderActions>
            {room?.roomUrl ? (
              <S.ExternalLink href={room.roomUrl} target="_blank" rel="noreferrer">
                Abrir em nova aba
              </S.ExternalLink>
            ) : null}
            <S.CloseButton type="button" onClick={onClose} aria-label="Fechar videochamada">
              <X size={18} />
            </S.CloseButton>
          </S.HeaderActions>
        </S.Header>
        <S.Content>
          {loading || !room?.roomUrl ? (
            <S.LoadingState>
              <Loader2 size={28} className="animate-spin" style={{ marginRight: 8 }} />
              Preparando sala...
            </S.LoadingState>
          ) : (
            <>
              <S.Frame
                src={room.roomUrl}
                allow="camera; microphone; fullscreen; speaker-selection; display-capture"
                title={`Videochamada da proposta ${proposal.proposalNumber}`}
                onLoad={() => setEmbedLoading(false)}
              />
              {embedLoading && <S.LoadingState>Carregando videochamada...</S.LoadingState>}
            </>
          )}
        </S.Content>
      </S.ModalBox>
    </S.Overlay>
  );
};

export default ProposalVideoCallModal;
