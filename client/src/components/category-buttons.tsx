import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";

interface CategoryButtonProps {
  emoji: string;
  title: string;
  description: string;
  href: string;
  dataTestId?: string;
  isLoggedIn: boolean;
}

const CategoryButton = ({ emoji, title, description, href, dataTestId, isLoggedIn }: CategoryButtonProps) => {
  // Giriş yapmamış kullanıcılar için sadece görsel
  if (!isLoggedIn) {
    return (
      <Card className="border-2 opacity-75">
        <CardContent className="p-6 text-center">
          <div className="text-4xl mb-3">
            {emoji}
          </div>
          <h3 className="font-bold text-lg mb-2 text-gray-800">
            {title}
          </h3>
          <p className="text-gray-600 text-sm">
            {description}
          </p>
        </CardContent>
      </Card>
    );
  }

  // Giriş yapmış kullanıcılar için tıklanabilir buton
  return (
    <Link href={href}>
      <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer border-2 hover:border-blue-300 group">
        <CardContent className="p-6 text-center">
          <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-200">
            {emoji}
          </div>
          <h3 className="font-bold text-lg mb-2 text-gray-800 group-hover:text-blue-600">
            {title}
          </h3>
          <p className="text-gray-600 text-sm group-hover:text-gray-700">
            {description}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
};

export function CategoryButtons() {
  const { user } = useAuth();
  const { t } = useLanguage();
  
  const categories = [
    {
      emoji: "📱",
      title: t.common.language === 'English' ? "Tech Products" : 
             t.common.language === 'العربية' ? "المنتجات التقنية" : "Teknolojik Ürünler",
      description: t.common.language === 'English' ? "Trade phones, laptops, cameras" : 
                   t.common.language === 'العربية' ? "تبادل الهواتف والكمبيوترات المحمولة والكاميرات" : "Telefon, laptop, kamera takas edin",
      href: "/items?category=teknolojik_urunler",
      dataTestId: "category-teknolojik-urunler"
    },
    {
      emoji: "🏠",
      title: t.common.language === 'English' ? "Home Appliances" : 
             t.common.language === 'العربية' ? "الأجهزة المنزلية" : "Beyaz Eşya",
      description: t.common.language === 'English' ? "Exchange home appliances" : 
                   t.common.language === 'العربية' ? "تبادل الأجهزة المنزلية" : "Beyaz eşyalar değiştirin",
      href: "/items?category=beyaz_esya",
      dataTestId: "category-beyaz-esya"
    },
    {
      emoji: "🪑",
      title: t.common.language === 'English' ? "Furniture" : 
             t.common.language === 'العربية' ? "الأثاث" : "Mobilya",
      description: t.common.language === 'English' ? "Exchange furniture" : 
                   t.common.language === 'العربية' ? "تبادل الأثاث" : "Mobilya değiştirin",
      href: "/items?category=mobilya",
      dataTestId: "category-mobilya"
    },
    {
      emoji: "🚗",
      title: t.common.language === 'English' ? "Car & Spare Parts" : 
             t.common.language === 'العربية' ? "السيارات وقطع الغيار" : "Araba & Yedek Parça",
      description: t.common.language === 'English' ? "Trade car parts" : 
                   t.common.language === 'العربية' ? "تبادل قطع غيار السيارات" : "Araç parçaları takas edin",
      href: "/items?category=araba_group",
      dataTestId: "category-araba-group"
    },
    {
      emoji: "🧸",
      title: t.common.language === 'English' ? "Toys" : 
             t.common.language === 'العربية' ? "الألعاب" : "Oyuncak",
      description: t.common.language === 'English' ? "Exchange children's toys" : 
                   t.common.language === 'العربية' ? "تبادل ألعاب الأطفال" : "Çocuk oyuncakları değiştirin",
      href: "/items?category=oyuncak",
      dataTestId: "category-oyuncak"
    },
    {
      emoji: "🏡",
      title: t.common.language === 'English' ? "Real Estate" : 
             t.common.language === 'العربية' ? "العقارات" : "Taşınmazlar",
      description: t.common.language === 'English' ? "Trade houses, land, fields" : 
                   t.common.language === 'العربية' ? "تبادل المنازل والأراضي والحقول" : "Ev, arsa, tarla takas edin",
      href: "/items?category=tasinmazlar_group",
      dataTestId: "category-tasinmazlar-group"
    },
    {
      emoji: "📚",
      title: t.common.language === 'English' ? "Books" : 
             t.common.language === 'العربية' ? "الكتب" : "Kitap",
      description: t.common.language === 'English' ? "Exchange your book collection" : 
                   t.common.language === 'العربية' ? "تبادل مجموعة كتبك" : "Kitap koleksiyonunuzu değiştirin",
      href: "/items?category=kitap",
      dataTestId: "category-kitap"
    }
  ];

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {t.common.language === 'English' ? 'Browse Categories' : 
             t.common.language === 'العربية' ? 'تصفح الفئات' : 
             'Kategorilere Göz Atın'}
          </h2>
          <p className="text-lg text-gray-600">
            {t.common.language === 'English' ? 'Select the product category you need and start trading' : 
             t.common.language === 'العربية' ? 'اختر فئة المنتج التي تحتاجها وابدأ التداول' : 
             'İhtiyacınız olan ürün kategorisini seçin ve takas yapmaya başlayın'}
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <CategoryButton
              key={index}
              emoji={category.emoji}
              title={category.title}
              description={category.description}
              href={category.href}
              dataTestId={category.dataTestId}
              isLoggedIn={!!user}
            />
          ))}
        </div>
      </div>
    </section>
  );
}