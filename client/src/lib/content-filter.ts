// Content filtering for inappropriate words
const BLOCKED_WORDS = [
  // Küfür ve argo
  'amk', 'amına', 'amq', 'aq', 'orospu', 'piç', 'sikik', 'sik', 'götü', 'göt', 'salak', 'aptal', 'gerizekalı',
  'mal', 'ahmak', 'dangalak', 'beyinsiz', 'kafasız', 'embesil', 'kancık', 'fahişe', 'pezevenk', 'şerefsiz',
  'namussuz', 'alçak', 'hain', 'köpek', 'domuz', 'pislik', 'çöp', 'bok', 'kakasol', 'leş', 'kaka', 'osur',
  
  // Aşağılayıcı terimler
  'çingene', 'kürt köpeği', 'ermeni dölü', 'rum artığı', 'yunan malı', 'arap sevici', 'terörist', 'pkklı',
  'fetöcü', 'vatan haini', 'komünist köpek', 'faşist', 'nazi', 'siyonist', 'kafir', 'gâvur',
  
  // Taciz içerikli
  'tecavüz', 'taciz', 'sikiş', 'sex', 'porno', 'nude', 'çıplak', 'soyun', 'meme', 'vajina', 'penis',
  'escort', 'masaj', 'randevu', 'buluşma', 'gece', 'özel hizmet', 'arkadaşlık',
  
  // Yaygın kısaltmalar ve çeşitlemeler
  'mk', 'mq', 'aq', 'sq', 'sg', 'ssg', 'git sg', 'siktir git', 'defol', 'yallah',
  'puşt', 'ibne', 'top', 'travesti', 'karı', 'avrat', 'dişi', 'hatun',
  
  // Nefret söylemi
  'ırkçı', 'ayrımcı', 'öldür', 'gebertir', 'katlet', 'yok et', 'imha et', 'temizle',
  'katliam', 'soykırım', 'linç', 'as', 'kurşunla', 'bomba', 'patlat'
];

// Check if text contains blocked words
export function containsInappropriateContent(text: string): boolean {
  if (!text) return false;
  
  const normalizedText = text.toLowerCase()
    .replace(/[ıİ]/g, 'i')
    .replace(/[ğĞ]/g, 'g')
    .replace(/[üÜ]/g, 'u')
    .replace(/[şŞ]/g, 's')
    .replace(/[öÖ]/g, 'o')
    .replace(/[çÇ]/g, 'c')
    // Remove common separators that might be used to bypass filtering
    .replace(/[\s\-_\.\,\!\?\*\+\=\(\)\[\]\{\}\/\\\|\~\`\@\#\$\%\^\&]/g, '');
  
  return BLOCKED_WORDS.some(word => {
    const normalizedWord = word.toLowerCase()
      .replace(/[ıİ]/g, 'i')
      .replace(/[ğĞ]/g, 'g')
      .replace(/[üÜ]/g, 'u')
      .replace(/[şŞ]/g, 's')
      .replace(/[öÖ]/g, 'o')
      .replace(/[çÇ]/g, 'c')
      .replace(/[\s\-_\.\,\!\?\*\+\=\(\)\[\]\{\}\/\\\|\~\`\@\#\$\%\^\&]/g, '');
    
    return normalizedText.includes(normalizedWord);
  });
}

// Get user-friendly error message
export function getContentFilterErrorMessage(): string {
  return "Bu metinde uygunsuz kelimeler bulundu. Lütfen nezaket kurallarına uygun bir dil kullanın.";
}