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
      <Card className="border-0 opacity-80 bg-gradient-to-br from-red-500 via-orange-500 to-red-600 text-white shadow-2xl animate-float backdrop-blur-sm">
        <CardContent className="p-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-red-400/30 to-orange-400/30 animate-pulse"></div>
          <div className="text-4xl mb-3 drop-shadow-2xl relative z-10">
            {emoji}
          </div>
          <h3 className="font-bold text-lg mb-2 text-white drop-shadow-lg relative z-10">
            {title}
          </h3>
          <p className="text-red-100 text-sm relative z-10">
            {description}
          </p>
        </CardContent>
      </Card>
    );
  }

  // Giriş yapmış kullanıcılar için tıklanabilir buton
  return (
    <Link href={href}>
      <Card className="hover:shadow-2xl hover:shadow-red-500/60 transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-red-600 via-red-500 to-orange-600 hover:from-red-400 hover:via-orange-500 hover:to-red-500 text-white group animate-wave hover:animate-bounce shadow-xl backdrop-blur-sm relative overflow-hidden">
        <CardContent className="p-6 text-center relative z-10">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-400/40 to-red-400/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
          <div className="text-4xl mb-3 group-hover:scale-125 transition-transform duration-300 drop-shadow-2xl filter group-hover:brightness-125">
            {emoji}
          </div>
          <h3 className="font-bold text-lg mb-2 text-white group-hover:text-orange-100 drop-shadow-lg">
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
          0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); }
          25% { transform: translateY(-3px) rotate(1deg) scale(1.02); }
          50% { transform: translateY(-5px) rotate(0deg) scale(1.05); }
          75% { transform: translateY(-3px) rotate(-1deg) scale(1.02); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-4px) scale(1.03); }
        }
        
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 25px rgba(239, 68, 68, 0.4), 0 0 50px rgba(249, 115, 22, 0.3); }
          50% { box-shadow: 0 0 35px rgba(220, 38, 38, 0.5), 0 0 70px rgba(234, 88, 12, 0.4); }
        }
        
        .animate-wave {
          animation: wave 4s ease-in-out infinite, glow 3s ease-in-out infinite;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite, glow 2s ease-in-out infinite;
        }
      `}</style>
      
      <section className="py-12 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-red-400 via-orange-400 to-red-500 bg-clip-text text-transparent mb-4 drop-shadow-lg">
              {t.common.categoriesTitle}
            </h2>
            <p className="text-lg text-gray-300">
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