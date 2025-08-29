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
      <Card className="border-0 bg-gradient-to-br from-red-400/90 via-rose-500/90 to-red-600/90 backdrop-blur-md text-white shadow-2xl hover:shadow-red-500/50 transition-all duration-300 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-red-300/30 to-rose-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="absolute -inset-0.5 bg-gradient-to-r from-red-400 to-rose-600 rounded-lg opacity-20 blur-sm group-hover:opacity-40 transition-opacity duration-300"></div>
        <CardContent className="p-6 text-center relative z-10">
          <div className="text-4xl mb-3 filter brightness-110 drop-shadow-lg">
            {emoji}
          </div>
          <h3 className="font-bold text-lg mb-2 text-white drop-shadow-md">
            {title}
          </h3>
          <p className="text-red-50 text-sm">
            {description}
          </p>
        </CardContent>
      </Card>
    );
  }

  // Giriş yapmış kullanıcılar için tıklanabilir buton
  return (
    <Link href={href}>
      <Card className="border-0 bg-gradient-to-br from-red-400/95 via-rose-500/95 to-red-600/95 backdrop-blur-lg hover:backdrop-blur-xl text-white group shadow-2xl hover:shadow-red-500/60 transition-all duration-300 cursor-pointer relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-300/40 to-rose-400/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="absolute -inset-0.5 bg-gradient-to-r from-red-400 via-rose-500 to-red-600 rounded-lg opacity-30 blur-sm group-hover:opacity-60 transition-opacity duration-300 animate-pulse"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50"></div>
        <CardContent className="p-6 text-center relative z-10">
          <div className="text-4xl mb-3 group-hover:scale-125 transition-transform duration-300 filter brightness-125 drop-shadow-2xl group-hover:brightness-150">
            {emoji}
          </div>
          <h3 className="font-bold text-lg mb-2 text-white group-hover:text-red-50 drop-shadow-lg">
            {title}
          </h3>
          <p className="text-red-50 text-sm group-hover:text-white transition-colors duration-300">
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
      title: t.categories.tasinmazlar,
      description: t.common.tasinmazDesc,
      href: "/items?category=tasinmazlar",
      dataTestId: "category-tasinmazlar"
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
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .shimmer {
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.4),
            transparent
          );
          background-size: 200% 100%;
          animation: shimmer 3s infinite;
        }
      `}</style>
      
      <section className="py-12 bg-gradient-to-br from-slate-50 via-red-50/30 to-rose-50/50 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ef4444' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-red-600 via-rose-500 to-red-700 bg-clip-text text-transparent mb-4 drop-shadow-sm">
              {t.common.categoriesTitle}
            </h2>
            <p className="text-xl text-gray-700 font-medium">
              {t.common.categoriesSubtitle}
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {categories.map((category, index) => (
              <div 
                key={index} 
                className="transform hover:-translate-y-2 transition-all duration-300"
                style={{ 
                  animationDelay: `${index * 0.1}s`,
                  opacity: 0,
                  animation: `fadeInUp 0.6s ease-out ${index * 0.1}s forwards`
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
      
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}