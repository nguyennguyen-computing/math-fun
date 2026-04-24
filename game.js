let score = 0;
let timeLeft = 45;
let currentQuestion = {};
let timerInterval;
let currentUser = null;
let gameEnded = false;

const operators = ['+', '-', '×', '÷'];

function generateQuestion() {
    const num1 = Math.floor(Math.random() * 12) + 1;
    const num2 = Math.floor(Math.random() * 12) + 1;
    const operator = operators[Math.floor(Math.random() * operators.length)];
    
    let answer;
    switch(operator) {
        case '+': answer = num1 + num2; break;
        case '-': answer = num1 - num2; break;
        case '×': answer = num1 * num2; break;
        case '÷': 
            const divisibleNum = num1 * num2;
            currentQuestion = { num1: divisibleNum, num2: num1, operator, answer: num2 };
            return;
    }
    
    currentQuestion = { num1, num2, operator, answer };
}

function displayQuestion() {
    document.querySelector('.question').textContent = 
        `${currentQuestion.num1} ${currentQuestion.operator} ${currentQuestion.num2} = ?`;
    document.querySelector('.answer-input').value = '';
    document.querySelector('.feedback').textContent = '';
}

function startTimer() {
    timerInterval = setInterval(() => {
        timeLeft--;
        const timerElement = document.getElementById('timer');
        if (timerElement) {
            timerElement.textContent = `${timeLeft}s`;
        }
        
        // Play tick sound when time is running out (last 10 seconds)
        if (timeLeft <= 10 && timeLeft > 0) {
            soundManager.playTick();
        }
        
        if (timeLeft <= 0) {
            console.log('Time is up! Ending game...');
            endGame();
        }
    }, 1000);
}

function updateScore() {
    const scoreElement = document.getElementById('score');
    if (scoreElement) {
        scoreElement.textContent = score;
    }
}

function checkAnswer() {
    if (gameEnded) return; // Don't check if game ended
    
    const userAnswer = parseInt(document.querySelector('.answer-input').value);
    const feedback = document.querySelector('.feedback');
    
    if (userAnswer === currentQuestion.answer) {
        score += 10;
        feedback.textContent = 'Correct!';
        feedback.style.color = '#4caf50';
        soundManager.playCorrect(); // Play correct sound
        updateScore();
        setTimeout(() => {
            if (!gameEnded) {
                generateQuestion();
                displayQuestion();
            }
        }, 500);
    } else {
        feedback.textContent = 'Try again!';
        feedback.style.color = '#f44336';
        soundManager.playWrong(); // Play wrong sound
    }
}

async function endGame() {
    if (gameEnded) {
        console.log('Game already ended, skipping...');
        return;
    }
    
    console.log('Ending game...');
    gameEnded = true;
    
    clearInterval(timerInterval);
    soundManager.playGameOver(); // Play game over sound
    
    // Disable input and button
    const input = document.querySelector('.answer-input');
    const button = document.querySelector('.btn-primary');
    if (input) input.disabled = true;
    if (button) button.disabled = true;
    
    // Show game over message on screen
    const feedback = document.querySelector('.feedback');
    feedback.textContent = `Game Over! Final Score: ${score}`;
    feedback.style.color = '#f44336';
    feedback.style.fontSize = '32px';
    
    console.log('Current user:', currentUser);
    
    if (currentUser) {
        try {
            console.log('Saving score to Firebase...');
            
            // Check if user already has a score
            const existingScores = await db.collection('leaderboard')
                .where('userId', '==', currentUser.uid)
                .get();
            
            if (!existingScores.empty) {
                // Update existing record if new score is higher
                const existingDoc = existingScores.docs[0];
                const existingScore = existingDoc.data().score;
                
                if (score > existingScore) {
                    await existingDoc.ref.update({
                        score: score,
                        timestamp: firebase.firestore.FieldValue.serverTimestamp()
                    });
                    console.log('Score updated! Old:', existingScore, 'New:', score);
                } else {
                    console.log('Existing score is higher. Not updating.');
                }
            } else {
                // Create new record
                const docRef = await db.collection('leaderboard').add({
                    name: currentUser.email,
                    userId: currentUser.uid,
                    score: score,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                });
                console.log('New score saved! Doc ID:', docRef.id);
            }
            
            // Wait 2 seconds then redirect
            setTimeout(() => {
                console.log('Redirecting to leaderboard...');
                window.location.href = 'leaderboard.html';
            }, 2000);
            
        } catch (error) {
            console.error('Error saving score:', error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);
            feedback.textContent = `Error: ${error.message}`;
            gameEnded = false;
            if (input) input.disabled = false;
            if (button) button.disabled = false;
        }
    } else {
        console.error('No user logged in!');
        feedback.textContent = 'Please login to save score';
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize sound on first user interaction
    document.addEventListener('click', () => soundManager.init(), { once: true });
    document.addEventListener('keypress', () => soundManager.init(), { once: true });
    
    // Sound toggle button
    const soundToggle = document.getElementById('sound-toggle');
    if (soundToggle) {
        soundToggle.addEventListener('click', () => {
            const enabled = soundManager.toggle();
            soundToggle.textContent = enabled ? '🔊' : '🔇';
            soundToggle.classList.toggle('muted', !enabled);
        });
    }
    
    // Check authentication
    currentUser = await requireAuth();
    
    // Show logout link
    const logoutLink = document.getElementById('logout-link');
    if (logoutLink) logoutLink.style.display = 'inline';
    
    generateQuestion();
    displayQuestion();
    startTimer();
    updateScore();
    
    document.querySelector('.btn-primary').addEventListener('click', checkAnswer);
    
    document.querySelector('.answer-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            checkAnswer();
        }
    });
});
