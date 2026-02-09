flowchart TD
  subgraph Client[Frontend]
    IDX[index.tsx]\n    APP[App.tsx]
    ROUTER[React Router]
    IDX --> APP --> ROUTER
    ROUTER --> FD[pages/FatherDashboard.tsx]
    ROUTER --> MD[pages/MotherDashboard.tsx]
    ROUTER --> ONB[pages/OnboardingPage.tsx]
    ROUTER --> LND[pages/LandingPage.tsx]
    ROUTER --> ROLE[pages/RoleSelectionPage.tsx]
    FD -->|uses| TYPES((types.ts))
    MD -->|uses| TYPES
    FD -->|uses| CONSTS((constants.ts))
    MD -->|uses| CONSTS
    FD -->|uses| TRANS((translations.ts))
    MD -->|uses| TRANS
  end

  subgraph Services[Backend & Integrations]
    GEM[services/geminiService.ts]
    GEM -->|calls| GENAI[@google/genai]
  end

  subgraph Storage[Persistence]
    APP -->|reads/writes| LS[localStorage via key gratia_sync_<pairingCode>]
    FD -->|updates| LS
    MD -->|updates| LS
  end

  subgraph Assets
    HTML[index.html]
    ICON[gratia.png]
    MANIFEST[manifest.json]
    HTML --> APP
    ICON --> HTML
    MANIFEST --> HTML
  end

  GEM -->|used by| FD
  GEM -->|used by| MD
  TILES[UI Components & Icons] --> FD
  TILES --> MD

  style Client fill:#f3fafe,stroke:#333,stroke-width:1px
  style Services fill:#fff7ed,stroke:#333
  style Storage fill:#f0fff4,stroke:#333
  style Assets fill:#fff5f8,stroke:#333
