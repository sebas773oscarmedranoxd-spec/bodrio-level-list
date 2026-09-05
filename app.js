// BLL SYSTEM APPLICATION CODE

// State Management
let currentTab = 'main';
let selectedItemId = null;
let editingItemId = null;
let isAdminLoggedIn = false;

// Sample Data Stores
const dataStore = {
    levels: [
        {
            id: 'l1',
            rank: 1,
            name: 'Crazy Time',
            creator: 'Fedorkaz',
            verifier: 'TopPlayer',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            tag: 'LEGAL',
            tab: 'main'
        },
        {
            id: 'l2',
            rank: 2,
            name: 'Layout Imposible',
            creator: 'LayoutGod',
            verifier: 'N/A',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            tag: 'ASSISTED',
            tab: 'main'
        }
    ],
    topPlayers: [
        {
            id: 'p1',
            rank: 1,
            name: 'K4ttie',
            points: 5000,
            hardest: 'Acheron',
            bllHardest: 'Layout Imposible',
            beaten: 12,
            media: 'https://youtube.com'
        }
    ],
    verifiers: [
        {
            id: 'v1',
            rank: 1,
            name: 'Zoink',
            points: 3200,
            hardest: 'Tidal Wave',
            nextHardest: 'Acheron',
            bllHardest: 'Worry',
            completions: 5
        }
    ],
    decorators: [
        {
            id: 'd1',
            rank: 1,
            name: 'Spu7Nix',
            points: 1500,
            nametag: 'Spu7NixGD'
        }
    ]
};

// DOM Elements
const listContainer = document.getElementById('list-container');
const detailCard = document.getElementById('detail-card');
const sectionTitle = document.getElementById('section-title');
const navTabs = document.querySelectorAll('.nav-tab');

// Admin Elements
const openAdminBtn = document.getElementById('open-admin-btn');
const closeAdminBtn = document.getElementById('close-admin-btn');
const adminModal = document.getElementById('admin-modal');
const adminAuthView = document.getElementById('admin-auth-view');
const adminDashView = document.getElementById('admin-dash-view');
const adminLoginForm = document.getElementById('admin-login-form');
const adminPassInput = document.getElementById('admin-pass-input');
const adminLogoutBtn = document.getElementById('admin-logout-btn');
const adminContentArea = document.getElementById('admin-content-area');

// TAB NAMES MAP
const tabTitles = {
    'main': 'Main List (Top 1-100)',
    'extended': 'Extended List',
    'legacy': 'Legacy List',
    'hot': 'HOT Levels',
    'top-players': 'Top Players Leaderboard',
    'verifiers': 'Verifiers Leaderboard',
    'decorators': 'Decorators Leaderboard'
};

// INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    initAdminModal();
    initClickOutside();
    renderContent();
});

// DESELECCIONAR AL HACER CLIC FUERA
function initClickOutside() {
    document.addEventListener('click', (e) => {
        const isClickInsideCard = e.target.closest('.list-card');
        const isClickInsideAdmin = e.target.closest('#admin-modal') || e.target.closest('#open-admin-btn');
        const isClickInsideNav = e.target.closest('.nav-tab');
        const isClickInsideDetail = e.target.closest('#details-sidebar');

        if (!isClickInsideCard && !isClickInsideAdmin && !isClickInsideNav && !isClickInsideDetail) {
            clearSelection();
        }
    });
}

function clearSelection() {
    selectedItemId = null;
    editingItemId = null;
    document.querySelectorAll('.list-card').forEach(c => c.classList.remove('active'));
    detailCard.innerHTML = '<p class="select-prompt">Selecciona un elemento para ver detalles.</p>';
    
    if (isAdminLoggedIn) {
        renderAdminPanel(currentTab, null);
    }
}

// TAB SYSTEM
function initTabs() {
    navTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            navTabs.forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            
            currentTab = e.target.getAttribute('data-tab');
            sectionTitle.textContent = tabTitles[currentTab] || 'Bodrio Level List';
            selectedItemId = null;
            editingItemId = null;
            
            renderContent();
            
            if (isAdminLoggedIn) {
                renderAdminPanel(currentTab, null);
            }
        });
    });
}

function getItemCategory() {
    if (['main', 'extended', 'legacy', 'hot'].includes(currentTab)) return 'levels';
    if (currentTab === 'top-players') return 'topPlayers';
    if (currentTab === 'verifiers') return 'verifiers';
    if (currentTab === 'decorators') return 'decorators';
}

