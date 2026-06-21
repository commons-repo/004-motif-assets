let motifDatabase = [];
let metadataDefinitions = {}; // Storage for global tooltip definitions lookup map
let activeFilters = {
    complexity: 'all',
    geometry: 'all',
    regional_origin: 'all'
};

document.addEventListener('DOMContentLoaded', () => {
    fetch('motifs_data.json')
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        })
        .then(payload => {
            motifDatabase = payload.database;
            metadataDefinitions = payload.metadata_definitions; // Unpack global definition maps
            renderMatrix();
            setupFilterEventListeners();
            injectDynamicOntologyTooltips(); // Bind OWL definitions directly to control elements
        })
        .catch(error => {
            console.error('Error fetching semantic matrix:', error);
            document.getElementById('matrix-rows').innerHTML = 
                '<div class="loading" style="color: #e74c3c;">Failed to initialize data stream. Ensure a local server is running.</div>';
        });
});

// Dynamic injection function reading straight from the ontology definitions payload
function injectDynamicOntologyTooltips() {
    // 1. Bind Upper-Level Category Definitions to H3 Section Headers
    const headers = document.querySelectorAll('h3[data-header-key]');
    headers.forEach(header => {
        const key = header.getAttribute('data-header-key');
        if (key && metadataDefinitions[key]) {
            header.setAttribute('title', metadataDefinitions[key]);
            header.style.cursor = 'help';
            header.style.borderBottom = '1px dotted #b0b0b0';
            header.style.display = 'inline-block';
        }
    });

    // 2. Bind Sub-Facet Definitions to Interactive Filter Buttons
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => {
        const value = btn.getAttribute('data-value');
        if (value && metadataDefinitions[value]) {
            btn.setAttribute('title', metadataDefinitions[value]);
        }
    });
}

