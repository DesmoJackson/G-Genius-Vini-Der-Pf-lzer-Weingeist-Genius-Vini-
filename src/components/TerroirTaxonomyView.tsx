import React, { useState } from 'react';
import { Compass, Layers, Sparkles, CheckCircle2 } from 'lucide-react';
import {
  PFALZ_TERROIR_PROFILES,
  TastingNote,
  TerroirGeologicalProfile,
  VISUAL_ASSETS,
  WineBottle,
} from '../data/pfalzDomain';

interface TerroirTaxonomyViewProps {
  bottles: WineBottle[];
  tastingNotes: TastingNote[];
  onExploreTerroirWithSpirit: (terroir: TerroirGeologicalProfile) => void;
}

export const TerroirTaxonomyView: React.FC<TerroirTaxonomyViewProps> = ({
  bottles,
  tastingNotes,
  onExploreTerroirWithSpirit,
}) => {
  const [selectedTerroir, setSelectedTerroir] =
    useState<TerroirGeologicalProfile>(PFALZ_TERROIR_PROFILES[1]);
  const [geoImgFailed, setGeoImgFailed] = useState(false);

  // Compute taxonomic collection status across the 5 Pfalz geological formations
  const collectedSoils = new Set(bottles.map((b) => b.soilType));
  const tastedBottleIds = new Set(tastingNotes.map((n) => n.bottleId));

  const matchingBottlesForSelected = bottles.filter(
    (b) => b.soilType === selectedTerroir.soilCategory
  );

  return (
    <div className="space-y-10">
      {/* Editorial Hero & Geological Specimens */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch bg-[#181513] border border-[#F5F0E6]/10 rounded-xl overflow-hidden">
        <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#A39B8B]">
              Taxonomie-Sammlung · Geologie der Pfalz
            </p>
            <h1 className="text-3xl sm:text-4xl font-serif-display font-semibold text-[#F5F0E6] mt-1 text-balance">
              Das Terroir-Lexikon: Vom Urmeer-Kalk zum Vulkan-Basalt
            </h1>
            <p className="text-sm text-[#A39B8B] mt-3 max-w-2xl leading-relaxed">
              Seit der Römerzeit prägt der Grabenbruch des Oberrheins entlang der
              Haardt ein geologisches Mosaik auf engstem Raum. Jedes Gestein
              steuert Wärmespeicherung, pH-Wert und die unverwechselbare
              Säure-Architektur im Glas.
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-[#F5F0E6]/10 flex flex-wrap items-center gap-8 text-xs font-mono-tabular text-[#A39B8B]">
            <div>
              <span className="block text-[11px] uppercase text-[#A39B8B]/70">
                Erschlossene Terroir-Formationen
              </span>
              <span className="text-lg font-semibold text-[#D4AF37]">
                {collectedSoils.size} von {PFALZ_TERROIR_PROFILES.length} Gesteinsarten
              </span>
            </div>
            <span>·</span>
            <div>
              <span className="block text-[11px] uppercase text-[#A39B8B]/70">
                Verkostete Referenz-Parzellen
              </span>
              <span className="text-lg font-semibold text-[#F5F0E6]">
                {tastedBottleIds.size} Lagen dokumentiert
              </span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 relative min-h-[240px] bg-[#0F0D0C]">
          {!geoImgFailed ? (
            <img
              src={VISUAL_ASSETS.geologySpecimens}
              alt="Pfälzer Gesteinsproben: Buntsandstein, Kalkmergel und Forster Pechstein-Basalt"
              referrerPolicy="no-referrer"
              onError={() => setGeoImgFailed(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center p-8 text-center text-xs text-[#A39B8B]">
              Geologische Gesteins-Sammlung · Buntsandstein · Kalkmergel · Basalt
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#181513] via-transparent to-transparent lg:bg-gradient-to-r lg:from-[#181513] lg:via-transparent lg:to-transparent" />
        </div>
      </section>

      {/* Interactive 5-Formation Taxonomic Matrix */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 5 Columns: Selector List of the 5 Geological Formations */}
        <div className="lg:col-span-5 space-y-3">
          <p className="text-xs uppercase tracking-[0.18em] text-[#A39B8B] mb-2">
            01. Geologische Leit-Formationen wählen
          </p>
          {PFALZ_TERROIR_PROFILES.map((profile, idx) => {
            const isSelected = profile.id === selectedTerroir.id;
            const inCellar = collectedSoils.has(profile.soilCategory);
            return (
              <button
                key={profile.id}
                type="button"
                onClick={() => setSelectedTerroir(profile)}
                className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                  isSelected
                    ? 'bg-[#211D1A] border-[#D4AF37]/50 text-[#F5F0E6]'
                    : 'bg-[#181513] border-[#F5F0E6]/10 text-[#A39B8B] hover:text-[#F5F0E6] hover:border-[#F5F0E6]/25'
                }`}
              >
                <div>
                  <div className="text-[11px] font-mono-tabular text-[#A39B8B]">
                    0{idx + 1} · {profile.geologicalAge}
                  </div>
                  <h2 className="text-lg font-serif-display font-semibold text-[#F5F0E6] mt-0.5">
                    {profile.name}
                  </h2>
                  <p className="text-xs text-[#A39B8B] mt-1">
                    Orte: {profile.keyVillages.join(', ')}
                  </p>
                </div>

                <div className="shrink-0 flex flex-col items-end">
                  {inCellar ? (
                    <span className="text-[11px] font-mono-tabular text-[#D4AF37] flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Im Keller</span>
                    </span>
                  ) : (
                    <span className="text-[11px] font-mono-tabular text-[#A39B8B]/60">
                      Offen
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Right 7 Columns: Detailed Specimen Dossier */}
        <div className="lg:col-span-7 bg-[#181513] border border-[#F5F0E6]/10 rounded-xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#F5F0E6]/10">
            <div>
              <p className="text-xs font-mono-tabular text-[#D4AF37]">
                {selectedTerroir.soilCategory} · {selectedTerroir.geologicalAge}
              </p>
              <h2 className="text-2xl sm:text-3xl font-serif-display font-semibold text-[#F5F0E6] mt-1">
                {selectedTerroir.name}
              </h2>
            </div>

            <button
              type="button"
              onClick={() => onExploreTerroirWithSpirit(selectedTerroir)}
              className="px-4 py-2.5 rounded-lg bg-[#D4AF37] text-[#0F0D0C] font-semibold text-xs hover:bg-[#e0bd42] transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 self-start sm:self-auto"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Weingeist zu diesem Boden befragen</span>
            </button>
          </div>

          {/* Accession Metadata Definition Grid */}
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div className="p-4 rounded-lg bg-[#0F0D0C] border border-[#F5F0E6]/10">
              <dt className="text-[#A39B8B] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Mineralische Signatur & Bodenphysik</span>
              </dt>
              <dd className="text-[#F5F0E6] mt-2 leading-relaxed">
                {selectedTerroir.mineralSignature}
              </dd>
            </div>

            <div className="p-4 rounded-lg bg-[#0F0D0C] border border-[#F5F0E6]/10">
              <dt className="text-[#A39B8B] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Säure-Architektur & pH-Pufferung</span>
              </dt>
              <dd className="text-[#F5F0E6] mt-2 leading-relaxed">
                {selectedTerroir.acidStructure}
              </dd>
            </div>
          </dl>

          <div className="p-4 rounded-lg bg-[#0F0D0C] border border-[#F5F0E6]/10">
            <h3 className="text-xs uppercase tracking-wider text-[#A39B8B]">
              Sensorischer Fingerabdruck im Glas
            </h3>
            <p className="text-sm font-serif-display italic text-[#F5F0E6] mt-1.5">
              „{selectedTerroir.sensoryImprint}“
            </p>
            <p className="text-xs text-[#A39B8B] font-mono-tabular mt-3">
              Berühmte VDP.Grosse Lagen: {selectedTerroir.flagshipSites.join(' · ')}
            </p>
          </div>

          {/* Matching Bottles in User's Cellar */}
          <div className="pt-4 border-t border-[#F5F0E6]/10">
            <h3 className="text-xs uppercase tracking-wider text-[#A39B8B] mb-3">
              Ihre eingelagerten Referenzflaschen auf {selectedTerroir.soilCategory} (
              {matchingBottlesForSelected.length})
            </h3>
            {matchingBottlesForSelected.length === 0 ? (
              <p className="text-xs text-[#A39B8B]">
                Noch keine Flasche dieses Bodentyps im Keller eingelagert.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {matchingBottlesForSelected.map((b) => (
                  <div
                    key={b.id}
                    className="p-3.5 rounded-lg bg-[#0F0D0C] border border-[#F5F0E6]/10"
                  >
                    <p className="text-[11px] font-mono-tabular text-[#A39B8B]">
                      {b.vintage} · {b.classification} · {b.quantity} Fl.
                    </p>
                    <p className="text-sm font-serif-display font-semibold text-[#F5F0E6] mt-0.5">
                      {b.name}
                    </p>
                    <p className="text-xs text-[#D4AF37] mt-0.5">{b.winery}</p>
                    <p className="text-[11px] font-mono-tabular text-[#A39B8B] mt-2">
                      Säure {b.acidityGL} g/l · RZ {b.residualSugarGL} g/l
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
