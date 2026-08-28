// Auto-generated covers manifest. Contains filenames found in /Songs/Covers
export const COVERS = [
  '/Songs/Covers/ ركبت الخصومه.webp',
  '/Songs/Covers/3 DAQAT.jpeg',
  '/Songs/Covers/Adrenalina.jpeg',
  '/Songs/Covers/Control Marawan Pablo.jpg',
  '/Songs/Covers/EL BAKHT.jpeg',
  '/Songs/Covers/Ein sehreya.png',
  '/Songs/Covers/El Wa2t El Daye3.jpeg',
  '/Songs/Covers/El neyya.jpeg',
  '/Songs/Covers/Enta umri.jpeg',
  '/Songs/Covers/Hadota Almany.png',
  '/Songs/Covers/Tamaly maak.jpeg',
  '/Songs/Covers/Yalmidan.jpeg',
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