// RENDER LIST CONTENT
function renderContent() {
    listContainer.innerHTML = '';
    let items = [];

    if (['main', 'extended', 'legacy', 'hot'].includes(currentTab)) {
        items = dataStore.levels.filter(l => l.tab === currentTab);
        items.sort((a, b) => a.rank - b.rank);
        renderLevelList(items);
    } else if (currentTab === 'top-players') {
        items = dataStore.topPlayers;
        items.sort((a, b) => a.rank - b.rank);
        renderPlayersList(items);
    } else if (currentTab === 'verifiers') {
        items = dataStore.verifiers;
        items.sort((a, b) => a.rank - b.rank);
        renderVerifiersList(items);
    } else if (currentTab === 'decorators') {
        items = dataStore.decorators;
        items.sort((a, b) => a.rank - b.rank);
        renderDecoratorsList(items);
    }

    if (items.length === 0) {
        listContainer.innerHTML = '<p style="color:#64748b; padding:20px;">No hay datos registrados en esta sección aún.</p>';
        detailCard.innerHTML = '<p class="select-prompt">Selecciona un elemento para ver detalles.</p>';
    } else if (!selectedItemId) {
        selectItem(items[0]);
    }
}

function renderLevelList(items) {
    items.forEach(item => {
        const card = document.createElement('div');
        card.className = `list-card ${selectedItemId === item.id ? 'active' : ''}`;
        
        let badgeClass = 'badge-legal';
        if (item.tag === 'ASSISTED') badgeClass = 'badge-assisted';
        if (item.tag === 'IMPOSSIBLE') badgeClass = 'badge-impossible';

        card.innerHTML = `
            <div class="card-left">
                <span class="card-rank">#${item.rank}</span>
                <div class="card-info">
                    <h4>${item.name}</h4>
                    <p>Por: ${item.creator}</p>
                </div>
            </div>
            <span class="badge ${badgeClass}">${item.tag}</span>
        `;
        card.addEventListener('click', (e) => {
            e.stopPropagation();
            selectItem(item);
        });
        listContainer.appendChild(card);
    });
}

function renderPlayersList(items) {
    items.forEach(item => {
        const card = document.createElement('div');
        card.className = `list-card ${selectedItemId === item.id ? 'active' : ''}`;
        card.innerHTML = `
            <div class="card-left">
                <span class="card-rank">#${item.rank}</span>
                <div class="card-info">
                    <h4>${item.name}</h4>
                    <p>Hardest: ${item.hardest}</p>
                </div>
            </div>
            <span style="color:#a78bfa; font-weight:700; font-size:13px;">${item.points} pts</span>
        `;
        card.addEventListener('click', (e) => {
            e.stopPropagation();
            selectItem(item);
        });
        listContainer.appendChild(card);
    });
}

function renderVerifiersList(items) {
    items.forEach(item => {
        const card = document.createElement('div');
        card.className = `list-card ${selectedItemId === item.id ? 'active' : ''}`;
        card.innerHTML = `
            <div class="card-left">
                <span class="card-rank">#${item.rank}</span>
                <div class="card-info">
                    <h4>${item.name}</h4>
                    <p>BLL Verificados: ${item.completions}</p>
                </div>
            </div>
            <span style="color:#a78bfa; font-weight:700; font-size:13px;">${item.points} pts</span>
        `;
        card.addEventListener('click', (e) => {
            e.stopPropagation();
            selectItem(item);
        });
        listContainer.appendChild(card);
    });
}

function renderDecoratorsList(items) {
    items.forEach(item => {
        const card = document.createElement('div');
        card.className = `list-card ${selectedItemId === item.id ? 'active' : ''}`;
        card.innerHTML = `
            <div class="card-left">
                <span class="card-rank">#${item.rank}</span>
                <div class="card-info">
                    <h4>${item.name}</h4>
                    <p>GD: ${item.nametag}</p>
                </div>
            </div>
            <span style="color:#a78bfa; font-weight:700; font-size:13px;">${item.points} pts</span>
        `;
        card.addEventListener('click', (e) => {
            e.stopPropagation();
            selectItem(item);
        });
        listContainer.appendChild(card);
    });
}

