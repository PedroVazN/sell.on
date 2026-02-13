import React, { useState, useEffect } from 'react';
import { apiService, PriceListItem, Distributor, Product } from '../../services/api';
import { useToastContext } from '../../contexts/ToastContext';
import { X, Trash2, Loader2 } from 'lucide-react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';

interface PriceListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (priceItem: PriceListItem) => void;
  distributors: Distributor[];
  products: Product[];
  priceItem?: PriceListItem | null;
}

interface PaymentMethod {
  type: 'aVista' | 'boleto' | 'cartao';
  installments: number;
  price: number;
}

interface ProductPricing {
  productId: string;
  product: Product;
  paymentMethods: PaymentMethod[];
}

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const ModalContainer = styled.div`
  background: ${theme.colors.background.modal};
  backdrop-filter: blur(20px);
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.lg};
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: ${theme.shadows.large};
  display: flex;
  flex-direction: column;
  position: relative;
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid ${theme.colors.border.primary};
  background: ${theme.colors.background.card};
`;

const ModalTitle = styled.h2`
  margin: 0;
  color: ${theme.colors.text.primary};
  font-size: 1.5rem;
  font-weight: 600;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.text.secondary};
  cursor: pointer;
  padding: 0.5rem;
  border-radius: ${theme.borderRadius.sm};
  transition: all 0.2s ease;
  
  &:hover {
    background: ${theme.colors.background.secondary};
    color: ${theme.colors.text.primary};
  }
`;

const ModalBody = styled.div`
  padding: 1.5rem;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-height: calc(90vh - 140px);
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${theme.colors.background.secondary};
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${theme.colors.border.secondary};
    border-radius: 4px;
    border: 1px solid ${theme.colors.background.secondary};
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: ${theme.colors.primary};
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  color: ${theme.colors.text.primary};
  font-weight: 500;
  font-size: 0.9rem;
`;

const Input = styled.input<{ $hasError?: boolean }>`
  padding: 0.75rem;
  border: 1px solid ${({ $hasError }) => $hasError ? theme.colors.error : theme.colors.border.primary};
  border-radius: ${theme.borderRadius.sm};
  background: ${theme.colors.background.secondary};
  color: ${theme.colors.text.primary};
  font-size: 1rem;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  &::placeholder {
    color: ${theme.colors.text.muted};
  }
`;

const Select = styled.select<{ $hasError?: boolean }>`
  padding: 0.75rem;
  border: 1px solid ${({ $hasError }) => $hasError ? theme.colors.error : theme.colors.border.primary};
  border-radius: ${theme.borderRadius.sm};
  background: ${theme.colors.background.secondary};
  color: ${theme.colors.text.primary};
  font-size: 1rem;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const ErrorMessage = styled.span`
  color: ${theme.colors.error};
  font-size: 0.8rem;
  font-weight: 500;
`;

const ModalFooter = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding: 1.5rem;
  border-top: 1px solid ${theme.colors.border.primary};
  background: ${theme.colors.background.card};
  flex-shrink: 0;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: ${theme.borderRadius.sm};
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 120px;
  justify-content: center;
  
  ${({ variant = 'secondary' }) => variant === 'primary' ? `
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
    
    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
    }
  ` : `
    background: transparent;
    color: ${theme.colors.text.primary};
    border: 1px solid ${theme.colors.border.primary};
    
    &:hover:not(:disabled) {
      background: ${theme.colors.background.secondary};
      border-color: ${theme.colors.border.secondary};
    }
  `}
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const LoadingSpinner = styled(Loader2)`
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const Grid = styled.div<{ columns?: number }>`
  display: grid;
  grid-template-columns: repeat(${({ columns = 2 }) => columns}, 1fr);
  gap: 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ProductCard = styled.div`
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.sm};
  padding: 1rem;
  background: ${theme.colors.background.secondary};
`;

const ProductHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const ProductInfo = styled.div`
  flex: 1;
  
  h4 {
    margin: 0 0 0.25rem 0;
    color: ${theme.colors.text.primary};
    font-size: 1rem;
  }
  
  p {
    margin: 0;
    color: ${theme.colors.text.secondary};
    font-size: 0.875rem;
  }
`;

const RemoveButton = styled.button`
  background: ${theme.colors.error};
  color: white;
  border: none;
  border-radius: ${theme.borderRadius.sm};
  padding: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: #dc2626;
  }
