import styled from 'styled-components';
import { theme } from '../../styles/theme';

export const Input = styled.input<{ $hasError?: boolean }>`
  width: 100%;
  padding: 0.75rem 1rem;
  background: ${theme.colors.background.card};
  border: 1px solid ${({ $hasError }) => 
    $hasError ? theme.colors.status.error : theme.colors.border.primary
  };
  border-radius: ${theme.borderRadius.md};
  color: ${theme.colors.text.primary};
  font-size: 1rem;
  backdrop-filter: blur(10px);
  transition: all ${theme.transitions.normal};

  &::placeholder {
    color: ${theme.colors.text.muted};
  }

  &:focus {
    outline: none;
    border-color: ${({ $hasError }) => 
      $hasError ? theme.colors.status.error : theme.colors.border.focus
    };
    background: ${theme.colors.background.cardHover};
    box-shadow: 0 0 0 3px ${({ $hasError }) => 
      $hasError ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)'
    };
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const Textarea = styled.textarea<{ $hasError?: boolean }>`
  width: 100%;
  padding: 0.75rem 1rem;
  background: ${theme.colors.background.card};
  border: 1px solid ${({ $hasError }) => 
    $hasError ? theme.colors.status.error : theme.colors.border.primary
  };
  border-radius: ${theme.borderRadius.md};
  color: ${theme.colors.text.primary};
  font-size: 1rem;
  backdrop-filter: blur(10px);
  transition: all ${theme.transitions.normal};
  resize: vertical;
  min-height: 80px;
  font-family: inherit;

  &::placeholder {
    color: ${theme.colors.text.muted};
  }

  &:focus {
    outline: none;
    border-color: ${({ $hasError }) => 
      $hasError ? theme.colors.status.error : theme.colors.border.focus
    };
    background: ${theme.colors.background.cardHover};
    box-shadow: 0 0 0 3px ${({ $hasError }) => 
      $hasError ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)'
    };
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const Select = styled.select<{ $hasError?: boolean }>`
  width: 100%;
  padding: 0.75rem 1rem;
  background: ${theme.colors.background.card};
  border: 1px solid ${({ $hasError }) => 
    $hasError ? theme.colors.status.error : theme.colors.border.primary
  };
  border-radius: ${theme.borderRadius.md};
  color: ${theme.colors.text.primary};
  font-size: 1rem;
  backdrop-filter: blur(10px);
  transition: all ${theme.transitions.normal};
  cursor: pointer;

  option {
    background: ${theme.colors.background.secondary};
    color: ${theme.colors.text.primary};
  }

  &:focus {
    outline: none;
    border-color: ${({ $hasError }) => 
      $hasError ? theme.colors.status.error : theme.colors.border.focus
    };
    background: ${theme.colors.background.cardHover};
    box-shadow: 0 0 0 3px ${({ $hasError }) => 
      $hasError ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)'
    };
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const Label = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: ${theme.colors.text.primary};
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.5rem;
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;

  .error {
    color: ${theme.colors.status.error};
    font-size: 0.875rem;
    font-weight: 500;
    margin-top: 0.25rem;
  }
`;

export const SearchInput = styled.div`
  position: relative;
  flex: 1;
  max-width: 400px;

  input {
    width: 100%;
    padding: 0.75rem 1rem 0.75rem 3rem;
    background: ${theme.colors.background.card};
    border: 1px solid ${theme.colors.border.primary};
    border-radius: ${theme.borderRadius.md};
    color: ${theme.colors.text.primary};
    font-size: 1rem;
    backdrop-filter: blur(10px);
    transition: all ${theme.transitions.normal};

    &::placeholder {
      color: ${theme.colors.text.muted};
    }

    &:focus {
      outline: none;
      border-color: ${theme.colors.border.focus};
      background: ${theme.colors.background.cardHover};
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
  }

  svg {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: ${theme.colors.text.muted};
    transition: color ${theme.transitions.normal};
  }

  &:focus-within svg {
    color: ${theme.colors.text.primary};
  }
`;