function selectItem(item) {
    selectedItemId = item.id;
    
    const category = getItemCategory();
    const items = category === 'levels' ? dataStore.levels.filter(l => l.tab === currentTab) : dataStore[category];
    const activeIndex = items.findIndex(i => i.id === item.id);
    
    const cards = Array.from(listContainer.children);
    cards.forEach(c => c.classList.remove('active'));
    if (cards[activeIndex]) cards[activeIndex].classList.add('active');

    if (['main', 'extended', 'legacy', 'hot'].includes(currentTab)) {
        let badgeClass = 'badge-legal';
        if (item.tag === 'ASSISTED') badgeClass = 'badge-assisted';
        if (item.tag === 'IMPOSSIBLE') badgeClass = 'badge-impossible';

        let embedUrl = item.videoUrl || '';
        if (embedUrl.includes('watch?v=')) {
            embedUrl = embedUrl.replace('watch?v=', 'embed/');
        }

        detailCard.innerHTML = `
            <h3>#${item.rank} - ${item.name}</h3>
            <p class="meta-text">Creador: ${item.creator} | Verificador: ${item.verifier}</p>
            <span class="badge ${badgeClass}">${item.tag}</span>
            <div class="video-wrapper">
                <iframe src="${embedUrl}" allowfullscreen></iframe>
            </div>
        `;
    } else if (currentTab === 'top-players') {
        detailCard.innerHTML = `
            <h3>#${item.rank} ${item.name}</h3>
            <p class="meta-text">Jugador Destacado BLL</p>
            <div class="stats-grid">
                <div class="stat-box"><div class="label">Player Points</div><div class="value">${item.points}</div></div>
                <div class="stat-box"><div class="label">Total Beaten</div><div class="value">${item.beaten} niveles</div></div>
                <div class="stat-box"><div class="label">Hardest (Global)</div><div class="value">${item.hardest}</div></div>
                <div class="stat-box"><div class="label">BLL Hardest</div><div class="value">${item.bllHardest}</div></div>
            </div>
            ${item.media ? `<a href="${item.media}" target="_blank" class="media-link">▶ Canal de YouTube / Media</a>` : ''}
        `;
    } else if (currentTab === 'verifiers') {
        detailCard.innerHTML = `
            <h3>#${item.rank} ${item.name}</h3>
            <p class="meta-text">Verificador Oficial BLL</p>
            <div class="stats-grid">
                <div class="stat-box"><div class="label">Verifier Points</div><div class="value">${item.points}</div></div>
                <div class="stat-box"><div class="label">Niveles BLL</div><div class="value">${item.completions}</div></div>
                <div class="stat-box"><div class="label">Hardest</div><div class="value">${item.hardest}</div></div>
            </div>
        `;
    } else if (currentTab === 'decorators') {
        detailCard.innerHTML = `
            <h3>#${item.rank} ${item.name}</h3>
            <p class="meta-text">Decorador BLL</p>
            <div class="stats-grid">
                <div class="stat-box"><div class="label">Decorator Points</div><div class="value">${item.points}</div></div>
                <div class="stat-box"><div class="label">GD Nametag</div><div class="value">${item.nametag}</div></div>
            </div>
        `;
    }
}

// ADMIN MODAL & AUTHENTICATION
function initAdminModal() {
    if (!openAdminBtn || !adminModal) return;

    openAdminBtn.addEventListener('click', () => {
        adminModal.classList.remove('hidden');
    });

    closeAdminBtn.addEventListener('click', () => {
        adminModal.classList.add('hidden');
    });

    adminLoginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const pass = adminPassInput.value;
        if (pass === 'G7!mR9#pL2$xQ4&wT8@vK') { // Cambia esto por tu contraseña deseada
            isAdminLoggedIn = true;
            adminAuthView.classList.add('hidden');
            adminDashView.classList.remove('hidden');
            adminPassInput.value = '';
            renderAdminPanel(currentTab, null);
        } else {
            alert('Contraseña incorrecta');
        }
    });

    adminLogoutBtn.addEventListener('click', () => {
        isAdminLoggedIn = false;
        adminDashView.classList.add('hidden');
        adminAuthView.classList.remove('hidden');
        adminModal.classList.add('hidden');
    });
}

function renderAdminPanel(tab, itemId) {
    if (!adminContentArea) return;
    adminContentArea.innerHTML = `<p style="color:#94a3b8; font-size:13px;">Panel de administración activo para pestaña: <strong>${tabTitles[tab]}</strong></p>`;
}
