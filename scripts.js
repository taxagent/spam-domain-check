document.addEventListener('DOMContentLoaded', () => {
    const domainForm = document.getElementById('domain-form');
    const domainInput = document.getElementById('domain-input');
    const searchInput = document.getElementById('search-input');
    const domainsContainer = document.getElementById('domains');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');

    let domains = []; // Array to store domain data
    let currentPage = 1;
    const itemsPerPage = 10;

    function renderDomains() {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedDomains = domains.slice(startIndex, endIndex);
        
        domainsContainer.innerHTML = paginatedDomains.map(domain => `
            <div class="domain-item">
                <span>${domain.name}</span>
                <div class="vote-buttons">
                    <button type="button" class="btn btn-danger" onclick="vote('${domain.name}', 'nogood');">
                        <i class="uil uil-times font-size-14"></i> Spam <span class="count">${domain.nogoodCount}</span>
                    </button>
                    <button type="button" class="btn btn-success" onclick="vote('${domain.name}', 'good');">
                        <i class="uil uil-check font-size-14"></i> Safe <span class="count">${domain.goodCount}</span>
                    </button>
                </div>
            </div>
        `).join('');
        
        // Enable/disable pagination buttons
        prevBtn.disabled = currentPage === 1;
        nextBtn.disabled = endIndex >= domains.length;
    }

    window.vote = function(domainName, voteType) {
        const domain = domains.find(d => d.name === domainName);
        if (domain) {
            if (voteType === 'nogood') {
                domain.nogoodCount++;
            } else if (voteType === 'good') {
                domain.goodCount++;
            }
            renderDomains();
        }
    };

    domainForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const domainName = domainInput.value.trim();
        if (domainName) {
            if (!domains.find(d => d.name === domainName)) {
                domains.push({ name: domainName, goodCount: 0, nogoodCount: 0 });
            }
            domainInput.value = '';
            renderDomains();
        }
    });

    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase();
        const filteredDomains = domains.filter(domain => domain.name.toLowerCase().includes(query));
        domainsContainer.innerHTML = filteredDomains.map(domain => `
            <div class="domain-item">
                <span>${domain.name}</span>
                <div class="vote-buttons">
                    <button type="button" class="btn btn-danger" onclick="vote('${domain.name}', 'nogood');">
                        <i class="uil uil-times font-size-14"></i> Spam <span class="count">${domain.nogoodCount}</span>
                    </button>
                    <button type="button" class="btn btn-success" onclick="vote('${domain.name}', 'good');">
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

    renderDomains();
});