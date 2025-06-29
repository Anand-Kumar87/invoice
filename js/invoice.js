// Invoice management

// Initialize invoices from localStorage
let invoices = JSON.parse(localStorage.getItem('invoices')) || [];

// Save invoices to localStorage
function saveInvoices() {
    localStorage.setItem('invoices', JSON.stringify(invoices));
}

// Get invoice by ID
function getInvoiceById(id) {
    return invoices.find(invoice => invoice.id === id);
}

// Add invoice
function addInvoice(invoice) {
    invoice.id = generateId();
    invoice.createdAt = new Date().toISOString();
    invoices.push(invoice);
    saveInvoices();
    return invoice;
}

// Update invoice
function updateInvoice(id, updatedInvoice) {
    const index = invoices.findIndex(invoice => invoice.id === id);
    if (index !== -1) {
        invoices[index] = { ...invoices[index], ...updatedInvoice };
        saveInvoices();
        return invoices[index];
    }
    return null;
}

// Delete invoice
function deleteInvoice(id) {
    invoices = invoices.filter(invoice => invoice.id !== id);
    saveInvoices();
}

// Calculate invoice totals
function calculateInvoiceTotals(items, taxRate = 0, discountRate = 0) {
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const taxAmount = subtotal * (taxRate / 100);
    const discountAmount = subtotal * (discountRate / 100);
    const total = subtotal + taxAmount - discountAmount;
    
    return {
        subtotal,
        taxAmount,
        discountAmount,
        total
    };
}

