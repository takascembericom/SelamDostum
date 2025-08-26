import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { logoutUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { LoginModal } from "@/components/auth/login-modal";
import { RegisterModal } from "@/components/auth/register-modal";
import { Menu, X, Plus, User, LogOut } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

export function Header() {
  const [location] = useLocation();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logoutUser();
      toast({
        title: "Başarıyla çıkış yaptınız",
        description: "İyi günler dileriz!",
      });
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const navItems = [
    { href: "/", label: "Ana Sayfa" },
    { href: "/items", label: "Eşyalar" },
  ];

  return (
    <>
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" data-testid="link-home">
                <div className="flex-shrink-0 flex items-center">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mr-2">
                    <span className="text-white font-bold text-lg">T</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">Takas</span>
                </div>
              </Link>
              <nav className="hidden md:ml-8 md:flex md:space-x-8">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    data-testid={`link-${item.label.toLowerCase().replace(' ', '-')}`}
                  >
                    <span
                      className={`px-3 py-2 text-sm font-medium transition-colors ${
                        location === item.href
                          ? "text-primary"
                          : "text-gray-700 hover:text-primary"
                      }`}
                    >
                      {item.label}
                    </span>
                  </Link>
                ))}
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <Link href="/add-item">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="hidden sm:flex items-center gap-2"
                      data-testid="button-add-item"
                    >
                      <Plus className="h-4 w-4" />
                      Eşya Ekle
                    </Button>
                  </Link>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="flex items-center gap-2"
                        data-testid="button-user-menu"
                      >
                        <User className="h-4 w-4" />
                        <span className="hidden sm:inline">
                          {profile?.firstName || user.email}
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href="/profile" data-testid="link-profile">
                          <User className="h-4 w-4 mr-2" />
                          Profil
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleLogout} data-testid="button-logout">
                        <LogOut className="h-4 w-4 mr-2" />
                        Çıkış Yap
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Button 
                    variant="ghost" 
                    onClick={() => setShowLoginModal(true)}
                    data-testid="button-login"
                  >
                    Giriş Yap
                  </Button>
                  <Button 
                    onClick={() => setShowRegisterModal(true)}
                    data-testid="button-register"
                  >
                    Kayıt Ol
                  </Button>
                </>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                data-testid="button-mobile-menu"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t">
              <div className="space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    data-testid={`mobile-link-${item.label.toLowerCase().replace(' ', '-')}`}
                  >
                    <div
                      className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        location === item.href
                          ? "bg-primary/10 text-primary"
                          : "text-gray-700 hover:text-primary hover:bg-gray-50"
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.label}
                    </div>
                  </Link>
                ))}
                {user && (
                  <Link href="/add-item">
                    <div 
                      className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary hover:bg-gray-50"
                      onClick={() => setMobileMenuOpen(false)}
                      data-testid="mobile-link-add-item"
                    >
                      Eşya Ekle
                    </div>
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

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
    </>
  );
}
