# Genius Vini — Der Pfälzer Weingeist

Eine multimodale Echtzeit-Sprachapplikation und kuratierte Wein-Enzyklopädie, die den *Genius Loci* der Pfälzer Weinberge als lebendige, audioreaktive Sommelier-Präsenz erfahrbar macht – ergänzt durch einen digitalen Weinkeller mit Taxonomie-Sammlung und das einsehbare **[CHRONOS-VIBE]** Prompt- & Architektur-Deck.

## User Review & Critical Decisions

> [!IMPORTANT]
> Die folgenden Produkt- und Architekturentscheidungen wurden auf Basis Ihrer Antworten festgelegt und bestimmen den Aufbau der Applikation:

- **Confirmed Decision 1 (Applikationsumfang & Chronos-Vibe)**: Wir entwickeln die vollständige, interaktive Web-Applikation **„Genius Vini“** inklusive Echtzeit-Sprachdialog und integrieren das angefragte Modul **[CHRONOS-VIBE]** als umschaltbares Architektur-, Prompt- und Telemetrie-Deck (zum Live-Einsehen, Kopieren und Testen der agilen Persona-Prompts und Audio-Engine-Parameter).
- **Confirmed Decision 2 (Datenhaltung & Weinkeller)**: Der digitale Weinkeller nutzt sofort verfügbaren lokalen Speicher (`localStorage`) und wird mit einem kuratierten Pfälzer Referenzbestand (u. a. *Forster Pechstein GG*, *Deidesheimer Kalkofen*, *Schweigener Sonnenberg Spätburgunder*, *Haardter Bürgergarten Scheurebe*) vorbefüllt, sodass Verkostungsnotizen, Bestandsänderungen und die Taxonomie-Sammlung ohne Login sofort erlebbar sind.
- **Confirmed Decision 3 (Kernmodule)**: Der Fokus liegt auf (1) dem **Echtzeit-Sprachdialog mit Persona-Umschalter und audioreaktivem Visualizer**, (2) dem **Digitalen Weinkeller mit Sammel-Taxonomie und Verkostungsnotizen** (inklusive Terroir-Grounding für Buntsandstein, Kalkmergel, Rotliegendes) sowie (3) dem **[CHRONOS-VIBE] Prompt-Inspektor**.
- **Open Choice / Empfohlener Standard (Text- & Push-to-Talk-Fallback)**: Neben dem bidirektionalen WebSocket-Mikrofon-Stream (`gemini-3.8-live`) stellen wir einen direkten Text- & Schnellfragen-Eingabekanal bereit, damit der Weingeist auch in lautstarken Umgebungen oder ohne Mikrofonfreigabe sofort mit Sprachausgabe und Tool-Grounding antwortet.

---

## 1. Overview & Core Concept

