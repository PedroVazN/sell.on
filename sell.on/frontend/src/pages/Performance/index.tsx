import React from 'react';
import { Activity, Plus, Search, Filter } from 'lucide-react';
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

export const Performance: React.FC = () => {
  return (
    <Container>
      <Header>
        <Title>Performance</Title>
        <Actions>
          <SearchContainer>
            <Search size={20} />
            <SearchInput placeholder="Pesquisar performance..." />
          </SearchContainer>
          <FilterButton>
            <Filter size={20} />
            Filtros
          </FilterButton>
          <CreateButton>
            <Plus size={20} />
            Nova Análise
          </CreateButton>
        </Actions>
      </Header>
      
      <Content>
        <p>Conteúdo da página de Performance será implementado aqui.</p>
      </Content>
    </Container>
  );
};
