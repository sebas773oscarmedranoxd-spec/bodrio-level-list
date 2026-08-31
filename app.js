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
            editingItemId = null;
            
            renderContent();
            
            if (isAdminLoggedIn) {
                renderAdminPanel(currentTab);
            }
        });
    });
}

// HELPER: GET CURRENT CATEGORY
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
    
    // Highlight selected card
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

    // SI EL ADMIN ESTÁ LOGUEADO, CARGA LOS DATOS EN EL FORMULARIO PARA EDITAR
    if (isAdminLoggedIn) {
        editingItemId = item.id;
        renderAdminPanel(currentTab, item);
    }
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
            
            // Carga el elemento actual para edición si existe
            const category = getItemCategory();
            const items = category === 'levels' ? dataStore.levels.filter(l => l.tab === currentTab) : dataStore[category];
            const selectedItem = items.find(i => i.id === selectedItemId) || items[0];
            
            if (selectedItem) {
                editingItemId = selectedItem.id;
                renderAdminPanel(currentTab, selectedItem);
            } else {
                renderAdminPanel(currentTab);
            }

            adminPassInput.value = '';
        }
    });

    adminLogoutBtn.addEventListener('click', () => {
        isAdminLoggedIn = false;
        editingItemId = null;
        adminDashView.classList.add('hidden');
        adminAuthView.classList.remove('hidden');
    });
}

