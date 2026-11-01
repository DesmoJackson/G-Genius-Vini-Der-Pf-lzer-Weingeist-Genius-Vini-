import React, { useState } from 'react';
import { Copy, Check, Cpu, Sliders, Terminal } from 'lucide-react';
import {
  ChronosVibeOptions,
  PERSONA_MATRIX,
  PersonaId,
  WineBottle,
  buildChronosVibeSystemPrompt,
} from '../data/pfalzDomain';

interface ChronosVibeViewProps {
  personaId: PersonaId;
  onSelectPersona: (id: PersonaId) => void;
  cellarBottles: WineBottle[];
  activeBottle: WineBottle | null;
  promptOptions: ChronosVibeOptions;
  onUpdatePromptOptions: (options: ChronosVibeOptions) => void;
  onApplyAndLaunchLive: () => void;
}

const TOOL_SCHEMAS_JSON = JSON.stringify(
  [
    {
      name: 'searchPfalzTerroir',
      description:
        'Durchsucht die verifizierte Pfälzer Terroir-, Geologie- und VDP.Grosse-Lagen-Datenbank (Buntsandstein, Kalkmergel, Basalt/Pechstein, Muschelkalk, Rotliegendes sowie analytische Säure- und Restzuckerwerte).',
      parameters: {
        type: 'OBJECT',
        properties: {
          query: {
            type: 'STRING',
            description:
              'Suchbegriff wie Lagenname (Pechstein, Kalkofen, Saumagen, Sonnenberg), Rebsorte oder Bodenart.',
          },
        },
        required: ['query'],
      },
    },
    {
      name: 'inspectUserCellar',
      description:
        'Prüft den aktuellen digitalen Weinkeller des Nutzers nach vorrätigen Flaschen, Trinkfenstern oder passenden Speisenbegleitungen (Food Pairing).',
      parameters: {
        type: 'OBJECT',
        properties: {
          filterOrDish: {
            type: 'STRING',
            description:
              'Optionales Gericht (z.B. Steinbutt, Rehrücken, Saumagen) oder Rebsorte zur Abstimmung mit dem Kellerbestand.',
          },
        },
        required: ['filterOrDish'],
      },
    },
    {
      name: 'recordTastingImpression',
      description:
        'Speichert eine neue Verkostungsnotiz oder Bewertung (85-100 Punkte) für einen Wein im digitalen Weinkeller des Nutzers.',
      parameters: {
        type: 'OBJECT',
        properties: {
          wineName: { type: 'STRING' },
          rating: { type: 'NUMBER' },
          sensorySummary: { type: 'STRING' },
        },
        required: ['wineName', 'rating', 'sensorySummary'],
      },
    },
  ],
  null,
  2
);

