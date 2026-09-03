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
    title: titleCase(title),
    artist,
    arabicTitle,
    arabicArtist,
    era,
    difficulty,
    src: assetPath(`Songs/${filename}`),
    cover: assetPath(`Songs/Covers/${filename.replace(/\.mp3$/i, '.jpg')}`),
  };
};

export const MANUAL_SONGS = MANUAL_FILES.map(parseManualSong);
