// frontend/script.js (Final Version with Live Search and Corrected URLs)

document.addEventListener('DOMContentLoaded', () => {
    // --- STATE & ELEMENTS ---
    const pages = document.querySelectorAll('.page-section');
    const showSignupLink = document.getElementById('show-signup');
    const showLoginLink = document.getElementById('show-login');
    const logoutButton = document.getElementById('logout-button');
    const searchContainer = document.getElementById('search-container');
    const searchBar = document.getElementById('search-bar');
    const resultsContent = document.getElementById('dynamic-results-content');
    
    // Live Search Elements
    const liveSearchBar = document.getElementById('live-search-bar');
    const liveSearchResultsContainer = document.getElementById('live-search-results-container');
    
    let allRecommendations = [];

    // --- UTILITY: DEBOUNCE FUNCTION ---
    // Prevents the app from sending API requests on every keystroke
    function debounce(func, delay) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    }

    // --- PAGE NAVIGATION ---
    function showPage(pageId) {
        pages.forEach(page => {
            page.classList.remove('active');
        });
        document.getElementById(pageId).classList.add('active');
    }

    // --- INITIAL ROUTING ---
    const token = localStorage.getItem('token');
    if (token) {
        showPage('main-app-page');
    } else {
        showPage('login-page');
    }

    // --- EVENT LISTENERS FOR NAVIGATION ---
    showSignupLink.addEventListener('click', (e) => {
        e.preventDefault();
        showPage('signup-page');
    });

    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        showPage('login-page');
    });

    logoutButton.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        allRecommendations = []; // Clear stored recommendations
        searchContainer.style.display = 'none'; // Hide search bar on logout
        liveSearchResultsContainer.innerHTML = ''; // Clear live search results
        alert('You have been logged out.');
        showPage('login-page');
    });

    // --- FORM SUBMISSION LOGIC ---
    
    // 1. SIGNUP FORM
    const signupForm = document.getElementById('signup-form');
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const res = await fetch('/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, password }) });
        const data = await res.json();
        if (res.ok) { alert('Signup successful! Please log in.'); showPage('login-page'); } else { alert(`Error: ${data.error}`); }
    });

    // 2. LOGIN FORM
    const loginForm = document.getElementById('login-form');
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const res = await fetch('/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
        const data = await res.json();
        if (res.ok) { localStorage.setItem('token', data.token); alert('Login successful! Please provide your academic details.'); showPage('details-page'); } else { alert(`Error: ${data.error}`); }
    });

    // 3. DETAILS FORM
    const detailsForm = document.getElementById('details-form');
    detailsForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const currentToken = localStorage.getItem('token');
        const academicDetails = { grade10: document.getElementById('grade10').value, grade12: document.getElementById('grade12').value, graduation: document.getElementById('graduation').value, };
        const res = await fetch('/save-details', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentToken}` }, body: JSON.stringify(academicDetails) });
        if (res.ok) { alert('Details saved! Welcome to the main app.'); showPage('main-app-page'); } else { alert('Failed to save details.'); }
    });

    // 4. CAREER RECOMMENDATION FORM
    const careerForm = document.getElementById('career-form');
    const submitBtn = document.getElementById('submit-btn');
    careerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const currentToken = localStorage.getItem('token');
        const skills = document.getElementById('skills').value;
        const interests = document.getElementById('interests').value;
        const personality = document.getElementById('personality').value;

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
        resultsContent.innerHTML = '<div class="loading"><i class="fas fa-brain"></i> The AI is thinking...</div>';
        searchContainer.style.display = 'none';

        try {
            const response = await fetch('/recommend', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentToken}` },
                body: JSON.stringify({ skills, interests, personality }),
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    alert('Your session has expired. Please log in again.');
                    localStorage.removeItem('token');
                    showPage('login-page');
                }
                throw new Error('Something went wrong with the request.');
            }

            const data = await response.json();
            allRecommendations = data.recommendations || [];
            displayRecommendations(allRecommendations);

        } catch (error) {
            resultsContent.innerHTML = `<div class="error"><i class="fas fa-exclamation-triangle"></i> ${error.message}</div>`;
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-magic"></i> Get Recommendations';
        }
    });

    // FILTER SEARCH BAR EVENT LISTENER
    searchBar.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        
        if (!searchTerm) {
            displayRecommendations(allRecommendations);
            return;
        }

        const filteredResults = allRecommendations.filter(rec => {
            const titleMatch = rec.title.toLowerCase().includes(searchTerm);
            const descriptionMatch = rec.description.toLowerCase().includes(searchTerm);
            const skillsMatch = rec.skills_to_learn.some(skill => skill.toLowerCase().includes(searchTerm));
            return titleMatch || descriptionMatch || skillsMatch;
        });
        
        displayRecommendations(filteredResults);
    });
    
    // LIVE SEARCH LOGIC
    async function handleLiveSearch(event) {
        const query = event.target.value;
        if (query.length < 3) {
            liveSearchResultsContainer.innerHTML = ''; // Clear results if query is too short
            return;
        }

        liveSearchResultsContainer.innerHTML = '<div class="loading" style="background:var(--card-bg); padding:1rem; border-radius:15px;">Fetching live answer...</div>';
        
        try {
            const currentToken = localStorage.getItem('token');
            const res = await fetch('/live-search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentToken}`
                },
                body: JSON.stringify({ query })
            });

            if (!res.ok) throw new Error("Failed to get a response.");

            const data = await res.json();
            displayLiveSearchResult(data.answer, query);

        } catch (error) {
            liveSearchResultsContainer.innerHTML = `<div class="error" style="background:var(--card-bg); padding:1rem; border-radius:15px;">${error.message}</div>`;
        }
    }
    
    function displayLiveSearchResult(answer, query) {
        liveSearchResultsContainer.innerHTML = `
            <div class="live-result-card">
                <h3>Your Query: "${query}"</h3>
                <p>${answer}</p>
            </div>
        `;
    }

    // Attach the debounced event listener for live search
    liveSearchBar.addEventListener('input', debounce(handleLiveSearch, 500));


    // DISPLAY RECOMMENDATIONS FUNCTION
    function displayRecommendations(recommendations) {
        if (!recommendations || recommendations.length === 0) {
            searchContainer.style.display = 'none';
            if(allRecommendations.length > 0) {
                 resultsContent.innerHTML = '<div class="error">No results match your search.</div>';
            } else {
                 resultsContent.innerHTML = '<div class="error">No career matches found. Try different keywords!</div>';
            }
            return;
        }

        searchContainer.style.display = 'block';
        let html = '<h2>Here are your top career matches:</h2>';
        recommendations.forEach(rec => {
            html += `
                <div class="recommendation-card">
                    <h3>${rec.title}</h3>
                    <p>${rec.description}</p>
                    <strong>Key Skills to Learn:</strong>
                    <ul class="skills-list">
                        ${rec.skills_to_learn.map(skill => `<li>${skill}</li>`).join('')}
                    </ul>
                </div>
            `;
        });
        resultsContent.innerHTML = html;
    }
});

