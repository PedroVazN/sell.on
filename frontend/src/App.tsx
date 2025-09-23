import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Leads } from './pages/Leads';
import { Sales } from './pages/Sales';
import { Reports } from './pages/Reports';
import { Goals } from './pages/Goals';
import { Users } from './pages/Users';
import { Profile } from './pages/Profile';
import { Performance } from './pages/Performance';
import { Analysis } from './pages/Analysis';
import { Calendar } from './pages/Calendar';
import { Notifications } from './pages/Notifications';
import { Configurations } from './pages/Configurations';
import { Products } from './pages/Products';
import { Clients } from './pages/Clients';
import { Distributors } from './pages/Distributors';
import { PriceList } from './pages/PriceList';
import { Proposals } from './pages/Proposals';
import { CreateProposal } from './pages/CreateProposal';
import { EditProposal } from './pages/EditProposal';
import { CreateProduct } from './pages/CreateProduct';
import { ClientRegistration } from './pages/ClientRegistration';
import { DistributorRegistration } from './pages/DistributorRegistration';
import { UserRegistration } from './pages/UserRegistration';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route 
          path="/login" 
          element={<Login />} 
        />
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="leads" element={<ProtectedRoute permission="admin"><Leads /></ProtectedRoute>} />
          <Route path="sales" element={<ProtectedRoute permission="admin"><Sales /></ProtectedRoute>} />
          <Route path="reports" element={<ProtectedRoute permission="admin"><Reports /></ProtectedRoute>} />
            <Route path="goals" element={<ProtectedRoute permission="admin"><Goals /></ProtectedRoute>} />
            <Route path="users" element={<ProtectedRoute permission="admin"><Users /></ProtectedRoute>} />
            <Route path="users/register" element={<ProtectedRoute permission="admin"><UserRegistration /></ProtectedRoute>} />
            <Route path="users/create-seller" element={<ProtectedRoute permission="admin"><UserRegistration /></ProtectedRoute>} />
            <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="performance" element={<ProtectedRoute permission="admin"><Performance /></ProtectedRoute>} />
          <Route path="analysis" element={<ProtectedRoute permission="admin"><Analysis /></ProtectedRoute>} />
          <Route path="calendar" element={<ProtectedRoute permission="admin"><Calendar /></ProtectedRoute>} />
          <Route path="notifications" element={<ProtectedRoute permission="admin"><Notifications /></ProtectedRoute>} />
          <Route path="configurations" element={<ProtectedRoute permission="admin"><Configurations /></ProtectedRoute>} />
          <Route path="products" element={<ProtectedRoute permission="admin"><Products /></ProtectedRoute>} />
          <Route path="products/create" element={<ProtectedRoute permission="admin"><CreateProduct /></ProtectedRoute>} />
          <Route path="clients" element={<ProtectedRoute permission="admin"><Clients /></ProtectedRoute>} />
          <Route path="clients/register" element={<ProtectedRoute permission="admin"><ClientRegistration /></ProtectedRoute>} />
          <Route path="distributors" element={<ProtectedRoute permission="admin"><Distributors /></ProtectedRoute>} />
          <Route path="distributors/register" element={<ProtectedRoute permission="admin"><DistributorRegistration /></ProtectedRoute>} />
          <Route path="proposals" element={<ProtectedRoute permission="proposals"><Proposals /></ProtectedRoute>} />
          <Route path="proposals/create" element={<ProtectedRoute permission="proposals"><CreateProposal /></ProtectedRoute>} />
          <Route path="proposals/edit/:id" element={<ProtectedRoute permission="proposals"><EditProposal /></ProtectedRoute>} />
          <Route path="price-list" element={<ProtectedRoute permission="admin"><PriceList /></ProtectedRoute>} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
