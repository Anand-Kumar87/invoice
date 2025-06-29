// Utility functions

// Format currency
function formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
    }).format(amount);
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// Show modal
function showModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Hide modal
function hideModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Get status badge class
function getStatusBadgeClass(status) {
    switch (status) {
        case 'Draft':
            return 'status-badge status-draft';
        case 'Sent':
            return 'status-badge status-sent';
        case 'Paid':
            return 'status-badge status-paid';
        case 'Overdue':
            return 'status-badge status-overdue';
        default:
            return 'status-badge';
    }
}

// Export to PDF
function exportToPDF(elementId, filename) {
    try {
        const { jsPDF } = window.jspdf;
        if (!jsPDF) {
            throw new Error('jsPDF library not loaded');
        }
        
        // Create a new PDF document
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        
        // Set initial position
        let yPos = 20;
        const leftMargin = 20;
        const rightAlign = 190;
        const pageWidth = 210 - (leftMargin * 2);
        
        // Get invoice data from the preview
        const invoice = document.getElementById(elementId);
        
        // Add logo if available
        const logoElement = invoice.querySelector('#preview-logo');
        if (logoElement && logoElement.src && !logoElement.src.includes('default-logo.png')) {
            try {
                doc.addImage(logoElement.src, 'PNG', leftMargin, yPos, 40, 20);
                // Move title to the right if logo exists
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(24);
                doc.setTextColor(59, 130, 246); // Primary blue color
                doc.text('INVOICE', 70, yPos + 10);
            } catch (error) {
                console.error('Error adding logo to PDF:', error);
                // If logo fails, center the title
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(24);
                doc.setTextColor(59, 130, 246); // Primary blue color
                doc.text('INVOICE', 105, yPos + 10, { align: 'center' });
            }
        } else {
            // No logo, center the title
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(24);
            doc.setTextColor(59, 130, 246); // Primary blue color
            doc.text('INVOICE', 105, yPos + 10, { align: 'center' });
        }
        
        // Add invoice details (right aligned)
        yPos += 5;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        
        const invoiceDetails = [
            `Invoice #: ${invoice.querySelector('#preview-invoice-number').textContent}`,
            `Issue Date: ${invoice.querySelector('#preview-issue-date').textContent}`,
            `Due Date: ${invoice.querySelector('#preview-due-date').textContent}`,
            `Status: ${invoice.querySelector('#preview-status').textContent}`
        ];
        
        invoiceDetails.forEach(detail => {
            yPos += 7;
            doc.text(detail, rightAlign, yPos, { align: 'right' });
        });
        
        // Move down for the next section
        yPos += 20;
        
        // Add client information (left side)
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text('Bill To:', leftMargin, yPos);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        
        const clientName = invoice.querySelector('#preview-client-name').textContent;
        const clientEmail = invoice.querySelector('#preview-client-email').textContent;
        const clientPhone = invoice.querySelector('#preview-client-phone').textContent;
        const clientAddress = invoice.querySelector('#preview-client-address').textContent;
        
        yPos += 7;
        doc.text(clientName, leftMargin, yPos);
        yPos += 5;
        doc.text(clientEmail, leftMargin, yPos);
        
        if (clientPhone && clientPhone.trim() !== '') {
            yPos += 5;
            doc.text(clientPhone, leftMargin, yPos);
        }
        
        let addressLines = [];
        if (clientAddress && clientAddress.trim() !== '') {
            yPos += 5;
            addressLines = doc.splitTextToSize(clientAddress, 80);
            addressLines.forEach(line => {
                doc.text(line, leftMargin, yPos);
                yPos += 5;
            });
        }
        
        // Reset yPos to add bank details on the right side
        yPos = yPos - (clientAddress ? addressLines.length * 5 : 0) - (clientPhone ? 5 : 0) - 10;
        
        // Add bank information (right side)
        doc.setFont('helvetica', 'bold');
        doc.text('Payment Details:', 110, yPos);
        
        doc.setFont('helvetica', 'normal');
        
        const bankName = invoice.querySelector('#preview-bank-name').textContent;
        const accountName = invoice.querySelector('#preview-account-name').textContent;
        const accountNumber = invoice.querySelector('#preview-account-number').textContent;
        
        yPos += 7;
        doc.text(`Bank: ${bankName}`, 110, yPos);
        yPos += 5;
        doc.text(`Account Name: ${accountName}`, 110, yPos);
        yPos += 5;
        doc.text(`Account Number: ${accountNumber}`, 110, yPos);
        
        const swiftContainer = invoice.querySelector('#preview-swift-container');
        if (swiftContainer && swiftContainer.style.display !== 'none') {
            yPos += 5;
            doc.text(`SWIFT Code: ${invoice.querySelector('#preview-swift-code').textContent}`, 110, yPos);
        }
        
        const ifscContainer = invoice.querySelector('#preview-ifsc-container');
        if (ifscContainer && ifscContainer.style.display !== 'none') {
            yPos += 5;
            doc.text(`IFSC Code: ${invoice.querySelector('#preview-ifsc-code').textContent}`, 110, yPos);
        }
        
        // Move down for the items table
        yPos += 20;
        
        // Add items table
        // Table headers
        doc.setFillColor(248, 250, 252); // Light gray background
        doc.rect(leftMargin, yPos, pageWidth, 8, 'F');
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text('Description', leftMargin + 5, yPos + 5.5);
        doc.text('Qty', leftMargin + 110, yPos + 5.5);
        doc.text('Rate', leftMargin + 130, yPos + 5.5);
        doc.text('Amount', leftMargin + 155, yPos + 5.5);
        
        // Table rows
        doc.setFont('helvetica', 'normal');
        yPos += 8;
        
        const items = invoice.querySelectorAll('#preview-items tr');
        items.forEach(item => {
            const columns = item.querySelectorAll('td');
            if (columns.length === 4) {
                const description = columns[0].textContent;
                const quantity = columns[1].textContent;
                const rate = columns[2].textContent;
                const amount = columns[3].textContent;
                
                // Check if we need a new page
                if (yPos > 250) {
                    doc.addPage();
                    yPos = 20;
                }
                
                // Split long descriptions
                const descriptionLines = doc.splitTextToSize(description, 100);
                
                // Draw the row
                descriptionLines.forEach((line, index) => {
                    if (index === 0) {
                        doc.text(line, leftMargin + 5, yPos + 5);
                        doc.text(quantity, leftMargin + 110, yPos + 5);
                        doc.text(rate, leftMargin + 130, yPos + 5);
                        doc.text(amount, leftMargin + 155, yPos + 5);
                    } else {
                        yPos += 5;
                        doc.text(line, leftMargin + 5, yPos + 5);
                    }
                });
                
                yPos += 10;
            }
        });
        
        // Add a line after items
        doc.setDrawColor(226, 232, 240); // Light gray line
        doc.setLineWidth(0.5);
        doc.line(leftMargin, yPos, leftMargin + pageWidth, yPos);
        
        // Add totals
        yPos += 10;
        
        // Subtotal
        doc.setFont('helvetica', 'normal');
        doc.text('Subtotal:', leftMargin + 130, yPos);
        doc.text(invoice.querySelector('#preview-subtotal').textContent, leftMargin + 170, yPos, { align: 'right' });
        
        // Tax (if applicable)
        const taxRow = invoice.querySelector('#preview-tax-row');
        if (taxRow && taxRow.style.display !== 'none') {
            yPos += 7;
            const taxRate = invoice.querySelector('#preview-tax-rate').textContent;
            const taxAmount = invoice.querySelector('#preview-tax-amount').textContent;
            doc.text(`Tax (${taxRate}%):`, leftMargin + 130, yPos);
            doc.text(taxAmount, leftMargin + 170, yPos, { align: 'right' });
        }
        
        // Discount (if applicable)
        const discountRow = invoice.querySelector('#preview-discount-row');
        if (discountRow && discountRow.style.display !== 'none') {
            yPos += 7;
            const discountRate = invoice.querySelector('#preview-discount-rate').textContent;
            const discountAmount = invoice.querySelector('#preview-discount-amount').textContent;
            doc.text(`Discount (${discountRate}%):`, leftMargin + 130, yPos);
            doc.text(discountAmount, leftMargin + 170, yPos, { align: 'right' });
        }
        
        // Total
        yPos += 7;
        doc.setDrawColor(226, 232, 240);
        doc.line(leftMargin + 110, yPos, leftMargin + 170, yPos);
        yPos += 5;
        
        doc.setFont('helvetica', 'bold');
        doc.text('Total:', leftMargin + 130, yPos);
        doc.text(invoice.querySelector('#preview-total').textContent, leftMargin + 170, yPos, { align: 'right' });
        
        // Notes (if applicable)
        const notesContainer = invoice.querySelector('#preview-notes-container');
        if (notesContainer && notesContainer.style.display !== 'none') {
            yPos += 20;
            
            // Check if we need a new page
            if (yPos > 250) {
                doc.addPage();
                yPos = 20;
            }
            
            doc.setFont('helvetica', 'bold');
            doc.text('Notes:', leftMargin, yPos);
            
            yPos += 7;
            doc.setFont('helvetica', 'normal');
            
            const notes = invoice.querySelector('#preview-notes').textContent;
            const noteLines = doc.splitTextToSize(notes, pageWidth);
            
            noteLines.forEach(line => {
                doc.text(line, leftMargin, yPos);
                yPos += 5;
            });
        }
        
        // Footer
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.text('Website developed by Anand Kumar', 105, 285, { align: 'center' });
        
        // Save the PDF
        doc.save(filename || `Invoice.pdf`);
        return true;
    } catch (error) {
        console.error('Error generating PDF:', error);
        return false;
    }
}