export const ChronosVibeView: React.FC<ChronosVibeViewProps> = ({
  personaId,
  onSelectPersona,
  cellarBottles,
  activeBottle,
  promptOptions,
  onUpdatePromptOptions,
  onApplyAndLaunchLive,
}) => {
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedSchema, setCopiedSchema] = useState(false);

  const compiledPrompt = buildChronosVibeSystemPrompt(
    personaId,
    cellarBottles,
    activeBottle,
    promptOptions
  );

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(compiledPrompt);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleCopySchema = async () => {
    try {
      await navigator.clipboard.writeText(TOOL_SCHEMAS_JSON);
      setCopiedSchema(true);
      setTimeout(() => setCopiedSchema(false), 2000);
    } catch {
      // fallback
    }
  };

  const toggleOption = (key: keyof ChronosVibeOptions) => {
    onUpdatePromptOptions({
      ...promptOptions,
      [key]: !promptOptions[key],
    });
  };

  return (
    <div className="space-y-10">
      {/* Header Banner */}
      <section className="bg-[#181513] border border-[#F5F0E6]/10 rounded-xl p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] font-mono-tabular">
            Modul Chronos-Vibe · Agile Prompt- & Audio-Engine-Logik
          </p>
          <h1 className="text-3xl sm:text-4xl font-serif-display font-semibold text-[#F5F0E6] mt-1 text-balance">
            Persona-Orchestrierung & Multimodal Live Architektur
          </h1>
          <p className="text-sm text-[#A39B8B] mt-2 max-w-3xl leading-relaxed">
            Hier konfigurieren und exportieren Sie die System-Prompt-Matrix, die
            direkt in die bidirektionale Gemini Multimodal Live Pipeline (
            <span className="font-mono-tabular text-[#F5F0E6]">gemini-3.8-live</span>)
            und die RAG-Function-Calling-Brücke injiziert wird.
          </p>
        </div>

        <button
          type="button"
          onClick={onApplyAndLaunchLive}
          className="px-5 py-3 rounded-lg bg-[#D4AF37] text-[#0F0D0C] font-semibold text-xs hover:bg-[#e0bd42] transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 self-start lg:self-auto"
        >
          <Cpu className="w-4 h-4" />
          <span>Konfiguration im Live-Sanctum testen</span>
        </button>
      </section>

      {/* Configuration Controls & Live System Prompt Output */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 5 Columns: Persona & Prompt Module Toggles */}
        <div className="lg:col-span-5 bg-[#181513] border border-[#F5F0E6]/10 rounded-xl p-6 space-y-6">
          <div className="pb-4 border-b border-[#F5F0E6]/10 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#D4AF37]" />
            <h2 className="text-xl font-serif-display font-semibold text-[#F5F0E6]">
              01. Persona- & Direktiven-Steuerung
            </h2>
          </div>

          {/* Persona Selector */}
          <div className="space-y-2">
            <label className="block text-xs text-[#A39B8B]">
              Aktive Sommelier-Persona & Stimm-Archetyp:
            </label>
            <div className="space-y-2">
              {(Object.keys(PERSONA_MATRIX) as PersonaId[]).map((id) => {
                const p = PERSONA_MATRIX[id];
                const active = id === personaId;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => onSelectPersona(id)}
                    className={`w-full text-left p-3.5 rounded-lg border transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#211D1A] border-[#D4AF37]/50 text-[#F5F0E6]'
                        : 'bg-[#0F0D0C] border-[#F5F0E6]/10 text-[#A39B8B] hover:text-[#F5F0E6]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span>{p.name}</span>
                      <span className="font-mono-tabular text-[#D4AF37]">
                        Voice: {p.voiceName}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#A39B8B] mt-1">
                      {p.styleDescription}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Prompt Injection Module Switches */}
          <div className="space-y-3 pt-4 border-t border-[#F5F0E6]/10">
            <p className="text-xs text-[#A39B8B]">
              Injektions-Module für den System-Prompt:
            </p>

            {[
              {
                key: 'enableMultilingualSwitch' as const,
                title: 'Nahtloses Code-Switching (DE / EN / Pfälzisch)',
                desc: 'Wechselt automatisch zwischen Pfälzer Herzlichkeit und britischer Sommelier-Präzision.',
              },
              {
                key: 'enableVadInterruptionRules' as const,
                title: 'Low-Latency Audio-Dramaturgie (<800ms Taktung)',
                desc: 'Optimiert Satzbau für gesprochene Sprache und natürliche Unterbrechbarkeit (VAD).',
              },
              {
                key: 'enableStrictRagGrounding' as const,
                title: 'Strict RAG Tool Grounding (Halluzinations-Schutz)',
                desc: 'Erzwingt Function Calling für Lagen, Bodenprofile, Säurewerte und Speisenbegleitung.',
              },
              {
                key: 'enableCellarContextInjection' as const,
                title: 'Live Weinkeller-Vektor-Injektion',
                desc: 'Spiegelt den aktuellen Flaschenbestand direkt in das Arbeitsgedächtnis des Geistes.',
              },
            ].map((mod) => {
              const checked = promptOptions[mod.key];
              return (
                <button
                  key={mod.key}
                  type="button"
                  onClick={() => toggleOption(mod.key)}
                  className="w-full text-left p-3 rounded-lg bg-[#0F0D0C] border border-[#F5F0E6]/10 hover:border-[#F5F0E6]/25 flex items-start justify-between gap-3 cursor-pointer"
                >
                  <div>
                    <div className="text-xs font-medium text-[#F5F0E6]">
                      {mod.title}
                    </div>
                    <div className="text-[11px] text-[#A39B8B] mt-0.5">
                      {mod.desc}
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-mono-tabular shrink-0 ${
                      checked
                        ? 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40'
                        : 'bg-[#181513] text-[#A39B8B]'
                    }`}
                  >
                    {checked ? 'AKTIV' : 'AUS'}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Audio Pipeline Specs */}
          <div className="p-4 rounded-lg bg-[#0F0D0C] border border-[#F5F0E6]/10 space-y-2 text-xs font-mono-tabular">
            <div className="text-[#D4AF37] font-semibold">
              Audio-zu-Audio Pipeline Parameter
            </div>
            <div className="text-[#A39B8B] flex justify-between">
              <span>Live Model:</span>
              <span className="text-[#F5F0E6]">gemini-3.8-live</span>
            </div>
            <div className="text-[#A39B8B] flex justify-between">
              <span>Mic Capture (Input):</span>
              <span className="text-[#F5F0E6]">16.000 Hz · 16-bit PCM LE</span>
            </div>
            <div className="text-[#A39B8B] flex justify-between">
              <span>Voice Stream (Output):</span>
              <span className="text-[#F5F0E6]">24.000 Hz · Gapless Queue</span>
            </div>
            <div className="text-[#A39B8B] flex justify-between">
              <span>Interruption Handling:</span>
              <span className="text-[#F5F0E6]">Server VAD + Buffer Flush</span>
            </div>
          </div>
        </div>

        {/* Right 7 Columns: Live Compiled System Prompt & Tool Schemas */}
        <div className="lg:col-span-7 space-y-6">
          {/* System Prompt Inspector */}
          <div className="bg-[#181513] border border-[#F5F0E6]/10 rounded-xl p-6">
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#F5F0E6]/10">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#D4AF37]" />
                <h2 className="text-xl font-serif-display font-semibold text-[#F5F0E6]">
                  02. Generierter System-Prompt (Live-Injektion)
                </h2>
              </div>
              <button
                type="button"
                onClick={handleCopyPrompt}
                className="px-3.5 py-1.5 rounded-lg bg-[#0F0D0C] border border-[#F5F0E6]/15 text-xs text-[#F5F0E6] hover:border-[#D4AF37] flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
              >
                {copiedPrompt ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Kopiert</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Prompt kopieren</span>
                  </>
                )}
              </button>
            </div>

            <pre className="mt-4 p-4 rounded-lg bg-[#0F0D0C] border border-[#F5F0E6]/10 text-xs font-mono-tabular text-[#F5F0E6]/90 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-[380px] overflow-y-auto">
              {compiledPrompt}
            </pre>
          </div>

          {/* Function Calling Tool Declarations */}
          <div className="bg-[#181513] border border-[#F5F0E6]/10 rounded-xl p-6">
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#F5F0E6]/10">
              <div>
                <h2 className="text-xl font-serif-display font-semibold text-[#F5F0E6]">
                  03. Domänen-RAG Function Declarations (@google/genai)
                </h2>
                <p className="text-xs text-[#A39B8B]">
                  Verhindert Halluzinationen bei Pfälzer Lagen, Säurewerten und
                  Kellerbeständen
                </p>
              </div>
              <button
                type="button"
                onClick={handleCopySchema}
                className="px-3.5 py-1.5 rounded-lg bg-[#0F0D0C] border border-[#F5F0E6]/15 text-xs text-[#F5F0E6] hover:border-[#D4AF37] flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
              >
                {copiedSchema ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Schema kopiert</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>JSON kopieren</span>
                  </>
                )}
              </button>
            </div>

            <pre className="mt-4 p-4 rounded-lg bg-[#0F0D0C] border border-[#F5F0E6]/10 text-xs font-mono-tabular text-[#A39B8B] overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-[260px] overflow-y-auto">
              {TOOL_SCHEMAS_JSON}
            </pre>
          </div>
        </div>
      </section>
    </div>
  );
};
