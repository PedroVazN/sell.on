import React from 'react';
import { Settings, Plus, Search, Filter } from 'lucide-react';
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

export const Configurations: React.FC = () => {
  return (
    <Container>
      <Header>
        <Title>Configurações</Title>
        <Actions>
          <SearchContainer>
            <Search size={20} />
            <SearchInput placeholder="Pesquisar configurações..." />
          </SearchContainer>
          <FilterButton>
            <Filter size={20} />
            Filtros
          </FilterButton>
          <CreateButton>
            <Plus size={20} />
            Nova Configuração
          </CreateButton>
        </Actions>
      </Header>
      
      <Content>
        <p>Conteúdo da página de Configurações será implementado aqui.</p>
      </Content>
    </Container>
  );
};
