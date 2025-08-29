import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { collection, query, where, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Item } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, UserPlus, Plus, ArrowRight, Star, HelpCircle, Lock, Phone, Smartphone, Info, Scale, Cookie } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { LoginModal } from "@/components/auth/login-modal";
import { RegisterModal } from "@/components/auth/register-modal";
import { CategoryButtons } from "@/components/category-buttons";
import { ItemGrid } from "@/components/items/item-grid";
import { Skeleton } from "@/components/ui/skeleton";
import logoImage from "@assets/generated_images/Professional_Takas_Çemberi_Logo_7b3581dc.png";

export default function Home() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // Fetch latest 20 items for homepage
  const { data: latestItems = [], isLoading: itemsLoading } = useQuery({
    queryKey: ['homepage-items'],
    queryFn: async (): Promise<Item[]> => {
      try {
        const response = await fetch('/api/items');
        const items = await response.json();
        return items.slice(0, 20); // Limit to 20 items for homepage
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
      title: `1. ${t.home.step1Title}`,
      description: t.home.step1Description,
      color: "bg-primary/10 text-primary"
    },
    {
      icon: <Plus className="h-8 w-8" />,
      title: `2. ${t.home.step2Title}`,
      description: t.home.step2Description,
      color: "bg-secondary/10 text-secondary"
    },
    {
      icon: <Search className="h-8 w-8" />,
      title: `3. ${t.home.step3Title}`,
      description: t.home.step3Description,
      color: "bg-accent/10 text-accent"
    },
    {
      icon: <div className="text-2xl">🤝</div>,
      title: `4. ${t.home.step4Title}`,
      description: t.home.step4Description,
      color: "bg-green-500/10 text-green-500"
    }
  ];


  const testimonials = [
    {
      name: "Ahmet Kaya",
      location: "İstanbul",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
      rating: 5,
      text: t.common.testimonial1
    },
    {
      name: "Ayşe Demir",
      location: "Ankara", 
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
      rating: 5,
      text: t.common.testimonial2
    },
    {
      name: "Zeynep Özkan",
      location: "İzmir",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b494?w=40&h=40&fit=crop&crop=face",
      rating: 5,
      text: t.common.testimonial3
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
          
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 leading-tight" data-testid="title-hero">
            {t.home.welcomeTitle}
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl mb-4 font-semibold" data-testid="welcome-text">
            {t.home.welcomeSubtitle}
          </p>
          <p className="text-sm sm:text-base md:text-lg mb-8 max-w-xl mx-auto opacity-90 px-4" data-testid="description-hero">
            {t.home.heroDescription}
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
                  📦 {t.home.recentItems}
                </h2>
                <p className="text-xl text-gray-600">
                  {t.home.recentItemsCount} {latestItems.length} {t.home.itemsText}
                </p>
              </div>
              <Button 
                asChild
                variant="outline"
                className="hidden sm:flex"
                data-testid="button-view-all-items"
              >
                <Link href="/items">
                  {t.common.viewAll}
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
                      {t.common.viewAll}
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
                <h3 className="text-xl font-medium text-gray-900 mb-2">{t.home.noRecentItems}</h3>
                <p className="text-gray-500 mb-6">{t.items.addItem}</p>
                <Button asChild>
                  <Link href="/add-item">
                    <Plus className="h-4 w-4 mr-2" />
                    {t.items.addItem}
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
              {t.home.howItWorks}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t.home.stepsSubtitle}
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
              {t.common.testimonialsTitle}
            </h2>
            <p className="text-xl text-gray-600">
              {t.common.testimonialsSubtitle}
            </p>
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


      {/* Blog Section */}
      <section className="py-20 bg-gradient-to-r from-green-100 to-blue-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <div className="text-center mb-8">
              <div className="flex justify-center items-center gap-3 mb-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <span className="text-2xl">♻️</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                  {t.blog.recyclingTitle}
                </h2>
                <div className="p-3 bg-blue-100 rounded-full">
                  <span className="text-2xl">🌱</span>
                </div>
              </div>
              <p className="text-xl text-gray-600 mb-6">
                {t.blog.recyclingSubtitle}
              </p>
            </div>
            
            <div className="prose prose-lg max-w-none text-gray-700 mb-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    {t.blog.protectNatureTitle}
                  </h3>
                  <p className="mb-4">{t.blog.protectNatureDesc}</p>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span><strong>{t.blog.plasticBottle}</strong></span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span><strong>{t.blog.aluminumCan}</strong></span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span><strong>{t.blog.glassBottle}</strong></span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    {t.blog.economyTitle}
                  </h3>
                  <p className="mb-4">{t.blog.economyDesc}</p>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>{t.blog.rawMaterial}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>{t.blog.energyConsumption}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>{t.blog.economicContribution}</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 mt-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-2xl">🔄</span>
                  {t.blog.easiestWayTitle}
                </h3>
                <p className="mb-4">{t.blog.easiestWayDesc}</p>
                <div className="grid sm:grid-cols-3 gap-4 text-sm">
                  <div className="text-center p-4 bg-white rounded-lg">
                    <div className="text-2xl mb-2">📱</div>
                    <p>{t.blog.phoneExample}</p>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg">
                    <div className="text-2xl mb-2">🪑</div>
                    <p>{t.blog.furnitureExample}</p>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg">
                    <div className="text-2xl mb-2">🔌</div>
                    <p>{t.blog.electronicExample}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-semibold text-lg">
                  <Link href="/blog/geri-donusum-neden-onemli">
                    {t.blog.readMore}
                  </Link>
                </Button>
                <Button asChild variant="outline" className="border-green-300 text-green-700 hover:bg-green-50 px-8 py-3 rounded-xl font-semibold text-lg">
                  <Link href="/add-item">
                    <Plus className="h-5 w-5 mr-2" />
                    {t.blog.startTrading}
                  </Link>
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                {t.blog.encouragement}
              </p>
            </div>
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