// Render invoices table
function renderInvoicesTable(tableId = 'invoices-body', limit = null) {
    const tableBody = document.getElementById(tableId);
    tableBody.innerHTML = '';
    
    // Sort invoices by date (newest first)
    const sortedInvoices = [...invoices].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
    );
    
    // Apply limit if specified
    const displayInvoices = limit ? sortedInvoices.slice(0, limit) : sortedInvoices;
    
    if (displayInvoices.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="7" class="text-center">No invoices found</td>
        `;
        tableBody.appendChild(row);
        return;
    }
    
    displayInvoices.forEach(invoice => {
        const client = getClientById(invoice.client);
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${invoice.invoiceNumber}</td>
            <td>${client ? client.name : 'Unknown Client'}</td>
            <td>${formatDate(invoice.issueDate)}</td>
            <td>${formatDate(invoice.dueDate)}</td>
            <td>${formatCurrency(invoice.total, invoice.currency)}</td>
            <td><span class="${getStatusBadgeClass(invoice.status)}">${invoice.status}</span></td>
            <td>
                <button class="btn btn-small view-invoice" data-id="${invoice.id}">View</button>
                <button class="btn btn-small edit-invoice" data-id="${invoice.id}">Edit</button>
                <button class="btn btn-small btn-danger delete-invoice" data-id="${invoice.id}">Delete</button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Add event listeners
    document.querySelectorAll('.view-invoice').forEach(button => {
        button.addEventListener('click', function() {
            const invoiceId = this.getAttribute('data-id');
            viewInvoice(invoiceId);
        });
    });
    
    document.querySelectorAll('.edit-invoice').forEach(button => {
        button.addEventListener('click', function() {
            const invoiceId = this.getAttribute('data-id');
            editInvoice(invoiceId);
        });
    });
    
    document.querySelectorAll('.delete-invoice').forEach(button => {
        button.addEventListener('click', function() {
            const invoiceId = this.getAttribute('data-id');
            if (confirm('Are you sure you want to delete this invoice?')) {
                deleteInvoice(invoiceId);
                renderInvoicesTable();
                renderInvoicesTable('recent-invoices-body', 5);
                updateDashboardStats();
                showNotification('Invoice deleted successfully');
            }
        });
    });
}

// View invoice
function viewInvoice(invoiceId) {
    const invoice = getInvoiceById(invoiceId);
    if (!invoice) return;
    
    const client = getClientById(invoice.client);
    const bankAccount = getBankAccountById(invoice.bankAccount);
    
    // Fill invoice preview
    document.getElementById('preview-invoice-number').textContent = invoice.invoiceNumber;
    document.getElementById('preview-issue-date').textContent = formatDate(invoice.issueDate);
    document.getElementById('preview-due-date').textContent = formatDate(invoice.dueDate);
    
    const statusElement = document.getElementById('preview-status');
    statusElement.textContent = invoice.status;
    statusElement.className = getStatusBadgeClass(invoice.status);
    
    // Client details
    if (client) {
        document.getElementById('preview-client-name').textContent = client.name;
        document.getElementById('preview-client-email').textContent = client.email;
        document.getElementById('preview-client-phone').textContent = client.phone || '';
        
        let address = '';
        if (client.address) {
            const addressParts = [
                client.address.street,
                client.address.city,
                client.address.state,
                client.address.zip,
                client.address.country
            ].filter(part => part);
            
            address = addressParts.join(', ');
        }
        document.getElementById('preview-client-address').textContent = address;
    }
    
    // Bank details
    if (bankAccount) {
        document.getElementById('preview-bank-name').textContent = bankAccount.bankName;
        document.getElementById('preview-account-name').textContent = bankAccount.accountName;
        document.getElementById('preview-account-number').textContent = bankAccount.accountNumber;
        
        if (bankAccount.swiftCode) {
            document.getElementById('preview-swift-code').textContent = bankAccount.swiftCode;
            document.getElementById('preview-swift-container').style.display = 'block';
        } else {
            document.getElementById('preview-swift-container').style.display = 'none';
        }
        
        if (bankAccount.ifscCode) {
            document.getElementById('preview-ifsc-code').textContent = bankAccount.ifscCode;
            document.getElementById('preview-ifsc-container').style.display = 'block';
        } else {
            document.getElementById('preview-ifsc-container').style.display = 'none';
        }
    }
    
    // Invoice items
    const itemsContainer = document.getElementById('preview-items');
    itemsContainer.innerHTML = '';
    
    invoice.items.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.description}</td>
            <td>${item.quantity}</td>
            <td>${formatCurrency(item.rate, invoice.currency)}</td>
            <td>${formatCurrency(item.amount, invoice.currency)}</td>
        `;
        itemsContainer.appendChild(row);
    });
    
    // Totals
    document.getElementById('preview-subtotal').textContent = formatCurrency(invoice.subtotal, invoice.currency);
    
    if (invoice.taxRate > 0) {
        document.getElementById('preview-tax-rate').textContent = invoice.taxRate;
        document.getElementById('preview-tax-amount').textContent = formatCurrency(invoice.taxAmount, invoice.currency);
        document.getElementById('preview-tax-row').style.display = 'flex';
    } else {
        document.getElementById('preview-tax-row').style.display = 'none';
    }
    
    if (invoice.discountRate > 0) {
        document.getElementById('preview-discount-rate').textContent = invoice.discountRate;
        document.getElementById('preview-discount-amount').textContent = formatCurrency(invoice.discountAmount, invoice.currency);
        document.getElementById('preview-discount-row').style.display = 'flex';
    } else {
        document.getElementById('preview-discount-row').style.display = 'none';
    }
    
    document.getElementById('preview-total').textContent = formatCurrency(invoice.total, invoice.currency);
    
    // Notes
    if (invoice.notes) {
        document.getElementById('preview-notes').textContent = invoice.notes;
        document.getElementById('preview-notes-container').style.display = 'block';
    } else {
        document.getElementById('preview-notes-container').style.display = 'none';
    }
    
    // Set up action buttons
    document.getElementById('edit-invoice').setAttribute('data-id', invoiceId);
    document.getElementById('delete-invoice').setAttribute('data-id', invoiceId);
    
    // Show modal
    showModal('invoice-view-modal');
}

