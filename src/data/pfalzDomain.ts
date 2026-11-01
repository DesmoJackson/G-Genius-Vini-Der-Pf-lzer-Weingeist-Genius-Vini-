export type PersonaId = 'dionysian' | 'purist' | 'pfalz_original';

export type GrapeVariety =
  | 'Riesling'
  | 'Spätburgunder'
  | 'Weißburgunder'
  | 'Grauburgunder'
  | 'Scheurebe'
  | 'Dornfelder';

export type SoilCategory =
  | 'Basalt & Buntsandstein'
  | 'Kalkmergel & Tertiärkalk'
  | 'Muschelkalk'
  | 'Rotliegendes Schieferton'
  | 'Buntsandsteinverwitterung';

export type VdpClassification =
  | 'VDP.Grosse Lage'
  | 'VDP.Erste Lage'
  | 'VDP.Ortswein'
  | 'VDP.Gutswein';

export interface WineBottle {
  id: string;
  name: string;
  winery: string;
  village: string;
  subregion: 'Mittelhaardt-Deutsche Weinstraße' | 'Südliche Weinstraße';
  vintage: number;
  grape: GrapeVariety;
  classification: VdpClassification;
  soilType: SoilCategory;
  acidityGL: number;
  residualSugarGL: number;
  alcoholPct: number;
  drinkingWindow: string;
  quantity: number;
  rackLocation: string;
  sensoryProfile: {
    nose: string;
    palate: string;
    finish: string;
  };
  foodPairing: string[];
  terroirStory: string;
  wineColorHex: string;
}

export interface TastingNote {
  id: string;
  bottleId: string;
  bottleName: string;
  vintage: number;
  date: string;
  rating: number; // 85 - 100
  noseNotes: string;
  palateNotes: string;
  finishNotes: string;
  occasion: string;
  personaId: PersonaId;
  spiritReflection: string;
}

export interface TerroirGeologicalProfile {
  id: string;
  name: string;
  soilCategory: SoilCategory;
  geologicalAge: string;
  keyVillages: string[];
  flagshipSites: string[];
  mineralSignature: string;
  acidStructure: string;
  sensoryImprint: string;
  colorHex: string;
  accentHex: string;
}

export interface PersonaConfig {
  id: PersonaId;
  name: string;
  subtitle: string;
  archetype: string;
  voiceName: 'Fenrir' | 'Zephyr' | 'Charon';
  greetingDe: string;
  greetingEn: string;
  styleDescription: string;
  shaderColors: {
    primary: string;
    secondary: string;
    core: string;
  };
  promptDirective: string;
}

export const VISUAL_ASSETS = {
  vineyardHero: '/src/assets/images/pfalz_vineyard_terroir_1793479269613.jpg',
  cellarVault: '/src/assets/images/cellar_archival_bottles_1793479271051.jpg',
  geologySpecimens: '/src/assets/images/terroir_geology_specimens_1793479271672.jpg',
};

