const fs = require('fs');
const path = require('path');
const PdfPrinter = require('pdfmake');

// Read the markdown content
const markdownContent = fs.readFileSync(path.join(__dirname, '..', 'Fintech_API_Documentation.md'), 'utf8');

// Simple conversion from markdown to a format suitable for pdfmake
// In a production environment, you'd want a more robust markdown parser
function convertMarkdownToPdfDefinition(markdown) {
  const lines = markdown.split('\n');
  const content = [];
  
  let currentList = null;
  let currentCodeBlock = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Skip empty lines
    if (line.trim() === '') {
      if (currentList) {
        content.push(currentList);
        currentList = null;
      }
      continue;
    }
    
    // Handle headers
    if (line.startsWith('# ')) {
      if (currentList) {
        content.push(currentList);
        currentList = null;
      }
      content.push({ text: line.substring(2), fontSize: 24, bold: true, margin: [0, 20, 0, 10] });
    } else if (line.startsWith('## ')) {
      if (currentList) {
        content.push(currentList);
        currentList = null;
      }
      content.push({ text: line.substring(3), fontSize: 20, bold: true, margin: [0, 15, 0, 8] });
    } else if (line.startsWith('### ')) {
      if (currentList) {
        content.push(currentList);
        currentList = null;
      }
      content.push({ text: line.substring(4), fontSize: 16, bold: true, margin: [0, 10, 0, 5] });
    } else if (line.startsWith('#### ')) {
      if (currentList) {
        content.push(currentList);
        currentList = null;
      }
      content.push({ text: line.substring(5), fontSize: 14, bold: true, margin: [0, 8, 0, 3] });
    }
    // Handle lists
    else if (line.startsWith('- ')) {
      if (!currentList) {
        currentList = { ul: [] };
      }
      currentList.ul.push(line.substring(2));
    }
    // Handle numbered lists
    else if (line.match(/^\d+\./)) {
      if (!currentList) {
        currentList = { ol: [] };
      }
      currentList.ol.push(line.substring(line.indexOf('.') + 2));
    }
    // Handle code blocks
    else if (line.startsWith('```')) {
      if (!currentCodeBlock) {
        currentCodeBlock = { text: '', fontSize: 10, font: 'Courier', margin: [0, 5, 0, 5] };
        if (i + 1 < lines.length && !lines[i + 1].startsWith('```')) {
          i++; // Skip the opening ```
          while (i < lines.length && !lines[i].startsWith('```')) {
            currentCodeBlock.text += lines[i] + '\n';
            i++;
          }
          content.push(currentCodeBlock);
          currentCodeBlock = null;
        }
      }
    }
    // Handle regular paragraphs
    else {
      if (currentList) {
        content.push(currentList);
        currentList = null;
      }
      if (line.trim() !== '') {
        content.push({ text: line, margin: [0, 5, 0, 5] });
      }
    }
  }
  
  // Add any remaining list
  if (currentList) {
    content.push(currentList);
  }
  
  return content;
}

// Define the PDF structure
const fonts = {
  Roboto: {
    normal: 'Helvetica',
    bold: 'Helvetica-Bold',
    italics: 'Helvetica-Oblique',
    bolditalics: 'Helvetica-BoldOblique'
  },
  Courier: {
    normal: 'Courier',
    bold: 'Courier-Bold',
    italics: 'Courier-Oblique',
    bolditalics: 'Courier-BoldOblique'
  }
};

const printer = new PdfPrinter(fonts);

const docDefinition = {
  content: convertMarkdownToPdfDefinition(markdownContent),
  styles: {
    header: {
      fontSize: 18,
      bold: true,
      margin: [0, 0, 0, 10]
    },
    subheader: {
      fontSize: 16,
      bold: true,
      margin: [0, 10, 0, 5]
    },
    code: {
      font: 'Courier',
      fontSize: 10,
      margin: [0, 5, 0, 5]
    }
  },
  defaultStyle: {
    font: 'Roboto'
  }
};

// Generate the PDF
const pdfDoc = printer.createPdfKitDocument(docDefinition);
const outputPath = path.join(__dirname, '..', 'Fintech API Documentation.pdf');
pdfDoc.pipe(fs.createWriteStream(outputPath));
pdfDoc.end();

console.log(`PDF generated successfully at: ${outputPath}`);