import styled from 'styled-components';

export const Wrapper = styled.div`
  margin-top: 8px;
`;

export const UploadRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: flex-end;
  margin-bottom: 16px;
`;

export const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 140px;
  flex: 1;
`;

export const Label = styled.label`
  font-size: 13px;
  font-weight: 600;
  color: #374151;
`;

export const Select = styled.select`
  padding: 8px 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background: #fff;
`;

export const Input = styled.input`
  padding: 8px 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
`;

export const UploadButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #3b82f6;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    background: #2563eb;
  }
`;

export const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const Item = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
`;

export const ItemInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

export const ItemName = styled.a`
  font-weight: 600;
  color: #1d4ed8;
  text-decoration: none;
  font-size: 14px;
  word-break: break-word;

  &:hover {
    text-decoration: underline;
  }
`;

export const ItemMeta = styled.div`
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
`;

export const ItemActions = styled.div`
  display: flex;
  gap: 8px;
  flex-shrink: 0;
`;

export const IconButton = styled.button<{ $danger?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border: 1px solid ${(p) => (p.$danger ? '#fecaca' : '#e5e7eb')};
  background: ${(p) => (p.$danger ? '#fef2f2' : '#fff')};
  color: ${(p) => (p.$danger ? '#dc2626' : '#374151')};
  border-radius: 6px;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const Empty = styled.p`
  color: #6b7280;
  font-size: 14px;
  margin: 0;
`;

export const Hint = styled.p`
  font-size: 12px;
  color: #9ca3af;
  margin: 8px 0 0;
`;

export const ReadOnlyBadge = styled.span`
  font-size: 12px;
  color: #6b7280;
  background: #f3f4f6;
  padding: 4px 8px;
  border-radius: 4px;
`;