function renderMatrix() {
    const container = document.getElementById('matrix-rows');
    container.innerHTML = '';

    // 1. Isolate entries matching the active sidebar filters
    const filteredRecords = motifDatabase.filter(motif => {
        const matchComplexity = activeFilters.complexity === 'all' || motif.classification.complexity === activeFilters.complexity;
        const matchGeometry = activeFilters.geometry === 'all' || motif.classification.geometry === activeFilters.geometry;
        const matchRegional = activeFilters.regional_origin === 'all' || motif.regional_origin === activeFilters.regional_origin;
        return matchComplexity && matchGeometry && matchRegional;
    });

    if (filteredRecords.length === 0) {
        container.innerHTML = '<div class="loading">No digital assets are currently available for the selected criteria.</div>';
        return;
    }

    // 2. Define custom sorting priority weights for each complexity class
    const complexityWeights = {
        'ElementaryMotif': 1,
        'SyntheticMotif': 2,
        'CombinatorialMotif': 3
    };

    // 3. Apply structural sorting logic before rendering rows
    filteredRecords.sort((a, b) => {
        const weightA = complexityWeights[a.classification.complexity] || 99;
        const weightB = complexityWeights[b.classification.complexity] || 99;

        // Primary Sort: Order strictly by Taxonomy Complexity Tier
        if (weightA !== weightB) {
            return weightA - weightB;
        }
        
        // Secondary Fallback: If complexity tiers match, sort alphabetically by ID name
        return a.id.localeCompare(b.id);
    });

    // 4. Build and append sorted matrix rows to the UI viewport container
    filteredRecords.forEach(motif => {
        const row = document.createElement('div');
        row.className = 'motif-row';

        const compTag = motif.classification.complexity.replace('Motif', '');
        const geoTag = motif.classification.geometry.replace('Geometry', '');
        const regionalTag = motif.regional_origin.replace('Motif', '');

        // Resolve local folder naming structure dynamically based on ontology records
        const regionFolder = motif.regional_origin === "AinuMotif" ? "ainu" : "ryukyu";
        const thumbnailPath = `motif_database/${regionFolder}/${motif.id}/preview/${motif.id}.png`;

        const uniqueTools = new Map();
        Object.values(motif.assets).forEach(asset => {
            if (asset.tool_id && !uniqueTools.has(asset.tool_id)) {
                const toolDefinition = metadataDefinitions[asset.tool_id] || "";
                uniqueTools.set(asset.tool_id, {
                    url: asset.tool_url,
                    doc: asset.tool_doc,
                    definition: toolDefinition
                });
            }
        });

        let toolsHtml = '';
        uniqueTools.forEach((info, id) => {
            toolsHtml += `
                <div style="margin-bottom: 0.8rem;">
                    <a href="${info.url}" target="_blank" rel="noopener" title="${info.definition}" style="display: block; font-weight: 500; text-decoration: none; color: #0369a1; font-size: 0.95rem; margin-bottom: 0.1rem;">${id}</a>
                    <a href="${info.doc}" target="_blank" rel="noopener" style="font-size: 0.8rem; color: #6c757d; text-decoration: none; display: inline-block; border-bottom: 1px dashed #cdc9c9;">[Documentation]</a>
                </div>
            `;
        });

        row.innerHTML = `
            <div class="motif-name" style="display: flex; flex-direction: column; align-items: flex-start; gap: 4px;">
                <span style="font-weight: 600; display: block; font-size: 1.05rem; color: #1e293b;">${motif.id}</span>
                <div style="font-size: 0.78rem; color: #6c757d; font-weight: normal; margin-bottom: 4px;">
                    Culture: ${regionalTag}
                </div>
                <img src="${thumbnailPath}" onerror="this.style.display='none';" alt="" style="width: 85px; height: auto; max-height: 85px; object-fit: contain; flex-shrink: 0; background: transparent; border: none;">
            </div>
            <div>
                <span class="tag" style="background-color: #e0f2fe; color: #0369a1; display: inline-block; margin-right: 4px; margin-bottom: 4px;">${compTag}</span>
                <span class="tag" style="background-color: #f0fdf4; color: #166534; display: inline-block;">${geoTag}</span>
            </div>
            <div class="desc-text">
                ${motif.cultural_context.narrative_meaning}
            </div>
            <div>${toolsHtml}</div>
            <div>
                <a href="${motif.assets.point_cloud.path}" class="download-btn" title="${motif.assets.point_cloud.definition}">⤓ Point (.zip)</a>
                <a href="${motif.assets.generative_code.path}" class="download-btn" title="${motif.assets.generative_code.definition}">⤓ Code (.zip)</a>
                <a href="${motif.assets.digital_abstraction.path}" class="download-btn" title="${motif.assets.digital_abstraction.definition}">⤓ Abstraction (.zip)</a>
            </div>

            <div>
                <div style="position: relative; width: 250px; height: 150px; margin: 0 auto; display: flex; align-items: center; justify-content: center; background-color: #f8f9fa; border: 1px solid var(--border-color); border-radius: 4px; overflow: hidden;">
                    <button onclick="changeGalleryImage('${motif.id}', -1)" style="position: absolute; left: 4px; background: rgba(44, 62, 80, 0.7); color: white; border: none; width: 22px; height: 22px; border-radius: 50%; cursor: pointer; font-weight: bold; font-size: 0.75rem; display: flex; align-items: center; justify-content: center; z-index: 5; user-select: none;">&lt;</button>
                    <img id="gallery-img-${motif.id}" data-motif-id="${motif.id}" src="motif_database/${regionFolder}/${motif.id}/preview_assets/1.png" onclick="openImageModal('${motif.id}', this.src)" onerror="handleGalleryError(this)" style="max-width: 100%; max-height: 100%; object-fit: contain; cursor: pointer; background: transparent;">
                    <button onclick="changeGalleryImage('${motif.id}', 1)" style="position: absolute; right: 4px; background: rgba(44, 62, 80, 0.7); color: white; border: none; width: 22px; height: 22px; border-radius: 50%; cursor: pointer; font-weight: bold; font-size: 0.75rem; display: flex; align-items: center; justify-content: center; z-index: 5; user-select: none;">&gt;</button>
                </div>
            </div>
        `;
        container.appendChild(row);
    });
}

