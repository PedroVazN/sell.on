import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../Sidebar';
import { Header } from '../Header';
import { Container, MainContent } from './styles';

export const Layout: React.FC = () => {
  return (
    <Container>
      <Sidebar />
      <MainContent>
        <Header />
        <Outlet />
      </MainContent>
    </Container>
  );
};
