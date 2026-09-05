// CONFIGURACIÓN SUPABASE
const SUPABASE_URL = 'https://odplxttonqezginqqtsh.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_VbXEFCQJvfFhPR0PCRurSQ_Gqpkayr1';

// Cliente de Supabase seguro (evita duplicar la declaración de la variable)
const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

if (!supabase) {
    console.error("Supabase no se cargó correctamente en el entorno global.");
}

// Estructura de datos global
let dataStore = {
    levels: [],
    topPlayers: [],
    verifiers: [],
    decorators: []
};

// Cargar datos
async function loadDataStore() {
    if (!supabase) return;
    try {
        const { data, error } = await supabase
            .from('bll_data')
            .select('data')
            .eq('id', 1)
            .single();

        if (error) throw error;
        if (data && data.data) {
            dataStore = {
                levels: data.data.levels || [],
                topPlayers: data.data.topPlayers || [],
                verifiers: data.data.verifiers || [],
                decorators: data.data.decorators || []
            };
        }
    } catch (e) {
        console.error('Error al cargar desde Supabase:', e);
    }
}

// Guardar datos
async function saveDataStore() {
    if (!supabase) return;
    try {
        const { error } = await supabase
            .from('bll_data')
            .update({ data: dataStore })
            .eq('id', 1);

        if (error) console.error('Error guardando en Supabase:', error);
    } catch (e) {
        console.error('Error en saveDataStore:', e);
    }
}

function formatYouTubeEmbedUrl(url) {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : url;
}

// State Management
let currentTab = 'main';
let selectedItemId = null;
let editingItemId = null;
let isAdminLoggedIn = false;

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

const tabTitles = {
    'main': 'Main List (Top 1-100)',
    'extended': 'Extended List',
    'legacy': 'Legacy List',
    'hot': 'HOT Levels',
    'top-players': 'Top Players Leaderboard',
    'verifiers': 'Verifiers Leaderboard',
    'decorators': 'Decorators Leaderboard'
};

document.addEventListener('DOMContentLoaded', async () => {
    await loadDataStore();
    initTabs();
    initAdminModal();
    initClickOutside();
    renderContent();
});

function initClickOutside() {
    document.addEventListener('click', (e) => {
        const isClickInsideCard = e.target.closest('.list-card');
        const isClickInsideAdmin = e.target.closest('#admin-modal') || e.target.closest('#open-admin-btn');
        const isClickInsideNav = e.target.closest('.nav-tab');
        const isClickInsideDetail = e.target.closest('#details-sidebar') || e.target.closest('#detail-card');

        if (!isClickInsideCard && !isClickInsideAdmin && !isClickInsideNav && !isClickInsideDetail) {
            clearSelection();
        }
    });
}

function clearSelection() {
    selectedItemId = null;
    editingItemId = null;
    document.querySelectorAll('.list-card').forEach(c => c.classList.remove('active'));
    
    if (detailCard) {
        detailCard.innerHTML = '<p class="select-prompt">Selecciona un elemento para ver detalles.</p>';
    }
    
    if (isAdminLoggedIn) {
        renderAdminPanel(currentTab, null);
    }
}

function initTabs() {
    navTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            navTabs.forEach(t => t.classList.remove('active'));
            const targetTab = e.currentTarget;
            targetTab.classList.add('active');
            
            currentTab = targetTab.getAttribute('data-tab');
            
            if (sectionTitle) {
                sectionTitle.textContent = tabTitles[currentTab] || 'Bodrio Level List';
            }
            
            selectedItemId = null;
            editingItemId = null;
            
            if (detailCard) {
                detailCard.innerHTML = '<p class="select-prompt">Selecciona un elemento para ver detalles.</p>';
            }
            
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
    return 'levels';
}

function shiftRanksOnInsert(targetList, newRank, ignoreId = null) {
    targetList.forEach(item => {
        if (item.id !== ignoreId && item.rank >= newRank) {
            item.rank += 1;
        }
    });
}

function reorderRanks(targetList) {
    targetList.sort((a, b) => a.rank - b.rank);
    targetList.forEach((item, index) => {
        item.rank = index + 1;
    });
}

