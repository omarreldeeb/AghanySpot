import catalog from './catalogSongs.json';

const assetPath = (path) =>
  `${import.meta.env.BASE_URL}${path.split('/').map(encodeURIComponent).join('/')}`;

const importedCovers = import.meta.glob('../../Songs/Covers/*.{jpg,jpeg,png,webp}', {
  eager: true,
  import: 'default',
  query: '?url',
});

const coverFiles = Object.entries(importedCovers).map(([source, url]) => ({
  name: decodeURIComponent(source.split('/').pop() || ''),
  url,
}));

const normalize = (value = '') => value
  .toLowerCase()
  .normalize('NFKD')
  .replace(/[^a-z0-9]+/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const noisePattern = /\((?:[^)]*(?:official|lyric|audio|music video|video|concert|فيديو|كلمات|حفل|إعلان)[^)]*)\)|\[(?:[^\]]*(?:official|lyric|audio|music video|video|concert|فيديو|كلمات|حفل|إعلان)[^\]]*)\]/gi;
const arabicPattern = /[\u0600-\u06ff]/;

const stripNoise = (value = '') => value
  .replace(noisePattern, '')
  .replace(/\b(?:official|lyric|audio|music|video)\b/gi, '')
  .replace(/(?:الكليب الرسمي|الكليب|فيديو كليب|كلمات|ماونتن ڤيو رمضان|من مسلسل كامل العدد\+*)/g, '')
  .replace(/^(?:Amr Diab|عمرو دياب)\s*\.{2,}\s*/i, '')
  .replace(/\s+/g, ' ')
  .trim();

const cleanEnglishTitle = (value = '', artist = '') => {
  if (value === 'Etisalat 2024') return 'El Sa3at El Helwa Mabt5lash';
  let title = stripNoise(value).split(/[|｜]/)[0].trim();
  const cleanArtist = stripNoise(artist);
  if (cleanArtist && cleanArtist !== 'Various') {
    title = title.replace(new RegExp(`^${cleanArtist.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*[-–—:]\\s*`, 'i'), '');
  }
  return title.replace(/\s*[-–—:]\s*$/, '').trim();
};

