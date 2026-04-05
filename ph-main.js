let allData = null;
let currentModule = null;
let currentConcept = null;

document.addEventListener('DOMContentLoaded', () => {
    fetch('ph-data.json')
        .then(res => {
            if (!res.ok) {
                throw new Error('فشل تحميل البيانات');
            }
            return res.json();
        })
        .then(data => {
            allData = data;
            renderModules(data.modules);
        })
        .catch(err => {
            console.error("خطأ:", err);
            const container = document.getElementById('modules-container');
            if (container) {
                container.innerHTML = `<div style="text-align: center; padding: 40px; color: #e74c3c;">
                    <p style="font-size: 1.2rem; margin-bottom: 10px;">عذراً، حدث خطأ في تحميل البيانات</p>
                    <p style="font-size: 0.9rem; color: #7f8c8d;">يرجى التحقق من اتصالك بالإنترنت وحاول مرة أخرى</p>
                </div>`;
            }
        });
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
    const targetView = document.getElementById(viewId);
    if (!targetView) {
        console.error('العرض المطلوب غير موجود:', viewId);
        return;
    }
    document.querySelectorAll('.view').forEach(el => { el.classList.remove('active'); el.classList.add('hidden'); });
    targetView.classList.remove('hidden');
    targetView.classList.add('active');
    window.scrollTo(0,0);
}

// ===== Search Functionality =====
let searchModal = null;
let searchInput = null;
let searchResults = null;

function initSearch() {
    searchModal = document.getElementById('search-modal');
    searchInput = document.getElementById('search-input');
    searchResults = document.getElementById('search-results');
    const searchBtn = document.getElementById('search-btn');

    // Open search on button click
    if (searchBtn) {
        searchBtn.addEventListener('click', openSearch);
    }

    // Search input listener
    if (searchInput) {
        searchInput.addEventListener('input', performSearch);
    }

    // Close search on ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && searchModal && !searchModal.classList.contains('hidden')) {
            closeSearch();
        }
        // Open search on Ctrl+K or Cmd+K
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            openSearch();
        }
    });

    // Close search when clicking outside
    if (searchModal) {
        searchModal.addEventListener('click', (e) => {
            if (e.target === searchModal) {
                closeSearch();
            }
        });
    }
}

function openSearch() {
    if (searchModal) {
        searchModal.classList.remove('hidden');
        if (searchInput) {
            searchInput.focus();
            searchInput.value = '';
            searchResults.innerHTML = '';
        }
    }
}

function closeSearch() {
    if (searchModal) {
        searchModal.classList.add('hidden');
    }
}

function performSearch() {
    const query = searchInput.value.trim().toLowerCase();
    
    if (!query) {
        searchResults.innerHTML = '';
        return;
    }

    if (!allData) {
        searchResults.innerHTML = '<div style="padding: 20px; text-align: center; color: #94a3b8;">جاري البحث...</div>';
        return;
    }

    const results = [];

    // Search in modules, concepts, axes, and theses
    allData.modules.forEach(module => {
        if (module.title.includes(query)) {
            results.push({
                type: 'module',
                title: module.title,
                subtitle: 'مجزوءة',
                data: module
            });
        }

        module.concepts.forEach(concept => {
            if (concept.title.includes(query)) {
                results.push({
                    type: 'concept',
                    title: concept.title,
                    subtitle: `مفهوم في ${module.title}`,
                    data: { concept, module }
                });
            }

            concept.axes.forEach(axis => {
                if (axis.title.includes(query) || axis.problem.includes(query)) {
                    results.push({
                        type: 'axis',
                        title: axis.title,
                        subtitle: `${concept.title} - ${module.title}`,
                        data: { axis, concept, module }
                    });
                }

                // Search in concepts definitions
                if (axis.concepts) {
                    axis.concepts.forEach(c => {
                        if (c.term.includes(query) || c.definition.includes(query)) {
                            results.push({
                                type: 'concept-def',
                                title: c.term,
                                subtitle: `مفهوم في ${axis.title}`,
                                data: { concept: c, axis, module }
                            });
                        }
                    });
                }

                // Search in theses
                if (axis.theses) {
                    axis.theses.forEach(thesis => {
                        if (thesis.philosopher.includes(query) || thesis.text.includes(query)) {
                            results.push({
                                type: 'thesis',
                                title: thesis.philosopher,
                                subtitle: `أطروحة في ${axis.title}`,
                                data: { thesis, axis, module }
                            });
                        }
                    });
                }
            });
        });
    });

    // Display results
    if (results.length === 0) {
        searchResults.innerHTML = '<div style="padding: 20px; text-align: center; color: #94a3b8;">لا توجد نتائج</div>';
    } else {
        searchResults.innerHTML = results.slice(0, 10).map((result, index) => `
            <div class="search-result-item" onclick="handleSearchResult(${index}, ${JSON.stringify(result).replace(/"/g, '&quot;')})">
                <div class="search-result-title">${result.title}</div>
                <div class="search-result-subtitle">${result.subtitle}</div>
            </div>
        `).join('');
    }
}

function handleSearchResult(index, result) {
    result = JSON.parse(JSON.stringify(result));
    closeSearch();

    if (result.type === 'module') {
        selectModule(result.data);
    } else if (result.type === 'concept') {
        selectModule(result.data.module);
        setTimeout(() => selectConcept(result.data.concept), 100);
    } else if (result.type === 'axis') {
        selectModule(result.data.module);
        setTimeout(() => selectConcept(result.data.concept), 100);
        setTimeout(() => openLesson(result.data.axis), 200);
    } else if (result.type === 'concept-def' || result.type === 'thesis') {
        selectModule(result.data.module);
        setTimeout(() => selectConcept(result.data.concept || result.data.axis.concepts?.[0]), 100);
        setTimeout(() => openLesson(result.data.axis), 200);
    }
}

// Initialize search when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initSearch();
});