// Edit invoice
function editInvoice(invoiceId) {
    const invoice = getInvoiceById(invoiceId);
    if (!invoice) return;
    
    // Fill form with invoice data
    document.getElementById('invoice-number').value = invoice.invoiceNumber;
    document.getElementById('invoice-client').value = invoice.client;
    document.getElementById('invoice-issue-date').value = invoice.issueDate;
    document.getElementById('invoice-due-date').value = invoice.dueDate;
    document.getElementById('invoice-currency').value = invoice.currency;
    document.getElementById('invoice-bank').value = invoice.bankAccount;
    document.getElementById('invoice-notes').value = invoice.notes || '';
    document.getElementById('invoice-status').value = invoice.status;
    document.getElementById('invoice-tax-rate').value = invoice.taxRate;
    document.getElementById('invoice-discount-rate').value = invoice.discountRate;
    
    // Clear existing items
    const itemsContainer = document.getElementById('invoice-items');
    itemsContainer.innerHTML = '';
    
    // Add invoice items
    invoice.items.forEach((item, index) => {
        addInvoiceItemRow(item, index);
    });
    
    // Update totals
    document.getElementById('invoice-subtotal').value = invoice.subtotal;
    document.getElementById('invoice-tax-amount').value = invoice.taxAmount;
    document.getElementById('invoice-discount-amount').value = invoice.discountAmount;
    document.getElementById('invoice-total').value = invoice.total;
    
    // Update modal title and form data attribute
    document.getElementById('invoice-modal-title').textContent = 'Edit Invoice';
    document.getElementById('invoice-form').setAttribute('data-id', invoiceId);
    
    // Show modal
    showModal('invoice-modal');
}

// Add invoice item row
function addInvoiceItemRow(item = null, index = null) {
    const itemsContainer = document.getElementById('invoice-items');
    const newIndex = index !== null ? index : itemsContainer.children.length;
    
    const itemRow = document.createElement('div');
    itemRow.className = 'invoice-item';
    
    itemRow.innerHTML = `
        <div class="form-group">
            <label for="item-description-${newIndex}">Description</label>
            <input type="text" id="item-description-${newIndex}" class="item-description" required>
        </div>
        <div class="form-group">
            <label for="item-quantity-${newIndex}">Quantity</label>
            <input type="number" id="item-quantity-${newIndex}" class="item-quantity" min="1" value="1" required>
        </div>
        <div class="form-group">
            <label for="item-rate-${newIndex}">Rate</label>
            <input type="number" id="item-rate-${newIndex}" class="item-rate" min="0" step="0.01" value="0" required>
        </div>
        <div class="form-group">
            <label for="item-amount-${newIndex}">Amount</label>
            <input type="number" id="item-amount-${newIndex}" class="item-amount" readonly>
        </div>
                <button type="button" class="btn btn-small btn-danger remove-item" ${itemsContainer.children.length === 0 ? 'disabled' : ''}>Remove</button>
    `;
    
    itemsContainer.appendChild(itemRow);
    
    // Fill with item data if provided
    if (item) {
        itemRow.querySelector('.item-description').value = item.description;
        itemRow.querySelector('.item-quantity').value = item.quantity;
        itemRow.querySelector('.item-rate').value = item.rate;
        itemRow.querySelector('.item-amount').value = item.amount;
    }
    
    // Add event listeners
    const quantityInput = itemRow.querySelector('.item-quantity');
    const rateInput = itemRow.querySelector('.item-rate');
    const amountInput = itemRow.querySelector('.item-amount');
    
    function calculateAmount() {
        const quantity = parseFloat(quantityInput.value) || 0;
        const rate = parseFloat(rateInput.value) || 0;
        const amount = quantity * rate;
        amountInput.value = amount;
        
        // Recalculate invoice totals
        updateInvoiceTotals();
    }
    
    quantityInput.addEventListener('input', calculateAmount);
    rateInput.addEventListener('input', calculateAmount);
    
    // Calculate initial amount
    calculateAmount();
    
    // Remove item button
    const removeButton = itemRow.querySelector('.remove-item');
    removeButton.addEventListener('click', function() {
        itemsContainer.removeChild(itemRow);
        
        // Enable/disable remove buttons based on number of items
        if (itemsContainer.children.length === 1) {
            itemsContainer.querySelector('.remove-item').disabled = true;
        }
        
        // Update item indices
        updateItemIndices();
        
        // Recalculate invoice totals
        updateInvoiceTotals();
    });
    
    // Enable all remove buttons if we have more than one item
    if (itemsContainer.children.length > 1) {
        document.querySelectorAll('.remove-item').forEach(button => {
            button.disabled = false;
        });
    }
}