// RENDER DYNAMIC ADMIN PANEL ACCORDING TO ACTIVE TAB & SELECTED ITEM
function renderAdminPanel(tab, editItem = null) {
    if (!adminContentArea) return;

    if (tab === 'decorators') {
        adminContentArea.innerHTML = `
            <h3>${editItem ? 'Editar' : 'Añadir'} Decorador</h3>
            <form id="form-decorator">
                <label>Posición en el top:</label>
                <input type="number" id="dec-rank" value="${editItem ? editItem.rank : ''}" placeholder="Ej: 1" required>

                <label>Nombre del Decorador:</label>
                <input type="text" id="dec-name" value="${editItem ? editItem.name : ''}" placeholder="Ej: Spu7Nix" required>

                <label>Decorator Points:</label>
                <input type="number" id="dec-points" value="${editItem ? editItem.points : ''}" placeholder="Ej: 1500" required>

                <label>Nametag en Geometry Dash:</label>
                <input type="text" id="dec-nametag" value="${editItem ? editItem.nametag : ''}" placeholder="Ej: Spu7NixGD" required>

                <button type="submit" class="btn-submit">${editItem ? 'Actualizar' : 'Guardar'} Decorador</button>
            </form>
        `;
        document.getElementById('form-decorator').addEventListener('submit', handleAddDecorator);
    } else if (tab === 'verifiers') {
        adminContentArea.innerHTML = `
            <h3>${editItem ? 'Editar' : 'Añadir'} Verificador</h3>
            <form id="form-verifier">
                <label>Posición en el top:</label>
                <input type="number" id="ver-rank" value="${editItem ? editItem.rank : ''}" placeholder="Ej: 1" required>

                <label>Nombre del Verificador:</label>
                <input type="text" id="ver-name" value="${editItem ? editItem.name : ''}" placeholder="Ej: Zoink" required>

                <label>Hardest Completion (General):</label>
                <input type="text" id="ver-hardest" value="${editItem ? editItem.hardest : ''}" placeholder="Ej: Tidal Wave" required>

                <label>Next Hardest:</label>
                <input type="text" id="ver-next-hardest" value="${editItem ? editItem.nextHardest : ''}" placeholder="Ej: Acheron" required>

                <label>BLL Hardest Completion:</label>
                <input type="text" id="ver-bll-hardest" value="${editItem ? editItem.bllHardest : ''}" placeholder="Ej: Worry" required>

                <label>Verifier Points:</label>
                <input type="number" id="ver-points" value="${editItem ? editItem.points : ''}" placeholder="Ej: 3200" required>

                <label>BLL Completions (Niveles aprobados):</label>
                <input type="number" id="ver-completions" value="${editItem ? editItem.completions : ''}" placeholder="Ej: 5" required>

                <button type="submit" class="btn-submit">${editItem ? 'Actualizar' : 'Guardar'} Verificador</button>
            </form>
        `;
        document.getElementById('form-verifier').addEventListener('submit', handleAddVerifier);
    } else if (tab === 'top-players') {
        adminContentArea.innerHTML = `
            <h3>${editItem ? 'Editar' : 'Añadir'} Top Player</h3>
            <form id="form-top-player">
                <label>Posición en el top:</label>
                <input type="number" id="player-rank" value="${editItem ? editItem.rank : ''}" placeholder="Ej: 1" required>

                <label>Nombre del Jugador:</label>
                <input type="text" id="player-name" value="${editItem ? editItem.name : ''}" placeholder="Ej: Diamond" required>

                <label>Player Points:</label>
                <input type="number" id="player-points" value="${editItem ? editItem.points : ''}" placeholder="Ej: 5000" required>

                <label>Hardest Completion (Demonlist):</label>
                <input type="text" id="player-hardest" value="${editItem ? editItem.hardest : ''}" placeholder="Ej: Acheron" required>

                <label>BLL Hardest Completion:</label>
                <input type="text" id="player-bll-hardest" value="${editItem ? editItem.bllHardest : ''}" placeholder="Ej: Layout Imposible" required>

                <label>BLL Levels Beaten (Total):</label>
                <input type="number" id="player-beaten" value="${editItem ? editItem.beaten : ''}" placeholder="Ej: 12" required>

                <label>Canal de YouTube / Twitch (URL):</label>
                <input type="url" id="player-media" value="${editItem ? editItem.media || '' : ''}" placeholder="https://youtube.com/@tu_canal">

                <button type="submit" class="btn-submit">${editItem ? 'Actualizar' : 'Guardar'} Top Player</button>
            </form>
        `;
        document.getElementById('form-top-player').addEventListener('submit', handleAddPlayer);
    } else {
        adminContentArea.innerHTML = `
            <h3>${editItem ? 'Editar' : 'Añadir'} Nivel (${tab.toUpperCase()})</h3>
            <form id="form-level">
                <label>Posición en el top:</label>
                <input type="number" id="level-rank" value="${editItem ? editItem.rank : ''}" placeholder="Ej: 1" required>

                <label>Nombre del Nivel:</label>
                <input type="text" id="level-name" value="${editItem ? editItem.name : ''}" placeholder="Ej: Worry" required>

                <label>Creador del Nivel:</label>
                <input type="text" id="level-creator" value="${editItem ? editItem.creator : ''}" placeholder="Ej: Tú" required>

                <label>Verificador del Nivel:</label>
                <input type="text" id="level-verifier" value="${editItem ? editItem.verifier : ''}" placeholder="Ej: TopPlayer" required>

                <label>Enlace de Video (YouTube Embed/Watch):</label>
                <input type="text" id="level-video" value="${editItem ? editItem.videoUrl : ''}" placeholder="Ej: https://www.youtube.com/watch?v=dQw4w9WgXcQ" required>

                <label>Categoría / Tag:</label>
                <select id="level-tag">
                    <option value="LEGAL" ${editItem && editItem.tag === 'LEGAL' ? 'selected' : ''}>LEGAL</option>
                    <option value="ASSISTED" ${editItem && editItem.tag === 'ASSISTED' ? 'selected' : ''}>ASSISTED (CBF / Mod)</option>
                    <option value="IMPOSSIBLE" ${editItem && editItem.tag === 'IMPOSSIBLE' ? 'selected' : ''}>IMPOSSIBLE</option>
                </select>

                <button type="submit" class="btn-submit">${editItem ? 'Actualizar' : 'Guardar'} Nivel</button>
            </form>
        `;
        document.getElementById('form-level').addEventListener('submit', handleAddLevel);
    }
}

// FORM HANDLERS WITH SHIFT SYSTEM & DUPLICATE VALIDATION

