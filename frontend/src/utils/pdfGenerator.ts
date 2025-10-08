import jsPDF from 'jspdf';

export interface ProposalPdfData {
  proposalNumber: string;
  client: {
    name: string;
    email: string;
    phone?: string;
    company?: string;
    cnpj?: string;
    razaoSocial?: string;
  };
  seller: {
    name: string;
    email: string;
  };
  distributor: {
    apelido?: string;
    razaoSocial?: string;
    cnpj?: string;
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
  
  // Cores do tema branco elegante
  const primaryColor = [59, 130, 246]; // #3B82F6 - Azul principal
  const secondaryColor = [99, 102, 241]; // #6366F1 - Azul secundário
  const accentColor = [16, 185, 129]; // #10B981 - Verde para sucesso
  const textPrimary = [31, 41, 55]; // #1F2937 - Texto principal
  const textSecondary = [107, 114, 128]; // #6B7280 - Texto secundário
  const textLight = [156, 163, 175]; // #9CA3AF - Texto claro
  const borderColor = [229, 231, 235]; // #E5E7EB - Bordas
  const bgLight = [249, 250, 251]; // #F9FAFB - Fundo claro
  const white = [255, 255, 255]; // Branco
  
  let yPosition = 20;
  
  // Cabeçalho compacto
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, pageWidth, 30, 'F');
  
  // Logo/Título
  doc.setTextColor(white[0], white[1], white[2]);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Sell.On', 20, 18);
  