// Update item indices
function updateItemIndices() {
    const itemsContainer = document.getElementById('invoice-items');
    
    Array.from(itemsContainer.children).forEach((itemRow, index) => {
        const descriptionInput = itemRow.querySelector('.item-description');
        const quantityInput = itemRow.querySelector('.item-quantity');
        const rateInput = itemRow.querySelector('.item-rate');
        const amountInput = itemRow.querySelector('.item-amount');
        
        descriptionInput.id = `item-description-${index}`;
        quantityInput.id = `item-quantity-${index}`;
        rateInput.id = `item-rate-${index}`;
        amountInput.id = `item-amount-${index}`;
        
        const descriptionLabel = itemRow.querySelector('label[for^="item-description-"]');
        const quantityLabel = itemRow.querySelector('label[for^="item-quantity-"]');
        const rateLabel = itemRow.querySelector('label[for^="item-rate-"]');
        const amountLabel = itemRow.querySelector('label[for^="item-amount-"]');
        
        descriptionLabel.setAttribute('for', `item-description-${index}`);
        quantityLabel.setAttribute('for', `item-quantity-${index}`);
        rateLabel.setAttribute('for', `item-rate-${index}`);
        amountLabel.setAttribute('for', `item-amount-${index}`);
    });
}

// Update invoice totals
function updateInvoiceTotals() {
    const itemsContainer = document.getElementById('invoice-items');
    const items = Array.from(itemsContainer.children).map(itemRow => {
        return {
            description: itemRow.querySelector('.item-description').value,
            quantity: parseFloat(itemRow.querySelector('.item-quantity').value) || 0,
            rate: parseFloat(itemRow.querySelector('.item-rate').value) || 0,
            amount: parseFloat(itemRow.querySelector('.item-amount').value) || 0
        };
    });
    
    const taxRate = parseFloat(document.getElementById('invoice-tax-rate').value) || 0;
    const discountRate = parseFloat(document.getElementById('invoice-discount-rate').value) || 0;
    
    const { subtotal, taxAmount, discountAmount, total } = calculateInvoiceTotals(items, taxRate, discountRate);
    
    document.getElementById('invoice-subtotal').value = subtotal;
    document.getElementById('invoice-tax-amount').value = taxAmount;
    document.getElementById('invoice-discount-amount').value = discountAmount;
    document.getElementById('invoice-total').value = total;
}

