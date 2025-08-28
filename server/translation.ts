// Ücretsiz çeviri servisi - MyMemory API kullanarak
export class TranslationService {
  private readonly baseUrl = 'https://api.mymemory.translated.net/get';
  
  async translateText(text: string, fromLang: string, toLang: string): Promise<string> {
    try {
      // MyMemory API parametreleri
      const params = new URLSearchParams({
        q: text,
        langpair: `${fromLang}|${toLang}`,
        de: 'takas@replit.com' // Email (isteğe bağlı, daha iyi hizmet için)
      });

      const response = await fetch(`${this.baseUrl}?${params}`);
      const data = await response.json();
      
      if (data.responseStatus === 200) {
        return data.responseData.translatedText;
      } else {
        console.error('Translation API error:', data.responseDetails);
        return text; // Hata durumunda orijinal metni döndür
      }
    } catch (error) {
      console.error('Translation service error:', error);
      return text; // Hata durumunda orijinal metni döndür
    }
  }

  // Türkçe metni İngilizce ve Arapçaya çevir
  async translateFromTurkish(text: string): Promise<{
    en: string;
    ar: string;
  }> {
    const [englishText, arabicText] = await Promise.all([
      this.translateText(text, 'tr', 'en'),
      this.translateText(text, 'tr', 'ar')
    ]);

    return {
      en: englishText,
      ar: arabicText
    };
  }

  // İlan başlığı ve açıklamasını birlikte çevir
  async translateItemContent(title: string, description: string): Promise<{
    titleEn: string;
    titleAr: string;
    descriptionEn: string;
    descriptionAr: string;
  }> {
    const [titleTranslations, descriptionTranslations] = await Promise.all([
      this.translateFromTurkish(title),
      this.translateFromTurkish(description)
    ]);

    return {
      titleEn: titleTranslations.en,
      titleAr: titleTranslations.ar,
      descriptionEn: descriptionTranslations.en,
      descriptionAr: descriptionTranslations.ar
    };
  }
}

export const translationService = new TranslationService();