  // Número da proposta e data
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`Proposta #${data.proposalNumber}`, pageWidth - 100, 12);
  
  const createdDate = new Date(data.createdAt).toLocaleDateString('pt-BR');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Criada em: ${createdDate}`, pageWidth - 100, 22);
  
  // Status badge
  const statusText = getStatusLabel(data.status);
  const statusColor = getStatusColor(data.status);
  doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.roundedRect(pageWidth - 100, 25, 50, 6, 1, 1, 'F');
  doc.setTextColor(white[0], white[1], white[2]);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text(statusText, pageWidth - 75, 28);
  
  yPosition = 45;
  
  // Seção de informações do cliente (lado esquerdo)
  drawCard(doc, 20, yPosition, (pageWidth - 50) / 2, 80, white, borderColor);
  
  doc.setTextColor(textPrimary[0], textPrimary[1], textPrimary[2]);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('DADOS DO CLIENTE', 30, yPosition + 12);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textSecondary[0], textSecondary[1], textSecondary[2]);
  doc.text(`Nome: ${data.client.name}`, 30, yPosition + 22);
  doc.text(`Email: ${data.client.email}`, 30, yPosition + 30);
  
  if (data.client.phone) {
    doc.text(`Telefone: ${data.client.phone}`, 30, yPosition + 38);
  }
  
  if (data.client.company) {
    doc.text(`Empresa: ${data.client.company}`, 30, yPosition + 46);
  }
  
  if (data.client.cnpj) {
    doc.text(`CNPJ: ${data.client.cnpj}`, 30, yPosition + 54);
  }
  
  if (data.client.razaoSocial) {
    doc.text(`Razão Social: ${data.client.razaoSocial}`, 30, yPosition + 62);
  }
  
  // Seção de vendedor e distribuidor (lado direito)
  const rightX = 20 + (pageWidth - 50) / 2 + 10;
  drawCard(doc, rightX, yPosition, (pageWidth - 50) / 2, 80, white, borderColor);
  
  doc.setTextColor(textPrimary[0], textPrimary[1], textPrimary[2]);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('VENDEDOR', rightX + 10, yPosition + 12);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textSecondary[0], textSecondary[1], textSecondary[2]);
  doc.text(`${data.seller.name}`, rightX + 10, yPosition + 22);
  doc.text(`${data.seller.email}`, rightX + 10, yPosition + 30);
  
  if (data.distributor.razaoSocial) {
    doc.setTextColor(textPrimary[0], textPrimary[1], textPrimary[2]);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('DISTRIBUIDOR', rightX + 10, yPosition + 38);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(textSecondary[0], textSecondary[1], textSecondary[2]);
    doc.text(`${data.distributor.razaoSocial}`, rightX + 10, yPosition + 46);
  }
  
  yPosition += 70;
  
  // Tabela de produtos compacta
  doc.setTextColor(textPrimary[0], textPrimary[1], textPrimary[2]);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('PRODUTOS', 20, yPosition);
  
  yPosition += 15;
  
  // Cabeçalho da tabela - colunas ajustadas
  const tableWidth = pageWidth - 40;
  const colPositions = [25, 100, 125, 150, 175];
  
  // Background do cabeçalho
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(20, yPosition - 6, tableWidth, 15, 'F');
  
  // Texto do cabeçalho
  doc.setTextColor(white[0], white[1], white[2]);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('PRODUTO', colPositions[0], yPosition + 2);
  doc.text('QTD', colPositions[1], yPosition + 2);
  doc.text('PREÇO', colPositions[2], yPosition + 2);
  doc.text('DESC%', colPositions[3], yPosition + 2);
  doc.text('TOTAL', colPositions[4], yPosition + 2);
  
  yPosition += 10;
  
  // Linhas dos produtos (máximo 10 itens para caber na página)
  const maxItems = Math.min(data.items.length, 10);
  for (let i = 0; i < maxItems; i++) {
    const item = data.items[i];
    
    // Background alternado para linhas
    if (i % 2 === 0) {
      doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
      doc.rect(20, yPosition - 4, tableWidth, 10, 'F');
    }
    
    // Bordas da linha
    doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
    doc.setLineWidth(0.3);
    doc.rect(20, yPosition - 4, tableWidth, 10, 'S');
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(textSecondary[0], textSecondary[1], textSecondary[2]);
    
    // Nome do produto (truncado se muito longo)
    const productName = item.product.name.length > 18 
      ? item.product.name.substring(0, 18) + '...' 
      : item.product.name;
    doc.text(productName, colPositions[0], yPosition + 1);
    
    // Quantidade
    doc.text(item.quantity.toString(), colPositions[1], yPosition + 1);
    
    // Preço unitário
    doc.text(`R$ ${item.unitPrice.toFixed(2)}`, colPositions[2], yPosition + 1);
    
    // Desconto
    doc.text(`${item.discount}%`, colPositions[3], yPosition + 1);
    
    // Total
    doc.setTextColor(textPrimary[0], textPrimary[1], textPrimary[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(`R$ ${item.total.toFixed(2)}`, colPositions[4], yPosition + 1);
    
    yPosition += 10;
  }
  
  // Se houver mais itens, mostrar "..."
  if (data.items.length > 10) {
    doc.setTextColor(textLight[0], textLight[1], textLight[2]);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.text(`... e mais ${data.items.length - 10} itens`, 25, yPosition + 1);
    yPosition += 10;
  }
  
  yPosition += 10;
  
  // Condições de pagamento (lado esquerdo)
  drawCard(doc, 20, yPosition, (pageWidth - 50) / 2, 50, white, borderColor);
  
  doc.setTextColor(textPrimary[0], textPrimary[1], textPrimary[2]);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('CONDIÇÕES DE PAGAMENTO', 30, yPosition + 12);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textSecondary[0], textSecondary[1], textSecondary[2]);
  doc.text(`Forma: ${data.paymentCondition}`, 30, yPosition + 25);
  doc.text(`Válido até: ${new Date(data.validUntil).toLocaleDateString('pt-BR')}`, 30, yPosition + 35);
  
  // Resumo financeiro (lado direito)
  drawCard(doc, rightX, yPosition, (pageWidth - 50) / 2, 50, white, borderColor);
  
  doc.setTextColor(textPrimary[0], textPrimary[1], textPrimary[2]);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('RESUMO FINANCEIRO', rightX + 10, yPosition + 12);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textSecondary[0], textSecondary[1], textSecondary[2]);
  doc.text(`Subtotal: R$ ${data.subtotal.toFixed(2)}`, rightX + 10, yPosition + 25);
  doc.text(`Desconto: -R$ ${data.discount.toFixed(2)}`, rightX + 10, yPosition + 35);
  
  // Linha separadora
  doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
  doc.setLineWidth(0.5);
  doc.line(rightX + 10, yPosition + 40, rightX + 10 + (pageWidth - 50) / 2 - 20, yPosition + 40);
  
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(`TOTAL: R$ ${data.total.toFixed(2)}`, rightX + 10, yPosition + 45);
  
  yPosition += 50;
  
  // Observações (se houver)
  if (data.observations && data.observations.trim()) {
    drawCard(doc, 20, yPosition, pageWidth - 40, 35, white, borderColor);
    
    doc.setTextColor(textPrimary[0], textPrimary[1], textPrimary[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('OBSERVAÇÕES', 30, yPosition + 12);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(textSecondary[0], textSecondary[1], textSecondary[2]);
    
    const splitObservations = doc.splitTextToSize(data.observations, pageWidth - 60);
    doc.text(splitObservations, 30, yPosition + 22);
  }
  
  // Salvar o PDF
  doc.save(`proposta-${data.proposalNumber}.pdf`);
};

// Função auxiliar para desenhar cards (sem bordas)
const drawCard = (doc: jsPDF, x: number, y: number, width: number, height: number, bgColor: number[], borderColor: number[]) => {
  // Background do card (sem borda)
  doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
  doc.rect(x, y, width, height, 'F');
};

const getStatusColor = (status: string): number[] => {
  switch (status) {
    case 'negociacao':
      return [245, 158, 11]; // #F59E0B - Amarelo
    case 'venda_fechada':
      return [16, 185, 129]; // #10B981 - Verde
    case 'venda_perdida':
      return [239, 68, 68]; // #EF4444 - Vermelho
    case 'expirada':
      return [107, 114, 128]; // #6B7280 - Cinza
    default:
      return [107, 114, 128]; // #6B7280 - Cinza
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
