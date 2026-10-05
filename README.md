# Semantically Connected CAD Assets from Cultural Motifs
**A study by the [Advanced Manufacturing Engineering Laboratory, Kitami Institute of Technology, Japan](https://kit-amel.jp)**

## Overview
This repository hosts a public dataset, semantic ontology, and CAD assets generated from the digitization of traditional cultural motifs, with Ainu motifs as the primary case. The objective is to provide open access to the digital-asset pipeline, support methodological reproducibility, and facilitate the reuse of heritage designs in contemporary design and manufacturing workflows.

## Digital Asset Portal
An interactive dashboard for exploring, filtering, and directly retrieving these CAD assets is actively deployed and accessible at:
[https://commons-repo.github.io/004-motif-assets/](https://commons-repo.github.io/004-motif-assets/)

## Repository Contents
The dataset includes the following components:
* **Point Representations:** Ordered coordinate datasets generated from motif references.
* **Rendering Code:** Rendering scripts utilizing OpenSCAD.
* **CAD Assets:** CAD-compatible two-dimensional (SVG, DXF) and three-dimensional (STL, OBJ, 3MF) files.
* **Semantic and Cultural Context:** Cultural meaning and context of motifs.
* **Semantic Ontology:** A custom Web Ontology Language (OWL) database mapping the non-linear relationships between motif taxonomy, cultural semantics, and the generated CAD assets.

## Project Structure
The repository is organized to separate the web deployment logic, the ontological schema, and the core motif databases:

```text
.
├── ainu_motifs_complete.owl    # Core OWL-based semantic ontology database
├── motifs_data.json            # Serialized JSON payload for the web dashboard
├── index.html                  # Dashboard UI entry point
├── app.js                      # Client-side data fetching and rendering script
├── style.css                   # Dashboard stylesheet
└── motif_database/             # Comprehensive digital asset archives
    ├── ryukyu/                 # Repository placeholder for Ryukyu motif integration
    └── ainu/                   # Traditional Ainu motif collection (13 structural instances)
        ├── Apapo-Piras(u)ke/   # Individual motif root directory
        │   ├── code/                   # OpenSCAD template and rendering scripts
        │   ├── digital_abstraction/    # Generated SVG, DXF, STL, OBJ, and 3MF files
        │   ├── point/                  # Ordered point-coordinate files (.txt)
        │   ├── preview/                # Visual rendering previews
        │   └── preview_assets/         # Sub-components for visual previews
        ├── Ayus/               
        ├── C1/ ... C6/         # Combinatorial motif instances
        ├── Heart-Shape/        
        ├── Morew/              
        ├── Sik/                
        ├── Sik-Uren-Morew/     
        └── Uren-Morew/
