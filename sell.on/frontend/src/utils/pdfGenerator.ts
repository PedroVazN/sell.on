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
  closedAt?: string;
  updatedAt?: string;
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
  
  // Número da proposta e datas
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`Proposta #${data.proposalNumber}`, pageWidth - 100, 10);
  
  const createdDate = new Date(data.createdAt).toLocaleDateString('pt-BR');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Criada em: ${createdDate}`, pageWidth - 100, 17);
  
  // Mostrar data de fechamento se a proposta foi finalizada
  if (data.status !== 'negociacao') {
    const closedDateStr = data.closedAt ? new Date(data.closedAt).toLocaleDateString('pt-BR') 
                        : data.updatedAt ? new Date(data.updatedAt).toLocaleDateString('pt-BR') 
                        : null;
    if (closedDateStr) {
      const closedLabel = data.status === 'venda_fechada' ? 'Fechada em:' 
                        : data.status === 'venda_perdida' ? 'Perdida em:' 
                        : 'Finalizada em:';
      doc.text(`${closedLabel} ${closedDateStr}`, pageWidth - 100, 23);
    }
  }
  
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
  drawCard(doc, 20, yPosition, (pageWidth - 50) / 2, 60, white, borderColor);
  
  doc.setTextColor(textPrimary[0], textPrimary[1], textPrimary[2]);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('DADOS DO CLIENTE', 30, yPosition + 12);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textSecondary[0], textSecondary[1], textSecondary[2]);
  doc.text(`Nome: ${data.client.name}`, 30, yPosition + 22);
  
  if (data.client.company) {
    doc.text(`Empresa: ${data.client.company}`, 30, yPosition + 30);
  }
  
  if (data.client.cnpj) {
    doc.text(`CNPJ: ${data.client.cnpj}`, 30, yPosition + 38);
  }
  
  if (data.client.razaoSocial) {
    doc.text(`Razão Social: ${data.client.razaoSocial}`, 30, yPosition + 46);
  }
  
  // Seção de vendedor e distribuidor (lado direito)
  const rightX = 20 + (pageWidth - 50) / 2 + 10;
  drawCard(doc, rightX, yPosition, (pageWidth - 50) / 2, 60, white, borderColor);
  
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
  
  // Cabeçalho da tabela - colunas ajustadas com menor espaçamento
  const tableWidth = pageWidth - 40;
  const colPositions = [25, 80, 100, 120, 140];
  
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
    
    // Nome do produto (completo)
    doc.text(item.product.name, colPositions[0], yPosition + 1);
    
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

export interface DashboardPdfData {
  month: string;
  year: number;
  proposalStats: {
    totalProposals: number;
    totalValue: number;
    negociacaoProposals: number;
    negociacaoValue: number;
    vendaFechadaProposals: number;
    vendaFechadaValue: number;
    vendaPerdidaProposals: number;
    vendaPerdidaValue: number;
    expiradaProposals: number;
    expiradaValue: number;
  };
  salesStats: {
    totalSales: number;
    totalRevenue: number;
    averageSale: number;
  };
  topProducts: Array<{
    name: string;
    sales: number;
    revenue: number;
    quantity: number;
  }>;
  goals: Array<{
    title: string;
    currentValue: number;
    targetValue: number;
    progress: { percentage: number };
    status: string;
    assignedTo?: { name: string } | string;
  }>;
}

export const generateDashboardPdf = (data: DashboardPdfData): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Cores
  const primaryColor = [59, 130, 246]; // #3B82F6
  const successColor = [16, 185, 129]; // #10B981
  const dangerColor = [239, 68, 68]; // #EF4444
  const warningColor = [245, 158, 11]; // #F59E0B
  const textPrimary = [31, 41, 55]; // #1F2937
  const textSecondary = [107, 114, 128]; // #6B7280
  const borderColor = [229, 231, 235]; // #E5E7EB
  const bgLight = [249, 250, 251]; // #F9FAFB
  const white = [255, 255, 255];
  
  let yPosition = 20;
  let currentPage = 1;
  
  // Função para adicionar nova página se necessário
  const checkPageBreak = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - 30) {
      doc.addPage();
      yPosition = 20;
      currentPage++;
    }
  };
  
  // Cabeçalho
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, pageWidth, 35, 'F');
  
  doc.setTextColor(white[0], white[1], white[2]);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Sell.On', 20, 20);
  
  doc.setFontSize(16);
  doc.text('Dashboard de Vendas', 20, 30);
  
  // Período
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`${data.month} ${data.year}`, pageWidth - 100, 20);
  
  const dateNow = new Date().toLocaleDateString('pt-BR');
  doc.setFontSize(10);
  doc.text(`Gerado em: ${dateNow}`, pageWidth - 100, 28);
  
  yPosition = 50;
  
  // Seção: Estatísticas de Propostas
  checkPageBreak(80);
  doc.setTextColor(textPrimary[0], textPrimary[1], textPrimary[2]);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('ESTATÍSTICAS DE PROPOSTAS', 20, yPosition);
  yPosition += 10;
  
  // Cards de métricas principais (2x2 grid)
  const cardWidth = (pageWidth - 50) / 2;
  const cardHeight = 35;
  
  // Card 1: Valor Ganho
  doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
  doc.rect(20, yPosition, cardWidth, cardHeight, 'F');
  doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
  doc.rect(20, yPosition, cardWidth, cardHeight, 'S');
  
  doc.setTextColor(textSecondary[0], textSecondary[1], textSecondary[2]);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Valor Ganho', 30, yPosition + 8);
  
  doc.setTextColor(successColor[0], successColor[1], successColor[2]);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(`R$ ${data.proposalStats.vendaFechadaValue.toFixed(2)}`, 30, yPosition + 18);
  
  doc.setTextColor(textSecondary[0], textSecondary[1], textSecondary[2]);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`${data.proposalStats.vendaFechadaProposals} propostas fechadas`, 30, yPosition + 28);
  
  // Card 2: Valor Perdido
  doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
  doc.rect(20 + cardWidth + 10, yPosition, cardWidth, cardHeight, 'F');
  doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
  doc.rect(20 + cardWidth + 10, yPosition, cardWidth, cardHeight, 'S');
  
  doc.setTextColor(textSecondary[0], textSecondary[1], textSecondary[2]);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Valor Perdido', 30 + cardWidth + 10, yPosition + 8);
  
  doc.setTextColor(dangerColor[0], dangerColor[1], dangerColor[2]);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(`R$ ${data.proposalStats.vendaPerdidaValue.toFixed(2)}`, 30 + cardWidth + 10, yPosition + 18);
  
  doc.setTextColor(textSecondary[0], textSecondary[1], textSecondary[2]);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`${data.proposalStats.vendaPerdidaProposals} propostas perdidas`, 30 + cardWidth + 10, yPosition + 28);
  
  yPosition += cardHeight + 15;
  
  // Card 3: Valor Total Gerado
  doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
  doc.rect(20, yPosition, cardWidth, cardHeight, 'F');
  doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
  doc.rect(20, yPosition, cardWidth, cardHeight, 'S');
  
  doc.setTextColor(textSecondary[0], textSecondary[1], textSecondary[2]);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Valor Total Gerado', 30, yPosition + 8);
  
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(`R$ ${data.proposalStats.totalValue.toFixed(2)}`, 30, yPosition + 18);
  
  doc.setTextColor(textSecondary[0], textSecondary[1], textSecondary[2]);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`${data.proposalStats.totalProposals} propostas criadas`, 30, yPosition + 28);
  
  // Card 4: Em Negociação
  doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
  doc.rect(20 + cardWidth + 10, yPosition, cardWidth, cardHeight, 'F');
  doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
  doc.rect(20 + cardWidth + 10, yPosition, cardWidth, cardHeight, 'S');
  
  doc.setTextColor(textSecondary[0], textSecondary[1], textSecondary[2]);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Em Negociação', 30 + cardWidth + 10, yPosition + 8);
  
  doc.setTextColor(warningColor[0], warningColor[1], warningColor[2]);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(`R$ ${data.proposalStats.negociacaoValue.toFixed(2)}`, 30 + cardWidth + 10, yPosition + 18);
  
  doc.setTextColor(textSecondary[0], textSecondary[1], textSecondary[2]);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`${data.proposalStats.negociacaoProposals} propostas`, 30 + cardWidth + 10, yPosition + 28);
  
  yPosition += cardHeight + 20;
  
  // Seção: Estatísticas de Vendas
  checkPageBreak(50);
  doc.setTextColor(textPrimary[0], textPrimary[1], textPrimary[2]);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('ESTATÍSTICAS DE VENDAS', 20, yPosition);
  yPosition += 15;
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textSecondary[0], textSecondary[1], textSecondary[2]);
  doc.text(`Total de Vendas: ${data.salesStats.totalSales}`, 30, yPosition);
  yPosition += 8;
  doc.text(`Receita Total: R$ ${data.salesStats.totalRevenue.toFixed(2)}`, 30, yPosition);
  yPosition += 8;
  doc.text(`Ticket Médio: R$ ${data.salesStats.averageSale.toFixed(2)}`, 30, yPosition);
  
  yPosition += 15;
  
  // Seção: Top Produtos
  if (data.topProducts && data.topProducts.length > 0) {
    checkPageBreak(60);
    doc.setTextColor(textPrimary[0], textPrimary[1], textPrimary[2]);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('TOP PRODUTOS', 20, yPosition);
    yPosition += 10;
    
    // Tabela
    const tableY = yPosition;
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(20, tableY, pageWidth - 40, 12, 'F');
    
    doc.setTextColor(white[0], white[1], white[2]);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Produto', 25, tableY + 8);
    doc.text('Quantidade', 100, tableY + 8);
    doc.text('Receita', pageWidth - 80, tableY + 8);
    
    yPosition = tableY + 12;
    
    data.topProducts.slice(0, 5).forEach((product, index) => {
      checkPageBreak(12);
      if (index % 2 === 0) {
        doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
        doc.rect(20, yPosition, pageWidth - 40, 10, 'F');
      }
      
      doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
      doc.rect(20, yPosition, pageWidth - 40, 10, 'S');
      
      doc.setTextColor(textPrimary[0], textPrimary[1], textPrimary[2]);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(product.name, 25, yPosition + 7);
      doc.text(product.quantity.toString(), 100, yPosition + 7);
      doc.text(`R$ ${product.revenue.toFixed(2)}`, pageWidth - 80, yPosition + 7);
      
      yPosition += 10;
    });
    
    yPosition += 10;
  }
  
  // Seção: Metas
  if (data.goals && data.goals.length > 0) {
    checkPageBreak(80);
    doc.setTextColor(textPrimary[0], textPrimary[1], textPrimary[2]);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('METAS', 20, yPosition);
    yPosition += 10;
    
    data.goals.slice(0, 5).forEach((goal) => {
      checkPageBreak(25);
      
      doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
      doc.rect(20, yPosition, pageWidth - 40, 20, 'F');
      doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
      doc.rect(20, yPosition, pageWidth - 40, 20, 'S');
      
      // Título da meta
      doc.setTextColor(textPrimary[0], textPrimary[1], textPrimary[2]);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      const assignedToName = typeof goal.assignedTo === 'object' ? goal.assignedTo?.name : goal.assignedTo;
      const goalTitle = assignedToName ? `${goal.title} (${assignedToName})` : goal.title;
      doc.text(goalTitle, 25, yPosition + 8);
      
      // Progresso
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(textSecondary[0], textSecondary[1], textSecondary[2]);
      doc.text(
        `R$ ${goal.currentValue.toFixed(2)} / R$ ${goal.targetValue.toFixed(2)} (${goal.progress.percentage}%)`,
        25,
        yPosition + 16
      );
      
      // Barra de progresso
      const progressWidth = ((pageWidth - 60) * Math.min(goal.progress.percentage, 100)) / 100;
      const progressColor = goal.progress.percentage >= 100 ? successColor :
                           goal.progress.percentage >= 80 ? primaryColor :
                           goal.progress.percentage >= 50 ? warningColor : dangerColor;
      
      doc.setFillColor(progressColor[0], progressColor[1], progressColor[2]);
      doc.rect(25, yPosition + 18, progressWidth, 3, 'F');
      
      yPosition += 25;
    });
  }
  
  // Rodapé em todas as páginas
  // Usar any para acessar getNumberOfPages que pode estar no internal
  const totalPages = (doc as any).internal?.getNumberOfPages?.() || (doc as any).getNumberOfPages?.() || currentPage;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(textSecondary[0], textSecondary[1], textSecondary[2]);
    doc.setFont('helvetica', 'normal');
    doc.text(`Página ${i} de ${totalPages}`, pageWidth - 30, pageHeight - 10);
    doc.text('Sell.On - Sistema de Gestão Comercial', 20, pageHeight - 10);
  }
  
  // Salvar o PDF
  const fileName = `dashboard-${data.month.toLowerCase()}-${data.year}.pdf`;
  doc.save(fileName);
};

/** Gera PDF com lista de propostas (tabela) para exportação */
export const generateProposalsListPdf = (headers: string[], rows: string[][]): void => {
  const doc = new jsPDF({ orientation: 'landscape' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const headerColor: [number, number, number] = [59, 130, 246];
  const textColor: [number, number, number] = [31, 41, 55];
  const borderColor: [number, number, number] = [229, 231, 235];
  const colCount = headers.length;
  const colWidth = (pageWidth - 2 * margin) / colCount;
  const rowHeight = 7;
  const fontSize = 7;
  let y = margin;

  const drawTableRow = (cells: string[], isHeader: boolean) => {
    if (y + rowHeight > pageHeight - 20) {
      doc.addPage('l');
      y = margin;
    }
    let x = margin;
    for (let i = 0; i < cells.length; i++) {
      const w = i === cells.length - 1 ? pageWidth - margin - x : colWidth;
      if (isHeader) {
        doc.setFillColor(headerColor[0], headerColor[1], headerColor[2]);
        doc.rect(x, y, w, rowHeight, 'F');
        doc.setTextColor(255, 255, 255);
      } else {
        doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
        doc.rect(x, y, w, rowHeight, 'S');
        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      }
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', isHeader ? 'bold' : 'normal');
      const text = String(cells[i] ?? '').substring(0, 35);
      doc.text(text, x + 2, y + rowHeight / 2 + 1.5);
      x += w;
    }
    y += rowHeight;
  };

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(headerColor[0], headerColor[1], headerColor[2]);
  doc.text('Exportação de Propostas - Sell.On', margin, y);
  y += 12;

  drawTableRow(headers, true);
  rows.forEach((row) => drawTableRow(row, false));

  const fileName = `propostas_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};