// Initialize invoice form
function initInvoiceForm() {
    const invoiceForm = document.getElementById('invoice-form');
    
    // Generate invoice number
    function generateInvoiceNumber() {
        const prefix = 'INV-';
        const randomNum = Math.floor(10000 + Math.random() * 90000);
        const timestamp = Date.now().toString().slice(-4);
        return `${prefix}${randomNum}-${timestamp}`;
    }
    
    // Set default values when creating a new invoice
    function setDefaultValues() {
        document.getElementById('invoice-number').value = generateInvoiceNumber();
        
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('invoice-issue-date').value = today;
        
        // Set due date to 30 days from now
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 30);
        document.getElementById('invoice-due-date').value = dueDate.toISOString().split('T')[0];
        
        // Set default status
        document.getElementById('invoice-status').value = 'Draft';
        
        // Clear items and add one empty item
        const itemsContainer = document.getElementById('invoice-items');
        itemsContainer.innerHTML = '';
        addInvoiceItemRow();
        
        // Clear totals
        document.getElementById('invoice-subtotal').value = 0;
        document.getElementById('invoice-tax-rate').value = 0;
        document.getElementById('invoice-tax-amount').value = 0;
        document.getElementById('invoice-discount-rate').value = 0;
        document.getElementById('invoice-discount-amount').value = 0;
        document.getElementById('invoice-total').value = 0;
    }
    
    // Handle form submission
    invoiceForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Collect items data
        const itemsContainer = document.getElementById('invoice-items');
        const items = Array.from(itemsContainer.children).map(itemRow => {
            return {
                description: itemRow.querySelector('.item-description').value,
                quantity: parseFloat(itemRow.querySelector('.item-quantity').value) || 0,
                rate: parseFloat(itemRow.querySelector('.item-rate').value) || 0,
                amount: parseFloat(itemRow.querySelector('.item-amount').value) || 0
            };
        });
        
        // Collect invoice data
        const invoiceData = {
            invoiceNumber: document.getElementById('invoice-number').value,
            client: document.getElementById('invoice-client').value,
            issueDate: document.getElementById('invoice-issue-date').value,
            dueDate: document.getElementById('invoice-due-date').value,
            currency: document.getElementById('invoice-currency').value,
            bankAccount: document.getElementById('invoice-bank').value,
            notes: document.getElementById('invoice-notes').value,
            status: document.getElementById('invoice-status').value,
            items: items,
            subtotal: parseFloat(document.getElementById('invoice-subtotal').value) || 0,
            taxRate: parseFloat(document.getElementById('invoice-tax-rate').value) || 0,
            taxAmount: parseFloat(document.getElementById('invoice-tax-amount').value) || 0,
            discountRate: parseFloat(document.getElementById('invoice-discount-rate').value) || 0,
            discountAmount: parseFloat(document.getElementById('invoice-discount-amount').value) || 0,
            total: parseFloat(document.getElementById('invoice-total').value) || 0
        };
        
        const invoiceId = this.getAttribute('data-id');
        
        if (invoiceId) {
            // Update existing invoice
            updateInvoice(invoiceId, invoiceData);
            showNotification('Invoice updated successfully');
        } else {
            // Add new invoice
            addInvoice(invoiceData);
            showNotification('Invoice created successfully');
        }
        
        // Reset form and hide modal
        this.reset();
        this.removeAttribute('data-id');
        hideModal('invoice-modal');
        
        // Update UI
        renderInvoicesTable();
        renderInvoicesTable('recent-invoices-body', 5);
        updateDashboardStats();
    });
    
    // Add item button
    document.getElementById('add-item-btn').addEventListener('click', function() {
        addInvoiceItemRow();
    });
    
    // Tax rate change
    document.getElementById('invoice-tax-rate').addEventListener('input', function() {
        updateInvoiceTotals();
    });
    
    // Discount rate change
    document.getElementById('invoice-discount-rate').addEventListener('input', function() {
        updateInvoiceTotals();
    });
    
    // Create invoice buttons
    document.querySelectorAll('#create-invoice-btn, #create-invoice-btn-2').forEach(button => {
        button.addEventListener('click', function() {
            document.getElementById('invoice-modal-title').textContent = 'Create Invoice';
            document.getElementById('invoice-form').reset();
            document.getElementById('invoice-form').removeAttribute('data-id');
            setDefaultValues();
            showModal('invoice-modal');
        });
    });
    
    // Edit invoice button in view modal
    document.getElementById('edit-invoice').addEventListener('click', function() {
        const invoiceId = this.getAttribute('data-id');
        hideModal('invoice-view-modal');
        editInvoice(invoiceId);
    });
    
    // Delete invoice button in view modal
    document.getElementById('delete-invoice').addEventListener('click', function() {
        const invoiceId = this.getAttribute('data-id');
        if (confirm('Are you sure you want to delete this invoice?')) {
            deleteInvoice(invoiceId);
            hideModal('invoice-view-modal');
            renderInvoicesTable();
            renderInvoicesTable('recent-invoices-body', 5);
            updateDashboardStats();
            showNotification('Invoice deleted successfully');
        }
    });
    
    // Download PDF button
    document.getElementById('download-pdf').addEventListener('click', function() {
        const invoiceId = document.getElementById('edit-invoice').getAttribute('data-id');
        const invoice = getInvoiceById(invoiceId);
        if (invoice) {
            exportToPDF('invoice-preview', `Invoice_${invoice.invoiceNumber}.pdf`);
        }
    });
    
    // Close modal buttons
    document.querySelectorAll('#invoice-modal .close-modal, #invoice-modal .close-modal-btn').forEach(button => {
        button.addEventListener('click', function() {
            hideModal('invoice-modal');
        });
    });
    
    document.querySelectorAll('#invoice-view-modal .close-modal').forEach(button => {
        button.addEventListener('click', function() {
            hideModal('invoice-view-modal');
        });
    });
}

