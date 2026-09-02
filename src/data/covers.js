// Auto-generated covers manifest. Contains filenames found in /Songs/Covers
const assetPath = (path) =>
  `${import.meta.env.BASE_URL}${path.split('/').map(encodeURIComponent).join('/')}`;

export const COVERS = [
  assetPath('Songs/Covers/Dary Ya Alby - Hamza Namira.jpg'),
  assetPath('Songs/Covers/We Ghalawatek - Amr Diab.jpg'),
  assetPath('Songs/Covers/Ahwak - Abdel Halim Hafez.jpeg'),
  assetPath('Songs/Covers/Kadaba - Karim Osama.jpg'),
  assetPath('Songs/Covers/Kebda - Afroto.jpeg'),
  assetPath('Songs/Covers/El Hob Eibna - Ramy Sabry.png'),
  assetPath('Songs/Covers/Layalina - Tul8te.jpeg'),
  assetPath('Songs/Covers/Merayt El Hob - Tamer Ashour.jpeg'),
  assetPath('Songs/Covers/Nano - Tul8te.jpeg'),
  assetPath('Songs/Covers/Tegy Ntrahen - Tamer Ashour.jpg'),
  assetPath('Songs/Covers/Wala Ash Wala Kan - Tul8te.jpg'),
  assetPath('Songs/Covers/ ركبت الخصومه.webp'),
  assetPath('Songs/Covers/3 DAQAT.jpeg'),
  assetPath('Songs/Covers/Adrenalina.jpeg'),
  assetPath('Songs/Covers/Control Marawan Pablo.jpg'),
  assetPath('Songs/Covers/EL BAKHT.jpeg'),
  assetPath('Songs/Covers/Ein sehreya.png'),
  assetPath('Songs/Covers/El Wa2t El Daye3.jpeg'),
  assetPath('Songs/Covers/El neyya.jpeg'),
  assetPath('Songs/Covers/Enta umri.jpeg'),
  assetPath('Songs/Covers/Hadota Almany.png'),
  assetPath('Songs/Covers/Tamaly maak.jpeg'),
  assetPath('Songs/Covers/Yalmidan.jpeg'),
  assetPath('Songs/Covers/Seneen - Tul8te.jpg'),
  assetPath('Songs/Covers/Kalemeny Belel - Marwan Moussa.jpg'),
];

// Normalize a name for fuzzy matching. Keep letters and numbers across scripts.
export function normalizeName(name = '') {
  try {
    return String(name)
      .toLowerCase()
      .normalize('NFKD')
      // keep letters and numbers (Unicode), remove punctuation and spaces
      .replace(/[^\p{L}\p{N}]+/gu, '')
      .trim();
  } catch (e) {
    return String(name).toLowerCase().replace(/[^a-z0-9]+/g, '').trim();
  }
}