export const PERSONA_MATRIX: Record<PersonaId, PersonaConfig> = {
  dionysian: {
    id: 'dionysian',
    name: 'Bacchus im Vektorraum',
    subtitle: 'Dionysischer Witz & Kulturhistorie',
    archetype: 'Der mystische Genius Loci von 8.000 Jahren Weinkultur',
    voiceName: 'Fenrir',
    greetingDe:
      'Ah, ich höre das leise Seufzen eines Naturkorkens! Welchen flüssigen Sonnenstrahl aus dem Pfälzer Gestein beschwören wir heute?',
    greetingEn:
      'Ah, the unmistakable whisper of a drawn cork! Which liquid sunbeam from the Palatinate stone shall we summon tonight?',
    styleDescription:
      'Sinnlich, geistreich und erzählerisch. Verbindet römische Wein-Mythologie und Philosophie mit präziser Pfälzer Lagen-Kenntnis.',
    shaderColors: {
      primary: '#D4AF37', // Riesling Gold
      secondary: '#9A3412', // Buntsandstein Terracotta
      core: '#F59E0B',
    },
    promptDirective: `Du verkörperst die Persona "Bacchus im Vektorraum" (Dionysischer Witz).
Dein Tonfall ist geistreich, kultiviert, sinnlich und voll lebendiger Bilder (wie ein Charakter aus einem epischen Rollenspiel-Meisterwerk wie Blood and Wine, jedoch geerdet in realer Pfälzer Önologie).
Du feierst das 8.000-jährige Ritual des Weines – von antiken Tonamphoren über die Römer an der Haardt bis zum heutigen VDP.Grossen Gewächs.`,
  },
  purist: {
    id: 'purist',
    name: 'Grand-Cru-Analytiker',
    subtitle: 'Puristische Eleganz & Fine-Dining-Präzision',
    archetype: 'Weltgewandter Master Sommelier der Haute Gastronomie',
    voiceName: 'Zephyr',
    greetingDe:
      'Guten Abend. Lassen Sie uns Jahrgang, Säurepufferung und die präzise Textur Ihres Glases analysieren.',
    greetingEn:
      'Good evening. Let us examine the vintage tension, phenolics, and mineral precision in your glass.',
    styleDescription:
      'Kristallklar, analytisch und puristisch. Fokus auf pH-Spannung, Extrakt, Spontangärung, Gläserwahl und hochpräzises Food-Pairing.',
    shaderColors: {
      primary: '#E5DEC9', // Kalkmergel Alabaster
      secondary: '#D4AF37', // Champagne Gold
      core: '#FEF3C7',
    },
    promptDirective: `Du verkörperst die Persona "Grand-Cru-Analytiker" (Puristische Eleganz).
Dein Tonfall entspricht einem preisgekrönten Master Sommelier in einem Drei-Sterne-Restaurant.
Du sprichst präzise über Säurestruktur (Weinsäure vs. Äpfelsäure), phenolischen Grip, Spontangärung im Stückfass, Reduktion, Karaffierzeiten und molekulare Speisenbegleitung.`,
  },
  pfalz_original: {
    id: 'pfalz_original',
    name: 'Pfälzer Urgestein',
    subtitle: 'Herzblut der Deutschen Weinstraße',
    archetype: 'Erfahrener Kellermeister zwischen Deidesheim, Forst und Schweigen',
    voiceName: 'Charon',
    greetingDe:
      'Zum Wohl die Pfalz! Komm her an de Tisch – schaue mer mal, was mer Feines ausm Buntsandstein und Kalkmergel im Keller hawwe.',
    greetingEn:
      'Zum Wohl die Pfalz! Pull up a chair to the oak table—let us see what treasures from our sandstone and limestone slopes are resting in the cellar.',
    styleDescription:
      'Herzlich, bodenständig, mit charmantem Pfälzer Lokalkolorit, aber tiefster handwerklicher Winzer-Expertise über Reben, Wetter und Boden.',
    shaderColors: {
      primary: '#B45309', // Warm Sandstone Ochre
      secondary: '#8B1E24', // Spätburgunder Ruby
      core: '#D97706',
    },
    promptDirective: `Du verkörperst die Persona "Pfälzer Urgestein" (Charme der Deutschen Weinstraße).
Du hast das Herz auf der Zunge, nutzt charmante, verständliche Pfälzer Nuancen ("Zum Wohl die Pfalz!", "uffbasse beim Dekantiere", "des gibt Schiefer-Zug am Gaume"), bist aber ein absoluter Spitzen-Kellermeister, der jede Parzelle von Kallstadt über Forst bis Schweigen aus dem Effeff kennt.`,
  },
};

