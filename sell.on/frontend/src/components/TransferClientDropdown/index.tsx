import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRightLeft, ChevronDown, Loader2 } from 'lucide-react';
import { apiService } from '../../services/api';
import type { User } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToastContext } from '../../contexts/ToastContext';
import * as S from './styles';

interface TransferClientDropdownProps {
  /** Cliente(s) a transferir */
  clientIds?: string[];
  /** Alternativa a clientIds: resolve os ids no momento da transferência */
  resolveClientIds?: () => Promise<string[]>;
  /** Dono atual, removido da lista de destinos */
  currentOwnerId?: string | null;
  /** Chamado após transferência concluída */
  onTransferred?: () => void;
  /** Confirmação antes de transferir; recebe o nome do vendedor de destino */
  confirmMessage?: (sellerName: string) => string;
  label?: string;
  compact?: boolean;
  disabled?: boolean;
}

let sellersCache: User[] | null = null;
let sellersRequest: Promise<User[]> | null = null;

async function loadSellers(): Promise<User[]> {
  if (sellersCache) return sellersCache;
  if (!sellersRequest) {
    sellersRequest = apiService
      .getUsers(1, 200, '', 'vendedor')
      .then((res) => {
        const list = (res.data || []).filter((u) => u.role === 'vendedor');
        sellersCache = list;
        return list;
      })
      .finally(() => {
        sellersRequest = null;
      });
  }
  return sellersRequest;
}

/** Invalida o cache de vendedores (usar após criar/editar usuários) */
export function clearSellersCache(): void {
  sellersCache = null;
}

export const TransferClientDropdown: React.FC<TransferClientDropdownProps> = ({
  clientIds,
  resolveClientIds,
  currentOwnerId,
  onTransferred,
  confirmMessage,
  label = 'Transferir',
  compact = false,
  disabled = false,
}) => {
  const { user } = useAuth();
  const { success: toastSuccess, error: toastError } = useToastContext();

  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const [sellers, setSellers] = useState<User[]>(sellersCache || []);
  const [loadingSellers, setLoadingSellers] = useState(false);
  const [transferringTo, setTransferringTo] = useState<string | null>(null);
  const [filter, setFilter] = useState('');

  const updatePosition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const menuWidth = 280;
    const left = Math.max(8, Math.min(rect.left, window.innerWidth - menuWidth - 8));
    setPosition({ top: rect.bottom + 6, left });
  }, []);

  const closeMenu = useCallback(() => {
    setOpen(false);
    setFilter('');
  }, []);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (menuRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      closeMenu();
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMenu();
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open, closeMenu, updatePosition]);

  const handleToggle = async () => {
    if (open) {
      closeMenu();
      return;
    }

    updatePosition();
    setOpen(true);

    if (!sellersCache) {
      setLoadingSellers(true);
      try {
        setSellers(await loadSellers());
      } catch {
        toastError('Erro', 'Não foi possível carregar os vendedores.');
        setOpen(false);
      } finally {
        setLoadingSellers(false);
      }
    } else {
      setSellers(sellersCache);
    }
  };

  const handleSelect = async (seller: User) => {
    if (confirmMessage && !window.confirm(confirmMessage(seller.name))) return;

    setTransferringTo(seller._id);
    try {
      const ids = resolveClientIds ? await resolveClientIds() : (clientIds || []);
      if (!ids.length) {
        toastError('Transferência', 'Nenhum cliente para transferir.');
        return;
      }

      const res = await apiService.transferClients(ids, seller._id);
      if (res.success) {
        toastSuccess(
          'Transferência concluída',
          (res as { message?: string }).message
            || res.data?.message
            || `${ids.length} cliente(s) para ${seller.name}.`
        );
        closeMenu();
        onTransferred?.();
      } else {
        toastError('Erro', (res as { message?: string }).message || 'Não foi possível transferir.');
      }
    } catch (err) {
      toastError('Erro', err instanceof Error ? err.message : 'Não foi possível transferir.');
    } finally {
      setTransferringTo(null);
    }
  };

  const term = filter.trim().toLowerCase();
  const options = sellers.filter((s) => {
    if (s._id === currentOwnerId) return false;
    if (s._id === user?._id) return false;
    if (!term) return true;
    return `${s.name} ${s.email}`.toLowerCase().includes(term);
  });

  return (
    <>
      <S.TriggerButton
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        disabled={disabled || (!resolveClientIds && !clientIds?.length)}
        $compact={compact}
        title="Transferir para outro vendedor"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <ArrowRightLeft size={compact ? 14 : 16} />
        {label}
        <ChevronDown size={compact ? 12 : 14} />
      </S.TriggerButton>

      {open && position && createPortal(
        <S.Menu ref={menuRef} style={{ top: position.top, left: position.left }} role="menu">
          <S.MenuTitle>Transferir para</S.MenuTitle>

          {sellers.length > 6 && (
            <S.SearchRow>
              <S.SearchField
                autoFocus
                placeholder="Buscar vendedor..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </S.SearchRow>
          )}

          {loadingSellers ? (
            <S.MenuMessage>
              <Loader2 size={16} className="spin" />
              Carregando vendedores...
            </S.MenuMessage>
          ) : options.length === 0 ? (
            <S.MenuMessage>Nenhum vendedor disponível.</S.MenuMessage>
          ) : (
            <S.OptionList>
              {options.map((seller) => (
                <S.OptionItem key={seller._id}>
                  <S.OptionButton
                    type="button"
                    role="menuitem"
                    onClick={() => handleSelect(seller)}
                    disabled={transferringTo !== null}
                  >
                    <strong>
                      {transferringTo === seller._id ? 'Transferindo...' : seller.name}
                    </strong>
                    {seller.email && <span>{seller.email}</span>}
                  </S.OptionButton>
                </S.OptionItem>
              ))}
            </S.OptionList>
          )}
        </S.Menu>,
        document.body
      )}
    </>
  );
};
