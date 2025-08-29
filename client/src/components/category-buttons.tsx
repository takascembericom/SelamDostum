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
      <Card className="border-2 opacity-75 bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg animate-float">
        <CardContent className="p-6 text-center">
          <div className="text-4xl mb-3 drop-shadow-lg">
            {emoji}
          </div>
          <h3 className="font-bold text-lg mb-2 text-white drop-shadow-md">
            {title}
          </h3>
          <p className="text-red-100 text-sm">
            {description}
          </p>
        </CardContent>
      </Card>
    );
  }

  // Giriş yapmış kullanıcılar için tıklanabilir buton
  return (
    <Link href={href}>
      <Card className="hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-red-400 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white group animate-wave hover:animate-pulse shadow-lg hover:shadow-red-500/50">
        <CardContent className="p-6 text-center">
          <div className="text-4xl mb-3 group-hover:scale-125 transition-transform duration-300 drop-shadow-lg">
            {emoji}
          </div>
          <h3 className="font-bold text-lg mb-2 text-white group-hover:text-red-100 drop-shadow-md">
            {title}
          </h3>
          <p className="text-red-100 text-sm group-hover:text-white">
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
      title: t.categories.teknolojik_urunler,
      description: t.common.teknolojikDesc,
      href: "/items?category=teknolojik_urunler",
      dataTestId: "category-teknolojik-urunler"
    },
    {
      emoji: "🏠",
      title: t.categories.beyaz_esya,
      description: t.common.beyazEsyaDesc,
      href: "/items?category=beyaz_esya",
      dataTestId: "category-beyaz-esya"
    },
    {
      emoji: "🪑",
      title: t.categories.mobilya,
      description: t.common.mobilyaDesc,
      href: "/items?category=mobilya",
      dataTestId: "category-mobilya"
    },
    {
      emoji: "🚗",
      title: t.categories.araba_group,
      description: t.common.arabaDesc,
      href: "/items?category=araba_group",
      dataTestId: "category-araba-group"
    },
    {
      emoji: "🧸",
      title: t.categories.oyuncak,
      description: t.common.oyuncakDesc,
      href: "/items?category=oyuncak",
      dataTestId: "category-oyuncak"
    },
    {
      emoji: "🏡",
      title: t.categories.tasinmazlar_group,
      description: t.common.tasinmazDesc,
      href: "/items?category=tasinmazlar_group",
      dataTestId: "category-tasinmazlar-group"
    },
    {
      emoji: "📚",
      title: t.categories.kitap,
      description: t.common.kitapDesc,
      href: "/items?category=kitap",
      dataTestId: "category-kitap"
    }
  ];

  return (
    <>
      <style>{`
        @keyframes wave {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-2px) rotate(0.5deg); }
          50% { transform: translateY(-4px) rotate(0deg); }
          75% { transform: translateY(-2px) rotate(-0.5deg); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-3px); }
        }
        
        .animate-wave {
          animation: wave 3s ease-in-out infinite;
        }
        
        .animate-float {
          animation: float 2s ease-in-out infinite;
        }
      `}</style>
      
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t.common.categoriesTitle}
            </h2>
            <p className="text-lg text-gray-600">
              {t.common.categoriesSubtitle}
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <div 
                key={index}
                className="transform transition-all duration-300"
                style={{ 
                  animationDelay: `${index * 0.1}s`,
                }}
              >
                <CategoryButton
                  emoji={category.emoji}
                  title={category.title}
                  description={category.description}
                  href={category.href}
                  dataTestId={category.dataTestId}
                  isLoggedIn={!!user}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}