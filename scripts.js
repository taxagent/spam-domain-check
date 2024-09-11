// Import the functions you need from the Firebase SDKs
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js';
import { getDatabase, ref, set, get, update, query, orderByKey, limitToFirst } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js';

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
const db = getDatabase(app);

// DOM elements
const domainInput = document.getElementById('domain-input');
const addDomainButton = document.getElementById('add-domain');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const domainsContainer = document.getElementById('domains');
const prevButton = document.getElementById('prev-button');
const nextButton = document.getElementById('next-button');

// Current page and number of domains per page
let currentPage = 1;
const domainsPerPage = 10;

// Add domain to the database
addDomainButton.addEventListener('click', () => {
    const domain = domainInput.value.trim();
    if (domain) {
        const domainRef = ref(db, 'domains/' + domain);
        set(domainRef, {
            name: domain,
            spam: 0,
            safe: 0
        }).then(() => {
            domainInput.value = '';
            loadDomains();
        }).catch((error) => {
            console.error('Error adding domain:', error);
        });
    } else {
        alert('Please enter a domain.');
    }
});

// Load domains from the database
function loadDomains() {
    const startAtIndex = (currentPage - 1) * domainsPerPage;
    const domainsRef = ref(db, 'domains');
    const domainsQuery = query(domainsRef, orderByKey(), limitToFirst(domainsPerPage));
    
    get(domainsQuery).then((snapshot) => {
        if (snapshot.exists()) {
            domainsContainer.innerHTML = '';
            snapshot.forEach((childSnapshot) => {
                const domain = childSnapshot.val();
                const domainName = childSnapshot.key;
                const domainElement = document.createElement('div');
                domainElement.className = 'domain-item';
                domainElement.innerHTML = `
                    <span>${domainName}</span>
                    <div>
                        <button class="spam" onclick="vote('${domainName}', 'spam')">Spam (${domain.spam})</button>
                        <button class="safe" onclick="vote('${domainName}', 'safe')">Safe (${domain.safe})</button>
                    </div>
                `;
                domainsContainer.appendChild(domainElement);
            });
        } else {
            domainsContainer.innerHTML = '<p>No domains available.</p>';
        }
    }).catch((error) => {
        console.error('Error loading domains:', error);
    });
}

// Handle voting
window.vote = function(domainName, voteType) {
    const domainRef = ref(db, 'domains/' + domainName);
    get(domainRef).then((snapshot) => {
        if (snapshot.exists()) {
            const domain = snapshot.val();
            update(domainRef, {
                [voteType]: (domain[voteType] || 0) + 1
            }).then(() => {
                loadDomains();
            }).catch((error) => {
                console.error('Error voting:', error);
            });
        } else {
            console.error('Domain does not exist.');
        }
    }).catch((error) => {
        console.error('Error retrieving domain:', error);
    });
};

// Initial load
loadDomains();
