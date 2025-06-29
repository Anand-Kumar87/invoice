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
// Replace the exportToPDF function in js/utils.js with this improved version:

// Update the exportToPDF function in js/utils.js
function exportToPDF(elementId, filename) {
    const { jsPDF } = window.jspdf;
    
    // Create a new jsPDF instance
    const doc = new jsPDF('p', 'mm', 'a4');
    
    // Get the element to be converted to PDF
    const element = document.getElementById(elementId);
    
    // Clone the element to avoid modifying the original
    const clonedElement = element.cloneNode(true);
    
    // Create a temporary container
    const tempContainer = document.createElement('div');
    tempContainer.appendChild(clonedElement);
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    document.body.appendChild(tempContainer);
    
    // Get logo
    const logoElement = clonedElement.querySelector('#preview-logo');
    const logoSrc = logoElement.src;
    
    // Manually extract and add content to PDF
    const invoiceNumber = clonedElement.querySelector('#preview-invoice-number').textContent;
    const issueDate = clonedElement.querySelector('#preview-issue-date').textContent;
    const dueDate = clonedElement.querySelector('#preview-due-date').textContent;
    const status = clonedElement.querySelector('#preview-status').textContent;
    
    // Rest of the variables extraction remains the same
    // ...
    
    // Add logo if available
    if (logoSrc && logoSrc !== 'assets/default-logo.png') {
        doc.addImage(logoSrc, 'PNG', 20, 15, 40, 20);
        // Adjust the position of the invoice title
        doc.setFontSize(24);
        doc.setTextColor(59, 130, 246); // Primary color
        doc.text('INVOICE', 70, 25);
    } else {
        // If no logo, center the invoice title
        doc.setFontSize(24);
        doc.setTextColor(59, 130, 246); // Primary color
        doc.text('INVOICE', 105, 20, { align: 'center' });
    }
    
    // Rest of the function remains the same
    // ...
}
    
    // Add invoice header
    doc.setFontSize(24);
    doc.setTextColor(59, 130, 246); // Primary color
    doc.text('INVOICE', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Invoice #: ${invoiceNumber}`, 200, 30, { align: 'right' });
    doc.text(`Issue Date: ${issueDate}`, 200, 37, { align: 'right' });
    doc.text(`Due Date: ${dueDate}`, 200, 44, { align: 'right' });
    doc.text(`Status: ${status}`, 200, 51, { align: 'right' });
    
    // Add client information
    doc.setFontSize(14);
    doc.text('Bill To:', 20, 60);
    
    doc.setFontSize(12);
    doc.text(clientName, 20, 67);
    doc.text(clientEmail, 20, 74);
    if (clientPhone) doc.text(clientPhone, 20, 81);
    if (clientAddress) {
        const addressLines = clientAddress.split(', ');
        addressLines.forEach((line, index) => {
            doc.text(line, 20, 88 + (index * 7));
        });
    }
    
    // Add bank information
    doc.setFontSize(14);
    doc.text('Payment Details:', 120, 60);
    
    doc.setFontSize(12);
    doc.text(`Bank: ${bankName}`, 120, 67);
    doc.text(`Account Name: ${accountName}`, 120, 74);
    doc.text(`Account Number: ${accountNumber}`, 120, 81);
    
    // Add items table
    const startY = 110;
    doc.line(20, startY, 190, startY);
    
    // Table headers
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Description', 22, startY - 5);
    doc.text('Qty', 120, startY - 5);
    doc.text('Rate', 140, startY - 5);
    doc.text('Amount', 170, startY - 5);
    
    // Table rows
    doc.setFont(undefined, 'normal');
    let currentY = startY + 10;
    
    // Get items from the table
    const itemRows = clonedElement.querySelectorAll('#preview-items tr');
    itemRows.forEach(row => {
        const columns = row.querySelectorAll('td');
        if (columns.length === 4) {
            doc.text(columns[0].textContent.substring(0, 40), 22, currentY);
            doc.text(columns[1].textContent, 120, currentY);
            doc.text(columns[2].textContent, 140, currentY);
            doc.text(columns[3].textContent, 170, currentY);
            currentY += 10;
        }
    });
    
    doc.line(20, currentY, 190, currentY);
    currentY += 10;
    
    // Add totals
    const subtotal = clonedElement.querySelector('#preview-subtotal').textContent;
    doc.text('Subtotal:', 140, currentY);
    doc.text(subtotal, 170, currentY);
    currentY += 10;
    
    // Check if tax row is visible
    const taxRow = clonedElement.querySelector('#preview-tax-row');
    if (taxRow && taxRow.style.display !== 'none') {
        const taxRate = clonedElement.querySelector('#preview-tax-rate').textContent;
        const taxAmount = clonedElement.querySelector('#preview-tax-amount').textContent;
        doc.text(`Tax (${taxRate}%):`, 140, currentY);
        doc.text(taxAmount, 170, currentY);
        currentY += 10;
    }
    
    // Check if discount row is visible
    const discountRow = clonedElement.querySelector('#preview-discount-row');
    if (discountRow && discountRow.style.display !== 'none') {
        const discountRate = clonedElement.querySelector('#preview-discount-rate').textContent;
        const discountAmount = clonedElement.querySelector('#preview-discount-amount').textContent;
        doc.text(`Discount (${discountRate}%):`, 140, currentY);
        doc.text(discountAmount, 170, currentY);
        currentY += 10;
    }
    
    // Total
    const total = clonedElement.querySelector('#preview-total').textContent;
    doc.setFont(undefined, 'bold');
    doc.text('Total:', 140, currentY);
    doc.text(total, 170, currentY);
    
    // Notes
    const notesContainer = clonedElement.querySelector('#preview-notes-container');
    if (notesContainer && notesContainer.style.display !== 'none') {
        currentY += 20;
        doc.setFont(undefined, 'bold');
        doc.text('Notes:', 20, currentY);
        
        const notes = clonedElement.querySelector('#preview-notes').textContent;
        doc.setFont(undefined, 'normal');
        currentY += 10;
        
        // Split notes into multiple lines if needed
        const splitNotes = doc.splitTextToSize(notes, 170);
        doc.text(splitNotes, 20, currentY);
    }
    
    // Footer
    doc.setFontSize(10);
    doc.text('Website developed by Anand Kumar', 105, 280, { align: 'center' });
    
    // Remove the temporary container
    document.body.removeChild(tempContainer);
    
    // Save the PDF
    newFunction();
function newFunction() {
    doc.save(filename);
    showNotification('Invoice exported to PDF successfully');
}