const cleanArabicTitle = (value = '', fallback = '') => {
  const source = stripNoise(value)
    .replace(/[()[\]]/g, '')
    .replace(/\bكلمات\b/g, '')
    .replace(/(?:الكليب الرسمي|الكليب|فيديو كليب|ماونتن ڤيو رمضان|من مسلسل كامل العدد\+*)/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  const parts = source.split(/[|｜]/).map((part) => part.trim()).filter(Boolean);
  const arabicPart = [...parts].reverse().find((part) => arabicPattern.test(part));
  const title = arabicPart || (arabicPattern.test(source) ? source : fallback);
  return title
    .replace(/^.*[-–—:]\s*/, '')
    .replace(/\bكلمات\b/g, '')
    .trim();
};

const artistHint = (entry) => {
  const source = `${entry.title_en} ${entry.title_ar} ${entry.artist_en} ${entry.artist_ar} ${entry.audio_file}`;
  const hints = [
    [/Hekayetna Helwa|Amr Diab/i, 'Amr Diab'],
    [/Amr Diab|عمرو دياب/i, 'Amr Diab'],
    [/شيرين|Sherine/i, 'Sherine'],
    [/الساعات الحلوة|Angham El Sa3at/i, 'Mohamed Ramadan & Angham'],
    [/أكتر و أكتر|Ekter W Akter/i, 'Sherine'],
    [/اسمراني عيونه سمرا|Asmrani Eyounoh/i, 'Hussain Aljassmi'],
    [/اتكلم كل يوم يومين|Etklm Kol Youm/i, 'Hussain Aljassmi'],
    [/رمضان في مصر حاجة تانية|Ramadan Fi Masr/i, 'Hussain Aljassmi'],
    [/سر السعاده|Ser Alsada/i, 'Hussain Aljassmi'],
    [/رمضان كريم|Ramadan Karim/i, 'Hakim'],
    [/ألف تحية|Alf Ta7eya/i, 'Ahmed Saad'],
    [/ألف مرة|Alf Mara/i, 'Ahmed Saad'],
    [/محمود العسيلي|Mahmoud El Esseily/i, 'Mahmoud El Esseily'],
    [/أمير عيد|Amir Eid/i, 'Amir Eid'],
  ];
  return hints.find(([pattern]) => pattern.test(source))?.[1] || stripNoise(entry.artist_en);
};

const cleanEntryMetadata = (entry) => {
  const artist = artistHint(entry);
  const title = cleanEnglishTitle(entry.title_en, artist);
  const arabicTitle = cleanArabicTitle(entry.title_ar, cleanArabicTitle(entry.title_en));
  return { title, artist, arabicTitle, arabicArtist: stripNoise(entry.artist_ar) };
};

const COVER_ALIASES = [
  ['Ragea', 'Amr Diab - Ragea.jpg'],
  ['We Malo', 'Amr Diab - We Maloh.jpg'],
  ['Senen', 'Amr Diab - Senien.jpg'],
  ['Ya Habebi la', 'Amr Diab - Ya Habiby La.jpg'],
  ["Ba'edt Leh", 'Amr Diab - Baedt Leh.jpg'],
  ["Sa'et El Foraa", 'Amr Diab - Ah Min El Foraa.jpg'],
  ['Alf Ta7eya', 'Ahmed Saad - Alf Taheya.jpg'],
  ['Mathasbnesh', 'Sherine - Hams El Mashaer.jpg'],
  ['عودتنى الدنيا', 'Sherine - 3wdtny Eldonia.jpg'],
  ['الساعات الحلوة', 'Mohamed Ramadan - Angham El Sa3at El Helwa Mabtekhlash.jpg'],
  ['أكتر و أكتر', 'Sherine - Ekter W Akter.jpg'],
  ['اسمراني عيونه سمرا', 'Hussain Aljassmi - Asmrani Eyounoh Samrah.jpg'],
  ['اتكلم كل يوم يومين', 'Hussain Aljassmi - Etklm Kol Youm Youmin.jpg'],
  ['رمضان في مصر حاجة تانية', 'Hussain Aljassmi - Ramadan Fi Masr Haja Taniah.jpg'],
  ['سر السعاده', 'Hussain Aljassmi - Ser Alsada.jpg'],
  ['Halo Ya Halo Ramadan Karim', 'Sabah - Halo Ya Halo Ramadan Karim.jpg'],
  ['الف مرة - من مسلسل كامل العدد++', 'Ahmed Saad - Alf Mara.jpg'],
];

const CATALOG_METADATA_OVERRIDES = {
  'sherine___ya_layaly__official_lyric_video____________________________': {
    title: 'Ya Layaly',
    arabicTitle: 'يا ليالي',
  },
  'sherine___fe_leila__official_lyric_video___________________________': {
    title: 'Fe Leila',
    arabicTitle: 'في ليلة',
  },
  'sherine___metakhda_mel_ayam__official_lyric_video____________________________________': {
    title: 'Metakhda Mel Ayam',
    arabicTitle: 'متاخدة من الأيام',
  },
  'amr_diab___ya_agmal_eyoun__official_lyric_video____________________________________': {
    title: 'Ya Agmal Eyoun',
    arabicTitle: 'يا أجمل عيون',
  },
  'halo_ya_halo_ramadan_karim': {
    title: 'Halo Ya Halo',
    arabicTitle: 'حلو يا حلو',
    artist: 'Sabah',
    arabicArtist: 'صباح',
  },
  '__________________________________________': {
    title: 'Alf Mara',
    arabicTitle: 'ألف مرة',
    artist: 'Ahmed Saad',
    arabicArtist: 'أحمد سعد',
  },
};

const coverForEntry = (entry) => {
  if (entry.cover_file && !entry.cover_file.endsWith('/default.jpg')) {
    const requestedName = decodeURIComponent(entry.cover_file.split('/').pop() || '');
    const explicit = coverFiles.find(({ name }) => name === requestedName);
    if (explicit) return explicit.url;
  }

  if (entry.title_en === '3la Bali' && entry.artist_en === 'Sherine') {
    const exact = coverFiles.find(({ name }) => name === 'Sherine - 3la Bali ｜ شيرين - على بالي.jpeg');
    if (exact) return exact.url;
  }

  const haystack = `${entry.audio_file} ${entry.title_en} ${entry.title_ar} ${entry.artist_en}`;
  const alias = COVER_ALIASES.find(([needle]) => haystack.includes(needle));
  if (alias) {
    const exact = coverFiles.find(({ name }) => name === alias[1]);
    if (exact) return exact.url;
  }

  const searchTerms = normalize(`${entry.title_en} ${entry.artist_en}`)
    .split(' ')
    .filter((term) => term.length > 2);
  const match = coverFiles
    .map((cover) => {
      const coverTerms = new Set(normalize(cover.name).split(' '));
      const score = searchTerms.filter((term) => coverTerms.has(term)).length;
      return { ...cover, score };
    })
    .sort((a, b) => b.score - a.score)[0];

  return match && match.score >= 2 ? match.url : null;
};

const hasCatalogNoise = (value = '') =>
  /\b(?:official|lyric|audio|music|video|concert)\b|فيديو|حفل|إعلان|الكليب الرسمي|ماونتن ڤيو رمضان|من مسلسل كامل العدد|\bكلمات\b|(?:Amr Diab|عمرو دياب)\s*\.{2,}|[|｜]/i.test(value);

const isValidCatalogSong = (song) => Boolean(
  song.src
    && song.cover
    && song.title
    && song.artist
    && song.arabicTitle
    && song.arabicArtist
    && !hasCatalogNoise(song.title)
    && !hasCatalogNoise(song.artist)
    && !hasCatalogNoise(song.arabicTitle)
    && !hasCatalogNoise(song.arabicArtist),
);

const ACCENT_COLORS = [
  '#22c55e',
  '#06b6d4',
  '#3b82f6',
  '#8b5cf6',
  '#d946ef',
  '#f43f5e',
  '#f97316',
  '#eab308',
];

export const CATALOG_SONGS = catalog.map((entry, index) => {
  const metadata = cleanEntryMetadata(entry);
  const override = CATALOG_METADATA_OVERRIDES[entry.id] || {};
  return {
  id: `catalog-${entry.id}`,
  title: override.title || metadata.title,
  artist: override.artist || metadata.artist,
  arabicTitle: override.arabicTitle || metadata.arabicTitle,
  arabicArtist: override.arabicArtist || metadata.arabicArtist,
  era: entry.era,
  difficulty: entry.difficulty,
  src: assetPath(entry.audio_file.replace(/^\.\//, '')),
  cover: coverForEntry(entry),
  hasCatalogCover: true,
  accent: ACCENT_COLORS[index % ACCENT_COLORS.length],
  recentlyAdded: true,
  };
}).filter(isValidCatalogSong);