// Update dashboard statistics
function updateDashboardStats() {
    const totalInvoicesElement = document.getElementById('total-invoices');
    const paidInvoicesElement = document.getElementById('paid-invoices');
    const pendingInvoicesElement = document.getElementById('pending-invoices');
    const totalRevenueElement = document.getElementById('total-revenue');
    
    const totalInvoices = invoices.length;
    const paidInvoices = invoices.filter(invoice => invoice.status === 'Paid').length;
    const pendingInvoices = invoices.filter(invoice => invoice.status === 'Sent' || invoice.status === 'Overdue').length;
    
    // Calculate total revenue from paid invoices
    const totalRevenue = invoices
        .filter(invoice => invoice.status === 'Paid')
        .reduce((sum, invoice) => sum + invoice.total, 0);
    
    totalInvoicesElement.textContent = totalInvoices;
    paidInvoicesElement.textContent = paidInvoices;
    pendingInvoicesElement.textContent = pendingInvoices;
    totalRevenueElement.textContent = formatCurrency(totalRevenue);
}

// Initialize invoice filters
function initInvoiceFilters() {
    const applyFiltersBtn = document.getElementById('apply-filters');
    const clearFiltersBtn = document.getElementById('clear-filters');
    
    applyFiltersBtn.addEventListener('click', function() {
        const clientFilter = document.getElementById('filter-client').value;
        const statusFilter = document.getElementById('filter-status').value;
        const dateFromFilter = document.getElementById('filter-date-from').value;
        const dateToFilter = document.getElementById('filter-date-to').value;
        
        // Filter invoices
        let filteredInvoices = [...invoices];
        
        if (clientFilter) {
            filteredInvoices = filteredInvoices.filter(invoice => invoice.client === clientFilter);
        }
        
        if (statusFilter) {
            filteredInvoices = filteredInvoices.filter(invoice => invoice.status === statusFilter);
        }
        
        if (dateFromFilter) {
            filteredInvoices = filteredInvoices.filter(invoice => invoice.issueDate >= dateFromFilter);
        }
        
        if (dateToFilter) {
            filteredInvoices = filteredInvoices.filter(invoice => invoice.issueDate <= dateToFilter);
        }
        
        // Render filtered invoices
        renderFilteredInvoices(filteredInvoices);
    });
    
    clearFiltersBtn.addEventListener('click', function() {
        document.getElementById('filter-client').value = '';
        document.getElementById('filter-status').value = '';
        document.getElementById('filter-date-from').value = '';
        document.getElementById('filter-date-to').value = '';
        
        // Render all invoices
        renderInvoicesTable();
    });
}

// Render filtered invoices
function renderFilteredInvoices(filteredInvoices) {
    const tableBody = document.getElementById('invoices-body');
    tableBody.innerHTML = '';
    
    if (filteredInvoices.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="7" class="text-center">No invoices found</td>
        `;
        tableBody.appendChild(row);
        return;
    }
    
    filteredInvoices.forEach(invoice => {
        const client = getClientById(invoice.client);
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${invoice.invoiceNumber}</td>
            <td>${client ? client.name : 'Unknown Client'}</td>
            <td>${formatDate(invoice.issueDate)}</td>
            <td>${formatDate(invoice.dueDate)}</td>
            <td>${formatCurrency(invoice.total, invoice.currency)}</td>
            <td><span class="${getStatusBadgeClass(invoice.status)}">${invoice.status}</span></td>
            <td>
                <button class="btn btn-small view-invoice" data-id="${invoice.id}">View</button>
                <button class="btn btn-small edit-invoice" data-id="${invoice.id}">Edit</button>
                <button class="btn btn-small btn-danger delete-invoice" data-id="${invoice.id}">Delete</button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
        // Add event listeners
    document.querySelectorAll('.view-invoice').forEach(button => {
        button.addEventListener('click', function() {
            const invoiceId = this.getAttribute('data-id');
            viewInvoice(invoiceId);
        });
    });
    
    document.querySelectorAll('.edit-invoice').forEach(button => {
        button.addEventListener('click', function() {
            const invoiceId = this.getAttribute('data-id');
            editInvoice(invoiceId);
        });
    });
    
    document.querySelectorAll('.delete-invoice').forEach(button => {
        button.addEventListener('click', function() {
            const invoiceId = this.getAttribute('data-id');
            if (confirm('Are you sure you want to delete this invoice?')) {
                deleteInvoice(invoiceId);
                renderInvoicesTable();
                renderInvoicesTable('recent-invoices-body', 5);
                updateDashboardStats();
                showNotification('Invoice deleted successfully');
            }
        });
    });
}