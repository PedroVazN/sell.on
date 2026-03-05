import jsPDF from 'jspdf';

export const testPdf = () => {
  try {
    const doc = new jsPDF();
    doc.text('Teste de PDF', 20, 20);
    doc.text('Sell.On - Sistema de Gestão Comercial', 20, 40);
    doc.text('Data: ' + new Date().toLocaleDateString('pt-BR'), 20, 60);
    
    // Salvar o PDF
    doc.save('teste-pdf.pdf');
    console.log('PDF gerado com sucesso!');
    return true;
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    return false;
  }
};
