import React, { useState, useEffect, useCallback } from 'react';
import { Package, Plus, Search, Filter, Edit, Trash2, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiService, Product } from '../../services/api';
import { 
  Container, 
  Header, 
  Title, 
  Actions, 
  SearchContainer, 
  SearchInput, 
  CreateButton, 
  FilterButton,
  Content,
  Table,
  TableHeader,
  TableRow,
  TableCell,
  TableBody,
  ActionButton,
  StatusBadge,
  EmptyState,
  LoadingState,
  ErrorState
} from './styles';

export const Products: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getProducts(1, 100, searchTerm);
      setProducts(response.data);
    } catch (err) {
      setError('Erro ao carregar produtos');
      console.error('Erro ao carregar produtos:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleCreateProduct = () => {
    navigate('/products/create');
  };

  const handleDeleteProduct = async (product: Product) => {
    if (window.confirm(`Tem certeza que deseja excluir o produto ${product.name}?`)) {
      try {
        await apiService.deleteProduct(product._id);
        loadProducts();
      } catch (err) {
        alert('Erro ao excluir produto');
        console.error('Erro ao excluir produto:', err);
      }
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };


  if (loading) {
    return (
      <Container>
        <Header>
          <Title>Produtos</Title>
          <Actions>
            <SearchContainer>
              <Search size={20} />
              <SearchInput placeholder="Pesquisar produtos..." disabled />
            </SearchContainer>
            <FilterButton disabled>
              <Filter size={20} />
              Filtros
            </FilterButton>
            <CreateButton disabled>
              <Plus size={20} />
              Novo Produto
            </CreateButton>
          </Actions>
        </Header>
        <Content>
          <LoadingState>
            <Loader2 size={32} />
            <p>Carregando produtos...</p>
          </LoadingState>
        </Content>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Header>
          <Title>Produtos</Title>
          <Actions>
            <SearchContainer>
              <Search size={20} />
              <SearchInput placeholder="Pesquisar produtos..." disabled />
            </SearchContainer>
            <FilterButton disabled>
              <Filter size={20} />
              Filtros
            </FilterButton>
            <CreateButton disabled>
              <Plus size={20} />
              Novo Produto
            </CreateButton>
          </Actions>
        </Header>
        <Content>
          <ErrorState>
            <p>{error}</p>
            <button onClick={loadProducts}>Tentar novamente</button>
          </ErrorState>
        </Content>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Produtos</Title>
        <Actions>
          <SearchContainer>
            <Search size={20} />
            <SearchInput 
              placeholder="Pesquisar produtos..." 
              value={searchTerm}
              onChange={handleSearch}
            />
          </SearchContainer>
          <FilterButton>
            <Filter size={20} />
            Filtros
          </FilterButton>
          <CreateButton onClick={handleCreateProduct}>
            <Plus size={20} />
            Novo Produto
          </CreateButton>
        </Actions>
      </Header>
      
      <Content>
        {products.length === 0 ? (
          <EmptyState>
            <Package size={48} />
            <h3>Nenhum produto encontrado</h3>
            <p>Comece criando seu primeiro produto</p>
            <CreateButton onClick={handleCreateProduct}>
              <Plus size={20} />
              Novo Produto
            </CreateButton>
          </EmptyState>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell>Produto</TableCell>
                <TableCell>Categoria</TableCell>
                <TableCell>Preço</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => {
                return (
                  <TableRow key={product._id}>
                    <TableCell>
                      <div>
                        <strong>{product.name}</strong>
                        {product.description && (
                          <div style={{ fontSize: '0.9rem', color: '#666' }}>
                            {product.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>
                      <strong style={{ color: '#10b981' }}>
                        {formatPrice(product.price || 0)}
                      </strong>
                    </TableCell>
                    <TableCell>
                      <StatusBadge $isActive={product.isActive}>
                        {product.isActive ? 'Ativo' : 'Inativo'}
                      </StatusBadge>
                    </TableCell>
                    <TableCell>
                      <ActionButton>
                        <Edit size={16} />
                      </ActionButton>
                      <ActionButton onClick={() => handleDeleteProduct(product)}>
                        <Trash2 size={16} />
                      </ActionButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Content>
    </Container>
  );
};