function handleAddLevel(e) {
    e.preventDefault();
    const desiredRank = parseInt(document.getElementById('level-rank').value);
    const name = document.getElementById('level-name').value.trim();

    const currentList = dataStore.levels.filter(l => l.tab === currentTab);
    const isEditing = Boolean(editingItemId);
    const maxRankAllowed = isEditing ? currentList.length : currentList.length + 1;

    if (desiredRank < 1 || desiredRank > maxRankAllowed) {
        alert("No se puede poner ese número, pon otro!");
        return;
    }

    // Validar duplicado por nombre
    const duplicate = currentList.find(l => l.name.toLowerCase() === name.toLowerCase() && l.id !== editingItemId);
    if (duplicate) {
        alert("Ya existe un nivel registrado con este nombre en esta lista!");
        return;
    }

    if (isEditing) {
        const index = dataStore.levels.findIndex(l => l.id === editingItemId);
        const oldRank = dataStore.levels[index].rank;

        // Sistema de empuje al editar posición
        if (desiredRank !== oldRank) {
            dataStore.levels.filter(l => l.tab === currentTab && l.id !== editingItemId).forEach(l => {
                if (desiredRank < oldRank && l.rank >= desiredRank && l.rank < oldRank) {
                    l.rank += 1;
                } else if (desiredRank > oldRank && l.rank <= desiredRank && l.rank > oldRank) {
                    l.rank -= 1;
                }
            });
        }

        dataStore.levels[index] = {
            ...dataStore.levels[index],
            rank: desiredRank,
            name: name,
            creator: document.getElementById('level-creator').value,
            verifier: document.getElementById('level-verifier').value,
            videoUrl: document.getElementById('level-video').value,
            tag: document.getElementById('level-tag').value
        };
    } else {
        // Sistema de empuje al añadir nuevo
        dataStore.levels.filter(l => l.tab === currentTab).forEach(l => {
            if (l.rank >= desiredRank) l.rank += 1;
        });

        const newId = 'l' + Date.now();
        dataStore.levels.push({
            id: newId,
            rank: desiredRank,
            name: name,
            creator: document.getElementById('level-creator').value,
            verifier: document.getElementById('level-verifier').value,
            videoUrl: document.getElementById('level-video').value,
            tag: document.getElementById('level-tag').value,
            tab: currentTab
        });
        selectedItemId = newId;
    }

    editingItemId = null;
    dataStore.levels.sort((a, b) => a.rank - b.rank);
    renderContent();
    adminModal.classList.add('hidden');
}

function handleAddPlayer(e) {
    e.preventDefault();
    const desiredRank = parseInt(document.getElementById('player-rank').value);
    const name = document.getElementById('player-name').value.trim();

    const isEditing = Boolean(editingItemId);
    const maxRankAllowed = isEditing ? dataStore.topPlayers.length : dataStore.topPlayers.length + 1;

    if (desiredRank < 1 || desiredRank > maxRankAllowed) {
        alert("No se puede poner ese número, pon otro!");
        return;
    }

    // Validar duplicado por nombre
    const duplicate = dataStore.topPlayers.find(p => p.name.toLowerCase() === name.toLowerCase() && p.id !== editingItemId);
    if (duplicate) {
        alert("Ya existe un jugador registrado con este nombre!");
        return;
    }

    if (isEditing) {
        const index = dataStore.topPlayers.findIndex(p => p.id === editingItemId);
        const oldRank = dataStore.topPlayers[index].rank;

        // Sistema de empuje al editar posición
        if (desiredRank !== oldRank) {
            dataStore.topPlayers.filter(p => p.id !== editingItemId).forEach(p => {
                if (desiredRank < oldRank && p.rank >= desiredRank && p.rank < oldRank) {
                    p.rank += 1;
                } else if (desiredRank > oldRank && p.rank <= desiredRank && p.rank > oldRank) {
                    p.rank -= 1;
                }
            });
        }

        dataStore.topPlayers[index] = {
            ...dataStore.topPlayers[index],
            rank: desiredRank,
            name: name,
            points: parseInt(document.getElementById('player-points').value),
            hardest: document.getElementById('player-hardest').value,
            bllHardest: document.getElementById('player-bll-hardest').value,
            beaten: parseInt(document.getElementById('player-beaten').value),
            media: document.getElementById('player-media').value
        };
    } else {
        // Sistema de empuje al añadir nuevo
        dataStore.topPlayers.forEach(p => {
            if (p.rank >= desiredRank) p.rank += 1;
        });

        const newId = 'p' + Date.now();
        dataStore.topPlayers.push({
            id: newId,
            rank: desiredRank,
            name: name,
            points: parseInt(document.getElementById('player-points').value),
            hardest: document.getElementById('player-hardest').value,
            bllHardest: document.getElementById('player-bll-hardest').value,
            beaten: parseInt(document.getElementById('player-beaten').value),
            media: document.getElementById('player-media').value
        });
        selectedItemId = newId;
    }

    editingItemId = null;
    dataStore.topPlayers.sort((a, b) => a.rank - b.rank);
    renderContent();
    adminModal.classList.add('hidden');
}

