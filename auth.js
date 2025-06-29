// Authentication management

// Initialize users from localStorage
let users = JSON.parse(localStorage.getItem('users')) || [];

// Add default admin user if none exists
if (users.length === 0) {
    users.push({
        id: generateId(),
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'admin123', // In a real app, use hashed passwords
        role: 'admin',
        createdAt: new Date().toISOString()
    });
    localStorage.setItem('users', JSON.stringify(users));
}

// Save users to localStorage
function saveUsers() {
    localStorage.setItem('users', JSON.stringify(users));
}

// Register a new user
function registerUser(name, email, password) {
    // Check if email already exists
    if (users.some(user => user.email === email)) {
        throw new Error('Email already in use');
    }
    
    const newUser = {
        id: generateId(),
        name,
        email,
        password, // In a real app, hash the password
        role: 'user',
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    saveUsers();
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
}

// Login user
function loginUser(email, password) {
    const user = users.find(user => user.email === email && user.password === password);
    
    if (!user) {
        throw new Error('Invalid email or password');
    }
    
    // Create session
    const session = {
        userId: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
    };
    
    localStorage.setItem('session', JSON.stringify(session));
    
    return session;
}

// Check if user is logged in
function isLoggedIn() {
    const session = JSON.parse(localStorage.getItem('session'));
    
    if (!session) {
        return false;
    }
    
    // Check if session has expired
    if (new Date(session.expiresAt) < new Date()) {
        localStorage.removeItem('session');
        return false;
    }
    
    return true;
}

// Get current user
function getCurrentUser() {
    if (!isLoggedIn()) {
        return null;
    }
    
    return JSON.parse(localStorage.getItem('session'));
}

// Logout user
function logoutUser() {
    localStorage.removeItem('session');
    window.location.href = 'login.html';
}

// Initialize login form
if (document.getElementById('login-form')) {
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        try {
            loginUser(email, password);
            window.location.href = 'index.html';
        } catch (error) {
            loginError.textContent = error.message;
        }
    });
}

// Initialize register form
if (document.getElementById('register-form')) {
    const registerForm = document.getElementById('register-form');
    const registerError = document.getElementById('register-error');
    
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        // Validate password match
        if (password !== confirmPassword) {
            registerError.textContent = 'Passwords do not match';
            return;
        }
        
        try {
            registerUser(name, email, password);
            // Auto login after registration
            loginUser(email, password);
            window.location.href = 'index.html';
        } catch (error) {
            registerError.textContent = error.message;
        }
    });
}