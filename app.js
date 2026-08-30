// BLL SYSTEM APPLICATION CODE

// State Management
let currentTab = 'main';
let selectedItemId = null;
let isAdminLoggedIn = false;

// Sample Data Stores
const dataStore = {
    levels: [
        {
            id: 'l1',
            rank: 1,
            name: 'Worry',
            creator: 'Tú',
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
            name: 'Diamond',
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
    renderContent();
});

// TAB SYSTEM
function initTabs() {
    navTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            navTabs.forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            
            currentTab = e.target.getAttribute('data-tab');
            sectionTitle.textContent = tabTitles[currentTab] || 'Bodrio Level List';
            selectedItemId = null;
            
            renderContent();
            
            if (isAdminLoggedIn) {
                renderAdminPanel(currentTab);
            }
        });
    });
}

// RENDER LIST CONTENT
function renderContent() {
    listContainer.innerHTML = '';
    let items = [];

    if (['main', 'extended', 'legacy', 'hot'].includes(currentTab)) {
        items = dataStore.levels.filter(l => l.tab === currentTab);
        renderLevelList(items);
    } else if (currentTab === 'top-players') {
        items = dataStore.topPlayers;
        renderPlayersList(items);
    } else if (currentTab === 'verifiers') {
        items = dataStore.verifiers;
        renderVerifiersList(items);
    } else if (currentTab === 'decorators') {
        items = dataStore.decorators;
        renderDecoratorsList(items);
    }

    if (items.length === 0) {
        listContainer.innerHTML = '<p style="color:#64748b; padding:20px;">No hay datos registrados en esta sección aún.</p>';
        detailCard.innerHTML = '<p class="select-prompt">Selecciona un elemento para ver detalles.</p>';
    } else if (!selectedItemId) {
        selectItem(items[0]);
    }
}

// RENDER SPECIFIC LISTS
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
        card.addEventListener('click', () => selectItem(item));
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
        card.addEventListener('click', () => selectItem(item));
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
        card.addEventListener('click', () => selectItem(item));
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
        card.addEventListener('click', () => selectItem(item));
        listContainer.appendChild(card);
    });
}

// SELECT & DISPLAY ITEM DETAILS
function selectItem(item) {
    selectedItemId = item.id;
    document.querySelectorAll('.list-card').forEach(c => c.classList.remove('active'));
    
    // Highlight selected card
    const cards = Array.from(listContainer.children);
    const category = getItemCategory();
    const activeIndex = dataStore[category].findIndex(i => i.id === item.id);
    if (cards[activeIndex]) cards[activeIndex].classList.add('active');

    if (['main', 'extended', 'legacy', 'hot'].includes(currentTab)) {
        let badgeClass = 'badge-legal';
        if (item.tag === 'ASSISTED') badgeClass = 'badge-assisted';
        if (item.tag === 'IMPOSSIBLE') badgeClass = 'badge-impossible';

        let embedUrl = item.videoUrl;
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
                <div class="stat-box"><div class="label">Next Hardest</div><div class="value">${item.nextHardest}</div></div>
                <div class="stat-box"><div class="label">BLL Hardest</div><div class="value">${item.bllHardest}</div></div>
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

function getItemCategory() {
    if (['main', 'extended', 'legacy', 'hot'].includes(currentTab)) return 'levels';
    if (currentTab === 'top-players') return 'topPlayers';
    if (currentTab === 'verifiers') return 'verifiers';
    if (currentTab === 'decorators') return 'decorators';
}

// ADMIN MODAL LOGIC
function initAdminModal() {
    openAdminBtn.addEventListener('click', () => {
        adminModal.classList.remove('hidden');
    });

    closeAdminBtn.addEventListener('click', () => {
        adminModal.classList.add('hidden');
    });

    adminLoginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (adminPassInput.value.length > 0) {
            isAdminLoggedIn = true;
            adminAuthView.classList.add('hidden');
            adminDashView.classList.remove('hidden');
            renderAdminPanel(currentTab);
            adminPassInput.value = '';
        }
    });

    adminLogoutBtn.addEventListener('click', () => {
        isAdminLoggedIn = false;
        adminDashView.classList.add('hidden');
        adminAuthView.classList.remove('hidden');
    });
}

