const assetPath = (path) =>
  `${import.meta.env.BASE_URL}${path.split('/').map(encodeURIComponent).join('/')}`;

const MANUAL_FILES = [
  'ATARY by Marwan Pablo اتاري مروان بابلو medium 2020s.mp3',
  'Albak Ya Hawl Allah by Bahaa Sultan قلبك يا حول الله بهاء سلطان medium 2000s.mp3',
  'Ana Bahebak (Al Ahly Sabbour Ramadan 2026) by Bahaa Sultan أنا بحبك بهاء سلطان easy 2020s.mp3',
  'Ana Ghaltan by Bahaa Sultan انا غلطان بهاء سلطان easy 2000s.mp3',
  'Ana Mesh Ma3ahom by Bahaa Sultan أنا مش معاهم بهاء سلطان easy 2000s.mp3',
  'Ana Mosammem by Bahaa Sultan أنا مصمم بهاء سلطان easy 2010s.mp3',
  'Asef by Tamer Ashour آسف تامر عاشور hard 2020s.mp3',
  'Bahawel Akhtelef by Husayn and LAI بحاول اختلف حسين لائي hard 2020s.mp3',
  'Bahki Aleyki by Ramy Sabry بحكي عليك رامي صبري hard 2020s.mp3',
  'Baoul Aady by Tamer Ashour بقول عادي تامر عاشور easy 2020s.mp3',
  'Barbary by Marwan Pablo بربري مروان بابلو easy 2020s.mp3',
  'Come Baby Come by Mohamed Ramadan كوم بيبي كوم محمد رمضان medium 2020s.mp3',
  'DAWLETNA by Husayn and Wingii دولتنا حسين وينجي easy 2020s.mp3',
  'Denamet by Molotof and Marwan Pablo ديناميت مولوتوف مروان بابلو hard 2020s.mp3',
  'Drama by Tamer Ashour دراما تامر عاشور hard 2020s.mp3',
  'El Gemeza by Marwan Pablo الجميزة مروان بابلو easy 2010s.mp3',
  'El Halal by Marwan Pablo الحلال مروان بابلو easy 2020s.mp3',
  'El Hob Bey2zini by Husayn الحب بيأذيني حسين hard 2020s.mp3',
  'El Loqta by Wegz اللقطة ويجز medium 2010s.mp3',
  'El Mabda2 by Marwan Pablo المبدأ مروان بابلو medium 2020s.mp3',
  'El Malek by Mohamed Ramadan الملك محمد رمضان easy 2010s.mp3',
  'El Rak Al Neya by Tamer Ashour الرك على النية تامر عاشور medium 2010s.mp3',
  'El Wad Albo Beyewga3o by Bahaa Sultan الواد قلبه بيوجعه بهاء سلطان easy 2000s.mp3',
  'Ensay by Saad Lamjarred and Mohamed Ramadan انساي سعد لمجرد محمد رمضان easy 2010s.mp3',
  'Esht Maak Hekayat by Tamer Ashour عشت معاك حكايات تامر عاشور medium 2010s.mp3',
  'Free by Marwan Pablo فري مروان بابلو easy 2010s.mp3',
  'Ghaba by Marwan Pablo غابة مروان بابلو easy 2020s.mp3',
  'HOSS by Husayn and FL EX هس حسين فليكس expert 2020s.mp3',
  'Habibi Ana Men Gherak by Mohamed Ramadan حبيبي انا من غيرك محمد رمضان easy 2020s.mp3',
  'Hagi Alh Nafsi by Tamer Ashour هجي على نفسي تامر عاشور easy 2000s.mp3',
  'Hayaty Msh Tamam by Ramy Sabry حياتي مش تمام رامي صبري easy 2020s.mp3',
  'KKKK by Shehab and Omar Keif KKKK شهاب عمر كيف hard 2020s.mp3',
  'Kan Mawdo3 by Tamer Ashour كان موضوع تامر عاشور hard 2010s.mp3',
  'Kan Nefsy by Wegz كان نفسي ويجز hard 2010s.mp3',
  'Karaheny Feky by Tamer Ashour كرهني فيك تامر عاشور medium 2010s.mp3',
  "Law Te'raf by Ramy Sabry لو تعرف رامي صبري medium 2000s.mp3",
  'Lelly Yah by Marwan Pablo ليلي ياه مروان بابلو medium 2020s.mp3',
  'Mafia by Mohamed Ramadan مافيا محمد رمضان easy 2010s.mp3',
  'Mahabetsh by Ramy Sabry محبتش رامي صبري medium 2010s.mp3',
  'Mahzouz by Tamer Ashour محظوظ تامر عاشور medium 2010s.mp3',
  'Makamelnash by Tamer Ashour ماكملناش تامر عاشور medium 2010s.mp3',
  'Malak? by Husayn مالك؟ حسين medium 2020s.mp3',
  'Masaaltneesh by Ramy Sabry مأشألتنيش رامي صبري medium 2010s.mp3',
  'Matafetch by Marwan Pablo متفتش مروان بابلو hard 2020s.mp3',
  'Medley Tamer Ashour by Gomro ميدلي تامر عاشور جمرة medium 2020s.mp3',
  'Money Man by Husayn and Wingii ماني مان حسين وينجي easy 2020s.mp3',
  'Msh Fare2ly by Tamer Ashour مش فارقلي تامر عاشور medium 2020s.mp3',
  'Number One by Mohamed Ramadan نمبر وان محمد رمضان easy 2010s.mp3',
  'Oloolo Samah by Tamer Ashour قولوله سماح تامر عاشور easy 2010s.mp3',
  'Qalb El Asad by Mohamed Ramadan and El Madfaagya قلب الاسد محمد رمضان المدفعجية easy 2010s.mp3',
  'Qasr B3eed by Tamer Ashour قصر بعيد تامر عاشور hard 2020s.mp3',
  'Rayheen Nesshar - Bum Bum by Mohamed Ramadan رايحين نسهر محمد رمضان easy 2020s.mp3',
  'SINdBAD by Marwan Pablo سندباد مروان بابلو medium 2010s.mp3',
  'Saleny by Wegz اسالني ويجز medium 2020s.mp3',
  'Sawa Sawa by Bahaa Sultan سوا سوا بهاء سلطان medium 2020s.mp3',
  'Seket Leh by Ramy Sabry سكت ليه رامي صبري medium 2000s.mp3',
  'Seven by Mohamed Ramadan سبعة محمد رمضان hard 2020s.mp3',
  'Share3 by Husayn شارع حسين medium 2020s.mp3',
  'Ta3ala Adalla3ak by Bahaa Sultan تعال أدلعك بهاء سلطان easy 2020s.mp3',
  'The Moon by Mohamed Ramadan القمر محمد رمضان easy 2010s.mp3',
  'Virus by Mohamed Ramadan فايروس محمد رمضان medium 2010s.mp3',
  'W lessa Yama by Ramy Sabry ولسه ياما رامي صبري medium 2020s.mp3',
  'Wahed Tany by Husayn واحد تاني حسين medium 2020s.mp3',
  'Ya Habibi by Mohamed Ramadan and GIMS يا حبيبي محمد رمضان جيمس easy 2020s.mp3',
  'Yaah by Tamer Ashour ياه تامر عاشور hard 2020s.mp3',
  'Yadoom El Aman by Bahaa Sultan يدوم الأمان بهاء سلطان medium 2020s.mp3',
  'Youm Ma Tensa by Tamer Ashour يوم ما تنسى تامر عاشور hard 2020s.mp3',
];