- **What It Does**: „Genius Vini“ verwandelt die Weinverkostung und Speisekarten-Beratung in ein dialogisches Ritual. Nutzer sprechen in Echtzeit (oder schreiben) mit dem Pfälzer Weingeist, wechseln nahtlos zwischen drei charakterstarken Sommelier-Personas, beobachten eine flüssige, auf Stimmfrequenzen und Weinfarbe reagierende Partikel-/Shader-Visualisierung und verwalten ihre verkosteten Jahrgänge in einem taxonomischen digitalen Weinkeller.
- **Target Audience / Persona**: Weinliebhaber, Gastronomie-Gäste und Entdecker der Pfälzer Weinkultur, die statt trockener Datenbanktabellen einen erzählerischen, sensorisch präzisen Begleiter suchen, sowie Entwickler/Architekten, die über das **[CHRONOS-VIBE]**-Modul die zugrundeliegende Prompt- und Audio-Pipeline inspizieren möchten.
- **Key Value**: Überwindung der klassischen, trägen STT-LLM-TTS-Kaskade durch direktes Server-gebrücktes Audio-Streaming (`gemini-3.8-live`) kombiniert mit halluzinationsfreiem Domain-Grounding (Tool-Zugriff auf reale Pfälzer VDP.Große Lagen, Bodenprofile, Säure-/Restzuckerwerte und den persönlichen Kellerbestand).

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Der Live-Weingeist (Sanctum & Audio-Konversation)**:
   - Im Zentrum des 1440px-Viewports schwebt der **Audioreaktive Weingeist-Orb** (Canvas-basierte, flüssige Frequenz- und Terroir-Visualisierung, deren Farbtemperatur sich dynamisch zwischen *Riesling-Gold*, *Spätburgunder-Rubin* und *Buntsandstein-Ocker* verschiebt).
   - Darunter wählt der Nutzer per Segmented Control die aktive **Persona-Matrix**:
     - *Dionysischer Witz* (Bacchantisch, geistreich, erzählerisch)
     - *Puristische Eleganz* (Weltgewandter Fine-Dining-Sommelier, präzise Sensorik, Code-Switching DE/EN)
     - *Pfälzer Urgestein* (Herzlicher Charme der Deutschen Weinstraße, bodenständig, tiefe Winzer-Weisheit)
   - Ein Klick auf **„Gespräch starten“** (oder Push-to-Talk / Text-Prompt) öffnet den bidirektionalen Stream. Während der Weingeist spricht oder über Function Calling Lagen-Daten abruft, werden unterhalb des Orbs das Live-Transkript sowie die abgerufenen **Terroir- & Lagen-Karten** (z. B. *Forster Pechstein – Basalt & Buntsandstein*) eingeblendet.
2. **Digitaler Weinkeller & Sammel-Taxonomie**:
   - Strukturierte Katalog-Ansicht des eigenen Bestands mit Filterung nach Rebsorte (*Riesling, Spätburgunder, Weiß-/Grauburgunder, Scheurebe, Dornfelder*), Terroir-Boden (*Buntsandstein, Kalkmergel, Basalt, Muschelkalk*) und Klassifikation (*VDP.Grosse Lage, VDP.Erste Lage, Ortswein*).
   - **Taxonomie-Fortschritt**: Visuelle Sammel-Matrix (inspiriert von klassischer Naturkunde-Taxonomie), die zeigt, welche Pfälzer Leit-Terroirs und Rebsorten bereits verkostet und katalogisiert wurden.
   - **Interaktive Verkostung & Bestandsführung**: Nutzer können Flaschen hinzufügen, den Flaschenbestand (`+1` / `-1` beim Entkorken) anpassen, strukturierte Verkostungsnotizen (Nase, Gaumen, Abgang, Jahrgangsbewertung, Trinkfenster) anlegen oder per Klick **„Mit dem Weingeist verkosten“** direkt in den Sprachdialog zu genau dieser Flasche springen.
3. **[CHRONOS-VIBE] Prompt- & Audio-Engine-Inspektor**:
   - Ein dedizierter Arbeitsbereich für das im Bericht genannte **[CHRONOS-VIBE]**-Modul: Zeigt die vollständige System-Prompt-Injektion der aktuellen Persona, die JSON-Schemata der Function-Calling-Tools (`queryPfalzTerroirDB`, `manageUserCellar`, `getFoodPairing`), die Audio-Pipeline-Konfiguration (16kHz PCM Input / 24kHz PCM Output, VAD & Interruption Handling) sowie einen Live-Prompt-Konfigurator mit One-Click-Copy.

### Visual Identity & Theme

- **Aesthetic Direction**: *Archival Cellar & Curatorial Luxury* (Kombination aus historischem Weinguts-Archiv, Naturstein-Textur und moderner editorischer Typografie ohne KI-Standard-Klischees).
- **Color Palette & Mood (60-30-10 Verteilung)**:
  - **60% Dominant Neutral Canvas**: Tiefes Keller-Schieferschwarz (`#0F0D0C` / `--background`) mit warmen Kalkstein-Oberflächen (`#181513`) für eine intime, kerzenbeleuchtete Verkostungs-Atmosphäre.
  - **30% Structural Surfaces & Typography**: Warmer Alabaster-Pergamentton (`#F5F0E6`) für Primärtext, gedämpfter Sandstein (`#A39B8B`) für Metadaten und feine 1px-Haarlinien-Trenner (`rgba(245, 240, 230, 0.09)`).
  - **10% Curatorial Accent Budget**: Edles **Riesling-Bernstein / Gold** (`#D4AF37`) für aktive Primäraktionen und **Spätburgunder-Karmesin** (`#8B1E24`) für Terroir- und Audio-Resonanz-Highlights.
