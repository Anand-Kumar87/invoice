// Bank account management

// Initialize bank accounts from localStorage
let bankAccounts = JSON.parse(localStorage.getItem('bankAccounts')) || [];

// Save bank accounts to localStorage
function saveBankAccounts() {
    localStorage.setItem('bankAccounts', JSON.stringify(bankAccounts));
}

// Get bank account by ID
function getBankAccountById(id) {
    return bankAccounts.find(account => account.id === id);
}

// Add bank account
function addBankAccount(account) {
    account.id = generateId();
    
    // If this account is set as default, unset any existing default
    if (account.isDefault) {
        bankAccounts.forEach(acc => {
            acc.isDefault = false;
        });
    }
    
    // If this is the first account, make it default
    if (bankAccounts.length === 0) {
        account.isDefault = true;
    }
    
    bankAccounts.push(account);
    saveBankAccounts();
    return account;
}

// Update bank account
function updateBankAccount(id, updatedAccount) {
    const index = bankAccounts.findIndex(account => account.id === id);
    if (index !== -1) {
        // If this account is being set as default, unset any existing default
        if (updatedAccount.isDefault) {
            bankAccounts.forEach(acc => {
                acc.isDefault = false;
            });
        }
        
        bankAccounts[index] = { ...bankAccounts[index], ...updatedAccount };
        saveBankAccounts();
        return bankAccounts[index];
    }
    return null;
}

// Delete bank account
function deleteBankAccount(id) {
    const accountToDelete = getBankAccountById(id);
    bankAccounts = bankAccounts.filter(account => account.id !== id);
    
    // If the deleted account was the default, set a new default if any accounts remain
    if (accountToDelete && accountToDelete.isDefault && bankAccounts.length > 0) {
        bankAccounts[0].isDefault = true;
    }
    
    saveBankAccounts();
}

// Render bank accounts table
function renderBankAccountsTable() {
    const tableBody = document.getElementById('banks-body');
    tableBody.innerHTML = '';
    
    if (bankAccounts.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="5" class="text-center">No bank accounts found</td>
        `;
        tableBody.appendChild(row);
        return;
    }
    
    bankAccounts.forEach(account => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${account.bankName}</td>
            <td>${account.accountName}</td>
            <td>${account.accountNumber}</td>
            <td>${account.isDefault ? '<span class="status-badge status-paid">Default</span>' : ''}</td>
            <td>
                <button class="btn btn-small edit-bank" data-id="${account.id}">Edit</button>
                <button class="btn btn-small btn-danger delete-bank" data-id="${account.id}">Delete</button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Add event listeners
    document.querySelectorAll('.edit-bank').forEach(button => {
        button.addEventListener('click', function() {
            const bankId = this.getAttribute('data-id');
            editBankAccount(bankId);
        });
    });
    
    document.querySelectorAll('.delete-bank').forEach(button => {
        button.addEventListener('click', function() {
            const bankId = this.getAttribute('data-id');
            if (confirm('Are you sure you want to delete this bank account?')) {
                deleteBankAccount(bankId);
                renderBankAccountsTable();
                populateBankDropdowns();
                showNotification('Bank account deleted successfully');
            }
        });
    });
}

// Populate bank account dropdowns
function populateBankDropdowns() {
    const bankDropdowns = document.querySelectorAll('#invoice-bank');
    
    bankDropdowns.forEach(dropdown => {
        // Save the first option (usually "Select Bank Account")
        const firstOption = dropdown.options[0];
        
        // Clear dropdown
        dropdown.innerHTML = '';
        
        // Add back the first option
        dropdown.appendChild(firstOption);
        
        // Add bank account options
        bankAccounts.forEach(account => {
            const option = document.createElement('option');
            option.value = account.id;
            option.textContent = `${account.bankName} - ${account.accountNumber}`;
            
            // Set default account as selected
            if (account.isDefault) {
                option.selected = true;
            }
            
            dropdown.appendChild(option);
        });
    });
}

// Edit bank account
function editBankAccount(bankId) {
    const account = getBankAccountById(bankId);
    if (!account) return;
    
    // Fill form with bank account data
    document.getElementById('bank-name').value = account.bankName;
    document.getElementById('account-name').value = account.accountName;
    document.getElementById('account-number').value = account.accountNumber;
    document.getElementById('swift-code').value = account.swiftCode || '';
    document.getElementById('ifsc-code').value = account.ifscCode || '';
    document.getElementById('branch-address').value = account.branchAddress || '';
    document.getElementById('is-default').checked = account.isDefault || false;
    
    // Update modal title and form data attribute
    document.getElementById('bank-modal-title').textContent = 'Edit Bank Account';
    document.getElementById('bank-form').setAttribute('data-id', bankId);
    
    // Show modal
    showModal('bank-modal');
}

// Initialize bank account form
function initBankForm() {
    const bankForm = document.getElementById('bank-form');
    
    bankForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const bankData = {
            bankName: document.getElementById('bank-name').value,
            accountName: document.getElementById('account-name').value,
            accountNumber: document.getElementById('account-number').value,
            swiftCode: document.getElementById('swift-code').value,
            ifscCode: document.getElementById('ifsc-code').value,
            branchAddress: document.getElementById('branch-address').value,
            isDefault: document.getElementById('is-default').checked
        };
        
        const bankId = this.getAttribute('data-id');
        
        if (bankId) {
            // Update existing bank account
            updateBankAccount(bankId, bankData);
            showNotification('Bank account updated successfully');
        } else {
            // Add new bank account
            addBankAccount(bankData);
            showNotification('Bank account added successfully');
        }
        
        // Reset form and hide modal
        this.reset();
        this.removeAttribute('data-id');
        hideModal('bank-modal');
        
        // Update UI
        renderBankAccountsTable();
        populateBankDropdowns();
    });
    
    //    // Add bank account button
    document.getElementById('add-bank-btn').addEventListener('click', function() {
        document.getElementById('bank-modal-title').textContent = 'Add Bank Account';
        document.getElementById('bank-form').reset();
        document.getElementById('bank-form').removeAttribute('data-id');
        showModal('bank-modal');
    });
    
    // Close modal buttons
    document.querySelectorAll('#bank-modal .close-modal, #bank-modal .close-modal-btn').forEach(button => {
        button.addEventListener('click', function() {
            hideModal('bank-modal');
        });
    });
}