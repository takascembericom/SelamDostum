import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { collection, query, where, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Item } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, UserPlus, Plus, ArrowRight, Star } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { LoginModal } from "@/components/auth/login-modal";
import { RegisterModal } from "@/components/auth/register-modal";
import { CategoryButtons } from "@/components/category-buttons";
import { ItemGrid } from "@/components/items/item-grid";
import { Skeleton } from "@/components/ui/skeleton";
import logoImage from "@assets/generated_images/Professional_Takas_Çemberi_Logo_7b3581dc.png";

export default function Home() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // Fetch latest 20 items for homepage
  const { data: latestItems = [], isLoading: itemsLoading } = useQuery({
    queryKey: ['homepage-items'],
    queryFn: async (): Promise<Item[]> => {
      try {
        const q = query(
          collection(db, 'items'),
          where('status', '==', 'aktif'),
          limit(20)
        );

        const querySnapshot = await getDocs(q);
        const itemsData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            ...data,
            id: doc.id,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
          } as Item;
        }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        return itemsData;
      } catch (error) {
        console.error('Error fetching homepage items:', error);
        return [];
      }
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/items?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  const steps = [
    {
      icon: <UserPlus className="h-8 w-8" />,
      title: "1. Hesap Oluştur",
      description: "Ücretsiz kayıt olun",
      color: "bg-primary/10 text-primary"
    },
    {
      icon: <Plus className="h-8 w-8" />,
      title: "2. İlan Ekle",
      description: "İlanınızın fotoğrafını ekleyin",
      color: "bg-secondary/10 text-secondary"
    },
    {
      icon: <Search className="h-8 w-8" />,
      title: "3. İlan Bul",
      description: "İstediğiniz ilanı arayın",
      color: "bg-accent/10 text-accent"
    },
    {
      icon: <div className="text-2xl">🤝</div>,
      title: "4. Takas Yap",
      description: "Teklif gönderin ve takas yapın",
      color: "bg-green-500/10 text-green-500"
    }
  ];


  const testimonials = [
    {
      name: "Ahmet Kaya",
      location: "İstanbul",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
      rating: 5,
      text: "Laptopumu kamerayla takas ettim. Çok güvenli ve kolay."
    },
    {
      name: "Ayşe Demir",
      location: "Ankara", 
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
      rating: 5,
      text: "Oyuncakları değiştirmek harika. Hem tasarruf ettik hem yeni oyuncaklar aldık."
    },
    {
      name: "Zeynep Özkan",
      location: "İzmir",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b494?w=40&h=40&fit=crop&crop=face",
      rating: 5,
      text: "Kitaplarımı yeni kitaplarla değiştiriyorum. Çok pratik."
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary to-green-600 text-white py-12">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Logo in Hero */}
          <div className="mb-8">
            <img 
              src={logoImage} 
              alt="Takas Çemberi Logo" 
              className="h-24 md:h-32 w-auto mx-auto mb-6"
            />
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-4" data-testid="title-hero">
            Güvenli Takas Platformu
          </h1>
          <p className="text-xl md:text-2xl mb-4 font-semibold" data-testid="welcome-text">
            Takas Çemberine Hoş Geldiniz
          </p>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto opacity-90" data-testid="description-hero">
            Sizde 4 kolay adımda üye olarak ilk ilanınızı verin
          </p>
        </div>
      </section>

      {/* Latest Items Section - Only show for logged in users */}
      {user && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4" data-testid="title-latest-items">
                  📦 En Son İlanlar
                </h2>
                <p className="text-xl text-gray-600">
                  Yeni eklenen {latestItems.length} ilan
                </p>
              </div>
              <Button 
                asChild
                variant="outline"
                className="hidden sm:flex"
                data-testid="button-view-all-items"
              >
                <Link href="/items">
                  Tümünü Gör
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>

            {/* Items Grid */}
            {itemsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg overflow-hidden shadow-sm">
                    <Skeleton className="w-full h-48" />
                    <div className="p-4">
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2 mb-2" />
                      <Skeleton className="h-3 w-full mb-2" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : latestItems.length > 0 ? (
              <>
                <ItemGrid 
                  items={latestItems} 
                  onViewDetails={(item) => window.location.href = `/item/${item.id}`}
                />
                {/* Mobile View All Button */}
                <div className="flex justify-center mt-8 sm:hidden">
                  <Button 
                    asChild
                    variant="outline"
                    data-testid="button-view-all-mobile"
                  >
                    <Link href="/items">
                      Tümünü Gör
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-16">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-gray-400 text-2xl">📦</span>
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">Henüz ilan yok</h3>
                <p className="text-gray-500 mb-6">İlk ilanınızı ekleyerek başlayın!</p>
                <Button asChild>
                  <Link href="/add-item">
                    <Plus className="h-4 w-4 mr-2" />
                    İlan Ekle
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4" data-testid="title-how-it-works">
              Nasıl Çalışır?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              4 adımda takas yapın
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center group" data-testid={`step-${index + 1}`}>
                <div className={`w-20 h-20 ${step.color} rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform`}>
                  {step.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Category Buttons Section */}
      <CategoryButtons />

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4" data-testid="title-testimonials">
              Kullanıcı Yorumları
            </h2>
            <p className="text-xl text-gray-600">Mutlu kullanıcılarımızdan yorumlar</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6 border border-gray-100" data-testid={`testimonial-${index}`}>
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-gray-700 mb-6">{testimonial.text}</p>
                <div className="flex items-center">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name} 
                    className="w-10 h-10 rounded-full mr-3"
                    data-testid={`avatar-testimonial-${index}`}
                  />
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-green-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6" data-testid="title-cta">
            Hemen Başla!
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Ücretsiz kayıt ol ve binlerce ilan arasından seç. 
            İlk takas özel indirimli!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!user ? (
              <>
                <Button 
                  onClick={() => setShowRegisterModal(true)}
                  className="bg-white text-primary hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold text-lg"
                  data-testid="button-cta-register"
                >
                  <UserPlus className="h-5 w-5 mr-2" />
                  Ücretsiz Kayıt Ol
                </Button>
                <Button 
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white hover:text-primary px-8 py-4 rounded-lg font-semibold text-lg"
                  asChild
                  data-testid="button-cta-explore"
                >
                  <Link href="/items">
                    <Search className="h-5 w-5 mr-2" />
                    İlanları Keşfet
                  </Link>
                </Button>
              </>
            ) : (
              <Button 
                className="bg-white text-primary hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold text-lg"
                asChild
                data-testid="button-cta-add-item"
              >
                <Link href="/add-item">
                  <Plus className="h-5 w-5 mr-2" />
                  İlk İlanını Ekle
                </Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Modals */}
      <LoginModal 
        open={showLoginModal} 
        onClose={() => setShowLoginModal(false)}
        onSwitchToRegister={() => {
          setShowLoginModal(false);
          setShowRegisterModal(true);
        }}
      />
      
      <RegisterModal 
        open={showRegisterModal} 
        onClose={() => setShowRegisterModal(false)}
        onSwitchToLogin={() => {
          setShowRegisterModal(false);
          setShowLoginModal(true);
        }}
      />
    </div>
  );
}