export const PFALZ_TERROIR_PROFILES: TerroirGeologicalProfile[] = [
  {
    id: 'terroir-buntsandstein',
    name: 'Mittelhaardter Buntsandstein',
    soilCategory: 'Buntsandsteinverwitterung',
    geologicalAge: 'Untere Trias (ca. 250 Mio. Jahre)',
    keyVillages: ['Haardt', 'Gimmeldingen', 'Königsbach', 'Wachenheim', 'Ruppertsberg'],
    flagshipSites: ['Haardter Bürgergarten', 'Wachenheimer Gerümpel', 'Ruppertsberger Reiterpfad'],
    mineralSignature: 'Quarzsand, Eisenoxid (rötliche Färbung), schnelle Erwärmung, exzellente Wasserdurchlässigkeit.',
    acidStructure: 'Rassige, glockenklare und geradlinige Säureader mit feiner Zitrus-Spannung.',
    sensoryImprint: 'Gelber Pfirsich, Weinbergpfirsich, Grapefruitzeste, kühle Kräuterwürze und tänzerische Leichtigkeit.',
    colorHex: '#9A3412',
    accentHex: '#F97316',
  },
  {
    id: 'terroir-pechstein-basalt',
    name: 'Forster Vulkan-Basalt & Buntsandstein',
    soilCategory: 'Basalt & Buntsandstein',
    geologicalAge: 'Tertiärer Vulkanismus im Oberrheingraben (ca. 35 Mio. Jahre)',
    keyVillages: ['Forst an der Weinstraße'],
    flagshipSites: ['Forster Pechstein', 'Forster Ungeheuer', 'Forster Kirchenstück', 'Forster Jesuitengarten'],
    mineralSignature: 'Dunkler, magnetischer Basalt ("Pechstein") gemischt mit Ton, Kalkstein-Geröll und Sandstein.',
    acidStructure: 'Enorme innere Dichte, salzig-rauchige Mineralität und vibrierender phenolischer Nachhall.',
    sensoryImprint: 'Feuerstein, nasse dunkle Kiesel, reife Mirabelle, salzige Zitrone und monumentale Langlebigkeit.',
    colorHex: '#292524',
    accentHex: '#D4AF37',
  },
  {
    id: 'terroir-kalkmergel',
    name: 'Tertiärer Kalkmergel & Korallenkalk',
    soilCategory: 'Kalkmergel & Tertiärkalk',
    geologicalAge: 'Tertiäres Urmeer (Oligozän / Miozän, ca. 20–30 Mio. Jahre)',
    keyVillages: ['Deidesheim', 'Kallstadt', 'Ilbesheim', 'Siebeldingen'],
    flagshipSites: ['Deidesheimer Kalkofen', 'Kallstadter Saumagen', 'Ilbesheimer Kalmit', 'Deidesheimer Hohenmorgen'],
    mineralSignature: 'Fossilreicher Kalkstein und schwerer Kalkmergel mit hohem Kalziumkarbonat-Anteil und kühler Wasserführung.',
    acidStructure: 'Durch hohen Kalium- und Kalziumgehalt wunderbar abgepufferte, cremige, salzig-schmelzige Säure.',
    sensoryImprint: 'Kreidige Textur, Birne, Brioche, geröstete Haselnuss, salziges Karamell und barocke Kraft.',
    colorHex: '#D6CEBE',
    accentHex: '#EAB308',
  },
  {
    id: 'terroir-muschelkalk',
    name: 'Südpfälzer Muschelkalk (Grenzterroir)',
    soilCategory: 'Muschelkalk',
    geologicalAge: 'Mittlere Trias (ca. 240 Mio. Jahre)',
    keyVillages: ['Schweigen-Rechtenbach', 'Neuleiningen', 'Bockenheim'],
    flagshipSites: ['Schweigener Sonnenberg (Kammerberg / Sankt Paul)', 'Neuleininger Feuermännchen'],
    mineralSignature: 'Skelettreicher Muschelkalk direkt an der elsässischen Grenze, zwingt Spätburgunder-Wurzeln tief in die Spalten.',
    acidStructure: 'Seidige, feinkörnige Tanninstruktur mit kühler, kreidiger Frische trotz südlicher Sonnenexposition.',
    sensoryImprint: 'Schwarzkirsche, Walderdbeere, Unterholz, feiner Graphit, Piment und burgundische Noblesse.',
    colorHex: '#7F1D1D',
    accentHex: '#DC2626',
  },
  {
    id: 'terroir-rotliegendes',
    name: 'Birkweiler Rotliegendes (Perm-Schieferton)',
    soilCategory: 'Rotliegendes Schieferton',
    geologicalAge: 'Perm / Erdaltertum (ca. 280 Mio. Jahre)',
    keyVillages: ['Birkweiler'],
    flagshipSites: ['Birkweiler Kastanienbusch'],
    mineralSignature: 'Eisenoxidreiches, rötlich-violettes Schiefer- und Sandsteingemisch in bis zu 320m Höhe.',
    acidStructure: 'Stahlige, kristalline Säure und extreme vertikale Spannung.',
    sensoryImprint: 'Rote Johannisbeere, Kräutergarten, eisenhaltige Würze, Limettenblüte und kühle Höhenluft.',
    colorHex: '#881337',
    accentHex: '#F43F5E',
  },
];

