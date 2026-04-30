const auth = firebase.auth();

window.login = login;
window.register = register;
window.logout = logout;
window.requireAuth = requireAuth;

function checkAuthState() {
    auth.onAuthStateChanged((user) => {
        updateUIForUser(user);
    });
}

function updateUIForUser(user) {
    const authSection = document.getElementById('auth-section');
    const userInfo = document.getElementById('user-info');
    
    if (user) {
        if (authSection) authSection.style.display = 'none';
        if (userInfo) {
            userInfo.style.display = 'block';
            userInfo.querySelector('#user-name').textContent = user.email;
        }
    } else {
        if (authSection) authSection.style.display = 'block';
        if (userInfo) userInfo.style.display = 'none';
    }
}

async function login(email, password) {
    try {
        await auth.signInWithEmailAndPassword(email, password);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function register(email, password) {
    try {
        await auth.createUserWithEmailAndPassword(email, password);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function logout() {
    try {
        await auth.signOut();
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Logout error:', error);
        alert('Error logging out');
    }
}

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

document.addEventListener('DOMContentLoaded', checkAuthState);
