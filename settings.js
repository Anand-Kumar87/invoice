// Settings management

// Initialize company settings from localStorage
let companySettings = JSON.parse(localStorage.getItem('companySettings')) || {
    logo: null,
    name: '',
    email: '',
    phone: '',
    address: ''
};

// Save company settings to localStorage
function saveCompanySettings() {
    localStorage.setItem('companySettings', JSON.stringify(companySettings));
}

// Initialize settings form
function initSettingsForm() {
    const logoPreview = document.getElementById('logo-preview');
    const logoUpload = document.getElementById('logo-upload');
    const uploadLogoBtn = document.getElementById('upload-logo-btn');
    const removeLogoBtn = document.getElementById('remove-logo-btn');
    const companyNameInput = document.getElementById('company-name');
    const companyEmailInput = document.getElementById('company-email');
    const companyPhoneInput = document.getElementById('company-phone');
    const companyAddressInput = document.getElementById('company-address');
    const saveCompanyInfoBtn = document.getElementById('save-company-info');
    
    // Load existing settings
    if (companySettings.logo) {
        logoPreview.src = companySettings.logo;
    }
    
    companyNameInput.value = companySettings.name || '';
    companyEmailInput.value = companySettings.email || '';
    companyPhoneInput.value = companySettings.phone || '';
    companyAddressInput.value = companySettings.address || '';
    
    // Upload logo button
    uploadLogoBtn.addEventListener('click', function() {
        logoUpload.click();
    });
    
    // Handle file selection
    logoUpload.addEventListener('change', function() {
        const file = this.files[0];
        if (!file) return;
        
        // Check file size (max 1MB)
        if (file.size > 1024 * 1024) {
            showNotification('Logo file is too large. Maximum size is 1MB.', 'error');
            return;
        }
        
        // Check file type
        if (!file.type.match('image.*')) {
            showNotification('Please select an image file.', 'error');
            return;
        }
        
        // Read and preview the file
        const reader = new FileReader();
        reader.onload = function(e) {
            logoPreview.src = e.target.result;
            companySettings.logo = e.target.result;
            saveCompanySettings();
            showNotification('Logo uploaded successfully');
        };
        reader.readAsDataURL(file);
    });
    
    // Remove logo button
    removeLogoBtn.addEventListener('click', function() {
        logoPreview.src = 'assets/default-logo.png';
        companySettings.logo = null;
        saveCompanySettings();
        showNotification('Logo removed');
    });
    
    // Save company info button
    saveCompanyInfoBtn.addEventListener('click', function() {
        companySettings.name = companyNameInput.value;
        companySettings.email = companyEmailInput.value;
        companySettings.phone = companyPhoneInput.value;
        companySettings.address = companyAddressInput.value;
        saveCompanySettings();
        showNotification('Company information saved');
    });
}