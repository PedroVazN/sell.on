import jsPDF from 'jspdf';

export interface ProposalPdfData {
  proposalNumber: string;
  client: {
    name: string;
    email: string;
    phone?: string;
    company?: string;
  };
  seller: {
    name: string;
    email: string;
  };
  distributor: {
    apelido?: string;
    razaoSocial?: string;
  };
  items: Array<{
    product: {
      name: string;
      description?: string;
    };
    quantity: number;
    unitPrice: number;
    discount: number;
    total: number;
  }>;
  subtotal: number;
  discount: number;
  total: number;
  paymentCondition: string;
  validUntil: string;
  observations?: string;
  status: string;
  createdAt: string;
}

export const generateProposalPdf = (data: ProposalPdfData): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Cores
  const primaryColor = '#3B82F6';
  const secondaryColor = '#6B7280';
  const textColor = '#1F2937';
  
  let yPosition = 20;
  
  // Cabeçalho
  doc.setFillColor(primaryColor);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  // Logo/Título
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Sell.On', 20, 25);
  
  // Número da proposta
  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  doc.text(`Proposta ${data.proposalNumber}`, pageWidth - 80, 25);
  
  // Data de criação
  const createdDate = new Date(data.createdAt).toLocaleDateString('pt-BR');
  doc.setFontSize(10);
  doc.text(`Criada em: ${createdDate}`, pageWidth - 80, 32);
  
  yPosition = 60;
  
  // Dados do cliente
  doc.setTextColor(textColor);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('DADOS DO CLIENTE', 20, yPosition);
  
  yPosition += 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nome: ${data.client.name}`, 20, yPosition);
  doc.text(`Email: ${data.client.email}`, 20, yPosition + 8);
  
  if (data.client.phone) {
    doc.text(`Telefone: ${data.client.phone}`, 20, yPosition + 16);
  }
  if (data.client.company) {
    doc.text(`Empresa: ${data.client.company}`, 20, yPosition + 24);
  }
  
  yPosition += 40;
  
  // Vendedor e Distribuidor
  doc.setFont('helvetica', 'bold');
  doc.text('VENDEDOR E DISTRIBUIDOR', 20, yPosition);
  
  yPosition += 10;
  doc.setFont('helvetica', 'normal');
  doc.text(`Vendedor: ${data.seller.name} (${data.seller.email})`, 20, yPosition);
  doc.text(`Distribuidor: ${data.distributor.apelido || 'N/A'} - ${data.distributor.razaoSocial || 'N/A'}`, 20, yPosition + 8);
  
  yPosition += 30;
  
  // Tabela de produtos
  doc.setFont('helvetica', 'bold');
  doc.text('PRODUTOS', 20, yPosition);
  
  yPosition += 15;
  
  // Cabeçalho da tabela
  doc.setFillColor(240, 240, 240);
  doc.rect(20, yPosition - 5, pageWidth - 40, 15, 'F');
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Produto', 25, yPosition);
  doc.text('Qtd', 120, yPosition);
  doc.text('Preço Unit.', 140, yPosition);
  doc.text('Desconto', 170, yPosition);
  doc.text('Total', 200, yPosition);
  
  yPosition += 10;
  
  // Linhas dos produtos
  data.items.forEach((item, index) => {
    if (yPosition > pageHeight - 50) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    
    // Nome do produto
    const productName = item.product.name.length > 30 
      ? item.product.name.substring(0, 30) + '...' 
      : item.product.name;
    doc.text(productName, 25, yPosition);
    
    // Quantidade
    doc.text(item.quantity.toString(), 120, yPosition);
    
    // Preço unitário
    doc.text(`R$ ${item.unitPrice.toFixed(2)}`, 140, yPosition);
    
    // Desconto
    doc.text(`${item.discount}%`, 170, yPosition);
    
    // Total
    doc.text(`R$ ${item.total.toFixed(2)}`, 200, yPosition);
    
    yPosition += 8;
  });
  
  yPosition += 20;
  
  // Totais
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('RESUMO FINANCEIRO', 20, yPosition);
  
  yPosition += 15;
  doc.setFont('helvetica', 'normal');
  doc.text(`Subtotal: R$ ${data.subtotal.toFixed(2)}`, 20, yPosition);
  doc.text(`Desconto: -R$ ${data.discount.toFixed(2)}`, 20, yPosition + 10);
  doc.text(`Total: R$ ${data.total.toFixed(2)}`, 20, yPosition + 25);
  
  yPosition += 50;
  
  // Condições de pagamento
  doc.setFont('helvetica', 'bold');
  doc.text('CONDIÇÕES DE PAGAMENTO', 20, yPosition);
  
  yPosition += 10;
  doc.setFont('helvetica', 'normal');
  doc.text(data.paymentCondition, 20, yPosition);
  
  yPosition += 15;
  doc.text(`Válido até: ${new Date(data.validUntil).toLocaleDateString('pt-BR')}`, 20, yPosition);
  
  // Status
  const statusText = data.status.toUpperCase();
  const statusColor = getStatusColor(data.status);
  doc.setTextColor(statusColor);
  doc.setFont('helvetica', 'bold');
  doc.text(`Status: ${statusText}`, pageWidth - 80, yPosition);
  
  // Observações
  if (data.observations) {
    yPosition += 30;
    doc.setTextColor(textColor);
    doc.setFont('helvetica', 'bold');
    doc.text('OBSERVAÇÕES', 20, yPosition);
    
    yPosition += 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    // Quebrar texto longo
    const splitObservations = doc.splitTextToSize(data.observations, pageWidth - 40);
    doc.text(splitObservations, 20, yPosition);
  }
  
  // Rodapé
  const footerY = pageHeight - 20;
  doc.setFontSize(8);
  doc.setTextColor(secondaryColor);
  doc.text('Sell.On - Sistema de Gestão Comercial', 20, footerY);
  doc.text(`Página 1 de 1`, pageWidth - 50, footerY);
  
  // Salvar o PDF
  doc.save(`proposta-${data.proposalNumber}.pdf`);
};

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'negociacao':
      return '#F59E0B';
    case 'venda_fechada':
      return '#059669';
    case 'venda_perdida':
      return '#DC2626';
    case 'expirada':
      return '#6B7280';
    default:
      return '#6B7280';
  }
};