function renderContent() {
    if (!listContainer) return;
    
    listContainer.innerHTML = '';
    let items = [];

    if (['main', 'extended', 'legacy', 'hot'].includes(currentTab)) {
        items = dataStore.levels ? dataStore.levels.filter(l => l.tab === currentTab) : [];
        items.sort((a, b) => a.rank - b.rank);
        renderLevelList(items);
    } else if (currentTab === 'top-players') {
        items = dataStore.topPlayers || [];
        items.sort((a, b) => a.rank - b.rank);
        renderPlayersList(items);
    } else if (currentTab === 'verifiers') {
        items = dataStore.verifiers || [];
        items.sort((a, b) => a.rank - b.rank);
        renderVerifiersList(items);
    } else if (currentTab === 'decorators') {
        items = dataStore.decorators || [];
        items.sort((a, b) => a.rank - b.rank);
        renderDecoratorsList(items);
    }

    if (items.length === 0) {
        listContainer.innerHTML = '<p style="color:#64748b; padding:20px; text-align:center;">No hay datos registrados en esta sección aún.</p>';
        if (detailCard) {
            detailCard.innerHTML = '<p class="select-prompt">Selecciona un elemento para ver detalles.</p>';
        }
    } else if (!selectedItemId && items.length > 0) {
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
    if (!item || !detailCard) return;
    selectedItemId = item.id;
    
    const category = getItemCategory();
    const items = category === 'levels' ? dataStore.levels.filter(l => l.tab === currentTab) : dataStore[category];
    const activeIndex = items.findIndex(i => i.id === item.id);
    
    if (listContainer) {
        const cards = Array.from(listContainer.children);
        cards.forEach(c => c.classList.remove('active'));
        if (cards[activeIndex]) cards[activeIndex].classList.add('active');
    }

    if (['main', 'extended', 'legacy', 'hot'].includes(currentTab)) {
        let badgeClass = 'badge-legal';
        if (item.tag === 'ASSISTED') badgeClass = 'badge-assisted';
        if (item.tag === 'IMPOSSIBLE') badgeClass = 'badge-impossible';

        let embedUrl = formatYouTubeEmbedUrl(item.videoUrl);

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

    if (isAdminLoggedIn) {
        renderAdminPanel(currentTab, selectedItemId);
    }
}

function initAdminModal() {
    if (!adminModal) return;

    openAdminBtn?.addEventListener('click', () => {
        adminModal.classList.remove('hidden');
        if (isAdminLoggedIn) {
            renderAdminPanel(currentTab, selectedItemId);
        }
    });

    closeAdminBtn?.addEventListener('click', () => {
        adminModal.classList.add('hidden');
    });

    adminLoginForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const pass = adminPassInput?.value;
        if (pass === 'G7!mR9#pL2$xQ4&wT8@vK') {
            isAdminLoggedIn = true;
            adminAuthView?.classList.add('hidden');
            adminDashView?.classList.remove('hidden');
            if (adminPassInput) adminPassInput.value = '';
            renderAdminPanel(currentTab, selectedItemId);
        } else {
            alert('Contraseña incorrecta');
        }
    });

    adminLogoutBtn?.addEventListener('click', () => {
        isAdminLoggedIn = false;
        adminDashView?.classList.add('hidden');
        adminAuthView?.classList.remove('hidden');
        adminModal.classList.add('hidden');
    });
}

function renderAdminPanel(tab, itemId) {
    if (!adminContentArea) return;

    const category = getItemCategory();
    let currentItem = null;

    if (selectedItemId) {
        if (category === 'levels') {
            currentItem = dataStore.levels.find(l => l.id === selectedItemId);
        } else {
            currentItem = dataStore[category].find(i => i.id === selectedItemId);
        }
    }

    if (['main', 'extended', 'legacy', 'hot'].includes(tab)) {
        renderLevelForm(currentItem, tab);
    } else if (tab === 'top-players') {
        renderPlayerForm(currentItem);
    } else if (tab === 'verifiers') {
        renderVerifierForm(currentItem);
    } else if (tab === 'decorators') {
        renderDecoratorForm(currentItem);
    }
}