// RENDER DYNAMIC ADMIN PANEL ACCORDING TO ACTIVE TAB
function renderAdminPanel(tab) {
    if (!adminContentArea) return;

    if (tab === 'decorators') {
        adminContentArea.innerHTML = `
            <h3>Añadir / Editar Decorador</h3>
            <form id="form-decorator">
                <label>Posición en el top:</label>
                <input type="number" id="dec-rank" placeholder="Ej: 1" required>

                <label>Nombre del Decorador:</label>
                <input type="text" id="dec-name" placeholder="Ej: Spu7Nix" required>

                <label>Decorator Points:</label>
                <input type="number" id="dec-points" placeholder="Ej: 1500" required>

                <label>Nametag en Geometry Dash:</label>
                <input type="text" id="dec-nametag" placeholder="Ej: Spu7NixGD" required>

                <button type="submit" class="btn-submit">Guardar Decorador</button>
            </form>
        `;
        document.getElementById('form-decorator').addEventListener('submit', handleAddDecorator);
    } else if (tab === 'verifiers') {
        adminContentArea.innerHTML = `
            <h3>Añadir / Editar Verificador</h3>
            <form id="form-verifier">
                <label>Posición en el top:</label>
                <input type="number" id="ver-rank" placeholder="Ej: 1" required>

                <label>Nombre del Verificador:</label>
                <input type="text" id="ver-name" placeholder="Ej: Zoink" required>

                <label>Hardest Completion (General):</label>
                <input type="text" id="ver-hardest" placeholder="Ej: Tidal Wave" required>

                <label>Next Hardest:</label>
                <input type="text" id="ver-next-hardest" placeholder="Ej: Acheron" required>

                <label>BLL Hardest Completion:</label>
                <input type="text" id="ver-bll-hardest" placeholder="Ej: Worry" required>

                <label>Verifier Points:</label>
                <input type="number" id="ver-points" placeholder="Ej: 3200" required>

                <label>BLL Completions (Niveles aprobados):</label>
                <input type="number" id="ver-completions" placeholder="Ej: 5" required>

                <button type="submit" class="btn-submit">Guardar Verificador</button>
            </form>
        `;
        document.getElementById('form-verifier').addEventListener('submit', handleAddVerifier);
    } else if (tab === 'top-players') {
        adminContentArea.innerHTML = `
            <h3>Añadir / Editar Top Player</h3>
            <form id="form-top-player">
                <label>Posición en el top:</label>
                <input type="number" id="player-rank" placeholder="Ej: 1" required>

                <label>Nombre del Jugador:</label>
                <input type="text" id="player-name" placeholder="Ej: Diamond" required>

                <label>Player Points:</label>
                <input type="number" id="player-points" placeholder="Ej: 5000" required>

                <label>Hardest Completion (Demonlist):</label>
                <input type="text" id="player-hardest" placeholder="Ej: Acheron" required>

                <label>BLL Hardest Completion:</label>
                <input type="text" id="player-bll-hardest" placeholder="Ej: Layout Imposible" required>

                <label>BLL Levels Beaten (Total):</label>
                <input type="number" id="player-beaten" placeholder="Ej: 12" required>

                <label>Canal de YouTube / Twitch (URL):</label>
                <input type="url" id="player-media" placeholder="https://youtube.com/@tu_canal">

                <button type="submit" class="btn-submit">Guardar Top Player</button>
            </form>
        `;
        document.getElementById('form-top-player').addEventListener('submit', handleAddPlayer);
    } else {
        adminContentArea.innerHTML = `
            <h3>Añadir / Editar Nivel (${tab.toUpperCase()})</h3>
            <form id="form-level">
                <label>Posición en el top:</label>
                <input type="number" id="level-rank" placeholder="Ej: 1" required>

                <label>Nombre del Nivel:</label>
                <input type="text" id="level-name" placeholder="Ej: Worry" required>

                <label>Creador:</label>
                <input type="text" id="level-creator" placeholder="Ej: Tú" required>

                <label>Verificador:</label>
                <input type="text" id="level-verifier" placeholder="Ej: TopPlayer" required>

                <label>Enlace de YouTube / Embed:</label>
                <input type="text" id="level-video" placeholder="Ej: https://www.youtube.com/watch?v=dQw4w9WgXcQ" required>

                <label>Categoría / Tag:</label>
                <select id="level-tag">
                    <option value="LEGAL">LEGAL</option>
                    <option value="ASSISTED">ASSISTED (CBF / Mod)</option>
                    <option value="IMPOSSIBLE">IMPOSSIBLE</option>
                </select>

                <button type="submit" class="btn-submit">Guardar Nivel</button>
            </form>
        `;
        document.getElementById('form-level').addEventListener('submit', handleAddLevel);
    }
}

