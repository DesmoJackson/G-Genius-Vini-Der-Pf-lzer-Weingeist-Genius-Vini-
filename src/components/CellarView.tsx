import React, { useState } from 'react';
import {
  Plus,
  Minus,
  Wine,
  Search,
  NotebookPen,
  Sparkles,
  X,
} from 'lucide-react';
import {
  GrapeVariety,
  PERSONA_MATRIX,
  PersonaId,
  SoilCategory,
  TastingNote,
  VISUAL_ASSETS,
  VdpClassification,
  WineBottle,
} from '../data/pfalzDomain';

interface CellarViewProps {
  bottles: WineBottle[];
  tastingNotes: TastingNote[];
  activePersonaId: PersonaId;
  onUpdateBottleQuantity: (id: string, delta: number) => void;
  onAddBottle: (bottle: Omit<WineBottle, 'id'>) => void;
  onAddTastingNote: (note: Omit<TastingNote, 'id'>) => void;
  onConsultBottleInLive: (bottle: WineBottle) => void;
}

const GRAPE_FILTERS: Array<'ALL' | GrapeVariety> = [
  'ALL',
  'Riesling',
  'Spätburgunder',
  'Weißburgunder',
  'Scheurebe',
];

export const CellarView: React.FC<CellarViewProps> = ({
  bottles,
  tastingNotes,
  activePersonaId,
  onUpdateBottleQuantity,
  onAddBottle,
  onAddTastingNote,
  onConsultBottleInLive,
}) => {
  const [selectedGrape, setSelectedGrape] = useState<'ALL' | GrapeVariety>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [cellarImgFailed, setCellarImgFailed] = useState(false);

  // Modal state for adding a tasting note
  const [tastingModalBottle, setTastingModalBottle] = useState<WineBottle | null>(null);
  const [noteRating, setNoteRating] = useState(95);
  const [noteNose, setNoteNose] = useState('');
  const [notePalate, setNotePalate] = useState('');
  const [noteFinish, setNoteFinish] = useState('');
  const [noteOccasion, setNoteOccasion] = useState('Abendverkostung im Gewölbe');

  // Modal state for adding a new bottle to inventory
  const [showAddBottleModal, setShowAddBottleModal] = useState(false);
  const [newBottleName, setNewBottleName] = useState('');
  const [newBottleWinery, setNewBottleWinery] = useState('');
  const [newBottleVillage, setNewBottleVillage] = useState('Deidesheim');
  const [newBottleVintage, setNewBottleVintage] = useState(2022);
  const [newBottleGrape, setNewBottleGrape] = useState<GrapeVariety>('Riesling');
  const [newBottleSoil, setNewBottleSoil] = useState<SoilCategory>(
    'Kalkmergel & Tertiärkalk'
  );
  const [newBottleClass, setNewBottleClass] =
    useState<VdpClassification>('VDP.Grosse Lage');
  const [newBottleAcid, setNewBottleAcid] = useState(7.6);
  const [newBottleSugar, setNewBottleSugar] = useState(2.5);
  const [newBottleAlcohol, setNewBottleAlcohol] = useState(12.5);
  const [newBottleQuantity, setNewBottleQuantity] = useState(3);
  const [newBottleNose, setNewBottleNose] = useState(
    'Weinbergpfirsich, Zitrusblüte, kühler Kalkstein und feine Kräuterwürze.'
  );

  const filteredBottles = bottles.filter((b) => {
    const matchesGrape = selectedGrape === 'ALL' || b.grape === selectedGrape;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      b.name.toLowerCase().includes(q) ||
      b.winery.toLowerCase().includes(q) ||
      b.village.toLowerCase().includes(q) ||
      b.soilType.toLowerCase().includes(q);
    return matchesGrape && matchesSearch;
  });

  const totalBottlesCount = bottles.reduce((sum, b) => sum + b.quantity, 0);
  const grosseLagenCount = bottles
    .filter((b) => b.classification === 'VDP.Grosse Lage')
    .reduce((sum, b) => sum + b.quantity, 0);

  const handleCreateTastingNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tastingModalBottle) return;

    onAddTastingNote({
      bottleId: tastingModalBottle.id,
      bottleName: tastingModalBottle.name,
      vintage: tastingModalBottle.vintage,
      date: new Date().toISOString().split('T')[0],
      rating: noteRating,
      noseNotes: noteNose || tastingModalBottle.sensoryProfile.nose,
      palateNotes: notePalate || tastingModalBottle.sensoryProfile.palate,
      finishNotes: noteFinish || tastingModalBottle.sensoryProfile.finish,
      occasion: noteOccasion,
      personaId: activePersonaId,
      spiritReflection: `Katalogisiert unter Begleitung von ${PERSONA_MATRIX[activePersonaId].name} (${tastingModalBottle.soilType}).`,
    });

    setTastingModalBottle(null);
    setNoteNose('');
    setNotePalate('');
    setNoteFinish('');
  };

  const handleCreateBottle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBottleName.trim() || !newBottleWinery.trim()) return;

    onAddBottle({
      name: newBottleName.trim(),
      winery: newBottleWinery.trim(),
      village: newBottleVillage.trim() || 'Forst an der Weinstraße',
      subregion: 'Mittelhaardt-Deutsche Weinstraße',
      vintage: Number(newBottleVintage) || 2022,
      grape: newBottleGrape,
      classification: newBottleClass,
      soilType: newBottleSoil,
      acidityGL: Number(newBottleAcid) || 7.5,
      residualSugarGL: Number(newBottleSugar) || 2.5,
      alcoholPct: Number(newBottleAlcohol) || 12.5,
      drinkingWindow: `${Number(newBottleVintage) + 2}–${Number(newBottleVintage) + 14}`,
      quantity: Number(newBottleQuantity) || 1,
      rackLocation: `Gewölbe D · Fach 0${bottles.length + 1}`,
      sensoryProfile: {
        nose: newBottleNose,
        palate: 'Straffe mineralische Textur mit präzisem Säurebogen.',
        finish: 'Salzig-würziger, anhaltender Nachhall.',
      },
      foodPairing: ['Gebratener Zander', 'Pfälzer Geflügel', 'Gereifter Hartkäse'],
      terroirStory: `Klassische Parzelle in ${newBottleVillage} geprägt von ${newBottleSoil}.`,
      wineColorHex: newBottleGrape === 'Spätburgunder' ? '#8B1E24' : '#D4AF37',
    });

    setShowAddBottleModal(false);
    setNewBottleName('');
    setNewBottleWinery('');
  };

  return (
    <div className="space-y-10">
      {/* Header & Archival Cellar Banner */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch bg-[#181513] border border-[#F5F0E6]/10 rounded-xl overflow-hidden">
        <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#A39B8B]">
              Digitales Gewölbe · Pfälzer Schatzkammer
            </p>
            <h1 className="text-3xl sm:text-4xl font-serif-display font-semibold text-[#F5F0E6] mt-1 text-balance">
              Persönlicher Weinkeller & Verkostungsarchiv
            </h1>
            <p className="text-sm text-[#A39B8B] mt-3 max-w-2xl leading-relaxed">
              Jede hier gelagerte Flasche ist automatisch im Vektor-Gedächtnis des
              Weingeists verankert. Wenn Sie im Sprachdialog nach einer
              Speisenbegleitung oder der optimalen Trinkreife fragen, greift der
              Sommelier direkt auf Ihren realen Bestand und die Säurewerte zu.
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-[#F5F0E6]/10 flex flex-wrap items-center justify-between gap-6">
            <div className="flex flex-wrap items-center gap-6 text-xs font-mono-tabular text-[#A39B8B]">
              <div>
                <span className="block text-[11px] uppercase text-[#A39B8B]/70">
                  Gesamtbestand
                </span>
                <span className="text-lg font-semibold text-[#F5F0E6]">
                  {totalBottlesCount} Flaschen
                </span>
              </div>
              <span>·</span>
              <div>
                <span className="block text-[11px] uppercase text-[#A39B8B]/70">
                  VDP.Grosse Lagen
                </span>
                <span className="text-lg font-semibold text-[#D4AF37]">
                  {grosseLagenCount} Flaschen
                </span>
              </div>
              <span>·</span>
              <div>
                <span className="block text-[11px] uppercase text-[#A39B8B]/70">
                  Verkostungsnotizen
                </span>
                <span className="text-lg font-semibold text-[#F5F0E6]">
                  {tastingNotes.length} Einträge
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowAddBottleModal(true)}
              className="px-4 py-2.5 rounded-lg bg-[#D4AF37] text-[#0F0D0C] font-semibold text-xs hover:bg-[#e0bd42] transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Neue Flasche einlagern</span>
            </button>
          </div>
        </div>

        <div className="lg:col-span-5 relative min-h-[220px] bg-[#0F0D0C]">
          {!cellarImgFailed ? (
            <img
              src={VISUAL_ASSETS.cellarVault}
              alt="Historisches Pfälzer Naturstein-Weingewölbe bei Kerzenschein"
              referrerPolicy="no-referrer"
              onError={() => setCellarImgFailed(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center p-8 text-center text-xs text-[#A39B8B]">
              Archiv-Weingewölbe · Mittelhaardt & Südliche Weinstraße
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#181513] via-transparent to-transparent lg:bg-gradient-to-r lg:from-[#181513] lg:via-transparent lg:to-transparent" />
        </div>
      </section>

      {/* Filter & Search Bar */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Segmented Control for Grape Variety */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-[#181513] border border-[#F5F0E6]/10 rounded-lg">
          {GRAPE_FILTERS.map((grape) => {
            const active = selectedGrape === grape;
            return (
              <button
                key={grape}
                type="button"
                onClick={() => setSelectedGrape(grape)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-[#211D1A] text-[#D4AF37] border border-[#D4AF37]/30'
                    : 'text-[#A39B8B] hover:text-[#F5F0E6]'
                }`}
              >
                {grape === 'ALL' ? 'Alle Rebsorten' : grape}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#A39B8B] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Lage, Weingut oder Boden suchen..."
            className="w-full bg-[#181513] border border-[#F5F0E6]/15 rounded-lg pl-10 pr-4 py-2 text-xs text-[#F5F0E6] placeholder:text-[#A39B8B]/60 focus:outline-none focus:border-[#D4AF37]"
          />
        </div>
      </section>

      {/* Cellar Bottle Grid (3 columns on desktop, uniform structure, zero-pill metadata) */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBottles.map((bottle) => (
          <article
            key={bottle.id}
            className="bg-[#181513] border border-[#F5F0E6]/10 rounded-xl p-6 flex flex-col justify-between hover:border-[#F5F0E6]/25 transition-colors"
          >
            <div>
              {/* Unboxed Metadata Kicker */}
              <div className="flex items-center justify-between text-xs text-[#A39B8B] font-mono-tabular">
                <span>
                  {bottle.vintage} · {bottle.classification}
                </span>
                <span>{bottle.rackLocation}</span>
              </div>

              <h2 className="text-xl font-serif-display font-semibold text-[#F5F0E6] mt-2">
                {bottle.name}
              </h2>
              <p className="text-xs text-[#D4AF37] font-medium mt-0.5">
                {bottle.winery} · {bottle.village}
              </p>

              {/* Analytical & Terroir Line */}
              <p className="text-xs text-[#A39B8B] font-mono-tabular mt-3 pt-3 border-t border-[#F5F0E6]/10">
                {bottle.grape} · {bottle.soilType}
              </p>
              <p className="text-xs text-[#A39B8B] font-mono-tabular mt-1">
                Säure {bottle.acidityGL} g/l · RZ {bottle.residualSugarGL} g/l ·{' '}
                {bottle.alcoholPct}% Vol. · Reife {bottle.drinkingWindow}
              </p>

              {/* Sensory Notes */}
              <div className="mt-4 space-y-1.5 text-xs text-[#F5F0E6]/85 leading-relaxed">
                <p>
                  <span className="text-[#A39B8B]">Nase:</span>{' '}
                  {bottle.sensoryProfile.nose}
                </p>
                <p>
                  <span className="text-[#A39B8B]">Gaumen:</span>{' '}
                  {bottle.sensoryProfile.palate}
                </p>
              </div>

              {/* Food Pairings */}
              <p className="text-xs text-[#A39B8B] mt-3">
                <span className="text-[#F5F0E6]/90 font-medium">Begleitung:</span>{' '}
                {bottle.foodPairing.join(' · ')}
              </p>
            </div>

            {/* Interactive Footer: Stock Steppers + Actions */}
            <div className="mt-6 pt-4 border-t border-[#F5F0E6]/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#A39B8B] font-mono-tabular">
                  Lagerbestand:{' '}
                  <strong className="text-[#F5F0E6]">{bottle.quantity} Flaschen</strong>
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onUpdateBottleQuantity(bottle.id, -1)}
                    disabled={bottle.quantity <= 0}
                    className="p-1.5 rounded bg-[#0F0D0C] border border-[#F5F0E6]/15 text-[#F5F0E6] hover:border-[#D4AF37] disabled:opacity-40 cursor-pointer"
                    title="Flasche entkorken (-1)"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateBottleQuantity(bottle.id, 1)}
                    className="p-1.5 rounded bg-[#0F0D0C] border border-[#F5F0E6]/15 text-[#F5F0E6] hover:border-[#D4AF37] cursor-pointer"
                    title="Flasche nachlagern (+1)"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTastingModalBottle(bottle)}
                  className="px-3 py-2 rounded-lg bg-[#0F0D0C] border border-[#F5F0E6]/15 text-xs text-[#F5F0E6] hover:border-[#D4AF37] transition-colors flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                >
                  <NotebookPen className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Notiz erfassen</span>
                </button>
                <button
                  type="button"
                  onClick={() => onConsultBottleInLive(bottle)}
                  className="px-3 py-2 rounded-lg bg-[#211D1A] border border-[#D4AF37]/40 text-xs text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0F0D0C] font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Mit Geist verkosten</span>
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>

      {/* Tasting Journal (Chronik der Verkostungen) */}
      <section className="bg-[#181513] border border-[#F5F0E6]/10 rounded-xl p-6 sm:p-8">
        <div className="pb-5 border-b border-[#F5F0E6]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[#A39B8B]">
              Sensorisches Gedächtnis
            </p>
            <h2 className="text-2xl font-serif-display font-semibold text-[#F5F0E6] mt-0.5">
              Verkostungsjournal & Bewertungen
            </h2>
          </div>
          <span className="text-xs font-mono-tabular text-[#A39B8B]">
            100-Punkte-Schema · Chronologisch sortiert
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {tastingNotes.map((note) => (
            <div
              key={note.id}
              className="p-5 rounded-lg bg-[#0F0D0C] border border-[#F5F0E6]/10 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-mono-tabular text-[#A39B8B]">
                  <span>
                    {note.date} · {note.occasion}
                  </span>
                  <span className="text-[#D4AF37] font-semibold">
                    {note.rating} / 100 Punkte
                  </span>
                </div>
                <h3 className="text-lg font-serif-display font-semibold text-[#F5F0E6] mt-1.5">
                  {note.vintage} {note.bottleName}
                </h3>
                <div className="mt-3 space-y-1.5 text-xs text-[#F5F0E6]/85 leading-relaxed">
                  <p>
                    <span className="text-[#A39B8B]">Nase:</span> {note.noseNotes}
                  </p>
                  <p>
                    <span className="text-[#A39B8B]">Gaumen:</span> {note.palateNotes}
                  </p>
                  <p>
                    <span className="text-[#A39B8B]">Abgang:</span> {note.finishNotes}
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-[#F5F0E6]/10 text-xs italic font-serif-display text-[#D4AF37]">
                „{note.spiritReflection}“
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Modal: Verkostungsnotiz anlegen */}
      {tastingModalBottle && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-[#181513] border border-[#F5F0E6]/20 rounded-xl max-w-lg w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#F5F0E6]/10 pb-3">
              <div>
                <p className="text-xs text-[#A39B8B] font-mono-tabular">
                  Verkostungsprotokoll · {tastingModalBottle.vintage}
                </p>
                <h3 className="text-xl font-serif-display font-semibold text-[#F5F0E6]">
                  {tastingModalBottle.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setTastingModalBottle(null)}
                className="p-1.5 text-[#A39B8B] hover:text-[#F5F0E6] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTastingNote} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#A39B8B] mb-1">
                    Punkte-Bewertung (85–100)
                  </label>
                  <input
                    type="number"
                    min={85}
                    max={100}
                    value={noteRating}
                    onChange={(e) => setNoteRating(Number(e.target.value))}
                    className="w-full bg-[#0F0D0C] border border-[#F5F0E6]/15 rounded-lg px-3 py-2 text-xs text-[#F5F0E6] font-mono-tabular"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#A39B8B] mb-1">
                    Anlass / Glas
                  </label>
                  <input
                    type="text"
                    value={noteOccasion}
                    onChange={(e) => setNoteOccasion(e.target.value)}
                    className="w-full bg-[#0F0D0C] border border-[#F5F0E6]/15 rounded-lg px-3 py-2 text-xs text-[#F5F0E6]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#A39B8B] mb-1">
                  Nase (Bouquet & Primär-/Tertiäraromen)
                </label>
                <input
                  type="text"
                  value={noteNose}
                  onChange={(e) => setNoteNose(e.target.value)}
                  placeholder={tastingModalBottle.sensoryProfile.nose}
                  className="w-full bg-[#0F0D0C] border border-[#F5F0E6]/15 rounded-lg px-3 py-2 text-xs text-[#F5F0E6]"
                />
              </div>

              <div>
                <label className="block text-xs text-[#A39B8B] mb-1">
                  Gaumen (Säurebogen, Mineralik, Textur)
                </label>
                <input
                  type="text"
                  value={notePalate}
                  onChange={(e) => setNotePalate(e.target.value)}
                  placeholder={tastingModalBottle.sensoryProfile.palate}
                  className="w-full bg-[#0F0D0C] border border-[#F5F0E6]/15 rounded-lg px-3 py-2 text-xs text-[#F5F0E6]"
                />
              </div>

              <div>
                <label className="block text-xs text-[#A39B8B] mb-1">
                  Abgang (Länge & Nachhall)
                </label>
                <input
                  type="text"
                  value={noteFinish}
                  onChange={(e) => setNoteFinish(e.target.value)}
                  placeholder={tastingModalBottle.sensoryProfile.finish}
                  className="w-full bg-[#0F0D0C] border border-[#F5F0E6]/15 rounded-lg px-3 py-2 text-xs text-[#F5F0E6]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F5F0E6]/10">
                <button
                  type="button"
                  onClick={() => setTastingModalBottle(null)}
                  className="px-4 py-2 rounded-lg bg-[#0F0D0C] border border-[#F5F0E6]/15 text-xs text-[#A39B8B] hover:text-[#F5F0E6] cursor-pointer"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#D4AF37] text-[#0F0D0C] font-semibold text-xs hover:bg-[#e0bd42] cursor-pointer"
                >
                  Verkostung speichern
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Neue Flasche einlagern */}
      {showAddBottleModal && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-[#181513] border border-[#F5F0E6]/20 rounded-xl max-w-lg w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#F5F0E6]/10 pb-3">
              <div className="flex items-center gap-2">
                <Wine className="w-4 h-4 text-[#D4AF37]" />
                <h3 className="text-xl font-serif-display font-semibold text-[#F5F0E6]">
                  Neue Pfälzer Flasche einlagern
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddBottleModal(false)}
                className="p-1.5 text-[#A39B8B] hover:text-[#F5F0E6] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBottle} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#A39B8B] mb-1">
                    Lagen- & Weinname
                  </label>
                  <input
                    type="text"
                    required
                    value={newBottleName}
                    onChange={(e) => setNewBottleName(e.target.value)}
                    placeholder="z.B. Forster Ungeheuer Riesling GG"
                    className="w-full bg-[#0F0D0C] border border-[#F5F0E6]/15 rounded-lg px-3 py-2 text-xs text-[#F5F0E6]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#A39B8B] mb-1">
                    Weingut
                  </label>
                  <input
                    type="text"
                    required
                    value={newBottleWinery}
                    onChange={(e) => setNewBottleWinery(e.target.value)}
                    placeholder="z.B. Weingut Bassermann-Jordan"
                    className="w-full bg-[#0F0D0C] border border-[#F5F0E6]/15 rounded-lg px-3 py-2 text-xs text-[#F5F0E6]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-[#A39B8B] mb-1">
                    Jahrgang
                  </label>
                  <input
                    type="number"
                    value={newBottleVintage}
                    onChange={(e) => setNewBottleVintage(Number(e.target.value))}
                    className="w-full bg-[#0F0D0C] border border-[#F5F0E6]/15 rounded-lg px-3 py-2 text-xs text-[#F5F0E6] font-mono-tabular"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#A39B8B] mb-1">
                    Rebsorte
                  </label>
                  <select
                    value={newBottleGrape}
                    onChange={(e) => setNewBottleGrape(e.target.value as GrapeVariety)}
                    className="w-full bg-[#0F0D0C] border border-[#F5F0E6]/15 rounded-lg px-2.5 py-2 text-xs text-[#F5F0E6]"
                  >
                    <option value="Riesling">Riesling</option>
                    <option value="Spätburgunder">Spätburgunder</option>
                    <option value="Weißburgunder">Weißburgunder</option>
                    <option value="Grauburgunder">Grauburgunder</option>
                    <option value="Scheurebe">Scheurebe</option>
                    <option value="Dornfelder">Dornfelder</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-[#A39B8B] mb-1">
                    Anzahl Flaschen
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={newBottleQuantity}
                    onChange={(e) => setNewBottleQuantity(Number(e.target.value))}
                    className="w-full bg-[#0F0D0C] border border-[#F5F0E6]/15 rounded-lg px-3 py-2 text-xs text-[#F5F0E6] font-mono-tabular"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#A39B8B] mb-1">
                    Terroir / Geologie
                  </label>
                  <select
                    value={newBottleSoil}
                    onChange={(e) => setNewBottleSoil(e.target.value as SoilCategory)}
                    className="w-full bg-[#0F0D0C] border border-[#F5F0E6]/15 rounded-lg px-2.5 py-2 text-xs text-[#F5F0E6]"
                  >
                    <option value="Basalt & Buntsandstein">Basalt & Buntsandstein</option>
                    <option value="Kalkmergel & Tertiärkalk">Kalkmergel & Tertiärkalk</option>
                    <option value="Muschelkalk">Muschelkalk</option>
                    <option value="Rotliegendes Schieferton">Rotliegendes Schieferton</option>
                    <option value="Buntsandsteinverwitterung">Buntsandsteinverwitterung</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-[#A39B8B] mb-1">
                    Klassifikation
                  </label>
                  <select
                    value={newBottleClass}
                    onChange={(e) =>
                      setNewBottleClass(e.target.value as VdpClassification)
                    }
                    className="w-full bg-[#0F0D0C] border border-[#F5F0E6]/15 rounded-lg px-2.5 py-2 text-xs text-[#F5F0E6]"
                  >
                    <option value="VDP.Grosse Lage">VDP.Grosse Lage</option>
                    <option value="VDP.Erste Lage">VDP.Erste Lage</option>
                    <option value="VDP.Ortswein">VDP.Ortswein</option>
                    <option value="VDP.Gutswein">VDP.Gutswein</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-[#A39B8B] mb-1">
                    Säure (g/l)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newBottleAcid}
                    onChange={(e) => setNewBottleAcid(Number(e.target.value))}
                    className="w-full bg-[#0F0D0C] border border-[#F5F0E6]/15 rounded-lg px-3 py-2 text-xs text-[#F5F0E6] font-mono-tabular"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#A39B8B] mb-1">
                    Restzucker (g/l)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newBottleSugar}
                    onChange={(e) => setNewBottleSugar(Number(e.target.value))}
                    className="w-full bg-[#0F0D0C] border border-[#F5F0E6]/15 rounded-lg px-3 py-2 text-xs text-[#F5F0E6] font-mono-tabular"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#A39B8B] mb-1">
                    Alkohol (% Vol.)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={newBottleAlcohol}
                    onChange={(e) => setNewBottleAlcohol(Number(e.target.value))}
                    className="w-full bg-[#0F0D0C] border border-[#F5F0E6]/15 rounded-lg px-3 py-2 text-xs text-[#F5F0E6] font-mono-tabular"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#A39B8B] mb-1">
                  Sensorische Signatur (Nase & Gaumen)
                </label>
                <input
                  type="text"
                  value={newBottleNose}
                  onChange={(e) => setNewBottleNose(e.target.value)}
                  className="w-full bg-[#0F0D0C] border border-[#F5F0E6]/15 rounded-lg px-3 py-2 text-xs text-[#F5F0E6]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F5F0E6]/10">
                <button
                  type="button"
                  onClick={() => setShowAddBottleModal(false)}
                  className="px-4 py-2 rounded-lg bg-[#0F0D0C] border border-[#F5F0E6]/15 text-xs text-[#A39B8B] hover:text-[#F5F0E6] cursor-pointer"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#D4AF37] text-[#0F0D0C] font-semibold text-xs hover:bg-[#e0bd42] cursor-pointer"
                >
                  In den Weinkeller aufnehmen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
