// Firebase configuration
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

// Initialize Firebase after libraries are loaded
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const domainForm = document.getElementById('domain-form');
const domainInput = document.getElementById('domain-input');
const searchInput = document.getElementById('search-input');
const domainsDiv = document.getElementById('domains');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');

let currentPage = 1;
const itemsPerPage = 10;
let domains = [];

domainForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const domain = domainInput.value.trim();
  if (domain) {
    db.ref('domains').push({ name: domain, spamCount: 0, safeCount: 0 })
      .then(() => {
        domainInput.value = '';
        fetchDomains();
      })
      .catch((error) => console.error('Error adding domain:', error));
  }
});

searchInput.addEventListener('input', fetchDomains);

function fetchDomains() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  db.ref('domains').once('value')
    .then(snapshot => {
      domains = [];
      snapshot.forEach(childSnapshot => {
        const domain = childSnapshot.val();
        domain.key = childSnapshot.key;
        if (domain.name.toLowerCase().includes(searchTerm)) {
          domains.push(domain);
        }
      });
      renderDomains();
    })
    .catch((error) => console.error('Error fetching domains:', error));
}

function renderDomains() {
  domainsDiv.innerHTML = '';
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const paginatedDomains = domains.slice(start, end);

  paginatedDomains.forEach(domain => {
    const domainItem = document.createElement('div');
    domainItem.className = 'domain-item';
    domainItem.innerHTML = `
      ${domain.name}
      <div>
        <button onclick="vote('${domain.key}', 'spam')">Spam ${domain.spamCount || 0}</button>
        <button onclick="vote('${domain.key}', 'safe')">Safe ${domain.safeCount || 0}</button>
      </div>
    `;
    domainsDiv.appendChild(domainItem);
  });

  prevBtn.style.display = currentPage === 1 ? 'none' : 'inline-block';
  nextBtn.style.display = end >= domains.length ? 'none' : 'inline-block';
}

function vote(key, type) {
  const ref = db.ref(`domains/${key}`);
  ref.transaction(domain => {
    if (domain) {
      domain[`${type}Count`] = (domain[`${type}Count`] || 0) + 1;
    }
    return domain;
  })
  .then(() => fetchDomains())
  .catch((error) => console.error('Error voting:', error));
}

prevBtn.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    fetchDomains();
  }
});

nextBtn.addEventListener('click', () => {
  if (currentPage * itemsPerPage < domains.length) {
    currentPage++;
    fetchDomains();
  }
});

// Initial fetch
fetchDomains();