function renderLevelForm(item, currentTab) {
    const isEdit = !!item;
    adminContentArea.innerHTML = `
        <h3>${isEdit ? 'Editar Nivel: ' + item.name : 'Añadir Nuevo Nivel'}</h3>
        <form id="admin-level-form">
            <label>Nombre del Nivel</label>
            <input type="text" id="level-name" value="${item ? item.name : ''}" required>

            <label>Posición / Rank (#)</label>
            <input type="number" id="level-rank" value="${item ? item.rank : 1}" min="1" required>

            <label>Creador</label>
            <input type="text" id="level-creator" value="${item ? item.creator : ''}" required>

            <label>Verificador</label>
            <input type="text" id="level-verifier" value="${item ? item.verifier : ''}" required>

            <label>URL del Video (YouTube)</label>
            <input type="url" id="level-video" value="${item ? item.videoUrl : ''}" placeholder="https://www.youtube.com/watch?v=..." required>

            <label>Etiqueta / Tag</label>
            <select id="level-tag">
                <option value="LEGAL" ${item && item.tag === 'LEGAL' ? 'selected' : ''}>LEGAL</option>
                <option value="ASSISTED" ${item && item.tag === 'ASSISTED' ? 'selected' : ''}>ASSISTED</option>
                <option value="IMPOSSIBLE" ${item && item.tag === 'IMPOSSIBLE' ? 'selected' : ''}>IMPOSSIBLE</option>
            </select>

            <button type="submit" class="btn-submit">${isEdit ? 'Guardar Cambios' : 'Añadir Nivel'}</button>
            ${isEdit ? `<button type="button" id="btn-delete-item" class="btn-secondary" style="background:#dc2626; margin-top:8px;">Eliminar Nivel</button>` : ''}
        </form>
    `;

    document.getElementById('admin-level-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('level-name').value;
        const rank = parseInt(document.getElementById('level-rank').value);
        const creator = document.getElementById('level-creator').value;
        const verifier = document.getElementById('level-verifier').value;
        const videoUrl = document.getElementById('level-video').value;
        const tag = document.getElementById('level-tag').value;

        if (!dataStore.levels) dataStore.levels = [];
        const currentCategoryLevels = dataStore.levels.filter(l => l.tab === currentTab);

        if (isEdit) {
            if (item.rank !== rank) {
                shiftRanksOnInsert(currentCategoryLevels, rank, item.id);
            }
            item.name = name;
            item.rank = rank;
            item.creator = creator;
            item.verifier = verifier;
            item.videoUrl = videoUrl;
            item.tag = tag;
        } else {
            shiftRanksOnInsert(currentCategoryLevels, rank);
            const newLevel = {
                id: 'l' + Date.now(),
                rank,
                name,
                creator,
                verifier,
                videoUrl,
                tag,
                tab: currentTab
            };
            dataStore.levels.push(newLevel);
        }

        reorderRanks(currentCategoryLevels);
        await saveDataStore();
        renderContent();
        if(adminModal) adminModal.classList.add('hidden');
    });

    if (isEdit) {
        document.getElementById('btn-delete-item')?.addEventListener('click', async () => {
            if (confirm(`¿Seguro que deseas eliminar "${item.name}"?`)) {
                dataStore.levels = dataStore.levels.filter(l => l.id !== item.id);
                reorderRanks(dataStore.levels.filter(l => l.tab === currentTab));
                await saveDataStore();
                clearSelection();
                renderContent();
                if(adminModal) adminModal.classList.add('hidden');
            }
        });
    }
}