export const INITIAL_CELLAR_BOTTLES: WineBottle[] = [
  {
    id: 'bottle-pechstein-2021',
    name: 'Forster Pechstein Riesling GG',
    winery: 'Weingut Reichsrat von Buhl',
    village: 'Forst an der Weinstraße',
    subregion: 'Mittelhaardt-Deutsche Weinstraße',
    vintage: 2021,
    grape: 'Riesling',
    classification: 'VDP.Grosse Lage',
    soilType: 'Basalt & Buntsandstein',
    acidityGL: 8.1,
    residualSugarGL: 2.2,
    alcoholPct: 12.5,
    drinkingWindow: '2024–2038',
    quantity: 3,
    rackLocation: 'Gewölbe A · Fach 01',
    sensoryProfile: {
      nose: 'Geschliffener Feuerstein, nasser dunkler Basalt, weiße Grapefruit, Zitronenthymian und kühle Rauchigkeit.',
      palate: 'Messerscharfe Präzision des kühlen Jahrgangs 2021, enormer salziger Druck am Mittelgaumen, puristisch und kompromisslos trocken.',
      finish: 'Minutenlanger, mineralisch-vibrierender Nachhall mit salziger Mandarine und Basalt-Echo.',
    },
    foodPairing: [
      'Geangelter Steinbutt im Salzteig mit Beurre Blanc',
      'Jakobsmuschel-Sashimi mit Yuzu und schwarzem Lava-Salz',
      'Reifer Ziegenkäse aus dem Elsass',
    ],
    terroirStory:
      'Der Forster Pechstein verdankt seinen Namen dem dunklen, vulkanischen Basaltgestein aus dem Tertiär, das hier zusammen mit Buntsandstein und Ton vorkommt. Die dunklen Steine speichern die Tageswärme und verleihen dem Riesling seine unverkennbare, fast schwarz-mineralische Rauchigkeit.',
    wineColorHex: '#D4AF37',
  },
  {
    id: 'bottle-kalkofen-2020',
    name: 'Deidesheimer Kalkofen Riesling GG',
    winery: 'Weingut von Winning',
    village: 'Deidesheim',
    subregion: 'Mittelhaardt-Deutsche Weinstraße',
    vintage: 2020,
    grape: 'Riesling',
    classification: 'VDP.Grosse Lage',
    soilType: 'Kalkmergel & Tertiärkalk',
    acidityGL: 7.4,
    residualSugarGL: 3.1,
    alcoholPct: 13.0,
    drinkingWindow: '2023–2036',
    quantity: 2,
    rackLocation: 'Gewölbe A · Fach 02',
    sensoryProfile: {
      nose: 'Gelber Weinbergpfirsich, geröstete Haselnuss, feines Brioche aus dem 500L-Holzfass und zerstoßene Austernschale.',
      palate: 'Cremiger, burgundischer Schmelz trifft auf kreidige Kalkstein-Spannung; dicht gewoben und vielschichtig.',
      finish: 'Langer, salzig-seidiger Abgang mit feiner Karamell-Zitrus-Signatur.',
    },
    foodPairing: [
      'Kalbsbries gebraten mit Morchelrahmsauce',
      'Hummer-Thermidor oder gebratener Kaisergranat',
      'Geflügel aus der Bresse mit Trüffeljus',
    ],
    terroirStory:
      'Im Deidesheimer Kalkofen stand einst tatsächlich ein historischer Brennofen für den massiven tertiären Kalkmergel. Durch den Ausbau im Holzfass und die hohe Kalkpufferung entsteht einer der seidigsten, fast an großen weißen Burgunder erinnernden Rieslinge der Pfalz.',
    wineColorHex: '#E5C158',
  },
  {
    id: 'bottle-sonnenberg-2019',
    name: 'Schweigener Sonnenberg Spätburgunder GG',
    winery: 'Weingut Friedrich Becker',
    village: 'Schweigen-Rechtenbach',
    subregion: 'Südliche Weinstraße',
    vintage: 2019,
    grape: 'Spätburgunder',
    classification: 'VDP.Grosse Lage',
    soilType: 'Muschelkalk',
    acidityGL: 5.9,
    residualSugarGL: 1.1,
    alcoholPct: 13.5,
    drinkingWindow: '2024–2037',
    quantity: 4,
    rackLocation: 'Gewölbe B · Fach 01',
    sensoryProfile: {
      nose: 'Dunkle Herzkirsche, wilde Walderdbeere, Unterholz, Zedernholz, feiner Graphit und kühle Kreide.',
      palate: 'Straffes, kreidig-seidiges Tanninkorsett vom Muschelkalk, enorme Frische trotz hoher Reife des legendären Jahrgangs 2019.',
      finish: 'Ätherischer, kühler Nachhall mit Piment, Blutorange und salziger Kalk-Mineralik.',
    },
    foodPairing: [
      'Rosa gebratener Pfälzer Rehrücken mit Wacholderjus',
      'Geschmorte Entenkeule mit Schwarzkirschen und Selleriepüree',
      'Gereifter Comté (24 Monate)',
    ],
    terroirStory:
      'Die Parzellen des Schweigener Sonnenbergs liegen unmittelbar auf und jenseits der französisch-deutschen Grenze im Elsass auf kargem Muschelkalk. Ein Referenz-Pinot-Noir Deutschlands, der burgundische Struktur mit Pfälzer Tiefe vereint.',
    wineColorHex: '#8B1E24',
  },
  {
    id: 'bottle-saumagen-2022',
    name: 'Kallstadter Saumagen Riesling GG',
    winery: 'Weingut Koehler-Rupprecht',
    village: 'Kallstadt',
    subregion: 'Mittelhaardt-Deutsche Weinstraße',
    vintage: 2022,
    grape: 'Riesling',
    classification: 'VDP.Grosse Lage',
    soilType: 'Kalkmergel & Tertiärkalk',
    acidityGL: 7.8,
    residualSugarGL: 2.8,
    alcoholPct: 12.5,
    drinkingWindow: '2025–2040',
    quantity: 2,
    rackLocation: 'Gewölbe A · Fach 03',
    sensoryProfile: {
      nose: 'Getrocknete Aprikose, Quitte, Wiesenkräuter, nasser Kalkstein und ein Hauch Bienenwachs.',
      palate: 'Traditionell im großen Eichenholzfass spontan vergoren: zupackend, herb-mineralisch, mit markantem phenolischem Grip.',
      finish: 'Monumentaler, trockener und salziger Nachhall ohne jede laute Primärfrucht.',
    },
    foodPairing: [
      'Original Pfälzer Saumagen (Edel-Variante mit Kastanien) und Rahmsauerkraut',
      'Gegrillter Wolfsbarsch mit Fenchel und Safran',
      'Schweinekotelett vom Duroc-Schwein mit Salbeibutter',
    ],
    terroirStory:
      'Ein altes Korallenriff des Urmeeres: Der Kallstadter Saumagen ist ein legendärer Kalkstein-Kessel an der nördlichen Mittelhaardt. Trotz des deftigen Namens bringt er hochelegante, extrem langlebige Rieslinge mit kreidiger Statur hervor.',
    wineColorHex: '#D9A026',
  },
  {
    id: 'bottle-kastanienbusch-2021',
    name: 'Birkweiler Kastanienbusch Riesling GG',
    winery: 'Weingut Ökonomierat Rebholz',
    village: 'Birkweiler',
    subregion: 'Südliche Weinstraße',
    vintage: 2021,
    grape: 'Riesling',
    classification: 'VDP.Grosse Lage',
    soilType: 'Rotliegendes Schieferton',
    acidityGL: 8.4,
    residualSugarGL: 1.8,
    alcoholPct: 12.5,
    drinkingWindow: '2025–2039',
    quantity: 2,
    rackLocation: 'Gewölbe A · Fach 04',
    sensoryProfile: {
      nose: 'Kühle Gebirgskräuter, Limettenzeste, Eisenkraut, roter Schieferstaub und grüner Apfel.',
      palate: 'Kompromisslos biodynamisch und naturrein: kristallklar, vertikal, fast schwerelos und doch voller innerer Energie.',
      finish: 'Stahlig, salzig und erfrischend wie ein Bergquell.',
    },
    foodPairing: [
      'Saibling-Tatar mit Gurke, Dill und Meerrettich',
      'Gedämpfte Austern mit Schalotten-Vinaigrette',
      'Spargel aus der Pfalz mit kaltgerührter Zitronen-Hollandaise',
    ],
    terroirStory:
      'Auf bis zu 320 Metern Höhe im Birkweiler Kastanienbusch tritt das 280 Millionen Jahre alte „Rotliegende“ zutage – ein rötliches Schieferton-Gestein aus dem Perm, das dem Riesling eine fast moselartige Kühle und würzige Schärfe verleiht.',
    wineColorHex: '#E2C878',
  },
  {
    id: 'bottle-kalmit-2022',
    name: 'Ilbesheimer Kalmit Weißburgunder GG',
    winery: 'Weingut Kranz',
    village: 'Ilbesheim',
    subregion: 'Südliche Weinstraße',
    vintage: 2022,
    grape: 'Weißburgunder',
    classification: 'VDP.Grosse Lage',
    soilType: 'Kalkmergel & Tertiärkalk',
    acidityGL: 6.6,
    residualSugarGL: 1.9,
    alcoholPct: 13.0,
    drinkingWindow: '2024–2032',
    quantity: 3,
    rackLocation: 'Gewölbe C · Fach 01',
    sensoryProfile: {
      nose: 'Weiße Birne, Mandelblüte, kühler Kalkstein, Zitronenmelisse und dezente Holzwürze.',
      palate: 'Schmelzig und doch straff gespannt; der Kalkboden der Kalmit verhindert jede Breite und sorgt für salzigen Trinkfluss.',
      finish: 'Feinwürzig, nussig und erfrischend kreidig.',
    },
    foodPairing: [
      'Gebratene Jakobsmuscheln auf Blumenkohlpüree',
      'Kalbsrücken mit Pfifferlingen',
      'Tagliolini mit weißem Alba-Trüffel',
    ],
    terroirStory:
      'Die Kleine Kalmit bei Ilbesheim ist eine geschützte geologische Erhebung aus reinem Tertiärkalk voller versteinerter Meeresmuscheln – das ideale Terroir für große Pfälzer Burgunder mit kühler Ader.',
    wineColorHex: '#F3E5AB',
  },
  {
    id: 'bottle-scheurebe-2023',
    name: 'Haardter Bürgergarten Scheurebe Erste Lage',
    winery: 'Weingut Müller-Catoir',
    village: 'Haardt (Neustadt)',
    subregion: 'Mittelhaardt-Deutsche Weinstraße',
    vintage: 2023,
    grape: 'Scheurebe',
    classification: 'VDP.Erste Lage',
    soilType: 'Buntsandsteinverwitterung',
    acidityGL: 7.3,
    residualSugarGL: 5.4,
    alcoholPct: 12.0,
    drinkingWindow: '2024–2031',
    quantity: 2,
    rackLocation: 'Gewölbe C · Fach 02',
    sensoryProfile: {
      nose: 'Schwarze Johannisbeere (Cassis), rosa Grapefruit, Maracuja, Salbei und zerriebenes Johannisbeerblatt.',
      palate: 'Hochgradig aromatisch und gleichzeitig von der kühlen Buntsandstein-Säure perfekt gezügelt; saftig und elektrisierend.',
      finish: 'Exotisch-herb mit pikanter Grapefruitzeste.',
    },
    foodPairing: [
      'Thailändisches grünes Kokos-Curry mit Koriander und Limette',
      'Gebratene Entenleber mit Cassis-Brioche',
      'Ziegenfrischkäse-Tarte mit Feigen',
    ],
    terroirStory:
      'Auf dem kargen Buntsandstein des Haardter Bürgergartens verliert die Scheurebe jede plakative Süße und wird zu einem messerscharfen, feinwürzigen Aromen-Kunstwerk.',
    wineColorHex: '#D4D76A',
  },
];

