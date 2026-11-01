import React, { useState } from 'react';
import {
  Mic,
  MicOff,
  PhoneOff,
  Radio,
  Send,
  Volume2,
  VolumeX,
  Wine,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import {
  PERSONA_MATRIX,
  PersonaId,
  VISUAL_ASSETS,
  WineBottle,
} from '../data/pfalzDomain';
import { AudioSpiritOrb } from './AudioSpiritOrb';
import {
  GroundedArtifact,
  TranscriptEntry,
} from '../hooks/useGeminiLiveSommelier';

interface LiveSanctumViewProps {
  personaId: PersonaId;
  onSelectPersona: (id: PersonaId) => void;
  cellarBottles: WineBottle[];
  activeBottle: WineBottle | null;
  onSelectActiveBottle: (bottle: WineBottle | null) => void;
  isLiveConnected: boolean;
  isConnecting: boolean;
  isMicMuted: boolean;
  onToggleMicMute: () => void;
  isSpeaking: boolean;
  isThinking: boolean;
  inputLevel: number;
  outputLevel: number;
  error: string | null;
  transcripts: TranscriptEntry[];
  groundedArtifacts: GroundedArtifact[];
  onStartLive: (initialPrompt?: string) => void;
  onStopLive: () => void;
  onStopPlayback: () => void;
  onSendPrompt: (prompt: string, speakResponse: boolean) => void;
  onNavigateToCellar: () => void;
}

const RITUAL_PROMPTS = [
  {
    label: 'Forster Pechstein 2021 analysieren',
    prompt:
      'Wir haben gerade den 2021 Forster Pechstein Riesling GG entkorkt. Erkläre mir das vulkanische Basalt-Terroir und die Sensorik im Glas.',
  },
  {
    label: 'Buntsandstein vs. Kalkmergel',
    prompt:
      'Worin liegt der geschmackliche und geologische Unterschied zwischen einem Riesling vom Mittelhaardter Buntsandstein und vom Deidesheimer Kalkmergel?',
  },
  {
    label: 'Begleitung zu Pfälzer Rehrücken',
    prompt:
      'Prüfe meinen digitalen Weinkeller: Welche vorrätige Flasche empfiehlst du heute Abend zu rosa gebratenem Pfälzer Rehrücken?',
  },
  {
    label: 'English Sommelier Switch',
    prompt:
      'Good evening! Could you introduce our cellar highlights from the Pfalz region in English for our international guests at the table?',
  },
];

export const LiveSanctumView: React.FC<LiveSanctumViewProps> = ({
  personaId,
  onSelectPersona,
  cellarBottles,
  activeBottle,
  onSelectActiveBottle,
  isLiveConnected,
  isConnecting,
  isMicMuted,
  onToggleMicMute,
  isSpeaking,
  isThinking,
  inputLevel,
  outputLevel,
  error,
  transcripts,
  groundedArtifacts,
  onStartLive,
  onStopLive,
  onStopPlayback,
  onSendPrompt,
  onNavigateToCellar,
}) => {
  const [inputText, setInputText] = useState('');
  const [speakTextResponses, setSpeakTextResponses] = useState(true);
  const [heroImgFailed, setHeroImgFailed] = useState(false);

  const activePersona = PERSONA_MATRIX[personaId];

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendPrompt(inputText, speakTextResponses);
    setInputText('');
  };

  return (
    <div className="space-y-10">
      {/* Main Split Sanctum */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left / Center 7 Columns: The Audio-Reactive Weingeist Sanctum */}
        <div className="lg:col-span-7 bg-[#181513] border border-[#F5F0E6]/10 rounded-xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Measured Background Backdrop */}
          {!heroImgFailed && (
            <div className="pointer-events-none absolute inset-0 opacity-15">
              <img
                src={VISUAL_ASSETS.vineyardHero}
                alt="Pfälzer Weinberge der Mittelhaardt bei Sonnenuntergang"
                referrerPolicy="no-referrer"
                onError={() => setHeroImgFailed(true)}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#181513] via-[#181513]/85 to-[#181513]/60" />
            </div>
          )}

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#F5F0E6]/10">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#A39B8B]">
                Genius Loci · Deutsche Weinstraße
              </p>
              <h1 className="text-2xl sm:text-3xl font-serif-display font-semibold text-[#F5F0E6] mt-1 text-balance">
                Der Pfälzer Weingeist im Echtzeit-Dialog
              </h1>
            </div>

            {/* Active Uncorked Bottle Selector */}
            <div className="flex items-center gap-2">
              <Wine className="w-4 h-4 text-[#D4AF37] shrink-0" />
              <select
                aria-label="Aktuelle Flasche am Tisch wählen"
                value={activeBottle?.id || ''}
                onChange={(e) => {
                  const found = cellarBottles.find((b) => b.id === e.target.value) || null;
                  onSelectActiveBottle(found);
                }}
                className="bg-[#0F0D0C] border border-[#F5F0E6]/15 rounded-lg px-3 py-2 text-xs text-[#F5F0E6] focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="">Freie Verkostung (Kein Einzelflaschen-Fokus)</option>
                {cellarBottles.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.vintage} {b.name} ({b.quantity} Fl.)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Persona-Matrix Switcher */}
          <div className="relative z-10 mt-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
              <span className="text-xs text-[#A39B8B]">
                Persona-Matrix (System-Stimme & Charakter):
              </span>
              <span className="text-xs text-[#D4AF37] font-mono-tabular">
                Stimmprofil: {activePersona.voiceName} · DE / EN / Pfälzisch
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-1.5 bg-[#0F0D0C] border border-[#F5F0E6]/10 rounded-lg">
              {(Object.keys(PERSONA_MATRIX) as PersonaId[]).map((id) => {
                const p = PERSONA_MATRIX[id];
                const isSelected = id === personaId;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => onSelectPersona(id)}
                    className={`px-3 py-2.5 rounded-md text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#211D1A] text-[#F5F0E6] border border-[#D4AF37]/40 shadow-sm'
                        : 'text-[#A39B8B] hover:text-[#F5F0E6] border border-transparent'
                    }`}
                  >
                    <div className="text-xs font-semibold whitespace-nowrap truncate">
                      {p.name}
                    </div>
                    <div className="text-[11px] text-[#A39B8B] truncate mt-0.5">
                      {p.subtitle}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Centerpiece Audio-Reactive Spirit Orb */}
          <div className="relative z-10 my-4 flex flex-col items-center">
            <AudioSpiritOrb
              persona={activePersona}
              isLiveConnected={isLiveConnected}
              isSpeaking={isSpeaking}
              isListening={isLiveConnected && !isMicMuted}
              isThinking={isThinking}
              inputLevel={inputLevel}
              outputLevel={outputLevel}
              activeWineColor={activeBottle?.wineColorHex}
            />

            {/* Focused Bottle Context Strip (Unboxed Zero-Pill Metadata) */}
            {activeBottle && (
              <div className="mt-3 px-4 py-2.5 bg-[#0F0D0C]/90 border border-[#F5F0E6]/10 rounded-lg text-center max-w-xl">
                <p className="text-xs text-[#D4AF37] font-medium">
                  Am Tisch entkorkt: {activeBottle.vintage} {activeBottle.name}
                </p>
                <p className="text-[11px] text-[#A39B8B] font-mono-tabular mt-0.5">
                  {activeBottle.winery} · {activeBottle.soilType} · Säure{' '}
                  {activeBottle.acidityGL} g/l · RZ {activeBottle.residualSugarGL} g/l ·{' '}
                  {activeBottle.alcoholPct}% Vol.
                </p>
              </div>
            )}
          </div>

          {/* Primary Voice Action Controls */}
          <div className="relative z-10 pt-4 border-t border-[#F5F0E6]/10 flex flex-wrap items-center justify-center gap-3">
            {!isLiveConnected ? (
              <button
                type="button"
                disabled={isConnecting}
                onClick={() => onStartLive()}
                className="px-6 py-3 rounded-lg bg-[#D4AF37] text-[#0F0D0C] font-semibold text-sm hover:bg-[#e0bd42] transition-colors flex items-center gap-2.5 cursor-pointer disabled:opacity-50 whitespace-nowrap shrink-0"
              >
                <Radio className="w-4 h-4" />
                <span>
                  {isConnecting
                    ? 'Verbinde Live-Stream...'
                    : 'Echtzeit-Sprachdialog starten'}
                </span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onToggleMicMute}
                  className={`px-4 py-2.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 ${
                    isMicMuted
                      ? 'bg-[#8B1E24]/30 border-[#8B1E24] text-[#F5F0E6]'
                      : 'bg-[#211D1A] border-[#F5F0E6]/20 text-[#F5F0E6] hover:border-[#D4AF37]'
                  }`}
                >
                  {isMicMuted ? (
                    <>
                      <MicOff className="w-4 h-4 text-[#F87171]" />
                      <span>Mikrofon stumm (Klicken zum Sprechen)</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4 text-[#D4AF37]" />
                      <span>Mikrofon aktiv (16kHz Stream)</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={onStopLive}
                  className="px-4 py-2.5 rounded-lg bg-[#8B1E24] text-[#F5F0E6] text-xs font-medium hover:bg-[#a1232a] transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
                >
                  <PhoneOff className="w-4 h-4" />
                  <span>Live-Stream beenden</span>
                </button>
              </>
            )}

            {isSpeaking && (
              <button
                type="button"
                onClick={onStopPlayback}
                className="px-3.5 py-2.5 rounded-lg bg-[#211D1A] border border-[#F5F0E6]/15 text-xs text-[#F5F0E6] hover:border-[#D4AF37] transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
              >
                <VolumeX className="w-4 h-4 text-[#D4AF37]" />
                <span>Stimme unterbrechen</span>
              </button>
            )}
          </div>

          {error && (
            <div className="relative z-10 mt-4 p-3.5 rounded-lg bg-[#8B1E24]/20 border border-[#8B1E24]/50 text-xs text-[#F5F0E6]">
              {error}
            </div>
          )}
        </div>

        {/* Right 5 Columns: Live Conversation & Schnell-Rituale */}
        <div className="lg:col-span-5 bg-[#181513] border border-[#F5F0E6]/10 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#F5F0E6]/10">
              <div>
                <h2 className="text-xl font-serif-display font-semibold text-[#F5F0E6]">
                  Sommelier-Resonanz & Dialog
                </h2>
                <p className="text-xs text-[#A39B8B]">
                  Sprechen Sie frei oder wählen Sie einen Verkostungs-Impuls
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSpeakTextResponses((prev) => !prev)}
                className="px-3 py-1.5 rounded-md bg-[#0F0D0C] border border-[#F5F0E6]/10 text-xs text-[#A39B8B] hover:text-[#F5F0E6] flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                title="Sprachausgabe für Text-Antworten umschalten"
              >
                {speakTextResponses ? (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Audio-Antwort Ein</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-3.5 h-3.5" />
                    <span>Nur Text</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Ritual Impulse Buttons */}
            <div className="mt-4">
              <p className="text-[11px] uppercase tracking-wider text-[#A39B8B] mb-2">
                Verkostungs-Impulse (Sofort-Abfrage mit Terroir-Grounding):
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {RITUAL_PROMPTS.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    disabled={isThinking}
                    onClick={() => onSendPrompt(item.prompt, speakTextResponses)}
                    className="px-3 py-2 rounded-lg bg-[#0F0D0C] hover:bg-[#211D1A] border border-[#F5F0E6]/10 hover:border-[#D4AF37]/40 text-left text-xs text-[#F5F0E6] transition-colors cursor-pointer disabled:opacity-50 truncate"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Transcript Stream */}
            <div className="mt-5 h-72 overflow-y-auto space-y-3 pr-1">
              {transcripts.map((entry) => (
                <div
                  key={entry.id}
                  className={`p-3.5 rounded-lg text-sm leading-relaxed ${
                    entry.speaker === 'user'
                      ? 'bg-[#211D1A] text-[#F5F0E6] ml-6 border border-[#F5F0E6]/10'
                      : 'bg-[#0F0D0C] text-[#F5F0E6] mr-4 border border-[#D4AF37]/25'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] text-[#A39B8B] font-mono-tabular mb-1">
                    <span>
                      {entry.speaker === 'user'
                        ? 'Sie (Verkoster)'
                        : PERSONA_MATRIX[entry.personaId || personaId].name}
                    </span>
                    <span>
                      {entry.toolUsed ? `${entry.toolUsed} · ` : ''}
                      {entry.timestamp}
                    </span>
                  </div>
                  <p className="text-sm text-[#F5F0E6]/95">{entry.text}</p>
                </div>
              ))}
              {isThinking && (
                <div className="p-3.5 rounded-lg bg-[#0F0D0C] border border-[#D4AF37]/20 text-xs text-[#D4AF37] font-mono-tabular">
                  Weingeist konsultiert Pfälzer Terroir-Datenbank & formuliert Antwort...
                </div>
              )}
            </div>
          </div>

          {/* Direct Text / Menu Consultation Input */}
          <form onSubmit={handleFormSubmit} className="mt-4 pt-4 border-t border-[#F5F0E6]/10">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Frage zu Jahrgang, Speisekarte oder Lage stellen (DE / EN)..."
                className="flex-1 bg-[#0F0D0C] border border-[#F5F0E6]/15 rounded-lg px-3.5 py-2.5 text-sm text-[#F5F0E6] placeholder:text-[#A39B8B]/60 focus:outline-none focus:border-[#D4AF37]"
              />
              <button
                type="submit"
                disabled={isThinking || !inputText.trim()}
                className="px-4 py-2.5 rounded-lg bg-[#D4AF37] text-[#0F0D0C] font-semibold text-xs hover:bg-[#e0bd42] transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 whitespace-nowrap shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Fragen</span>
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Real-Time Grounded Domain RAG Cards Section */}
      <section className="bg-[#181513] border border-[#F5F0E6]/10 rounded-xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#F5F0E6]/10">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[#A39B8B]">
              Strict Domain Grounding · Halluzinations-Schutz
            </p>
            <h2 className="text-2xl font-serif-display font-semibold text-[#F5F0E6] mt-0.5">
              Vom Weingeist abgerufene Terroir- & Keller-Referenzen
            </h2>
          </div>
          <button
            type="button"
            onClick={onNavigateToCellar}
            className="px-4 py-2 rounded-lg bg-[#211D1A] border border-[#F5F0E6]/15 text-xs text-[#F5F0E6] hover:border-[#D4AF37] transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 self-start sm:self-auto"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Vollständigen Weinkeller öffnen</span>
          </button>
        </div>

        {groundedArtifacts.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            {cellarBottles.slice(0, 3).map((bottle) => (
              <div
                key={bottle.id}
                className="p-5 rounded-lg bg-[#0F0D0C] border border-[#F5F0E6]/10 flex flex-col justify-between"
              >
                <div>
                  <p className="text-xs text-[#A39B8B] font-mono-tabular">
                    {bottle.vintage} · {bottle.classification} · {bottle.village}
                  </p>
                  <h3 className="text-lg font-serif-display font-semibold text-[#F5F0E6] mt-1">
                    {bottle.name}
                  </h3>
                  <p className="text-xs text-[#D4AF37] mt-0.5">{bottle.winery}</p>
                  <p className="text-xs text-[#A39B8B] font-mono-tabular mt-3">
                    Boden: {bottle.soilType} · Säure {bottle.acidityGL} g/l · RZ{' '}
                    {bottle.residualSugarGL} g/l
                  </p>
                  <p className="text-xs text-[#F5F0E6]/85 mt-3 leading-relaxed">
                    {bottle.sensoryProfile.nose}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#F5F0E6]/10 flex items-center justify-between">
                  <span className="text-xs font-mono-tabular text-[#A39B8B]">
                    Bestand: {bottle.quantity} Fl. ({bottle.drinkingWindow})
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectActiveBottle(bottle);
                      onSendPrompt(
                        `Lass uns den ${bottle.vintage} ${bottle.name} von ${bottle.winery} verkosten. Was zeichnet seine Lage und Säurestruktur aus?`,
                        speakTextResponses
                      );
                    }}
                    className="text-xs text-[#D4AF37] hover:underline flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Im Dialog öffnen</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6 mt-6">
            {groundedArtifacts.map((art) => (
              <div
                key={art.id}
                className="p-5 rounded-lg bg-[#0F0D0C] border border-[#D4AF37]/30 space-y-4"
              >
                <div className="flex items-center justify-between text-xs text-[#A39B8B] font-mono-tabular border-b border-[#F5F0E6]/10 pb-2.5">
                  <span>
                    Function Call verifiziert: <strong className="text-[#D4AF37]">{art.toolName}</strong>
                  </span>
                  <span>Abgerufen um {art.timestamp}</span>
                </div>

                {art.recordedNote && (
                  <div className="p-3.5 rounded bg-[#181513] border border-[#F5F0E6]/10">
                    <p className="text-xs text-[#D4AF37] font-mono-tabular">
                      Verkostungsnotiz automatisch im Keller protokolliert · {art.recordedNote.rating}/100 Punkte
                    </p>
                    <p className="text-sm font-serif-display font-semibold text-[#F5F0E6] mt-1">
                      {art.recordedNote.wineName}
                    </p>
                    <p className="text-xs text-[#F5F0E6]/85 mt-1">
                      {art.recordedNote.sensorySummary}
                    </p>
                  </div>
                )}

                {art.terroirs && art.terroirs.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {art.terroirs.map((t) => (
                      <div
                        key={t.id}
                        className="p-4 rounded bg-[#181513] border border-[#F5F0E6]/10"
                      >
                        <p className="text-xs text-[#A39B8B] font-mono-tabular">
                          Geologie · {t.geologicalAge}
                        </p>
                        <h4 className="text-base font-serif-display font-semibold text-[#F5F0E6] mt-0.5">
                          {t.name}
                        </h4>
                        <p className="text-xs text-[#D4AF37] mt-1">
                          Leitlagen: {t.flagshipSites.join(' · ')}
                        </p>
                        <p className="text-xs text-[#F5F0E6]/85 mt-2 leading-relaxed">
                          {t.mineralSignature} {t.acidStructure}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {art.wines && art.wines.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {art.wines.map((w) => (
                      <div
                        key={w.id}
                        className="p-4 rounded bg-[#181513] border border-[#F5F0E6]/10 flex flex-col justify-between"
                      >
                        <div>
                          <p className="text-xs text-[#A39B8B] font-mono-tabular">
                            {w.vintage} · {w.classification} · Säure {w.acidityGL} g/l · RZ{' '}
                            {w.residualSugarGL} g/l
                          </p>
                          <h4 className="text-base font-serif-display font-semibold text-[#F5F0E6] mt-0.5">
                            {w.name} ({w.winery})
                          </h4>
                          <p className="text-xs text-[#F5F0E6]/80 mt-2">
                            {w.sensoryProfile.palate}
                          </p>
                          <p className="text-xs text-[#D4AF37] mt-2">
                            Food Pairing: {w.foodPairing.join(' · ')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