const ARABIC_ARTISTS = [
  'محمد رمضان والمدفعجية',
  'محمد رمضان المدفعجية',
  'محمد رمضان جيمس',
  'سعد لمجرد محمد رمضان',
  'مروان بابلو',
  'بهاء سلطان',
  'تامر عاشور',
  'رامي صبري',
  'حسين وينجي',
  'حسين فليكس',
  'حسين لائي',
  'جمرة',
  'محمد رمضان',
  'ليجي سي',
  'ويجز',
  'شهاب عمر كيف',
  'توليت',
  'حسين',
  'جمرة',
];

const ERA_OVERRIDES = {
  Medley: '2020s',
  Narein: '2020s',
  'Ana Ghaltan': '2020s',
  'Saleny': '2020s',
  'Habibi Ana Men Gherak': '2020s',
  'Sawa Sawa': '2020s',
  'El Halal': '2020s',
  'Lelly Yah': '2020s',
  Denamet: '2020s',
  Free: '2010s',
  'El Mabda2': '2020s',
  Barbary: '2020s',
  Ghaba: '2020s',
  KKKK: '2020s',
  ATARY: '2020s',
  'El Gemeza': '2010s',
  SINdBAD: '2010s',
  Matafetch: '2020s',
  'El Hob Bey2zini': '2020s',
  'Wahed Tany': '2020s',
  DAWLETNA: '2020s',
  Share3: '2020s',
  'Bahawel Akhtelef': '2020s',
  HOSS: '2020s',
  'Malak?': '2020s',
  'Money Man': '2020s',
  Ensay: '2010s',
  'Qalb El Asad': '2010s',
  Mafia: '2010s',
  'Ya Habibi': '2020s',
  'Come Baby Come': '2020s',
  Virus: '2010s',
  'The Moon': '2010s',
  Seven: '2020s',
  'El Malek': '2010s',
  'Rayheen Nesshar - Bum Bum': '2020s',
  'Number One': '2010s',
  'W lessa Yama': '2020s',
  'Hayaty Msh Tamam': '2020s',
  'Bahki Aleyki': '2020s',
  "Law Te'raf": '2000s',
  'Seket Leh': '2000s',
  'Msh Fare2ly': '2020s',
  'Baoul Aady': '2020s',
  'Hagi Alh Nafsi': '2000s',
  Yaah: '2020s',
  Makamelnash: '2010s',
  'Qasr B3eed': '2020s',
  'Karaheny Feky': '2010s',
  Asef: '2020s',
  'El Rak Al Neya': '2010s',
  'Merayt El Hob': '2020s',
  'Youm Ma Tensa': '2020s',
  Drama: '2020s',
  Masaaltneesh: '2010s',
  Mahzouz: '2010s',
  'Ta3ala Adalla3ak': '2020s',
  'Ana Mosammem': '2010s',
  'Yadoom El Aman': '2020s',
  'Sahbi Ya Sahbi': '2020s',
  'Ana Bahebak': '2020s',
  'Hana Masr Hafdal Kol Mara Ajilak': '2020s',
  'Albak Ya Hawl Allah': '2000s',
  'Ana Mesh Ma3ahom': '2000s',
  'El Wad Albo Beyewga3o': '2000s',
};

