const fs = require('fs');
const path = require('path');
const PdfPrinter = require('pdfmake');

// Read the markdown content
const markdownContent = fs.readFileSync(path.join(__dirname, '..', 'Fintech_API_Documentation.md'), 'utf8');

// Simple conversion from markdown-like content to PDF definition
function convertToPdfDefinition(content) {
  const lines = content.split('\n');
  const pdfContent = [];
  
  // Add title page
  pdfContent.push({
    text: 'Fintech Microservice Application API Documentation',
    fontSize: 24,
    bold: true,
    alignment: 'center',
    margin: [0, 100, 0, 20]
  });
  
  pdfContent.push({
    text: 'Comprehensive Guide to Endpoints, Authentication, and Usage',
    fontSize: 16,
    alignment: 'center',
    margin: [0, 0, 0, 100]
  });
  
  pdfContent.push({
    text: 'Generated Documentation',
    fontSize: 12,
    alignment: 'center',
    italics: true
  });
  
  // Add a page break
  pdfContent.push({ text: '', pageBreak: 'after' });
  
  // Process content sections
  for (const line of lines) {
    if (line.startsWith('# ')) {
      pdfContent.push({
        text: line.substring(2),
        fontSize: 24,
        bold: true,
        margin: [0, 20, 0, 10]
      });
    } else if (line.startsWith('## ')) {
      pdfContent.push({
        text: line.substring(3),
        fontSize: 20,
        bold: true,
        margin: [0, 15, 0, 8]
      });
    } else if (line.startsWith('### ')) {
      pdfContent.push({
        text: line.substring(4),
        fontSize: 16,
        bold: true,
        margin: [0, 10, 0, 5]
      });
    } else if (line.startsWith('#### ')) {
      pdfContent.push({
        text: line.substring(5),
        fontSize: 14,
        bold: true,
        margin: [0, 8, 0, 3]
      });
    } else if (line.startsWith('- ')) {
      pdfContent.push({
        text: '• ' + line.substring(2),
        margin: [10, 2, 0, 2]
      });
    } else if (line.match(/^\d+\./)) {
      pdfContent.push({
        text: line,
        margin: [10, 2, 0, 2]
      });
    } else if (line.startsWith('```')) {
      // Skip code block markers
      continue;
    } else if (line.trim() !== '') {
      pdfContent.push({
        text: line,
        margin: [0, 3, 0, 3]
      });
    }
  }
  
  return pdfContent;
}

// Define fonts
const fonts = {
  Helvetica: {
    normal: 'Helvetica',
    bold: 'Helvetica-Bold',
    italics: 'Helvetica-Oblique',
    bolditalics: 'Helvetica-BoldOblique'
  }
};

const printer = new PdfPrinter(fonts);

const docDefinition = {
  content: convertToPdfDefinition(markdownContent),
  defaultStyle: {
    font: 'Helvetica',
    fontSize: 11
  },
  pageSize: 'A4',
  pageMargins: [40, 60, 40, 60]
};

// Generate the PDF
const pdfDoc = printer.createPdfKitDocument(docDefinition);
const outputPath = path.join(__dirname, '..', 'Fintech API Documentation.pdf');
pdfDoc.pipe(fs.createWriteStream(outputPath));
pdfDoc.end();

console.log(`PDF generated successfully at: ${outputPath}`);