// FORM HANDLERS WITH VALIDATION
function handleAddLevel(e) {
    e.preventDefault();
    const desiredRank = parseInt(document.getElementById('level-rank').value);
    const currentList = dataStore.levels.filter(l => l.tab === currentTab);
    const maxRankAllowed = currentList.length + 1;

    if (desiredRank < 1 || desiredRank > maxRankAllowed) {
        alert("No se puede poner ese numero, pon otro!");
        return;
    }

    const newLevel = {
        id: 'l' + (dataStore.levels.length + 1),
        rank: desiredRank,
        name: document.getElementById('level-name').value,
        creator: document.getElementById('level-creator').value,
        verifier: document.getElementById('level-verifier').value,
        videoUrl: document.getElementById('level-video').value,
        tag: document.getElementById('level-tag').value,
        tab: currentTab
    };

    dataStore.levels.push(newLevel);
    dataStore.levels.sort((a, b) => a.rank - b.rank);

    renderContent();
    adminModal.classList.add('hidden');
}

function handleAddPlayer(e) {
    e.preventDefault();
    const desiredRank = parseInt(document.getElementById('player-rank').value);
    const maxRankAllowed = dataStore.topPlayers.length + 1;

    if (desiredRank < 1 || desiredRank > maxRankAllowed) {
        alert("No se puede poner ese numero, pon otro!");
        return;
    }

    const newPlayer = {
        id: 'p' + (dataStore.topPlayers.length + 1),
        rank: desiredRank,
        name: document.getElementById('player-name').value,
        points: parseInt(document.getElementById('player-points').value),
        hardest: document.getElementById('player-hardest').value,
        bllHardest: document.getElementById('player-bll-hardest').value,
        beaten: parseInt(document.getElementById('player-beaten').value),
        media: document.getElementById('player-media').value
    };

    dataStore.topPlayers.push(newPlayer);
    dataStore.topPlayers.sort((a, b) => a.rank - b.rank);

    renderContent();
    adminModal.classList.add('hidden');
}

function handleAddVerifier(e) {
    e.preventDefault();
    const desiredRank = parseInt(document.getElementById('ver-rank').value);
    const maxRankAllowed = dataStore.verifiers.length + 1;

    if (desiredRank < 1 || desiredRank > maxRankAllowed) {
        alert("No se puede poner ese numero, pon otro!");
        return;
    }

    const newVerifier = {
        id: 'v' + (dataStore.verifiers.length + 1),
        rank: desiredRank,
        name: document.getElementById('ver-name').value,
        points: parseInt(document.getElementById('ver-points').value),
        hardest: document.getElementById('ver-hardest').value,
        nextHardest: document.getElementById('ver-next-hardest').value,
        bllHardest: document.getElementById('ver-bll-hardest').value,
        completions: parseInt(document.getElementById('ver-completions').value)
    };

    dataStore.verifiers.push(newVerifier);
    dataStore.verifiers.sort((a, b) => a.rank - b.rank);

    renderContent();
    adminModal.classList.add('hidden');
}

function handleAddDecorator(e) {
    e.preventDefault();
    const desiredRank = parseInt(document.getElementById('dec-rank').value);
    const maxRankAllowed = dataStore.decorators.length + 1;

    if (desiredRank < 1 || desiredRank > maxRankAllowed) {
        alert("No se puede poner ese numero, pon otro!");
        return;
    }

    const newDecorator = {
        id: 'd' + (dataStore.decorators.length + 1),
        rank: desiredRank,
        name: document.getElementById('dec-name').value,
        points: parseInt(document.getElementById('dec-points').value),
        nametag: document.getElementById('dec-nametag').value
    };

    dataStore.decorators.push(newDecorator);
    dataStore.decorators.sort((a, b) => a.rank - b.rank);

    renderContent();
    adminModal.classList.add('hidden');
}