const TITLE_OVERRIDES = {
  'Ana Bahebak (Al Ahly Sabbour Ramadan 2026)': 'Ana Bahebak',
  'Hena Masr Hafdal Kol Mara Ageelak': 'Hana Masr Hafdal Kol Mara Ajilak',
  'Medley Tamer Ashour': 'Medley',
  Narein: 'Narein',
  Saleny: 'Saleeny',
};

const ARTIST_OVERRIDES = {
  'Hena Masr Hafdal Kol Mara Ageelak': 'Mahmoud El Esseily & Bahaa Sultan',
  'Medley Tamer Ashour': 'Tamer Ashour',
};

const ARABIC_TITLE_OVERRIDES = {
  'Medley Tamer Ashour': 'ميدلي',
  Narein: 'نارين',
  Saleny: 'ساليني',
};

const ARABIC_ARTIST_OVERRIDES = {
  'Medley Tamer Ashour': 'تامر عاشور',
};

const ARTIST_ALIASES = new Map([
  ['omar keif kkkk', 'Omar Keif'],
  ['marawan moussa', 'Marwan Moussa'],
  ['marwan moussa', 'Marwan Moussa'],
  ['hussain al jassmi', 'Hussain AlJassmi'],
  ['hussain aljassmi', 'Hussain AlJassmi'],
  ['hussein al jassmi', 'Hussain AlJassmi'],
  ['hussein aljassmi', 'Hussain AlJassmi'],
  ['hussain el jasmi', 'Hussain AlJassmi'],
  ['hussein eljasmi', 'Hussain AlJassmi'],
  ['حسين الجسمي', 'Hussain AlJassmi'],
  ['tommy', 'Tommy'],
  ['tommy gun', 'Tommy'],
  ['hamid al shaeri', 'Hamid El Shaari'],
  ['hamid el shaari', 'Hamid El Shaari'],
]);

