// ----------------------------------------------------------------------------------
// PASTE YOUR SPOTIFY API KEYS HERE
// ----------------------------------------------------------------------------------
const clientId = '49623b69703742479c518de9bc51d50f'; // <-- PASTE YOUR CLIENT ID
const clientSecret = 'be11367aeb5b4b34b2a61465ad64ce15'; // <-- PASTE YOUR CLIENT SECRET
// ----------------------------------------------------------------------------------

const redirectUri = 'https://studiochief.github.io/morelerekening-2/'; 

// The "Controversy Database" (shortened for brevity)
const controversyDatabase = {
    '06HL4z0CvFAxyc27GXpf02': { name: 'Kanye West', controversies: [{ item: 'VMA Incident (2009)', cost: 'AN AWKWARD SILENCE' }, { item: "'Slavery was a choice'", cost: 'A HISTORY BOOK' }] },
    '2h93pZq0e7k5yf4dywlkpM': { name: 'R. Kelly', controversies: [{ item: 'Numerous abuse allegations', cost: 'LOOKING THE OTHER WAY' }, { item: 'Sex trafficking conviction', cost: 'A HEAVY SIGH' }] },
};


// --- Main App Logic ---
document.addEventListener('DOMContentLoaded', () => {
    const loginButton = document.getElementById('login-button');
    loginButton.addEventListener('click', redirectToSpotifyLogin);
    handleRedirect();
});

function redirectToSpotifyLogin() {
    // This is the base URL for Spotify's authorization page
    const spotifyAuthUrl = 'https://accounts.spotify.com/authorize';

    // Use URLSearchParams to safely build the query string
    const params = new URLSearchParams();
    params.append('client_id', clientId);
    params.append('response_type', 'code');
    params.append('redirect_uri', redirectUri);
    params.append('scope', 'user-top-read');
    params.append('show_dialog', 'true');

    // Combine the base URL and the parameters
    const authUrl = `${spotifyAuthUrl}?${params.toString()}`;

    console.log("Redirecting to this URL:", authUrl);
    window.location.href = authUrl;
}

async function handleRedirect() {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (code) {
        console.log("Authorization code received:", code);
        try {
            const accessToken = await getAccessToken(code);
            if (accessToken) {
                console.log("Access token received:", accessToken);
                const topArtists = await fetchTopArtists(accessToken);
                console.log("Top artists received:", topArtists);
                const receiptData = processDataForReceipt(topArtists);
                displayReceipt(receiptData);
            } else {
                // This else block will now catch failures from getAccessToken
                console.error("Failed to get access token. It was undefined.");
                alert("Could not get access token. Check the console for errors.");
            }
        } catch (error) {
            console.error("An error occurred during the authentication process:", error);
            alert("An error occurred. Check the console for more details.");
        }
    }
}

async function getAccessToken(code) {
    try {
        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret)
            },
            body: `grant_type=authorization_code&code=${code}&redirect_uri=${encodeURIComponent(redirectUri)}`
        });

        if (!response.ok) {
            // If response is not 200-299, something went wrong.
            const errorData = await response.json();
            console.error('Error from Spotify token endpoint:', errorData);
            throw new Error(`Spotify API Error: ${errorData.error_description || 'Failed to fetch token'}`);
        }

        const data = await response.json();
        window.history.pushState({}, document.title, window.location.pathname);
        return data.access_token;

    } catch (error) {
        console.error("Error in getAccessToken:", error);
        return null; // Return null on failure
    }
}

async function fetchTopArtists(token) {
   try {
        const response = await fetch('https://api.spotify.com/v1/me/top/artists', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error from Spotify top artists endpoint:', errorData);
            throw new Error(`Spotify API Error: ${errorData.error.message || 'Failed to fetch artists'}`);
        }
        
        const data = await response.json();
        return data.items;

    } catch (error) {
        console.error("Error in fetchTopArtists:", error);
        return null;
    }
}

// Unchanged functions below...
function processDataForReceipt(artists) {
    let moralCosts = [];
    let totalControversialArtists = 0;
    if (artists) {
        artists.forEach(artist => {
            if (controversyDatabase[artist.id]) {
                totalControversialArtists++;
                const artistInfo = controversyDatabase[artist.id];
                moralCosts.push(...artistInfo.controversies);
            }
        });
    }
    return { costs: moralCosts, totalArtists: artists ? artists.length : 0, controversialCount: totalControversialArtists };
}

function displayReceipt(data) {
    document.getElementById('login-section').style.display = 'none';
    const receiptSection = document.getElementById('receipt-section');
    let costsHtml = '';
    if (data.costs.length > 0) {
        data.costs.forEach(cost => {
            costsHtml += `<div class="item-row"><span class="item">${cost.item}</span><span class="price">${cost.cost}</span></div>`;
        });
    } else {
        costsHtml = `<p style="text-align:center; margin: 20px 0;">Your listening history appears to be morally unproblematic. For now.</p>`;
    }
    const receiptHtml = `
        <div class="receipt-container">
            <header class="receipt-header">
                <h2>YOUR SPOTIFY RECEIPT</h2>
                <p>Date: ${new Date().toLocaleDateString()}</p>
                <p>Artists Scanned: ${data.totalArtists}</p>
            </header>
            <div class="separator"></div>
            <div class="moral-costs-header"><p>-- Hidden Costs (${data.controversialCount} Artists) --</p></div>
            ${costsHtml}
            <div class="separator"></div>
            <footer class="receipt-footer">
                <p>Thank you for your complicity.</p>
            </footer>
        </div>
    `;
    receiptSection.innerHTML = receiptHtml;

    // ... after the controversyDatabase ...

// --- Main App Logic ---
document.addEventListener('DOMContentLoaded', () => {
    // ... (loginButton listener) ...

    // Add this for the logout button
    const logoutButton = document.getElementById('logout-button');
    logoutButton.addEventListener('click', () => {
        // Simple way to "log out" is to clear the UI and go back to the start
        window.location.href = window.location.pathname;
    });

    handleRedirect();
});

// ... (all other functions remain the same until displayReceipt) ...

function displayReceipt(data) {
    document.getElementById('login-section').style.display = 'none';
    const receiptSection = document.getElementById('receipt-section');
    const logoutButton = document.getElementById('logout-button');

    // ... (rest of the function) ...

    receiptSection.innerHTML = receiptHtml;
    logoutButton.classList.remove('hidden'); // Show the logout button
}
}
