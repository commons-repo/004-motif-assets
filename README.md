# Open Data of Digital Assets Derived From Physical Motifs
**A study by the [Advanced Manufacturing Engineering Laboratory, Kitami Institute of Technology, Japan] (https://www.kit-amel.jp/)**

## Overview
This repository hosts the public dataset, semantic ontology, and digital abstractions generated from the digitization of traditional physical cultural motifs (specifically Ainu motifs). The objective is to provide open access to the complete digital asset pipeline, ensuring methodological reproducibility and facilitating the functional reuse of heritage designs in contemporary manufacturing workflows.

## Digital Asset Portal
An interactive dashboard for exploring, filtering, and directly retrieving these digital assets is actively deployed and accessible at:
[https://commons-repo.github.io/004-motif-assets/](https://commons-repo.github.io/004-motif-assets/)

## Repository Contents
The dataset includes the following components:
* **Point Clouds:** Foundational coordinate datasets extracted from physical artifacts.
* **Generative Code:** Rendering scripts utilizing OpenSCAD.
* **Digital Abstractions:** Manufacturing-ready two-dimensional (SVG, DXF) and three-dimensional (STL, OBJ, 3MF) files.
* **Semantic Ontology:** A custom Web Ontology Language (OWL) database mapping the non-linear relationships between motif taxonomy, cultural semantics, and the derived digital abstractions.

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
        │   ├── code/                   # OpenSCAD template, scripts, and coordinate arrays
        │   ├── digital_abstraction/    # Exported 2D vector layouts and 3D solid meshes
        │   ├── point/                  # Raw point-cloud coordinate text files (.txt)
        │   ├── preview/                # Visual rendering previews
        │   └── preview_assets/         # Sub-components for visual previews
        ├── Ayus/               
        ├── C1/ ... C6/         # Combinatorial motif instances
        ├── Heart-Shape/        
        ├── Morew/              
        ├── Sik/                
        ├── Sik-Uren-Morew/     
        └── Uren-Morew/
