```mermaid flowchart TD
  subgraph Client[Frontend]
    IDX[index.tsx]
    APP[App.tsx]
    ROUTER[React Router]
    IDX --> APP
    APP --> ROUTER
    ROUTER --> FD[pages/FatherDashboard.tsx]
    ROUTER --> MD[pages/MotherDashboard.tsx]
    ROUTER --> ONB[pages/OnboardingPage.tsx]
    ROUTER --> LND[pages/LandingPage.tsx]
    ROUTER --> ROLE[pages/RoleSelectionPage.tsx]
    FD --> TYPES((types.ts))
    MD --> TYPES
    FD --> CONSTS((constants.ts))
    MD --> CONSTS
    FD --> TRANS((translations.ts))
    MD --> TRANS
  end

  subgraph Services[Backend & Integrations]
    GEM[services/geminiService.ts]
    GENAI[@google/genai]
    GEM --> GENAI
  end

  subgraph Storage[Persistence]
    LS[localStorage: gratia_sync_code]
    APP <--> LS
    FD --> LS
    MD --> LS
  end

  subgraph Assets
    HTML[index.html]
    ICON[gratia.png]
    MANIFEST[manifest.json]
    HTML --> APP
    ICON --> HTML
    MANIFEST --> HTML
  end

  GEM --> FD
  GEM --> MD
  TILES[UI Components] --> FD
  TILES --> MD

  style Client fill:#f3fafe,stroke:#333
  style Services fill:#fff7ed,stroke:#333
  style Storage fill:#f0fff4,stroke:#333
  style Assets fill:#fff5f8,stroke:#333
```
