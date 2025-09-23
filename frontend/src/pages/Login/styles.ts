import styled, { keyframes } from 'styled-components';

// Animações personalizadas
const float = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-10px) rotate(2deg); }
`;

const fadeIn = keyframes`
  from { 
    opacity: 0; 
    transform: translateY(20px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
`;

const slideIn = keyframes`
  from { 
    opacity: 0; 
    transform: translateX(-20px); 
  }
  to { 
    opacity: 1; 
    transform: translateX(0); 
  }
`;

export const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  position: relative;
  padding: 20px;
  overflow: hidden;
  background: #0a0a0f;
`;

export const Background = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%);
  z-index: 0;
`;

export const AbstractShapes = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  pointer-events: none;
`;

export const Shape1 = styled.div`
  position: absolute;
  top: 10%;
  left: 10%;
  width: 60px;
  height: 60px;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 50%;
  animation: ${float} 6s ease-in-out infinite;
  
  &::after {
    content: '✦';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: rgba(255, 255, 255, 0.3);
    font-size: 20px;
  }
`;

export const Shape2 = styled.div`
  position: absolute;
  top: 20%;
  right: 15%;
  width: 80px;
  height: 80px;
  background: rgba(139, 92, 246, 0.08);
  border-radius: 50%;
  animation: ${float} 8s ease-in-out infinite reverse;
`;

export const Shape3 = styled.div`
  position: absolute;
  bottom: 30%;
  left: 20%;
  width: 100px;
  height: 100px;
  background: rgba(245, 158, 11, 0.06);
  border-radius: 50%;
  animation: ${float} 7s ease-in-out infinite;
`;

export const Shape4 = styled.div`
  position: absolute;
  bottom: 20%;
  right: 25%;
  width: 40px;
  height: 40px;
  background: rgba(59, 130, 246, 0.12);
  border-radius: 50%;
  animation: ${float} 5s ease-in-out infinite reverse;
  
  &::after {
    content: '✦';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: rgba(255, 255, 255, 0.4);
    font-size: 16px;
  }
`;

export const Shape5 = styled.div`
  position: absolute;
  top: 50%;
  right: 10%;
  width: 120px;
  height: 60px;
  background: linear-gradient(45deg, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.05));
  border-radius: 60px;
  animation: ${float} 9s ease-in-out infinite;
  transform: rotate(-15deg);
`;

export const LoginCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 40px;
  width: 100%;
  max-width: 400px;
  backdrop-filter: blur(20px);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.05);
  position: relative;
  z-index: 10;
  transition: all 0.3s ease;
  animation: ${fadeIn} 0.6s ease-out;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 
      0 12px 48px rgba(0, 0, 0, 0.4),
      0 0 0 1px rgba(255, 255, 255, 0.1);
  }
`;

export const Logo = styled.div`
  text-align: center;
  margin-bottom: 40px;
  
  h1 {
    font-size: 2.5rem;
    font-weight: 300;
    color: #ffffff;
    margin: 0;
    letter-spacing: -1px;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    text-shadow: none;
  }
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 24px;
  animation: ${fadeIn} 0.8s ease-out 0.2s both;
`;

export const InputGroup = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const Label = styled.label`
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 4px;
`;

export const Input = styled.input`
  width: 100%;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  color: #ffffff;
  font-size: 1rem;
  padding: 16px 20px;
  outline: none;
  transition: all 0.3s ease;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  
  &:focus {
    border-color: rgba(59, 130, 246, 0.5);
    background: rgba(255, 255, 255, 0.12);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
    font-size: 0.95rem;
  }

  &:hover {
    border-color: rgba(255, 255, 255, 0.25);
    background: rgba(255, 255, 255, 0.1);
  }
`;

export const PasswordToggle = styled.button`
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3;
  
  &:hover {
    color: rgba(255, 255, 255, 0.8);
    background: rgba(255, 255, 255, 0.05);
  }
  
  &:active {
    transform: translateY(-50%) scale(0.95);
  }
`;

export const LoginButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ffffff;
  color: #000000;
  border: none;
  border-radius: 8px;
  padding: 16px 20px;
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 8px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
  
  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    
    &:hover {
      transform: none;
      box-shadow: none;
    }
  }
`;

export const LoginIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: #3b82f6;
  border-radius: 50%;
  color: #ffffff;
`;

export const ErrorMessage = styled.div`
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #ef4444;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 0.9rem;
  text-align: center;
  margin-bottom: 16px;
  animation: ${fadeIn} 0.4s ease-out;
  font-weight: 500;
`;

export const SuccessMessage = styled.div`
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #10b981;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 0.9rem;
  text-align: center;
  margin-bottom: 16px;
  animation: ${fadeIn} 0.4s ease-out;
  font-weight: 500;
`;

export const Footer = styled.div`
  text-align: center;
  margin-top: 32px;
  animation: ${fadeIn} 0.8s ease-out 0.4s both;
  
  a {
    color: rgba(255, 255, 255, 0.6);
    text-decoration: none;
    font-size: 0.9rem;
    font-weight: 500;
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    
    &:hover {
      color: rgba(255, 255, 255, 0.9);
    }
  }
`;
