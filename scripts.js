// Import the necessary Firebase modules
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';

// Your Firebase configuration
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
const db = getFirestore(app);

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

// Add domain to Firestore
addDomainButton.addEventListener('click', async () => {
  const domain = domainInput.value.trim();
  if (domain) {
    try {
      await addDoc(collection(db, 'domains'), {
        name: domain,
        spam: 0,
        safe: 0
      });
      domainInput.value = '';
      loadDomains();
    } catch (error) {
      console.error('Error adding domain:', error);
    }
  } else {
    alert('Please enter a domain.');
  }
});

// Load domains from Firestore
async function loadDomains() {
  const startAtIndex = (currentPage - 1) * domainsPerPage;
  const domainsRef = collection(db, 'domains');
  const domainsQuery = query(domainsRef, orderBy('name'), limit(domainsPerPage));

  try {
    const querySnapshot = await getDocs(domainsQuery);
    domainsContainer.innerHTML = '';
    querySnapshot.forEach((doc) => {
      const domain = doc.data();
      const domainName = doc.id;
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
  } catch (error) {
    console.error('Error loading domains:', error);
  }
}

// Handle voting
window.vote = async function(domainName, voteType) {
  const domainRef = doc(db, 'domains', domainName);
  try {
    const docSnap = await getDoc(domainRef);
    if (docSnap.exists()) {
      const domain = docSnap.data();
      await updateDoc(domainRef, {
        [voteType]: (domain[voteType] || 0) + 1
      });
      loadDomains();
    } else {
      console.error('Domain does not exist.');
    }
  } catch (error) {
    console.error('Error updating domain:', error);
  }
};

// Initial load
loadDomains();
