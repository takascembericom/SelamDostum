import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";

interface CategoryButtonProps {
  emoji: string;
  title: string;
  description: string;
  href: string;
  dataTestId?: string;
}

const CategoryButton = ({ emoji, title, description, href, dataTestId }: CategoryButtonProps) => (
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

export function CategoryButtons() {
  const categories = [
    {
      emoji: "📱",
      title: "Teknolojik Ürünler",
      description: "Telefon, laptop, kamera takas edin",
      href: "/items?category=teknolojik_urunler",
      dataTestId: "category-teknolojik-urunler"
    },
    {
      emoji: "🏠",
      title: "Beyaz Eşya",
      description: "Beyaz eşyalar değiştirin",
      href: "/items?category=beyaz_esya",
      dataTestId: "category-beyaz-esya"
    },
    {
      emoji: "🪑",
      title: "Mobilya",
      description: "Mobilya değiştirin",
      href: "/items?category=mobilya",
      dataTestId: "category-mobilya"
    },
    {
      emoji: "🚗",
      title: "Araba & Yedek Parça",
      description: "Araç parçaları takas edin",
      href: "/items?category=araba_group",
      dataTestId: "category-araba-group"
    },
    {
      emoji: "🧸",
      title: "Oyuncak",
      description: "Çocuk oyuncakları değiştirin",
      href: "/items?category=oyuncak",
      dataTestId: "category-oyuncak"
    },
    {
      emoji: "🏡",
      title: "Taşınmazlar",
      description: "Ev, arsa, tarla takas edin",
      href: "/items?category=tasinmazlar_group",
      dataTestId: "category-tasinmazlar-group"
    },
    {
      emoji: "📚",
      title: "Kitap",
      description: "Kitap koleksiyonunuzu değiştirin",
      href: "/items?category=kitap",
      dataTestId: "category-kitap"
    }
  ];

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Kategorilere Göz Atın
          </h2>
          <p className="text-lg text-gray-600">
            İhtiyacınız olan ürün kategorisini seçin ve takas yapmaya başlayın
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
            />
          ))}
        </div>
      </div>
    </section>
  );
}