function handleAddVerifier(e) {
    e.preventDefault();
    const desiredRank = parseInt(document.getElementById('ver-rank').value);
    const name = document.getElementById('ver-name').value.trim();

    const isEditing = Boolean(editingItemId);
    const maxRankAllowed = isEditing ? dataStore.verifiers.length : dataStore.verifiers.length + 1;

    if (desiredRank < 1 || desiredRank > maxRankAllowed) {
        alert("No se puede poner ese número, pon otro!");
        return;
    }

    // Validar duplicado por nombre
    const duplicate = dataStore.verifiers.find(v => v.name.toLowerCase() === name.toLowerCase() && v.id !== editingItemId);
    if (duplicate) {
        alert("Ya existe un verificador registrado con este nombre!");
        return;
    }

    if (isEditing) {
        const index = dataStore.verifiers.findIndex(v => v.id === editingItemId);
        const oldRank = dataStore.verifiers[index].rank;

        // Sistema de empuje al editar posición
        if (desiredRank !== oldRank) {
            dataStore.verifiers.filter(v => v.id !== editingItemId).forEach(v => {
                if (desiredRank < oldRank && v.rank >= desiredRank && v.rank < oldRank) {
                    v.rank += 1;
                } else if (desiredRank > oldRank && v.rank <= desiredRank && v.rank > oldRank) {
                    v.rank -= 1;
                }
            });
        }

        dataStore.verifiers[index] = {
            ...dataStore.verifiers[index],
            rank: desiredRank,
            name: name,
            points: parseInt(document.getElementById('ver-points').value),
            hardest: document.getElementById('ver-hardest').value,
            nextHardest: document.getElementById('ver-next-hardest').value,
            bllHardest: document.getElementById('ver-bll-hardest').value,
            completions: parseInt(document.getElementById('ver-completions').value)
        };
    } else {
        // Sistema de empuje al añadir nuevo
        dataStore.verifiers.forEach(v => {
            if (v.rank >= desiredRank) v.rank += 1;
        });

        const newId = 'v' + Date.now();
        dataStore.verifiers.push({
            id: newId,
            rank: desiredRank,
            name: name,
            points: parseInt(document.getElementById('ver-points').value),
            hardest: document.getElementById('ver-hardest').value,
            nextHardest: document.getElementById('ver-next-hardest').value,
            bllHardest: document.getElementById('ver-bll-hardest').value,
            completions: parseInt(document.getElementById('ver-completions').value)
        });
        selectedItemId = newId;
    }

    editingItemId = null;
    dataStore.verifiers.sort((a, b) => a.rank - b.rank);
    renderContent();
    adminModal.classList.add('hidden');
}

function handleAddDecorator(e) {
    e.preventDefault();
    const desiredRank = parseInt(document.getElementById('dec-rank').value);
    const name = document.getElementById('dec-name').value.trim();

    const isEditing = Boolean(editingItemId);
    const maxRankAllowed = isEditing ? dataStore.decorators.length : dataStore.decorators.length + 1;

    if (desiredRank < 1 || desiredRank > maxRankAllowed) {
        alert("No se puede poner ese número, pon otro!");
        return;
    }

    // Validar duplicado por nombre
    const duplicate = dataStore.decorators.find(d => d.name.toLowerCase() === name.toLowerCase() && d.id !== editingItemId);
    if (duplicate) {
        alert("Ya existe un decorador registrado con este nombre!");
        return;
    }

    if (isEditing) {
        const index = dataStore.decorators.findIndex(d => d.id === editingItemId);
        const oldRank = dataStore.decorators[index].rank;

        // Sistema de empuje al editar posición
        if (desiredRank !== oldRank) {
            dataStore.decorators.filter(d => d.id !== editingItemId).forEach(d => {
                if (desiredRank < oldRank && d.rank >= desiredRank && d.rank < oldRank) {
                    d.rank += 1;
                } else if (desiredRank > oldRank && d.rank <= desiredRank && d.rank > oldRank) {
                    d.rank -= 1;
                }
            });
        }

        dataStore.decorators[index] = {
            ...dataStore.decorators[index],
            rank: desiredRank,
            name: name,
            points: parseInt(document.getElementById('dec-points').value),
            nametag: document.getElementById('dec-nametag').value
        };
    } else {
        // Sistema de empuje al añadir nuevo
        dataStore.decorators.forEach(d => {
            if (d.rank >= desiredRank) d.rank += 1;
        });

        const newId = 'd' + Date.now();
        dataStore.decorators.push({
            id: newId,
            rank: desiredRank,
            name: name,
            points: parseInt(document.getElementById('dec-points').value),
            nametag: document.getElementById('dec-nametag').value
        });
        selectedItemId = newId;
    }

    editingItemId = null;
    dataStore.decorators.sort((a, b) => a.rank - b.rank);
    renderContent();
    adminModal.classList.add('hidden');
}