`;

const PaymentMethodCard = styled.div`
  border: 1px solid ${theme.colors.border.secondary};
  border-radius: ${theme.borderRadius.sm};
  padding: 0.75rem;
  background: ${theme.colors.background.card};
  margin-bottom: 0.5rem;
`;

const PaymentMethodHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
`;

const PaymentMethodType = styled.span`
  font-weight: 500;
  color: ${theme.colors.text.primary};
  text-transform: capitalize;
`;

const PaymentMethodInputs = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
`;


const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${theme.colors.text.secondary};
  
  p {
    margin: 0.5rem 0 0 0;
  }
`;

export const PriceListModal: React.FC<PriceListModalProps> = ({
  isOpen,
  onClose,
  onSave,
  distributors,
  products,
  priceItem
}) => {
  const { error: showError } = useToastContext();
  const [formData, setFormData] = useState({
    distributor: '',
    validFrom: '',
    validUntil: '',
    notes: ''
  });
  const [selectedProducts, setSelectedProducts] = useState<ProductPricing[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (priceItem) {
        // Para edição, vamos simplificar por enquanto
        setFormData({
          distributor: priceItem.distributor?._id || '',
          validFrom: priceItem.validFrom ? new Date(priceItem.validFrom).toISOString().split('T')[0] : '',
          validUntil: priceItem.validUntil ? new Date(priceItem.validUntil).toISOString().split('T')[0] : '',
          notes: priceItem.notes || ''
        });
      } else {
        setFormData({
          distributor: '',
          validFrom: '',
          validUntil: '',
          notes: ''
        });
        setSelectedProducts([]);
      }
      setErrors({});
    }
  }, [isOpen, priceItem]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpar erro do campo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const addProduct = (productId: string) => {
    const product = products.find(p => p._id === productId);
    if (!product) return;

    const newProductPricing: ProductPricing = {
      productId,
      product,
      paymentMethods: [
        { type: 'aVista', installments: 1, price: 0 },
        { type: 'boleto', installments: 1, price: 0 },
        { type: 'cartao', installments: 1, price: 0 }
      ]
    };

    setSelectedProducts(prev => [...prev, newProductPricing]);
  };

  const removeProduct = (productId: string) => {
    setSelectedProducts(prev => prev.filter(p => p.productId !== productId));
  };


  const updatePaymentMethod = (productId: string, index: number, field: keyof PaymentMethod, value: any) => {
    setSelectedProducts(prev => prev.map(p => 
      p.productId === productId 
        ? {
            ...p,
            paymentMethods: p.paymentMethods.map((pm, i) => 
              i === index ? { ...pm, [field]: value } : pm
            )
          }
        : p
    ));
  };


  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.distributor) {
      newErrors.distributor = 'Distribuidor é obrigatório';
    }

    if (selectedProducts.length === 0) {
      newErrors.products = 'Pelo menos um produto deve ser selecionado';
    }

    selectedProducts.forEach((product, productIndex) => {
      product.paymentMethods.forEach((payment, paymentIndex) => {
        if (payment.price > 0 && payment.installments < 1) {
          newErrors[`payment_${productIndex}_${paymentIndex}`] = 'Número de parcelas deve ser pelo menos 1';
        }
      });
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      // Criar um item de preço para cada produto
      const priceItems = selectedProducts.map(product => ({
        distributor: formData.distributor,
        product: product.productId,
        pricing: {
          aVista: product.paymentMethods.find(pm => pm.type === 'aVista')?.price || 0,
          credito: product.paymentMethods
            .filter(pm => pm.type === 'cartao' && pm.price > 0)
            .map(pm => ({ parcelas: pm.installments, preco: pm.price })),
          boleto: product.paymentMethods
            .filter(pm => pm.type === 'boleto' && pm.price > 0)
            .map(pm => ({ parcelas: pm.installments, preco: pm.price }))
        },
        isActive: true,
        validFrom: formData.validFrom ? new Date(formData.validFrom).toISOString() : new Date().toISOString(),
        validUntil: formData.validUntil ? new Date(formData.validUntil).toISOString() : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        notes: formData.notes
      }));

      // Salvar cada item individualmente
      const savedItems = [];
      for (const priceData of priceItems) {
        const response = await apiService.createPriceListItem(priceData);
        savedItems.push(response.data);
      }

      // Chamar callback com o primeiro item salvo para atualizar a lista
      if (savedItems.length > 0) {
        onSave(savedItems[0]);
      }
      
      onClose();
    } catch (err) {
      console.error('Erro ao salvar preços:', err);
      showError('Erro ao salvar preços', 'Verifique os dados e tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const availableProducts = products.filter(product => 
    !selectedProducts.some(sp => sp.productId === product._id)
  );

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>
            {priceItem ? 'Editar Lista de Preços' : 'Nova Lista de Preços'}
          </ModalTitle>
          <CloseButton onClick={onClose}>
            <X size={24} />
          </CloseButton>
        </ModalHeader>

        <form onSubmit={handleSubmit}>
          <ModalBody>
            <Grid columns={2}>
              <FormGroup>
                <Label>Distribuidor *</Label>
                <Select
                  name="distributor"
                  value={formData.distributor}
                  onChange={handleInputChange}
                  $hasError={!!errors.distributor}
                >
                  <option value="">Selecione um distribuidor</option>
                  {distributors.map(distributor => (
                    <option key={distributor._id} value={distributor._id}>
                      {distributor.apelido} - {distributor.razaoSocial}
                    </option>
                  ))}
                </Select>
                {errors.distributor && <ErrorMessage>{errors.distributor}</ErrorMessage>}
              </FormGroup>

              <FormGroup>
                <Label>Adicionar Produto</Label>
                <Select
                  value=""
                  onChange={(e) => {
                    if (e.target.value) {
                      addProduct(e.target.value);
                      e.target.value = '';
                    }
                  }}
                >
                  <option value="">Selecione um produto</option>
                  {availableProducts.map(product => (
                    <option key={product._id} value={product._id}>
                      {product.name}
                    </option>
                  ))}
                </Select>
              </FormGroup>
            </Grid>

            <Grid columns={2}>
              <FormGroup>
                <Label>Válido de</Label>
                <Input
                  type="date"
                  name="validFrom"
                  value={formData.validFrom}
                  onChange={handleInputChange}
                />
              </FormGroup>

              <FormGroup>
                <Label>Válido até</Label>
                <Input
                  type="date"
                  name="validUntil"
                  value={formData.validUntil}
                  onChange={handleInputChange}
                />
              </FormGroup>
            </Grid>

            {selectedProducts.length === 0 ? (
              <EmptyState>
                <p>Nenhum produto selecionado</p>
                <p>Selecione um distribuidor e adicione produtos para configurar os preços</p>
              </EmptyState>
            ) : (
              selectedProducts.map((product) => (
                <ProductCard key={product.productId}>
                  <ProductHeader>
                    <ProductInfo>
                      <h4>{product.product.name}</h4>
                      <p>{product.product.description}</p>
                    </ProductInfo>
                    <RemoveButton onClick={() => removeProduct(product.productId)}>
                      <Trash2 size={16} />
                    </RemoveButton>
                  </ProductHeader>

                  {product.paymentMethods.map((payment, index) => (
                    <PaymentMethodCard key={index}>
                      <PaymentMethodHeader>
                        <PaymentMethodType>
                          {payment.type === 'aVista' ? 'À Vista' : 
                           payment.type === 'boleto' ? 'Boleto' : 'Cartão'}
                        </PaymentMethodType>
                      </PaymentMethodHeader>
                      <PaymentMethodInputs>
                        <div>
                          <Label>Parcelas</Label>
                          <Input
                            type="number"
                            min="1"
                            value={payment.installments}
                            onChange={(e) => updatePaymentMethod(product.productId, index, 'installments', parseInt(e.target.value) || 1)}
                          />
                        </div>
                        <div>
                          <Label>Preço</Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={payment.price}
                            onChange={(e) => updatePaymentMethod(product.productId, index, 'price', parseFloat(e.target.value) || 0)}
                            placeholder="0,00"
                          />
                        </div>
                      </PaymentMethodInputs>
                    </PaymentMethodCard>
                  ))}
                </ProductCard>
              ))
            )}

            <FormGroup>
              <Label>Observações</Label>
              <Input
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Observações sobre a lista de preços..."
              />
            </FormGroup>
          </ModalBody>

          <ModalFooter>
            <Button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              variant="secondary"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              variant="primary"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size={16} />
                  Salvando...
                </>
              ) : (
                'Salvar Lista de Preços'
              )}
            </Button>
          </ModalFooter>
        </form>
      </ModalContainer>
    </ModalOverlay>
  );
};