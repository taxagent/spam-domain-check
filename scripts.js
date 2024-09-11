// scripts.js

// Import the functions you need from the Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-analytics.js";
import { getFirestore, collection, addDoc, getDocs, query, where, updateDoc, doc } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCbSCWDbBLiOdeFtFNo0ZBKhrDjVUr17r0",
    authDomain: "spam-domain-checker-d8640.firebaseapp.com",
    projectId: "spam-domain-checker-d8640",
    storageBucket: "spam-domain-checker-d8640.appspot.com",
    messagingSenderId: "179110083249",
    appId: "1:179110083249:web:6c50f2f3daf7a97cb14090",
    measurementId: "G-YBWD8MLJDS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

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
            const querySnapshot = await getDocs(collection(db, 'domains'));
            domains = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            renderDomains();
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
                        <i class="uil uil-times font-size-14"></i> Spam <span class="count">${domain.nogoodCount}</span>
                    </button>
                    <button type="button" class="btn btn-success" onclick="vote('${domain.id}', 'good');">
                        <i class="uil uil-check font-size-14"></i> Safe <span class="count">${domain.goodCount}</span>
                    </button>
                </div>
            </div>
        `).join('');
        
        prevBtn.disabled = currentPage === 1;
        nextBtn.disabled = endIndex >= domains.length;
    }

    window.vote = async function(domainId, voteType) {
        try {
            const domainRef = doc(db, 'domains', domainId);
            const domainSnapshot = await getDocs(query(collection(db, 'domains'), where('__name__', '==', domainId)));

            if (!domainSnapshot.empty) {
                const domainData = domainSnapshot.docs[0].data();
                if (voteType === 'nogood') {
                    await updateDoc(domainRef, { nogoodCount: domainData.nogoodCount + 1 });
                } else if (voteType === 'good') {
                    await updateDoc(domainRef, { goodCount: domainData.goodCount + 1 });
                }
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
                const existingDomains = await getDocs(query(collection(db, 'domains'), where('name', '==', domainName)));
                if (existingDomains.empty) {
                    await addDoc(collection(db, 'domains'), { name: domainName, goodCount: 0, nogoodCount: 0 });
                    domainInput.value = '';
                    fetchDomains();
                } else {
                    alert('Domain already exists.');
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
                        <i class="uil uil-times font-size-14"></i> Spam <span class="count">${domain.nogoodCount}</span>
                    </button>
                    <button type="button" class="btn btn-success" onclick="vote('${domain.id}', 'good');">
                        <i class="uil uil-check font-size-14"></i> Safe <span class="count">${domain.goodCount}</span>
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