// Fallback PDF generation method
function downloadInvoiceAsPDF(invoiceId) {
    try {
        const invoice = getInvoiceById(invoiceId);
        if (!invoice) {
            showNotification('Invoice not found', 'error');
            return false;
        }
        
        // Get client and bank info
        const client = getClientById(invoice.client);
        const bank = getBankAccountById(invoice.bankAccount);
        
        // Create a new jsPDF instance
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Add title
        doc.setFontSize(22);
        doc.setTextColor(59, 130, 246);
        doc.text('INVOICE', 105, 20, { align: 'center' });
        
        // Add invoice details
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text(`Invoice #: ${invoice.invoiceNumber}`, 20, 30);
        doc.text(`Issue Date: ${formatDate(invoice.issueDate)}`, 20, 35);
        doc.text(`Due Date: ${formatDate(invoice.dueDate)}`, 20, 40);
        doc.text(`Status: ${invoice.status}`, 20, 45);
        
        // Add client info
        doc.text('Bill To:', 20, 55);
        doc.text(client ? client.name : 'Unknown Client', 20, 60);
        doc.text(client ? client.email : '', 20, 65);
        
        // Add bank info
        doc.text('Payment Details:', 120, 55);
        doc.text(`Bank: ${bank ? bank.bankName : 'Unknown Bank'}`, 120, 60);
        doc.text(`Account #: ${bank ? bank.accountNumber : ''}`, 120, 65);
        
              // Add items header
        doc.setFillColor(240, 240, 240);
        doc.rect(20, 75, 170, 8, 'F');
        doc.setFontSize(9);
        doc.text('Description', 25, 80);
        doc.text('Qty', 120, 80);
        doc.text('Rate', 140, 80);
        doc.text('Amount', 160, 80);
        
        // Add items
        let y = 90;
        invoice.items.forEach(item => {
            doc.text(item.description.substring(0, 40), 25, y);
            doc.text(item.quantity.toString(), 120, y);
            doc.text(formatCurrency(item.rate, invoice.currency), 140, y);
            doc.text(formatCurrency(item.amount, invoice.currency), 160, y);
            y += 10;
        });
        
        // Add totals
        y += 10;
        doc.text('Subtotal:', 130, y);
        doc.text(formatCurrency(invoice.subtotal, invoice.currency), 160, y);
        
        if (invoice.taxRate > 0) {
            y += 7;
            doc.text(`Tax (${invoice.taxRate}%):`, 130, y);
            doc.text(formatCurrency(invoice.taxAmount, invoice.currency), 160, y);
        }
        
        if (invoice.discountRate > 0) {
            y += 7;
            doc.text(`Discount (${invoice.discountRate}%):`, 130, y);
            doc.text(formatCurrency(invoice.discountAmount, invoice.currency), 160, y);
        }
        
        y += 10;
        doc.setFontSize(11);
        doc.text('Total:', 130, y);
        doc.text(formatCurrency(invoice.total, invoice.currency), 160, y);
        
        // Add notes if any
        if (invoice.notes) {
            y += 20;
            doc.setFontSize(10);
            doc.text('Notes:', 20, y);
            y += 7;
            
            const noteLines = doc.splitTextToSize(invoice.notes, 170);
            noteLines.forEach(line => {
                doc.text(line, 20, y);
                y += 5;
            });
        }
        
        // Add footer
        doc.setFontSize(8);
        doc.text('Website developed by Anand Kumar', 105, 280, { align: 'center' });
        
        // Save the PDF
        doc.save(`Invoice_${invoice.invoiceNumber}.pdf`);
        return true;
    } catch (error) {
        console.error('Error generating PDF:', error);
        return false;
    }
}

// Simple PDF generation for testing
function generateSimplePDF(invoiceId) {
    try {
        const { jsPDF } = window.jspdf;
        if (!jsPDF) {
            throw new Error('jsPDF library not loaded');
        }
        
        const doc = new jsPDF();
        doc.text('Hello world!', 10, 10);
        doc.text('This is a test PDF.', 10, 20);
        doc.text(`Invoice ID: ${invoiceId}`, 10, 30);
        doc.text('If you can see this, PDF generation is working.', 10, 40);
        doc.save('test.pdf');
        return true;
    } catch (error) {
        console.error('Error generating test PDF:', error);
        return false;
    }
}