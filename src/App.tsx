import React, { useEffect, useState } from 'react';
import {
  ChronosVibeOptions,
  INITIAL_CELLAR_BOTTLES,
  INITIAL_TASTING_NOTES,
  PersonaId,
  TastingNote,
  TerroirGeologicalProfile,
  WineBottle,
} from './data/pfalzDomain';
import { useGeminiLiveSommelier } from './hooks/useGeminiLiveSommelier';
import { LiveSanctumView } from './components/LiveSanctumView';
import { CellarView } from './components/CellarView';
import { TerroirTaxonomyView } from './components/TerroirTaxonomyView';
import { ChronosVibeView } from './components/ChronosVibeView';

type ActiveTab = 'sanctum' | 'cellar' | 'terroir' | 'chronos';

const STORAGE_KEYS = {
  bottles: 'genius_vini_cellar_bottles_v1',
  notes: 'genius_vini_tasting_notes_v1',
  persona: 'genius_vini_persona_v1',
};

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('sanctum');

  const [personaId, setPersonaId] = useState<PersonaId>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.persona);
    if (saved === 'dionysian' || saved === 'purist' || saved === 'pfalz_original') {
      return saved;
    }
    return 'dionysian';
  });

  const [cellarBottles, setCellarBottles] = useState<WineBottle[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.bottles);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore storage errors
    }
    return INITIAL_CELLAR_BOTTLES;
  });

  const [tastingNotes, setTastingNotes] = useState<TastingNote[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.notes);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore storage errors
    }
    return INITIAL_TASTING_NOTES;
  });

  const [activeBottle, setActiveBottle] = useState<WineBottle | null>(
    () => INITIAL_CELLAR_BOTTLES[0]
  );

  const [promptOptions, setPromptOptions] = useState<ChronosVibeOptions>({
    enableMultilingualSwitch: true,
    enableStrictRagGrounding: true,
    enableCellarContextInjection: true,
    enableVadInterruptionRules: true,
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.bottles, JSON.stringify(cellarBottles));
    } catch {
      // ignore
    }
  }, [cellarBottles]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.notes, JSON.stringify(tastingNotes));
    } catch {
      // ignore
    }
  }, [tastingNotes]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.persona, personaId);
    } catch {
      // ignore
    }
  }, [personaId]);

  const handleAddTastingNote = (newNote: Omit<TastingNote, 'id'>) => {
    const created: TastingNote = {
      ...newNote,
      id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    };
    setTastingNotes((prev) => [created, ...prev]);
  };

  const {
    isLiveConnected,
    isConnecting,
    isMicMuted,
    setIsMicMuted,
    isSpeaking,
    isThinking,
    inputLevel,
    outputLevel,
    error,
    transcripts,
    groundedArtifacts,
    startLiveSession,
    stopLiveSession,
    stopAllPlayback,
    sendSommelierPrompt,
  } = useGeminiLiveSommelier({
    personaId,
    cellarBottles,
    activeBottle,
    promptOptions,
    onAutoRecordNote: handleAddTastingNote,
  });

  const handleUpdateBottleQuantity = (id: string, delta: number) => {
    setCellarBottles((prev) =>
      prev.map((b) =>
        b.id === id ? { ...b, quantity: Math.max(0, b.quantity + delta) } : b
      )
    );
  };

  const handleAddBottle = (bottleData: Omit<WineBottle, 'id'>) => {
    const created: WineBottle = {
      ...bottleData,
      id: `bottle-${Date.now()}`,
    };
    setCellarBottles((prev) => [created, ...prev]);
  };

  const handleConsultBottleInLive = (bottle: WineBottle) => {
    setActiveBottle(bottle);
    setActiveTab('sanctum');
    sendSommelierPrompt(
      `Wir betrachten aus meinem Weinkeller den ${bottle.vintage} ${bottle.name} (${bottle.winery}, ${bottle.soilType}). Bitte analysiere seine Struktur, Trinkreife und ideale Speisenbegleitung.`,
      true
    );
  };

  const handleExploreTerroirWithSpirit = (terroir: TerroirGeologicalProfile) => {
    setActiveTab('sanctum');
    sendSommelierPrompt(
      `Erkläre mir das Pfälzer Terroir "${terroir.name}" (${terroir.soilCategory}) und wie es die Säurestruktur und Mineralik in Lagen wie ${terroir.flagshipSites.slice(0, 2).join(' oder ')} prägt.`,
      true
    );
  };

  const handlePrimaryHeaderCta = () => {
    setActiveTab('sanctum');
    if (!isLiveConnected && !isConnecting) {
      startLiveSession();
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0D0C] text-[#F5F0E6] flex flex-col justify-between">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-40 bg-[#0F0D0C]/95 backdrop-blur border-b border-[#F5F0E6]/10">
        <div className="max-w-[1320px] mx-auto flex items-center justify-between gap-8 px-6 py-4">
          {/* Zone 1: Single text element wordmark */}
          <button
            type="button"
            onClick={() => setActiveTab('sanctum')}
            className="text-2xl font-serif-display font-semibold tracking-tight text-[#F5F0E6] whitespace-nowrap shrink-0 cursor-pointer"
          >
            Genius Vini
          </button>

          {/* Zone 2: 4 concise single-line text navigation links */}
          <nav className="flex items-center gap-6 text-sm font-medium text-[#A39B8B] overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('sanctum')}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer border-b-2 ${
                activeTab === 'sanctum'
                  ? 'text-[#F5F0E6] border-[#D4AF37]'
                  : 'border-transparent hover:text-[#F5F0E6]'
              }`}
            >
              Weingeist Live
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('cellar')}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer border-b-2 ${
                activeTab === 'cellar'
                  ? 'text-[#F5F0E6] border-[#D4AF37]'
                  : 'border-transparent hover:text-[#F5F0E6]'
              }`}
            >
              Weinkeller
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('terroir')}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer border-b-2 ${
                activeTab === 'terroir'
                  ? 'text-[#F5F0E6] border-[#D4AF37]'
                  : 'border-transparent hover:text-[#F5F0E6]'
              }`}
            >
              Terroir-Atlas
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('chronos')}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer border-b-2 ${
                activeTab === 'chronos'
                  ? 'text-[#F5F0E6] border-[#D4AF37]'
                  : 'border-transparent hover:text-[#F5F0E6]'
              }`}
            >
              Chronos-Vibe
            </button>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={handlePrimaryHeaderCta}
              className="px-4 py-2 text-xs font-semibold text-[#0F0D0C] bg-[#D4AF37] rounded-lg hover:bg-[#e0bd42] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {isLiveConnected ? 'Live-Dialog aktiv' : 'Verkostung starten'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container (1440px Desktop Presence) */}
      <main className="flex-1 max-w-[1320px] w-full mx-auto px-6 py-8 sm:py-10">
        {activeTab === 'sanctum' && (
          <LiveSanctumView
            personaId={personaId}
            onSelectPersona={setPersonaId}
            cellarBottles={cellarBottles}
            activeBottle={activeBottle}
            onSelectActiveBottle={setActiveBottle}
            isLiveConnected={isLiveConnected}
            isConnecting={isConnecting}
            isMicMuted={isMicMuted}
            onToggleMicMute={() => setIsMicMuted((prev) => !prev)}
            isSpeaking={isSpeaking}
            isThinking={isThinking}
            inputLevel={inputLevel}
            outputLevel={outputLevel}
            error={error}
            transcripts={transcripts}
            groundedArtifacts={groundedArtifacts}
            onStartLive={startLiveSession}
            onStopLive={stopLiveSession}
            onStopPlayback={stopAllPlayback}
            onSendPrompt={sendSommelierPrompt}
            onNavigateToCellar={() => setActiveTab('cellar')}
          />
        )}

        {activeTab === 'cellar' && (
          <CellarView
            bottles={cellarBottles}
            tastingNotes={tastingNotes}
            activePersonaId={personaId}
            onUpdateBottleQuantity={handleUpdateBottleQuantity}
            onAddBottle={handleAddBottle}
            onAddTastingNote={handleAddTastingNote}
            onConsultBottleInLive={handleConsultBottleInLive}
          />
        )}

        {activeTab === 'terroir' && (
          <TerroirTaxonomyView
            bottles={cellarBottles}
            tastingNotes={tastingNotes}
            onExploreTerroirWithSpirit={handleExploreTerroirWithSpirit}
          />
        )}

        {activeTab === 'chronos' && (
          <ChronosVibeView
            personaId={personaId}
            onSelectPersona={setPersonaId}
            cellarBottles={cellarBottles}
            activeBottle={activeBottle}
            promptOptions={promptOptions}
            onUpdatePromptOptions={setPromptOptions}
            onApplyAndLaunchLive={() => setActiveTab('sanctum')}
          />
        )}
      </main>

      {/* Quiet Editorial Footer */}
      <footer className="border-t border-[#F5F0E6]/10 py-6 px-6 mt-12">
        <div className="max-w-[1320px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#A39B8B]">
          <p className="font-serif-display text-sm text-[#F5F0E6]">
            Genius Vini — Der Pfälzer Weingeist · Mittelhaardt & Südliche Weinstraße
          </p>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setActiveTab('sanctum')}
              className="hover:text-[#F5F0E6] transition-colors cursor-pointer"
            >
              Echtzeit-Sommelier
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => setActiveTab('cellar')}
              className="hover:text-[#F5F0E6] transition-colors cursor-pointer"
            >
              Digitaler Weinkeller
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => setActiveTab('chronos')}
              className="hover:text-[#F5F0E6] transition-colors cursor-pointer"
            >
              Chronos-Vibe Prompt-Deck
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