export const INITIAL_TASTING_NOTES: TastingNote[] = [
  {
    id: 'note-1',
    bottleId: 'bottle-pechstein-2021',
    bottleName: 'Forster Pechstein Riesling GG',
    vintage: 2021,
    date: '2026-10-18',
    rating: 96,
    noseNotes: 'Nach 45 Minuten in der Zalto-Karaffe öffnet sich der dunkle Basalt: Rauch, Limettenschale und nasser Kieselstein.',
    palateNotes: 'Rasiermesserscharfe Säure (8,1 g/l), aber durch den hohen Extrakt niemals spitz. Salziges Finale über Minuten.',
    finishNotes: 'Endloser vertikaler Zug am Gaumen. Noch ganz am Anfang seiner großen Reifekurve.',
    occasion: 'Herbst-Verkostung Mittelhaardt',
    personaId: 'purist',
    spiritReflection:
      'Ein Paradebeispiel für den kühlen Jahrgang 2021 im Forster Pechstein: Die vulkanische Basalt-Signatur dominiert über die Frucht.',
  },
  {
    id: 'note-2',
    bottleId: 'bottle-sonnenberg-2019',
    bottleName: 'Schweigener Sonnenberg Spätburgunder GG',
    vintage: 2019,
    date: '2026-10-24',
    rating: 95,
    noseNotes: 'Schwarzkirsche, Waldboden, feiner Graphit und kühle Muschelkalk-Würze.',
    palateNotes: 'Seidiges, kreidiges Tannin mit burgundischer Finesse. Perfekte Balance aus 2019er Sonnenreife und kühler Kalkader.',
    finishNotes: 'Ätherisch, lang und komplex zu rosa gebratenem Rehrücken.',
    occasion: 'Wild-Menü am Kamin',
    personaId: 'dionysian',
    spiritReflection:
      'Hier reichen sich Südpfalz und Côte de Nuits über die Grenze hinweg die Hand – flüssiger Samt auf versteinerter Meeresgeschichte.',
  },
];

