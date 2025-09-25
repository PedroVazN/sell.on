import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../Sidebar';
import { Header } from '../Header';
import { Clock } from '../Clock';
import { Container, MainContent } from './styles';

export const Layout: React.FC = () => {
  return (
    <Container>
      <Clock />
      <Sidebar />
      <MainContent>
        <Header />
        <Outlet />
      </MainContent>
    </Container>
  );
};
