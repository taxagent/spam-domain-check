// Import the functions you need from the Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getDatabase, ref, set, get, update, query, orderByChild, equalTo } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-database.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-analytics.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCbSCWDbBLiOdeFtFNo0ZBKhrDjVUr17r0",
    authDomain: "spam-domain-checker-d8640.firebaseapp.com",
    databaseURL: "https://spam-domain-checker-d8640-default-rtdb.firebaseio.com",
    projectId: "spam-domain-checker-d8640",
    storageBucket: "spam-domain-checker-d8640.appspot.com",
    messagingSenderId: "179110083249",
    appId: "1:179110083249:web:6c50f2f3daf7a97cb14090",
    measurementId: "G-YBWD8MLJDS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getDatabase(app);

document.addEventListener('DOMContentLoaded', () => {
    const domainForm = document.getElementById('domain-form');
    const domainInput = document.getElementById('domain-input');
    const searchInput = document.getElementById('search-input');
    const domainsContainer = document.getElementById('domains');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');

    let domains = [];
    let currentPage = 1;
    const itemsPerPage = 10;

    async function fetchDomains() {
        try {
            const domainsRef = ref(db, 'domains');
            const snapshot = await get(domainsRef);
            if (snapshot.exists()) {
                domains = Object.entries(snapshot.val()).map(([id, domain]) => ({ id, ...domain }));
                renderDomains();
            } else {
                console.log("No data available");
            }
        } catch (error) {
            console.error("Error fetching domains: ", error);
        }
    }

    function renderDomains() {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedDomains = domains.slice(startIndex, endIndex);

        domainsContainer.innerHTML = paginatedDomains.map(domain => `
            <div class="domain-item">
                <span>${domain.name}</span>
                <div class="vote-buttons">
                    <button type="button" class="btn btn-danger" onclick="vote('${domain.id}', 'nogood');">
                        <i class="uil uil-times font-size-14"></i> Spam <span class="count">${domain.nogoodCount || 0}</span>
                    </button>
                    <button type="button" class="btn btn-success" onclick="vote('${domain.id}', 'good');">
                        <i class="uil uil-check font-size-14"></i> Safe <span class="count">${domain.goodCount || 0}</span>
                    </button>
                </div>
            </div>
        `).join('');
        
        prevBtn.disabled = currentPage === 1;
        nextBtn.disabled = endIndex >= domains.length;
    }

    window.vote = async function(domainId, voteType) {
        try {
            const domainRef = ref(db, `domains/${domainId}`);
            const snapshot = await get(domainRef);

            if (snapshot.exists()) {
                const domainData = snapshot.val();
                const updates = {};
                if (voteType === 'nogood') {
                    updates.nogoodCount = (domainData.nogoodCount || 0) + 1;
                } else if (voteType === 'good') {
                    updates.goodCount = (domainData.goodCount || 0) + 1;
                }
                await update(domainRef, updates);
                fetchDomains();
            }
        } catch (error) {
            console.error("Error voting: ", error);
        }
    };

    domainForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const domainName = domainInput.value.trim();
        if (domainName) {
            try {
                const domainsRef = ref(db, 'domains');
                const q = query(domainsRef, orderByChild('name'), equalTo(domainName));
                const snapshot = await get(q);

                if (snapshot.exists()) {
                    alert('Domain already exists.');
                } else {
                    const newDomainRef = ref(db, 'domains').push();
                    await set(newDomainRef, { name: domainName, goodCount: 0, nogoodCount: 0 });
                    domainInput.value = '';
                    fetchDomains();
                }
            } catch (error) {
                console.error("Error adding domain: ", error);
            }
        } else {
            alert('Please enter a domain.');
        }
    });

    searchInput.addEventListener('input', () => {
        const queryText = searchInput.value.toLowerCase();
        const filteredDomains = domains.filter(domain => domain.name.toLowerCase().includes(queryText));
        domainsContainer.innerHTML = filteredDomains.map(domain => `
            <div class="domain-item">
                <span>${domain.name}</span>
                <div class="vote-buttons">
                    <button type="button" class="btn btn-danger" onclick="vote('${domain.id}', 'nogood');">
                        <i class="uil uil-times font-size-14"></i> Spam <span class="count">${domain.nogoodCount || 0}</span>
                    </button>
                    <button type="button" class="btn btn-success" onclick="vote('${domain.id}', 'good');">
                        <i class="uil uil-check font-size-14"></i> Safe <span class="count">${domain.goodCount || 0}</span>
                    </button>
                </div>
            </div>
        `).join('');
    });

    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderDomains();
        }
    });

    nextBtn.addEventListener('click', () => {
        if ((currentPage * itemsPerPage) < domains.length) {
            currentPage++;
            renderDomains();
        }
    });

    fetchDomains();
});
