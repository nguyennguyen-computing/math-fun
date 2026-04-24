// Get Firebase Auth instance
const auth = firebase.auth();

// Make functions globally accessible
window.login = login;
window.register = register;
window.logout = logout;
window.requireAuth = requireAuth;

// Check authentication state
function checkAuthState() {
    auth.onAuthStateChanged((user) => {
        updateUIForUser(user);
    });
}

// Update UI based on user state
function updateUIForUser(user) {
    const authSection = document.getElementById('auth-section');
    const userInfo = document.getElementById('user-info');
    
    if (user) {
        // User is logged in
        if (authSection) authSection.style.display = 'none';
        if (userInfo) {
            userInfo.style.display = 'block';
            userInfo.querySelector('#user-name').textContent = user.email;
        }
    } else {
        // User is logged out
        if (authSection) authSection.style.display = 'block';
        if (userInfo) userInfo.style.display = 'none';
    }
}

// Login function
async function login(email, password) {
    try {
        await auth.signInWithEmailAndPassword(email, password);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Register function
async function register(email, password) {
    try {
        await auth.createUserWithEmailAndPassword(email, password);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Logout function
async function logout() {
    try {
        await auth.signOut();
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Logout error:', error);
        alert('Error logging out');
    }
}

// Check if user is authenticated
function requireAuth() {
    return new Promise((resolve) => {
        auth.onAuthStateChanged((user) => {
            if (!user) {
                alert('Please login to play the game');
                window.location.href = 'index.html';
            } else {
                resolve(user);
            }
        });
    });
}

// Initialize auth check on page load
document.addEventListener('DOMContentLoaded', checkAuthState);
