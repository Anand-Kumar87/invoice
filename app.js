// Main application script

// Check authentication before initializing
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    if (!isLoggedIn() && !window.location.href.includes('login.html') && !window.location.href.includes('register.html')) {
        window.location.href = 'login.html';
        return;
    }
    
    // If on login or register page and already logged in, redirect to app
    if (isLoggedIn() && (window.location.href.includes('login.html') || window.location.href.includes('register.html'))) {
        window.location.href = 'index.html';
        return;
    }
    
    // Only initialize the app if we're on the main page
    if (!window.location.href.includes('login.html') && !window.location.href.includes('register.html')) {
        initializeApp();
    }
});

// Initialize the application
function initializeApp() {
    // Set user name in header
    const user = getCurrentUser();
    if (user) {
        document.querySelector('.user-name').textContent = user.name;
    }
    
    // Initialize logout button
    document.getElementById('logout-btn').addEventListener('click', function() {
        logoutUser();
    });
    
    // Initialize navigation
    initNavigation();
    
    // Initialize clients
    initClientForm();
    renderClientsTable();
    populateClientDropdowns();
    
    // Initialize bank accounts
    initBankForm();
    renderBankAccountsTable();
    populateBankDropdowns();
    
    // Initialize invoices
    initInvoiceForm();
    renderInvoicesTable();
    renderInvoicesTable('recent-invoices-body', 5);
    updateDashboardStats();
    initInvoiceFilters();
    
    // Initialize settings
    initSettingsForm();
    
    // Add sample data if none exists
    if (clients.length === 0 && bankAccounts.length === 0 && invoices.length === 0) {
        addSampleData();
    }
}

// Initialize navigation
function initNavigation() {
    const navLinks = document.querySelectorAll('.sidebar-nav a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            navLinks.forEach(link => link.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Hide all pages
            document.querySelectorAll('.page').forEach(page => {
                page.classList.remove('active');
            });
            
            // Show the selected page
            const pageId = this.getAttribute('data-page');
            document.getElementById(`${pageId}-page`).classList.add('active');
        });
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', function(e) {
        document.querySelectorAll('.modal').forEach(modal => {
            if (e.target === modal) {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    });
}

// Add sample data for demonstration
function addSampleData() {
    // Add sample clients
    const sampleClients = [
        {
            name: 'Acme Corporation',
            email: 'billing@acme.com',
            phone: '(555) 123-4567',
            address: {
                street: '123 Main St',
                city: 'New York',
                state: 'NY',
                zip: '10001',
                country: 'USA'
            }
        },
        {
            name: 'Globex Industries',
            email: 'accounts@globex.com',
            phone: '(555) 987-6543',
            address: {
                street: '456 Tech Blvd',
                city: 'San Francisco',
                state: 'CA',
                zip: '94107',
                country: 'USA'
            }
        },
        {
            name: 'Stark Enterprises',
            email: 'finance@stark.com',
            phone: '(555) 789-0123',
            address: {
                street: '789 Innovation Way',
                city: 'Boston',
                state: 'MA',
                zip: '02110',
                country: 'USA'
            }
        }
    ];
    
    sampleClients.forEach(client => addClient(client));
    
    // Add sample bank accounts
    const sampleBankAccounts = [
        {
            bankName: 'First National Bank',
            accountName: 'Business Account',
            accountNumber: '1234567890',
            swiftCode: 'FNBAUS33',
            ifscCode: '',
            branchAddress: '100 Financial St, New York, NY 10001',
            isDefault: true
        },
        {
            bankName: 'Global Trust Bank',
            accountName: 'Savings Account',
            accountNumber: '0987654321',
            swiftCode: 'GTBKUS44',
            ifscCode: '',
            branchAddress: '200 Banking Ave, Chicago, IL 60601',
            isDefault: false
        }
    ];
    
    sampleBankAccounts.forEach(account => addBankAccount(account));
    
    // Add sample invoices
    const today = new Date();
    const thirtyDaysLater = new Date(today);
    thirtyDaysLater.setDate(today.getDate() + 30);
    
    const fifteenDaysAgo = new Date(today);
    fifteenDaysAgo.setDate(today.getDate() - 15);
    
    const fortyFiveDaysAgo = new Date(today);
    fortyFiveDaysAgo.setDate(today.getDate() - 45);
        const sampleInvoices = [
        {
            invoiceNumber: 'INV-2023-001',
            client: clients[0].id,
            issueDate: today.toISOString().split('T')[0],
            dueDate: thirtyDaysLater.toISOString().split('T')[0],
            currency: 'USD',
            bankAccount: bankAccounts[0].id,
            notes: 'Thank you for your business!',
            status: 'Draft',
            items: [
                {
                    description: 'Web Development Services',
                    quantity: 40,
                    rate: 75,
                    amount: 3000
                },
                {
                    description: 'UI/UX Design',
                    quantity: 20,
                    rate: 85,
                    amount: 1700
                }
            ],
            subtotal: 4700,
            taxRate: 7.5,
            taxAmount: 352.5,
            discountRate: 5,
            discountAmount: 235,
            total: 4817.5
        },
        {
            invoiceNumber: 'INV-2023-002',
            client: clients[1].id,
            issueDate: fifteenDaysAgo.toISOString().split('T')[0],
            dueDate: today.toISOString().split('T')[0],
            currency: 'USD',
            bankAccount: bankAccounts[0].id,
            notes: 'Net 15 payment terms',
            status: 'Sent',
            items: [
                {
                    description: 'Mobile App Development',
                    quantity: 80,
                    rate: 90,
                    amount: 7200
                },
                {
                    description: 'Project Management',
                    quantity: 10,
                    rate: 65,
                    amount: 650
                }
            ],
            subtotal: 7850,
            taxRate: 8,
            taxAmount: 628,
            discountRate: 0,
            discountAmount: 0,
            total: 8478
        },
        {
            invoiceNumber: 'INV-2023-003',
            client: clients[2].id,
            issueDate: fortyFiveDaysAgo.toISOString().split('T')[0],
            dueDate: fifteenDaysAgo.toISOString().split('T')[0],
            currency: 'USD',
            bankAccount: bankAccounts[1].id,
            notes: '',
            status: 'Paid',
            items: [
                {
                    description: 'SEO Consulting',
                    quantity: 15,
                    rate: 120,
                    amount: 1800
                }
            ],
            subtotal: 1800,
            taxRate: 6,
            taxAmount: 108,
            discountRate: 10,
            discountAmount: 180,
            total: 1728
        }
    ];
    
    sampleInvoices.forEach(invoice => addInvoice(invoice));
    
    // Update UI
    renderClientsTable();
    populateClientDropdowns();
    renderBankAccountsTable();
    populateBankDropdowns();
    renderInvoicesTable();
    renderInvoicesTable('recent-invoices-body', 5);
    updateDashboardStats();
    
    showNotification('Sample data added for demonstration');
}