- **Typography & Hierarchy (2+1 Font Rule)**:
  - *Display / Hero / Lagen-Namen*: **`Cormorant Garamond`** (charakterstarke, hochkontrastreiche Luxus-Serife für Weingüter, Lagen und Kapitelüberschriften; `clamp(2.25rem, 4vw, 3.5rem)` mit `text-wrap: balance`).
  - *Body Prose & UI Controls*: **`Plus Jakarta Sans`** (klare, moderne Lesbarkeit für Dialoge, Verkostungsnotizen und Navigation; 15px–16px).
  - *Data, Jahrgänge, Säurewerte & Chronos-Vibe Specs*: **`JetBrains Mono`** mit `tabular-nums` für Jahrgänge, Säure in `g/l`, Restzucker, Trinkfenster und Audio-Latenzen.
- **Component Styling & Layout**:
  - **Top Bar Contract**: Einzeiliger Header in drei Zonen mit `gap-8`:
    1. *Brand Wordmark*: `Genius Vini`
    2. *Navigation Links*: `Weingeist Live` · `Weinkeller` · `Terroir-Taxonomie` · `Chronos-Vibe`
    3. *Primary Action*: `Verkostung starten`
  - **Zero-Pill Discipline**: Alle Wein-Metadaten (Jahrgang, Lage, Bodenart, Säure, Alkoholgehalt) werden als ruhiger, ungeboxter Fließtext mit typografischen Trennern (`2021 · Forster Pechstein · Basalt & Buntsandstein · 7,8 g/l Säure`) dargestellt – keine bunten Pill-Badges. Interaktive Filter nutzen dezente Segmented Controls.
- **Interactive Feedback & Motion**:
  - Flüssiges 60fps-Canvas-Rendering für den Weingeist-Orb (reagiert in Echtzeit auf Mikrofon-Input-Amplitude und 24kHz-Modell-Output-Frequenzen).
  - Sanfte Übergänge (`<= 200ms`, `cubic-bezier(0.16, 1, 0.3, 1)`) beim Umschalten zwischen Personas, Keller-Filtern und Verkostungs-Drawer.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Bidirektionale Server-WebSocket-Brücke zur Gemini Live API (`gemini-3.8-live`) + Text/Audio-Hybrid**
  - *Chosen Approach*: Der Express-Server hält die sichere Verbindung zur Gemini Multimodal Live API (`gemini-3.8-live`) über das `@google/genai` SDK und streamt 16kHz PCM-Audio vom Browser-Mikrofon sowie 24kHz PCM-Audio-Antworten über einen lokalen WebSocket (`/ws/live`). Zusätzlich gibt es einen REST-Endpunkt (`/api/sommelier/consult` mit `gemini-3.8-flash`), falls der Nutzer Text-Prompts sendet oder ohne Mikrofon interagiert.
  - *Why*: Erfüllt das Kernversprechen einer verzögerungsfreien Konversation (<800ms Gefühl, Interruption Handling, natürlicher Stimmcharakter) bei gleichzeitiger 100%-Sicherheit des API-Schlüssels auf dem Server.
  - *Alternatives Considered*: Klassische Browser-WebSpeech-API (zu roboterhaft, keine echte Audio-zu-Audio-Intonation) oder reine Client-SDK-Aufrufe (unsicher, da der API-Key im Browser läge).