export const normalizeArtistName = (artist = '') => artist
  .replace(/\bOmar Keif KKKK\b/gi, 'Omar Keif')
  .replace(/\bMarawan Moussa\b/gi, 'Marwan Moussa')
  .replace(/\bHussain Al ?Jassmi\b/gi, 'Hussain AlJassmi')
  .replace(/\bHussein Al ?Jassmi\b/gi, 'Hussain AlJassmi')
  .replace(/\bHussain El ?Jasmi\b/gi, 'Hussain AlJassmi')
  .replace(/حسين الجسمي/g, 'Hussain AlJassmi')
  .replace(/\bTommy Gun\b/gi, 'Tommy')
  .replace(/\bHamid Al Shaeri\b/gi, 'Hamid El Shaari')
  .replace(/\bLegecy\b/gi, 'Lege-Cy')
  .replace(/\s+/g, ' ')
  .trim()
  .replace(/^(.*)$/i, (value) => {
    const alias = ARTIST_ALIASES.get(value.toLowerCase());
    return alias || value;
  });

const difficultyPattern = / (easy|medium|hard|expert|impossible) (\d{4}s)$/i;
const firstArabicCharacter = /[\u0600-\u06ff]/;

const titleCase = (value) =>
  value
    .trim()
    .split(/\s+/)
    .map((word) => {
      const parts = word.split(/(-)/);
      return parts
        .map((part) => (part === '-' ? part : part ? part.charAt(0).toUpperCase() + part.slice(1).toLowerCase() : part))
        .join('');
    })
    .join(' ');

const parseManualSong = (filename, index) => {
  const base = filename.replace(/\.mp3$/i, '');
  const difficultyMatch = base.match(difficultyPattern);
  if (!difficultyMatch) throw new Error(`Could not parse difficulty or era: ${filename}`);

  const difficulty = difficultyMatch[1].charAt(0).toUpperCase() + difficultyMatch[1].slice(1).toLowerCase();
  const era = difficultyMatch[2];
  const withoutDifficulty = base.slice(0, difficultyMatch.index);
  const separator = withoutDifficulty.indexOf(' by ');
  if (separator < 0) throw new Error(`Could not separate title and artist: ${filename}`);

  const title = withoutDifficulty.slice(0, separator).trim();
  const artistAndArabic = withoutDifficulty.slice(separator + 4).trim();
  const arabicStart = artistAndArabic.search(firstArabicCharacter);
  if (arabicStart < 0) throw new Error(`Could not find Arabic metadata: ${filename}`);

  const artist = artistAndArabic.slice(0, arabicStart).trim();
  const arabicMetadata = artistAndArabic.slice(arabicStart).trim();
  const arabicArtist = ARABIC_ARTISTS.find((candidate) => arabicMetadata.endsWith(candidate));
  if (!arabicArtist) throw new Error(`Could not separate Arabic title and artist: ${filename}`);

  const arabicTitle = arabicMetadata.slice(0, -arabicArtist.length).trim();
  return {
    id: index + 103,
    title: TITLE_OVERRIDES[title] || titleCase(title),
    artist: normalizeArtistName(ARTIST_OVERRIDES[title] || artist),
    arabicTitle: ARABIC_TITLE_OVERRIDES[title] || arabicTitle,
    arabicArtist: ARABIC_ARTIST_OVERRIDES[title] || arabicArtist,
    era: ERA_OVERRIDES[TITLE_OVERRIDES[title] || title] || era,
    difficulty,
    src: assetPath(`Songs/${filename}`),
    cover: assetPath(`Songs/Covers/${filename.replace(/\.mp3$/i, '.jpg')}`),
  };
};

export const MANUAL_SONGS = MANUAL_FILES.map(parseManualSong);