function renderPlayerForm(item) {
    const isEdit = !!item;
    adminContentArea.innerHTML = `
        <h3>${isEdit ? 'Editar Jugador: ' + item.name : 'Añadir Nuevo Jugador'}</h3>
        <form id="admin-player-form">
            <label>Nombre del Jugador</label>
            <input type="text" id="player-name" value="${item ? item.name : ''}" required>

            <label>Posición / Rank (#)</label>
            <input type="number" id="player-rank" value="${item ? item.rank : 1}" min="1" required>

            <label>Puntos (Points)</label>
            <input type="number" id="player-points" value="${item ? item.points : 0}" required>

            <label>Hardest (Global)</label>
            <input type="text" id="player-hardest" value="${item ? item.hardest : ''}" required>

            <label>BLL Hardest</label>
            <input type="text" id="player-bll-hardest" value="${item ? item.bllHardest : ''}" required>

            <label>Niveles Pasados (Total Beaten)</label>
            <input type="number" id="player-beaten" value="${item ? item.beaten : 0}" required>

            <label>Enlace a YouTube / Media</label>
            <input type="url" id="player-media" value="${item ? item.media : ''}">

            <button type="submit" class="btn-submit">${isEdit ? 'Guardar Cambios' : 'Añadir Jugador'}</button>
            ${isEdit ? `<button type="button" id="btn-delete-item" class="btn-secondary" style="background:#dc2626; margin-top:8px;">Eliminar Jugador</button>` : ''}
        </form>
    `;

    document.getElementById('admin-player-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('player-name').value;
        const rank = parseInt(document.getElementById('player-rank').value);
        const points = parseInt(document.getElementById('player-points').value);
        const hardest = document.getElementById('player-hardest').value;
        const bllHardest = document.getElementById('player-bll-hardest').value;
        const beaten = parseInt(document.getElementById('player-beaten').value);
        const media = document.getElementById('player-media').value;

        if (!dataStore.topPlayers) dataStore.topPlayers = [];

        if (isEdit) {
            if (item.rank !== rank) {
                shiftRanksOnInsert(dataStore.topPlayers, rank, item.id);
            }
            item.name = name;
            item.rank = rank;
            item.points = points;
            item.hardest = hardest;
            item.bllHardest = bllHardest;
            item.beaten = beaten;
            item.media = media;
        } else {
            shiftRanksOnInsert(dataStore.topPlayers, rank);
            dataStore.topPlayers.push({
                id: 'p' + Date.now(),
                rank, name, points, hardest, bllHardest, beaten, media
            });
        }

        reorderRanks(dataStore.topPlayers);
        await saveDataStore();
        renderContent();
        if(adminModal) adminModal.classList.add('hidden');
    });

    if (isEdit) {
        document.getElementById('btn-delete-item')?.addEventListener('click', async () => {
            if (confirm(`¿Seguro que deseas eliminar a "${item.name}"?`)) {
                dataStore.topPlayers = dataStore.topPlayers.filter(p => p.id !== item.id);
                reorderRanks(dataStore.topPlayers);
                await saveDataStore();
                clearSelection();
                renderContent();
                if(adminModal) adminModal.classList.add('hidden');
            }
        });
    }
}

