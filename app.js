// La contraseña que tú decidas para ser el único Admin
const MASTER_ADMIN_PASS = "bll2026admin"; 

// Datos locales por defecto si aún no conectas Supabase
let levelsDB = [
    { id: 1, position: 1, name: "Worry", creator: "Tú", verifier: "TopPlayer", status: "Legal", category: "main", points: 250, gd_id: "10101010", video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
    { id: 2, position: 2, name: "Layout Imposible", creator: "LayoutGod", verifier: "N/A", status: "Assisted", category: "main", points: 0, gd_id: "99999999", video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ" }
];

let currentCategory = 'main';

function renderLevels() {
    const container = document.getElementById("levels-container");
    container.innerHTML = "";

    const filtered = levelsDB
        .filter(l => l.category === currentCategory)
        .sort((a, b) => a.position - b.position);

    if (filtered.length === 0) {
        container.innerHTML = `<p style="padding:1rem; color:#94a1b2;">No hay niveles en esta lista aún.</p>`;
        return;
    }

    filtered.forEach(level => {
        const card = document.createElement("div");
        card.className = "level-card";
        card.onclick = () => loadDetails(level);
        card.innerHTML = `
            <span class="level-rank">#${level.position}</span>
            <div class="level-info">
                <h4>${level.name}</h4>
                <small>Por: ${level.creator}</small>
            </div>
            <span class="tag tag-${level.status.toLowerCase()}">${level.status}</span>
        `;
        container.appendChild(card);
    });

    loadDetails(filtered[0]);
}

function loadDetails(lvl) {
    if (!lvl) return;
    document.getElementById("det-title").innerText = `#${lvl.position} - ${lvl.name}`;
    document.getElementById("det-creator").innerText = lvl.creator;
    document.getElementById("det-verifier").innerText = lvl.verifier || 'N/A';
    document.getElementById("det-points").innerText = lvl.points;
    document.getElementById("det-gdid").innerText = `#${lvl.gd_id}`;
    document.getElementById("det-video").src = lvl.video_url;
    
    const tag = document.getElementById("det-status");
    tag.innerText = lvl.status;
    tag.className = `tag tag-${lvl.status.toLowerCase()}`;
}

function switchTab(cat) {
    currentCategory = cat;
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    document.getElementById("list-title").innerText = `${cat.toUpperCase()} List`;
    renderLevels();
}

/* Modal y Seguridad Admin */
function openAdminModal() { document.getElementById("admin-modal").style.display = "flex"; }
function closeAdminModal() { document.getElementById("admin-modal").style.display = "none"; }

function loginAdmin() {
    const input = document.getElementById("admin-pass-input").value;
    if (input === MASTER_ADMIN_PASS) {
        document.getElementById("login-form-wrapper").style.display = "none";
        document.getElementById("admin-panel-wrapper").style.display = "block";
    } else {
        alert("Contraseña incorrecta. Solo el dueño de BLL puede editar.");
    }
}

function saveLevel(e) {
    e.preventDefault();
    const pos = parseInt(document.getElementById("lvl-pos").value);
    const status = document.getElementById("lvl-status").value;
    
    // Cálculo de Puntos: Assisted = 0 Pts siempre
    let pts = 0;
    if (status === 'Legal') {
        pts = Math.max(5, 250 - (pos - 1) * 2);
    }

    const newLevel = {
        id: Date.now(),
        name: document.getElementById("lvl-name").value,
        creator: document.getElementById("lvl-creator").value,
        verifier: document.getElementById("lvl-verifier").value || "N/A",
        status: status,
        category: document.getElementById("lvl-category").value,
        position: pos,
        points: pts,
        gd_id: document.getElementById("lvl-gdid").value,
        video_url: formatYoutubeUrl(document.getElementById("lvl-video").value)
    };

    levelsDB.push(newLevel);
    alert("¡Nivel publicado exitosamente!");
    closeAdminModal();
    renderLevels();
}

function formatYoutubeUrl(url) {
    if (url.includes("watch?v=")) return `https://www.youtube.com/embed/${url.split("watch?v=")[1].split("&")[0]}`;
    if (url.includes("youtu.be/")) return `https://www.youtube.com/embed/${url.split("youtu.be/")[1].split("?")[0]}`;
    return url;
}

window.onload = renderLevels;
