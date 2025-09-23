import React from 'react';
import { FileText, Plus, Search, Filter } from 'lucide-react';
import { 
  Container, 
  Header, 
  Title, 
  Actions, 
  SearchContainer, 
  SearchInput, 
  CreateButton, 
  FilterButton,
  Content
} from './styles';

export const Reports: React.FC = () => {
  return (
    <Container>
      <Header>
        <Title>Relatórios</Title>
        <Actions>
          <SearchContainer>
            <Search size={20} />
            <SearchInput placeholder="Pesquisar relatórios..." />
          </SearchContainer>
          <FilterButton>
            <Filter size={20} />
            Filtros
          </FilterButton>
          <CreateButton>
            <Plus size={20} />
            Novo Relatório
          </CreateButton>
        </Actions>
      </Header>
      
      <Content>
        <p>Conteúdo da página de Relatórios será implementado aqui.</p>
      </Content>
    </Container>
  );
};