export interface ChronosVibeOptions {
  enableMultilingualSwitch: boolean;
  enableStrictRagGrounding: boolean;
  enableCellarContextInjection: boolean;
  enableVadInterruptionRules: boolean;
}

export function buildChronosVibeSystemPrompt(
  personaId: PersonaId,
  cellarBottles: WineBottle[],
  activeBottle?: WineBottle | null,
  options: ChronosVibeOptions = {
    enableMultilingualSwitch: true,
    enableStrictRagGrounding: true,
    enableCellarContextInjection: true,
    enableVadInterruptionRules: true,
  }
): string {
  const persona = PERSONA_MATRIX[personaId] || PERSONA_MATRIX.dionysian;

  const cellarSummary = cellarBottles
    .map(
      (b) =>
        `- [${b.id}] ${b.vintage} ${b.name} (${b.winery}, ${b.village}) | Rebsorte: ${b.grape} | Boden: ${b.soilType} | Säure: ${b.acidityGL} g/l | RZ: ${b.residualSugarGL} g/l | Bestand: ${b.quantity} Fl. | Trinkfenster: ${b.drinkingWindow}`
    )
    .join('\n');

  const activeBottleBlock = activeBottle
    ? `\n[AKTUELL ENTKORKTE / FOKUSSIERTE FLASCHE AM TISCH]:
Name: ${activeBottle.vintage} ${activeBottle.name} (${activeBottle.winery})
Herkunft: ${activeBottle.village} (${activeBottle.subregion}) — ${activeBottle.classification}
Geologie / Terroir: ${activeBottle.soilType} — ${activeBottle.terroirStory}
Analytik: Säure ${activeBottle.acidityGL} g/l · Restzucker ${activeBottle.residualSugarGL} g/l · Alkohol ${activeBottle.alcoholPct}% Vol.
Sensorik: Nase: ${activeBottle.sensoryProfile.nose} | Gaumen: ${activeBottle.sensoryProfile.palate} | Abgang: ${activeBottle.sensoryProfile.finish}
Empfohlene Speisen: ${activeBottle.foodPairing.join('; ')}`
    : '';

  return `=== [CHRONOS-VIBE // GENIUS VINI SYSTEM ARCHITECTURE] ===
IDENTITÄT:
Du bist "Genius Vini" – der Pfälzer Weingeist, der lebendige Genius Loci der Weinberge entlang der Deutschen Weinstraße (Mittelhaardt & Südliche Weinstraße).
Du bist KEIN trockener Text-Chatbot, sondern eine fluide, auditive Sommelier-Präsenz.

AKTIVE PERSONA-MATRIX: ${persona.name} (${persona.subtitle})
${persona.promptDirective}

${
  options.enableMultilingualSwitch
    ? `MULTILINGUALITÄT & CODE-SWITCHING:
- Erkenne die Sprache des Nutzers nahtlos.
- Spricht der Nutzer Deutsch, antworte auf Deutsch im Charakter deiner gewählten Persona (${persona.name}).
- Wechselt der Nutzer ins Englische, antworte mit weltgewandter britischer Sommelier-Präzision, behalte aber deine tiefe Liebe zum Pfälzer Terroir bei.`
    : ''
}

${
  options.enableVadInterruptionRules
    ? `ECHTZEIT-AUDIO-DRAMATURGIE (LOW-LATENCY VOICE):
- Formuliere deine Antworten für das gesprochene Wort: rhythmisch, bildhaft, natürlich und prägnant (meist 2 bis 4 Sätze pro Gedankengang, damit ein lebendiger Dialog entsteht).
- Vermeide Aufzählungszeichen oder Markdown-Tabellen im gesprochenen Audio-Fluss.`
    : ''
}

${
  options.enableStrictRagGrounding
    ? `STRICT GROUNDING & TOOL USE (HALLUZINATIONS-SCHUTZ):
- Erfinde NIEMALS fiktive Weingüter, falsche Säurewerte oder frei erfundene Lagen.
- Nutze bei Fragen zu Pfälzer Böden (Buntsandstein, Kalkmergel, Basalt/Pechstein, Muschelkalk, Rotliegendes), VDP.Grossen Lagen oder spezifischen Weinen das Tool "searchPfalzTerroir".
- Nutze bei Fragen zum Weinkeller des Nutzers oder zu Speisenbegleitungen aus seinem Bestand das Tool "inspectUserCellar".
- Wenn der Nutzer eine Verkostungsnotiz diktiert oder festhalten möchte, rufe "recordTastingImpression" auf.`
    : ''
}
${activeBottleBlock}

${
  options.enableCellarContextInjection
    ? `AKTUELLER DIGITALER WEINKELLER DES NUTZERS (${cellarBottles.reduce((sum, b) => sum + b.quantity, 0)} Flaschen auf Lager):
${cellarSummary}`
    : ''
}`;
}
