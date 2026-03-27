let allData = null;
let currentModule = null;
let currentConcept = null;

document.addEventListener('DOMContentLoaded', () => {
    fetch('ph-data.json')
        .then(res => res.json())
        .then(data => {
            allData = data;
            renderModules(data.modules);
        })
        .catch(err => console.error("Error:", err));
});

// --- Level 1: Modules ---
function renderModules(modules) {
    const container = document.getElementById('modules-container');
    container.innerHTML = '';
    modules.forEach(module => {
        const card = document.createElement('div');
        card.className = 'module-card';
        card.innerHTML = `
            <div class="module-info"><h3>${module.title}</h3><p style="font-size:0.8rem; color:#64748b">${module.concepts.length} مفاهيم</p></div>
            <i class="fas fa-chevron-left" style="color:var(--primary)"></i>
        `;
        card.onclick = () => selectModule(module);
        container.appendChild(card);
    });
}

function selectModule(module) {
    currentModule = module;
    document.getElementById('selected-module-title').textContent = module.title;
    document.getElementById('header-title').textContent = module.title;
    
    const container = document.getElementById('concepts-container');
    container.innerHTML = '';
    module.concepts.forEach(concept => {
        const item = document.createElement('div');
        item.className = 'concept-item';
        item.innerHTML = `<h4>${concept.title}</h4><i class="fas fa-chevron-left"></i>`;
        item.onclick = () => selectConcept(concept);
        container.appendChild(item);
    });
    switchView('concepts-view');
}

// --- Level 2: Concepts ---
function selectConcept(concept) {
    currentConcept = concept;
    document.getElementById('selected-concept-title').textContent = concept.title;
    document.getElementById('header-title').textContent = concept.title;

    const container = document.getElementById('axes-container');
    container.innerHTML = '';
    concept.axes.forEach(axis => {
        const card = document.createElement('div');
        card.className = 'axis-card';
        card.innerHTML = `
            <div>
                <h3>${axis.title}</h3>
                <p style="font-size:0.85rem; color:#d97706; margin:5px 0 0 0"><i class="fas fa-question"></i> ${axis.problem}</p>
            </div>
            <i class="fas fa-chevron-left"></i>
        `;
        card.onclick = () => openLesson(axis);
        container.appendChild(card);
    });
    switchView('axes-view');
}

// --- Level 3: Full Lesson View ---
function openLesson(axis) {
    document.getElementById('header-title').textContent = axis.title;
    
    // 1. Build Breadcrumb
    const bc = document.getElementById('breadcrumb-nav');
    bc.innerHTML = `
        <div onclick="goToModules()" style="cursor:pointer">${currentModule.title}</div>
        <i class="fas fa-chevron-left"></i>
        <div onclick="goToConcepts()" style="cursor:pointer">${currentConcept.title}</div>
        <i class="fas fa-chevron-left"></i>
        <span>${axis.title}</span>
    `;

    // 2. Fill Problem
    document.getElementById('lesson-problem').textContent = axis.problem;

    // 3. Fill Concepts
    const conceptsContainer = document.getElementById('lesson-concepts');
    conceptsContainer.innerHTML = '';
    if (axis.concepts && axis.concepts.length > 0) {
        axis.concepts.forEach(c => {
            conceptsContainer.innerHTML += `
                <div class="concept-card-detail">
                    <span class="concept-term">${c.term}</span>
                    <p class="concept-def">${c.definition}</p>
                </div>
            `;
        });
    } else {
        conceptsContainer.innerHTML = '<p style="grid-column:1/-1; text-align:center; color:#94a3b8">لا توجد مفاهيم محددة.</p>';
    }

    // 4. Fill Theses
    const thesesContainer = document.getElementById('lesson-theses');
    thesesContainer.innerHTML = '';
    if (axis.theses && axis.theses.length > 0) {
        axis.theses.forEach(t => {
            // Extract quote if exists between {}
            let text = t.text;
            let quote = '';
            const quoteMatch = text.match(/\{([^}]+)\}/);
            if (quoteMatch) {
                quote = quoteMatch[0];
                text = text.replace(quote, '').trim();
                quote = quote.replace(/[{}]/g, '').trim();
            }

            thesesContainer.innerHTML += `
                <div class="thesis-card">
                    <span class="philosopher-tag">${t.philosopher}</span>
                    <div class="thesis-content">${text}</div>
                    ${quote ? `<span class="thesis-quote"><i class="fas fa-quote-right"></i> ${quote}</span>` : ''}
                </div>
            `;
        });
    } else {
        thesesContainer.innerHTML = '<p style="text-align:center; color:#94a3b8">لا توجد أطروحات مسجلة.</p>';
    }

    switchView('lesson-view');
}

function switchView(viewId) {
    document.querySelectorAll('.view').forEach(el => { el.classList.remove('active'); el.classList.add('hidden'); });
    document.getElementById(viewId).classList.remove('hidden');
    document.getElementById(viewId).classList.add('active');
    window.scrollTo(0,0);
}