- **Decision 2: Deterministisches RAG-Grounding über Function Calling für Pfälzer Lagen & Keller-Bestand**
  - *Chosen Approach*: Sowohl in der Live-Session als auch im Text-Modus erhält das Modell Zugriff auf strukturierte Tools (`searchPfalzTerroir`, `getCellarInventory`, `logTastingNote`). Wenn der Nutzer nach einem *Forster Pechstein*, *Kallstadter Saumagen* oder seinen eigenen Vorräten fragt, liest das Modell echte analytische Parameter (Bodenprofil, Säurewerte, Trinkreife, Kellerbestand) aus der verifizierten Domänen-Datenbank.
  - *Why*: Verhindert Halluzinationen bei Jahrgängen, Säurewerten und Lagen-Klassifikationen, während die generative Sprachkraft für Poesie und Sensorik erhalten bleibt.
- **Decision 3: Sofort nutzbarer Lokaler Weinkeller mit Synchronisation zum Server-Tool-Kontext**
  - *Chosen Approach*: Der Weinkeller wird im Browser (`localStorage`) persistiert und bei jeder Session/Änderung an den Server-Kontext gespiegelt, sodass der Weingeist im Sprachdialog jederzeit weiß, welche Flaschen der Nutzer aktuell im Keller liegen hat.
  - *Why*: Sofortiges, reibungsloses Erlebnis ohne Registrierungs-Hürde, kombiniert mit voller Personalisierung im KI-Dialog.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

### Architecture & Component Diagram

```
┌───────────────────────────────────────────────────────────────────────────────────┐
│                           CLIENT (React 19 + Tailwind)                            │
│                                                                                   │
│  ┌─────────────────────────────────────────────────────────────────────────────┐  │
│  │ Top Bar:  Genius Vini   |  Weingeist · Weinkeller · Taxonomie · Chronos-Vibe│  │
│  └─────────────────────────────────────────────────────────────────────────────┘  │
│         │                         │                        │                      │
│         ▼                         ▼                        ▼                      │
│  ┌─────────────────────┐   ┌────────────────────┐   ┌──────────────────────────┐  │
│  │  Live Sanctum View  │   │ Digital Cellar &   │   │  [CHRONOS-VIBE] Studio   │  │
│  │  • Audio Orb Canvas │   │ Taxonomy View      │   │  • System Prompt Matrix  │  │
│  │  • Persona Switcher │   │ • Inventory Grid   │   │  • Tool Schema Inspector │  │
│  │  • Mic / PTT Stream │   │ • Terroir Matrix   │   │  • Live Latency & VAD    │  │
│  │  • Grounded Cards   │   │ • Tasting Journal  │   │    Architecture Deck     │  │
│  └─────────┬───────────┘   └─────────┬──────────┘   └──────────────────────────┘  │
│            │                         │                                            │
│  ┌─────────┴─────────────────────────┴─────────────────────────────────────────┐  │
│  │ Client State & Audio Engine (Web Audio API 16kHz In / 24kHz Gapless Out +   │  │
│  │ LocalStorage Cellar Store synced with Server Session)                       │  │
│  └─────────┬───────────────────────────────────────────┬───────────────────────┘  │
└────────────┼───────────────────────────────────────────┼──────────────────────────┘
             │ WebSocket (/ws/live)                      │ HTTP REST (/api/*)
             │ 16kHz PCM In / 24kHz PCM Out + Tool Events│ Cellar Sync & Text Consult
             ▼                                           ▼
┌───────────────────────────────────────────────────────────────────────────────────┐
│                         EXPRESS SERVER (Node.js + ws)                             │
│                                                                                   │
│  ┌───────────────────────────────────────┐   ┌─────────────────────────────────┐  │
│  │ Gemini Live Bridge (@google/genai)    │   │ Pfälzer Terroir & RAG Engine    │  │
│  │ • Model: gemini-3.8-live              │◄─►│ • VDP.Grosse Lagen Vector/Index │  │
│  │ • Text/Fallback: gemini-3.8-flash     │   │ • Buntsandstein/Kalkmergel Data │  │
│  │ • Dynamic Persona System Instruction  │   │ • User Cellar State Mirror      │  │
│  └───────────────────────────────────────┘   └─────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────────────────┘
```

### Data Model & State