function setupFilterEventListeners() {
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', (event) => {
            const targetedButton = event.target;
            const filterType = targetedButton.getAttribute('data-filter-type');
            const filterValue = targetedButton.getAttribute('data-value');

            document.querySelectorAll(`.filter-btn[data-filter-type="${filterType}"]`).forEach(b => b.classList.remove('active'));
            targetedButton.classList.add('active');

            activeFilters[filterType] = filterValue;
            renderMatrix();
        });
    });
}

/* ==========================================
   INTERACTIVE PREVIEW GALLERY FUNCTIONS
   ========================================== */

/* ==========================================
   INTERACTIVE PREVIEW GALLERY FUNCTIONS
   ========================================== */

// Global tracking register for the currently focused modal image
window.activeModalMotifId = null;

window.changeGalleryImage = (motifId, direction) => {
    if (!window.galleryStates) {
        window.galleryStates = {};
    }
    if (!window.galleryStates[motifId]) {
        const rowEl = document.getElementById(`gallery-img-${motifId}`)?.closest('.motif-row');
        const isAinu = rowEl?.innerHTML.includes('Culture: Ainu') || false;
        window.galleryStates[motifId] = { 
            current: 1, 
            region: isAinu ? "ainu" : "ryukyu" 
        };
    }

    const state = window.galleryStates[motifId];
    state.current += direction;
    if (state.current < 1) state.current = 1;
    
    const imgElement = document.getElementById(`gallery-img-${motifId}`);
    if (imgElement) {
        // Automatically extracts active file extension (.jpg or .png) dynamically
        const ext = imgElement.src.split('.').pop().split('?')[0];
        imgElement.src = `motif_database/${state.region}/${motifId}/preview_assets/${state.current}.${ext}`;
    }
};

window.handleGalleryError = (imgElement) => {
    const motifId = imgElement.getAttribute('data-motif-id');
    const state = window.galleryStates[motifId];
    
    if (state && state.current > 1) {
        state.current = 1;
        const ext = imgElement.src.split('.').pop().split('?')[0];
        const fallbackSrc = `motif_database/${state.region}/${motifId}/preview_assets/${state.current}.${ext}`;
        imgElement.src = fallbackSrc;

        // CRITICAL SYNC: If the modal is open, ensure the modal view loops back to 1 instantly on boundary overflow
        const modalImg = document.getElementById('modal-img');
        if (modalImg && window.activeModalMotifId === motifId) {
            modalImg.src = fallbackSrc;
        }
    } else {
        const container = imgElement.parentElement;
        if (container) {
            container.innerHTML = '<span style="font-size: 0.8rem; color: #94a3b8; font-style: italic;">N/A</span>';
        }
    }
};

window.openImageModal = (motifId, imgSrc) => {
    const modal = document.getElementById('gallery-modal');
    const modalImg = document.getElementById('modal-img');
    const modalTitle = document.getElementById('modal-title');
    
    if (modal && modalImg && modalTitle) {
        window.activeModalMotifId = motifId; // Lock in active ID
        modalTitle.textContent = `Motif Identifier: ${motifId}`;
        modalImg.src = imgSrc;
        modal.style.display = 'flex';
    }
};

window.closeImageModal = () => {
    const modal = document.getElementById('gallery-modal');
    if (modal) {
        modal.style.display = 'none';
        window.activeModalMotifId = null; // Clear focus register on close
    }
};

// NEW FUNCTION: Direct driving engine for the modal navigation arrows
window.changeModalImage = (direction) => {
    const motifId = window.activeModalMotifId;
    if (!motifId) return;

    // Trigger standard indexing logic
    window.changeGalleryImage(motifId, direction);

    // Grab the newly evaluated source URL from the matrix column and mirror it onto the popup view
    const inlineImg = document.getElementById(`gallery-img-${motifId}`);
    const modalImg = document.getElementById('modal-img');
    if (inlineImg && modalImg) {
        modalImg.src = inlineImg.src;
    }
};