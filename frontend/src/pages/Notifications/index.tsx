import React from 'react';
import { Bell, Plus, Search, Filter } from 'lucide-react';
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

export const Notifications: React.FC = () => {
  return (
    <Container>
      <Header>
        <Title>Notificações</Title>
        <Actions>
          <SearchContainer>
            <Search size={20} />
            <SearchInput placeholder="Pesquisar notificações..." />
          </SearchContainer>
          <FilterButton>
            <Filter size={20} />
            Filtros
          </FilterButton>
          <CreateButton>
            <Plus size={20} />
            Nova Notificação
          </CreateButton>
        </Actions>
      </Header>
      
      <Content>
        <p>Conteúdo da página de Notificações será implementado aqui.</p>
      </Content>
    </Container>
  );
};
