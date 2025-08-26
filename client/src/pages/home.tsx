import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, UserPlus, Plus, ArrowRight, Star } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { LoginModal } from "@/components/auth/login-modal";
import { RegisterModal } from "@/components/auth/register-modal";

export default function Home() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

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
      description: "Ücretsiz hesabınızı oluşturun ve profilinizi tamamlayın",
      color: "bg-primary/10 text-primary"
    },
    {
      icon: <Plus className="h-8 w-8" />,
      title: "2. Eşya Ekle",
      description: "Takas etmek istediğiniz eşyalarınızın fotoğraflarını yükleyin",
      color: "bg-secondary/10 text-secondary"
    },
    {
      icon: <Search className="h-8 w-8" />,
      title: "3. Eşya Bul",
      description: "İstediğiniz eşyayı arayın ve uygun olanları bulun",
      color: "bg-accent/10 text-accent"
    },
    {
      icon: <div className="text-2xl">🤝</div>,
      title: "4. Takas Yap",
      description: "Teklif gönderin, anlaşın ve güvenli şekilde takas yapın",
      color: "bg-green-500/10 text-green-500"
    }
  ];

  const features = [
    {
      icon: "📱",
      title: "Teknolojik Ürünler",
      description: "Eski telefonunuzu tablet ile, laptopunuzu kamerayla takas edin"
    },
    {
      icon: "🏠",
      title: "Beyaz Eşya",
      description: "Kullanmadığınız beyaz eşyalarınızı ihtiyacınız olan eşyalarla değiştirin"
    },
    {
      icon: "🪑",
      title: "Mobilya",
      description: "Evinizdeki mobilyaları farklı tarzda mobilyalarla takas edin"
    },
    {
      icon: "🚗",
      title: "Araba & Yedek Parça",
      description: "Araç yedek parçalarınızı ve araba aksesuarlarınızı takas edin"
    },
    {
      icon: "🧸",
      title: "Oyuncak",
      description: "Çocuğunuzun büyüdüğü oyuncakları yeni yaş grubuna uygun olanlarla değiştirin"
    },
    {
      icon: "🏡",
      title: "Taşınmazlar",
      description: "Ev, arsa, tarla, bağ, bahçe gibi emlak varlıklarınızı takas edin"
    }
  ];

  const testimonials = [
    {
      name: "Ahmet Kaya",
      location: "İstanbul",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
      rating: 5,
      text: "Kullanmadığım laptop ile istediğim kamerayı takas ettim. Hem para biriktirdim hem de çevreye katkıda bulundum. Sistem çok güvenli ve kolay."
    },
    {
      name: "Ayşe Demir",
      location: "Ankara", 
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
      rating: 5,
      text: "Çocuğumun büyüdüğü oyuncakları yaşına uygun olanlarla değiştirmek harika bir fikir. Takas platformu sayesinde hem tasarruf ettik hem de yeni oyuncaklar aldık."
    },
    {
      name: "Zeynep Özkan",
      location: "İzmir",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b494?w=40&h=40&fit=crop&crop=face",
      rating: 5,
      text: "Kitap tutkunu olarak okuduğum kitapları yeni kitaplarla değiştirmek mükemmel. Hem kütüphanem yenileniyor hem de başkaları da faydalanıyor."
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary to-green-600 text-white py-20">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6" data-testid="title-hero">
            Kullanmadığın Eşyalarını <br />
            <span className="text-accent">Değerli Eşyalarla</span> Takas Et
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90" data-testid="description-hero">
            Güvenli, kolay ve çevreci bir şekilde eşyalarınızı başkalarıyla değiştirin. 
            Binlerce kullanıcı arasından istediğiniz eşyayı bulun.
          </p>
          

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold" data-testid="stat-users">15,000+</div>
              <div className="opacity-80">Aktif Kullanıcı</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold" data-testid="stat-trades">50,000+</div>
              <div className="opacity-80">Başarılı Takas</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold" data-testid="stat-items">100,000+</div>
              <div className="opacity-80">Eşya İlanı</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4" data-testid="title-how-it-works">
              Nasıl Çalışır?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Sadece 4 basit adımda eşyalarınızı takas edebilirsiniz
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

          {/* Features */}
          <div className="mt-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6" data-testid="title-features">Platform Kullanım Örnekleri</h3>
              <div className="space-y-6">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-4" data-testid={`feature-${index}`}>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 text-2xl">
                      {feature.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{feature.title}</h4>
                      <p className="text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4" data-testid="title-testimonials">
              Kullanıcılarımız Ne Diyor?
            </h2>
            <p className="text-xl text-gray-600">Binlerce mutlu kullanıcımızdan bazı yorumlar</p>
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
            Hemen Başla, İlk Takasını Yap!
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Ücretsiz hesap oluştur ve binlerce eşya arasından istediğini bul. 
            İlk takasın için özel %20 komisyon indirimi!
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
                    Eşyaları Keşfet
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
                  İlk Eşyanı Ekle
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