1. **`WineBottle` (Keller-Bestand & Domänen-Referenz)**:
   - `id`, `name` (z. B. *Forster Pechstein Riesling GG*), `winery` (z. B. *Weingut Reichsrat von Buhl*), `vintage` (z. B. `2021`), `grape` (*Riesling*, *Spätburgunder*, *Weißburgunder*, *Grauburgunder*, *Scheurebe*, *Dornfelder*), `classification` (*VDP.Grosse Lage*, *VDP.Erste Lage*, *VDP.Ortswein*), `subregion` (*Mittelhaardt*, *Südliche Weinstraße*, *Zellertal*), `soilType` (*Basalt & Buntsandstein*, *Kalkmergel*, *Muschelkalk*, *Rotliegendes*), `acidityGL` (z. B. `7.9`), `residualSugarGL` (z. B. `3.2`), `alcoholPct` (z. B. `12.5`), `drinkingWindow` (`2024–2036`), `quantity` (Flaschenanzahl im Keller), `sensoryProfile` (Aromen & Struktur), `foodPairing` (Empfehlungen).
2. **`TastingNote` (Verkostungshistorie)**:
   - `id`, `bottleId`, `date`, `rating` (90–100 Punkte-Skala), `noseNotes`, `palateNotes`, `finishNotes`, `occasion`, `personaComment` (optionales Resümee des Weingeists).
3. **`PersonaConfig` (Die Persona-Matrix)**:
   - `id` (`dionysian` | `purist` | `pfalz_original`), `title`, `voiceName` (`Fenrir` | `Zephyr` | `Charon`), `systemInstruction`, `shaderPalette` (Primär-/Sekundärfarben für den Audio-Visualizer).

### Interactive Component & State Mapping

- **Persona-Umschalter (`dionysian` | `purist` | `pfalz_original`)**: Aktualisiert unmittelbar die Farbpalette des Audio-Shaders, die aktive System-Instruction im **[CHRONOS-VIBE]**-Inspektor und konfiguriert die Live-Session (inklusive passender Stimmfarbe `Zephyr`, `Fenrir` oder `Charon`).
- **Live-Sprachsteuerung (Start / Push-to-Talk / Unterbrechen)**:
  - Öffnet den `16kHz` Mikrofon-Capture-Stream und den `24kHz` Gapless-Playback-Scheduler (`nextStartTime`-Queueing).
  - Spricht der Nutzer während einer laufenden Antwort, erkennt die Live API das `interrupted`-Signal, leert sofort den Client-Audio-Buffer und lässt den Weingeist organisch auf den Einwurf reagieren.
  - Wenn der Weingeist im Gespräch ein Tool aufruft (`searchPfalzTerroir` oder `inspectUserCellar`), sendet der Server das Tool-Ergebnis parallel an den Client, sodass die passende **Lagen-Karte** oder **Keller-Flasche** live im Interface aufleuchtet.
- **Digitaler Weinkeller & Verkostungs-Modal**:
  - Filtert den Bestand verzögerungsfrei nach Rebsorte, Bodenart und Trinkreife.
  - Bietet vollständige CRUD-Handler zum Hinzufügen neuer Flaschen, Anpassen der Flaschenanzahl (`+` / `-` beim Entkorken), Erfassen neuer Verkostungsnotizen und Starten einer kontextgebundenen Sommelier-Beratung für jede Flasche.
- **Terroir-Taxonomie-Sammler**:
  - Berechnet automatisch den Sammel-Status über die verkosteten Flaschen und Lagen (z. B. *Mittelhaardt Buntsandstein-Meister*, *Südliche Weinstraße Kalkmergel-Kenner*) und erlaubt das direkte Inspizieren der geologischen Bodenprofile.
- **[CHRONOS-VIBE] Architektur- & Prompt-Inspektor**:
  - Interaktive Auswahl der Persona-Prompts, Live-Vorschau der injizierten Keller- und Terroir-Vektoren, Kopierfunktion für die System-Prompts und Echtzeit-Anzeige der aktiven Audio-Stream-Telemetrie.
