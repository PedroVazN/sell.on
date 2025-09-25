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
  
  // Cores do tema escuro elegante (convertidas para RGB)
  const primaryColor = [59, 130, 246]; // #3B82F6
  const secondaryColor = [139, 92, 246]; // #8B5CF6
  const accentColor = [245, 158, 11]; // #F59E0B
  const darkBg = [15, 23, 42]; // #0F172A
  const cardBg = [30, 41, 59]; // #1E293B
  const textPrimary = [248, 250, 252]; // #F8FAFC
  const textSecondary = [148, 163, 184]; // #94A3B8
  const borderColor = [51, 65, 85]; // #334155
  
  let yPosition = 20;
  
  // Background escuro
  doc.setFillColor(darkBg[0], darkBg[1], darkBg[2]);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  
  // Cabeçalho simples com fundo azul
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  // Logo/Título
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Sell.On', 25, 25);
  
  // Número da proposta
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(`Proposta #${data.proposalNumber}`, pageWidth - 100, 25);
  
  // Data de criação
  const createdDate = new Date(data.createdAt).toLocaleDateString('pt-BR');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Criada em: ${createdDate}`, pageWidth - 100, 32);
  
  yPosition = 70;
  
  // Card de informações do cliente
  drawCard(doc, 20, yPosition, pageWidth - 40, 60, cardBg, borderColor);
  
  doc.setTextColor(textPrimary[0], textPrimary[1], textPrimary[2]);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('DADOS DO CLIENTE', 30, yPosition + 15);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textSecondary[0], textSecondary[1], textSecondary[2]);
  doc.text(`Nome: ${data.client.name}`, 30, yPosition + 30);
  doc.text(`Email: ${data.client.email}`, 30, yPosition + 40);
  
  if (data.client.company) {
    doc.text(`Empresa: ${data.client.company}`, 30, yPosition + 50);
  }
  
  yPosition += 80;
  
  // Card de vendedor e distribuidor
  drawCard(doc, 20, yPosition, pageWidth - 40, 40, cardBg, borderColor);
  
  doc.setTextColor(textPrimary[0], textPrimary[1], textPrimary[2]);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('VENDEDOR E DISTRIBUIDOR', 30, yPosition + 15);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textSecondary[0], textSecondary[1], textSecondary[2]);
  doc.text(`Vendedor: ${data.seller.name} (${data.seller.email})`, 30, yPosition + 30);
  
  yPosition += 60;
  
  // Nova página para produtos
  doc.addPage();
  doc.setFillColor(darkBg[0], darkBg[1], darkBg[2]);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  
  yPosition = 30;
  
  // Tabela de produtos com design elegante
  doc.setTextColor(textPrimary[0], textPrimary[1], textPrimary[2]);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('PRODUTOS', 20, yPosition);
  
  yPosition += 25;
  
  // Cabeçalho da tabela - colunas ajustadas para caber no PDF
  const tableWidth = pageWidth - 40;
  const colWidths = [70, 15, 25, 20, 30]; // Produto, Qtd, Preço, Desc, Total
  const colPositions = [25, 100, 120, 150, 175];
  
  // Background do cabeçalho
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(20, yPosition - 8, tableWidth, 20, 'F');
  
  // Bordas do cabeçalho
  doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
  doc.setLineWidth(0.5);
  doc.rect(20, yPosition - 8, tableWidth, 20, 'S');
  
  // Texto do cabeçalho
  doc.setTextColor(textPrimary[0], textPrimary[1], textPrimary[2]);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('PRODUTO', colPositions[0], yPosition + 2);
  doc.text('QTD', colPositions[1], yPosition + 2);
  doc.text('PREÇO', colPositions[2], yPosition + 2);
  doc.text('DESC%', colPositions[3], yPosition + 2);
  doc.text('TOTAL', colPositions[4], yPosition + 2);
  
  yPosition += 15;
  
  // Linhas dos produtos
  data.items.forEach((item, index) => {
    if (yPosition > pageHeight - 100) {
      doc.addPage();
      // Redesenhar background
      doc.setFillColor(darkBg[0], darkBg[1], darkBg[2]);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');
      yPosition = 30;
    }
    
    // Background alternado para linhas
    if (index % 2 === 0) {
      doc.setFillColor(cardBg[0], cardBg[1], cardBg[2]);
      doc.rect(20, yPosition - 5, tableWidth, 15, 'F');
    }
    
    // Bordas da linha
    doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
    doc.setLineWidth(0.3);
    doc.rect(20, yPosition - 5, tableWidth, 15, 'S');
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(textSecondary[0], textSecondary[1], textSecondary[2]);
    
    // Nome do produto (com quebra de linha se necessário)
    const productName = item.product.name.length > 25 
      ? item.product.name.substring(0, 25) + '...' 
      : item.product.name;
    doc.text(productName, colPositions[0], yPosition + 3);
    
    // Quantidade
    doc.text(item.quantity.toString(), colPositions[1], yPosition + 3);
    
    // Preço unitário
    doc.text(`R$ ${item.unitPrice.toFixed(2)}`, colPositions[2], yPosition + 3);
    
    // Desconto
    doc.text(`${item.discount}%`, colPositions[3], yPosition + 3);
    
    // Total
    doc.setTextColor(textPrimary[0], textPrimary[1], textPrimary[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(`R$ ${item.total.toFixed(2)}`, colPositions[4], yPosition + 3);
    
    yPosition += 15;
  });
  
  yPosition += 20;
  
  // Nova página para resumo financeiro e condições
  doc.addPage();
  doc.setFillColor(darkBg[0], darkBg[1], darkBg[2]);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  
  yPosition = 30;
  
  // Card de resumo financeiro
  drawCard(doc, 20, yPosition, pageWidth - 40, 80, cardBg, borderColor);
  
  doc.setTextColor(textPrimary[0], textPrimary[1], textPrimary[2]);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('RESUMO FINANCEIRO', 30, yPosition + 15);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textSecondary[0], textSecondary[1], textSecondary[2]);
  doc.text(`Subtotal: R$ ${data.subtotal.toFixed(2)}`, 30, yPosition + 35);
  doc.text(`Desconto: -R$ ${data.discount.toFixed(2)}`, 30, yPosition + 50);
  
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(`TOTAL: R$ ${data.total.toFixed(2)}`, 30, yPosition + 70);
  
  yPosition += 100;
  
  // Card de condições de pagamento
  drawCard(doc, 20, yPosition, pageWidth - 40, 60, cardBg, borderColor);
  
  doc.setTextColor(textPrimary[0], textPrimary[1], textPrimary[2]);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('CONDIÇÕES DE PAGAMENTO', 30, yPosition + 15);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textSecondary[0], textSecondary[1], textSecondary[2]);
  doc.text(data.paymentCondition, 30, yPosition + 35);
  doc.text(`Válido até: ${new Date(data.validUntil).toLocaleDateString('pt-BR')}`, 30, yPosition + 50);
  
  // Status minimalista
  const statusText = getStatusLabel(data.status);
  doc.setTextColor(textSecondary[0], textSecondary[1], textSecondary[2]);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Status: ${statusText}`, pageWidth - 80, yPosition + 18);
  
  // Observações
  if (data.observations) {
    yPosition += 80;
    drawCard(doc, 20, yPosition, pageWidth - 40, 40, cardBg, borderColor);
    
    doc.setTextColor(textPrimary[0], textPrimary[1], textPrimary[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('OBSERVAÇÕES', 30, yPosition + 15);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(textSecondary[0], textSecondary[1], textSecondary[2]);
    
    const splitObservations = doc.splitTextToSize(data.observations, pageWidth - 60);
    doc.text(splitObservations, 30, yPosition + 30);
  }
  
  // Rodapé elegante
  const footerY = pageHeight - 30;
  doc.setFillColor(cardBg[0], cardBg[1], cardBg[2]);
  doc.rect(0, footerY, pageWidth, 30, 'F');
  
  doc.setFontSize(10);
  doc.setTextColor(textSecondary[0], textSecondary[1], textSecondary[2]);
  doc.setFont('helvetica', 'normal');
  doc.text('Sell.On - Sistema de Gestão Comercial', 25, footerY + 15);
  doc.text(`Página 1 de 1`, pageWidth - 60, footerY + 15);
  
  // Salvar o PDF
  doc.save(`proposta-${data.proposalNumber}.pdf`);
};

// Função auxiliar para desenhar cards
const drawCard = (doc: jsPDF, x: number, y: number, width: number, height: number, bgColor: number[], borderColor: number[]) => {
  // Background do card
  doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
  doc.rect(x, y, width, height, 'F');
  
  // Borda do card
  doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
  doc.setLineWidth(0.5);
  doc.rect(x, y, width, height, 'S');
  
  // Sombra sutil (usando cor RGB válida)
  doc.setFillColor(20, 20, 20);
  doc.rect(x + 2, y + 2, width, height, 'F');
};

const getStatusColor = (status: string): number[] => {
  switch (status) {
    case 'negociacao':
      return [245, 158, 11]; // #F59E0B
    case 'venda_fechada':
      return [5, 150, 105]; // #059669
    case 'venda_perdida':
      return [220, 38, 38]; // #DC2626
    case 'expirada':
      return [107, 114, 128]; // #6B7280
    default:
      return [107, 114, 128]; // #6B7280
  }
};

const getStatusBgColor = (status: string): number[] => {
  switch (status) {
    case 'negociacao':
      return [254, 243, 199]; // #FEF3C7
    case 'venda_fechada':
      return [209, 250, 229]; // #D1FAE5
    case 'venda_perdida':
      return [254, 226, 226]; // #FEE2E2
    case 'expirada':
      return [243, 244, 246]; // #F3F4F6
    default:
      return [243, 244, 246]; // #F3F4F6
  }
};

const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'negociacao':
      return 'Negociação';
    case 'venda_fechada':
      return 'Venda Fechada';
    case 'venda_perdida':
      return 'Venda Perdida';
    case 'expirada':
      return 'Expirada';
    default:
      return status;
  }
};
