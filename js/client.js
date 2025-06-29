// Client management

// Initialize clients from localStorage
let clients = JSON.parse(localStorage.getItem('clients')) || [];

// Save clients to localStorage
function saveClients() {
    localStorage.setItem('clients', JSON.stringify(clients));
}

// Get client by ID
function getClientById(id) {
    return clients.find(client => client.id === id);
}

// Add client
function addClient(client) {
    client.id = generateId();
    clients.push(client);
    saveClients();
    return client;
}

// Update client
function updateClient(id, updatedClient) {
    const index = clients.findIndex(client => client.id === id);
    if (index !== -1) {
        clients[index] = { ...clients[index], ...updatedClient };
        saveClients();
        return clients[index];
    }
    return null;
}

// Delete client
function deleteClient(id) {
    clients = clients.filter(client => client.id !== id);
    saveClients();
}

// Render clients table
function renderClientsTable() {
    const tableBody = document.getElementById('clients-body');
    tableBody.innerHTML = '';
    
    if (clients.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="5" class="text-center">No clients found</td>
        `;
        tableBody.appendChild(row);
        return;
    }
    
    clients.forEach(client => {
        const row = document.createElement('tr');
        
        // Format address
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
        
        row.innerHTML = `
            <td>${client.name}</td>
            <td>${client.email}</td>
            <td>${client.phone || '-'}</td>
            <td>${address || '-'}</td>
            <td>
                <button class="btn btn-small edit-client" data-id="${client.id}">Edit</button>
                <button class="btn btn-small btn-danger delete-client" data-id="${client.id}">Delete</button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Add event listeners
    document.querySelectorAll('.edit-client').forEach(button => {
        button.addEventListener('click', function() {
            const clientId = this.getAttribute('data-id');
            editClient(clientId);
        });
    });
    
    document.querySelectorAll('.delete-client').forEach(button => {
        button.addEventListener('click', function() {
            const clientId = this.getAttribute('data-id');
            if (confirm('Are you sure you want to delete this client?')) {
                deleteClient(clientId);
                renderClientsTable();
                populateClientDropdowns();
                showNotification('Client deleted successfully');
            }
        });
    });
}

// Populate client dropdowns
function populateClientDropdowns() {
    const clientDropdowns = document.querySelectorAll('#invoice-client, #filter-client');
    
    clientDropdowns.forEach(dropdown => {
        // Save the first option (usually "Select Client" or "All Clients")
        const firstOption = dropdown.options[0];
        
        // Clear dropdown
        dropdown.innerHTML = '';
        
        // Add back the first option
        dropdown.appendChild(firstOption);
        
        // Add client options
        clients.forEach(client => {
            const option = document.createElement('option');
            option.value = client.id;
            option.textContent = client.name;
            dropdown.appendChild(option);
        });
    });
}

// Edit client
function editClient(clientId) {
    const client = getClientById(clientId);
    if (!client) return;
    
    // Fill form with client data
    document.getElementById('client-name').value = client.name;
    document.getElementById('client-email').value = client.email;
    document.getElementById('client-phone').value = client.phone || '';
    
    if (client.address) {
        document.getElementById('client-street').value = client.address.street || '';
        document.getElementById('client-city').value = client.address.city || '';
        document.getElementById('client-state').value = client.address.state || '';
        document.getElementById('client-zip').value = client.address.zip || '';
        document.getElementById('client-country').value = client.address.country || '';
    }
    
    // Update modal title and form data attribute
    document.getElementById('client-modal-title').textContent = 'Edit Client';
    document.getElementById('client-form').setAttribute('data-id', clientId);
    
    // Show modal
    showModal('client-modal');
}

// Initialize client form
function initClientForm() {
    const clientForm = document.getElementById('client-form');
    
    clientForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const clientData = {
            name: document.getElementById('client-name').value,
            email: document.getElementById('client-email').value,
            phone: document.getElementById('client-phone').value,
            address: {
                street: document.getElementById('client-street').value,
                city: document.getElementById('client-city').value,
                state: document.getElementById('client-state').value,
                zip: document.getElementById('client-zip').value,
                country: document.getElementById('client-country').value
            }
        };
        
        const clientId = this.getAttribute('data-id');
        
        if (clientId) {
            // Update existing client
            updateClient(clientId, clientData);
            showNotification('Client updated successfully');
        } else {
            // Add new client
            addClient(clientData);
            showNotification('Client added successfully');
        }
        
        // Reset form and hide modal
        this.reset();
        this.removeAttribute('data-id');
        hideModal('client-modal');
        
        // Update UI
        renderClientsTable();
        populateClientDropdowns();
    });
    
    // Add client button
    document.getElementById('add-client-btn').addEventListener('click', function() {
        document.getElementById('client-modal-title').textContent = 'Add Client';
        document.getElementById('client-form').reset();
        document.getElementById('client-form').removeAttribute('data-id');
        showModal('client-modal');
    });
    
    // Close modal buttons
    document.querySelectorAll('#client-modal .close-modal, #client-modal .close-modal-btn').forEach(button => {
        button.addEventListener('click', function() {
            hideModal('client-modal');
        });
    });
}