function renderVerifierForm(item) {
    const isEdit = !!item;
    adminContentArea.innerHTML = `
        <h3>${isEdit ? 'Editar Verificador: ' + item.name : 'Añadir Verificador'}</h3>
        <form id="admin-verifier-form">
            <label>Nombre</label>
            <input type="text" id="ver-name" value="${item ? item.name : ''}" required>

            <label>Rank (#)</label>
            <input type="number" id="ver-rank" value="${item ? item.rank : 1}" required>

            <label>Puntos</label>
            <input type="number" id="ver-points" value="${item ? item.points : 0}" required>

            <label>Hardest</label>
            <input type="text" id="ver-hardest" value="${item ? item.hardest : ''}" required>

            <label>Niveles BLL Verificados</label>
            <input type="number" id="ver-completions" value="${item ? item.completions : 0}" required>

            <button type="submit" class="btn-submit">${isEdit ? 'Guardar Cambios' : 'Añadir Verificador'}</button>
            ${isEdit ? `<button type="button" id="btn-delete-item" class="btn-secondary" style="background:#dc2626; margin-top:8px;">Eliminar</button>` : ''}
        </form>
    `;

    document.getElementById('admin-verifier-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const rank = parseInt(document.getElementById('ver-rank').value);
        if (!dataStore.verifiers) dataStore.verifiers = [];

        if (isEdit) {
            if (item.rank !== rank) {
                shiftRanksOnInsert(dataStore.verifiers, rank, item.id);
            }
            item.name = document.getElementById('ver-name').value;
            item.rank = rank;
            item.points = parseInt(document.getElementById('ver-points').value);
            item.hardest = document.getElementById('ver-hardest').value;
            item.completions = parseInt(document.getElementById('ver-completions').value);
        } else {
            shiftRanksOnInsert(dataStore.verifiers, rank);
            dataStore.verifiers.push({
                id: 'v' + Date.now(),
                rank,
                name: document.getElementById('ver-name').value,
                points: parseInt(document.getElementById('ver-points').value),
                hardest: document.getElementById('ver-hardest').value,
                completions: parseInt(document.getElementById('ver-completions').value)
            });
        }
        reorderRanks(dataStore.verifiers);
        await saveDataStore();
        renderContent();
        if(adminModal) adminModal.classList.add('hidden');
    });

    if (isEdit) {
        document.getElementById('btn-delete-item')?.addEventListener('click', async () => {
            if (confirm(`¿Seguro que deseas eliminar a "${item.name}"?`)) {
                dataStore.verifiers = dataStore.verifiers.filter(v => v.id !== item.id);
                reorderRanks(dataStore.verifiers);
                await saveDataStore();
                clearSelection();
                renderContent();
                if(adminModal) adminModal.classList.add('hidden');
            }
        });
    }
}

function renderDecoratorForm(item) {
    const isEdit = !!item;
    adminContentArea.innerHTML = `
        <h3>${isEdit ? 'Editar Decorador: ' + item.name : 'Añadir Decorador'}</h3>
        <form id="admin-decorator-form">
            <label>Nombre</label>
            <input type="text" id="dec-name" value="${item ? item.name : ''}" required>

            <label>Rank (#)</label>
            <input type="number" id="dec-rank" value="${item ? item.rank : 1}" required>

            <label>Puntos</label>
            <input type="number" id="dec-points" value="${item ? item.points : 0}" required>

            <label>Nametag en GD</label>
            <input type="text" id="dec-tag" value="${item ? item.nametag : ''}" required>

            <button type="submit" class="btn-submit">${isEdit ? 'Guardar Cambios' : 'Añadir Decorador'}</button>
            ${isEdit ? `<button type="button" id="btn-delete-item" class="btn-secondary" style="background:#dc2626; margin-top:8px;">Eliminar</button>` : ''}
        </form>
    `;

    document.getElementById('admin-decorator-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const rank = parseInt(document.getElementById('dec-rank').value);
        if (!dataStore.decorators) dataStore.decorators = [];

        if (isEdit) {
            if (item.rank !== rank) {
                shiftRanksOnInsert(dataStore.decorators, rank, item.id);
            }
            item.name = document.getElementById('dec-name').value;
            item.rank = rank;
            item.points = parseInt(document.getElementById('dec-points').value);
            item.nametag = document.getElementById('dec-tag').value;
        } else {
            shiftRanksOnInsert(dataStore.decorators, rank);
            dataStore.decorators.push({
                id: 'd' + Date.now(),
                rank,
                name: document.getElementById('dec-name').value,
                points: parseInt(document.getElementById('dec-points').value),
                nametag: document.getElementById('dec-tag').value
            });
        }
        reorderRanks(dataStore.decorators);
        await saveDataStore();
        renderContent();
        if(adminModal) adminModal.classList.add('hidden');
    });

    if (isEdit) {
        document.getElementById('btn-delete-item')?.addEventListener('click', async () => {
            if (confirm(`¿Seguro que deseas eliminar a "${item.name}"?`)) {
                dataStore.decorators = dataStore.decorators.filter(d => d.id !== item.id);
                reorderRanks(dataStore.decorators);
                await saveDataStore();
                clearSelection();
                renderContent();
                if(adminModal) adminModal.classList.add('hidden');
            }
        });
    }
}
