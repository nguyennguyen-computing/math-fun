async function loadLeaderboard() {
    const tbody = document.querySelector('tbody');
    
    try {
        tbody.innerHTML = '<tr><td colspan="3">Loading...</td></tr>';
        
        const snapshot = await db.collection('leaderboard')
            .orderBy('score', 'desc')
            .limit(10)
            .get();
        
        // Clear loading message
        tbody.innerHTML = '';
        
        if (snapshot.empty) {
            tbody.innerHTML = '<tr><td colspan="3">No scores yet. Be the first to play!</td></tr>';
            return;
        }
        
        let rank = 1;
        snapshot.forEach((doc) => {
            const data = doc.data();
            console.log(`Rank ${rank}:`, data);
            
            const row = document.createElement('tr');
            const rankCell = document.createElement('td');
            const nameCell = document.createElement('td');
            const scoreCell = document.createElement('td');
            
            rankCell.textContent = rank + '.';
            nameCell.textContent = data.name || 'Unknown';
            scoreCell.textContent = data.score || 0;
            
            row.appendChild(rankCell);
            row.appendChild(nameCell);
            row.appendChild(scoreCell);
            tbody.appendChild(row);
            
            rank++;
        });
        
        console.log('Leaderboard loaded successfully');
        
    } catch (error) {
        console.error('Error loading leaderboard:', error);
        tbody.innerHTML = '<tr><td colspan="3">Error loading leaderboard</td></tr>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Show logout link if user is logged in
    firebase.auth().onAuthStateChanged((user) => {
        const logoutLink = document.getElementById('logout-link');
        if (user && logoutLink) {
            logoutLink.style.display = 'inline';
        }
    });
    
    loadLeaderboard();
});
