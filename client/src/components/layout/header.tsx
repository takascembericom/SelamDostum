import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { logoutUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { LoginModal } from "@/components/auth/login-modal";
import { RegisterModal } from "@/components/auth/register-modal";
import { Plus, User, LogOut, Home, Shield, MessageCircle, Bell } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useMessageNotifications } from "@/hooks/useMessageNotifications";
import logoImage from "@assets/generated_images/Professional_Takas_Çemberi_Logo_7b3581dc.png";

export function Header() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const { unreadCount } = useMessageNotifications();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const handleLogout = async () => {
    try {
      await logoutUser();
      toast({
        title: "Çıkış yapıldı",
        description: "İyi günler!",
      });
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    }
  };


  return (
    <>
      <header className="bg-white shadow-sm sticky top-0 z-40">
        {/* Mobile Floating Add Item Button */}
        {user && (
          <Link href="/add-item">
            <Button 
              className="fixed top-4 right-4 z-50 bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-full shadow-lg sm:hidden flex items-center gap-2"
              data-testid="button-add-item-mobile"
            >
              <Plus className="h-5 w-5" />
              İlan Ver
            </Button>
          </Link>
        )}
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-24">
            <div className="flex items-center">
              <Link href="/" data-testid="link-home">
                <div className="flex-shrink-0 flex items-center">
                  <img 
                    src={logoImage} 
                    alt="Takas Çemberi Logo" 
                    className="h-20 w-auto mr-5"
                  />
                  <span className="text-5xl font-bold text-gray-900 hidden sm:inline">Takas Çemberi</span>
                </div>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <Link href="/">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="flex items-center gap-2"
                      data-testid="button-home"
                    >
                      <Home className="h-4 w-4" />
                      <span className="hidden sm:inline">Ana Sayfa</span>
                    </Button>
                  </Link>
                  
                  <Link href="/add-item">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="hidden sm:flex items-center gap-2"
                      data-testid="button-add-item"
                    >
                      <Plus className="h-4 w-4" />
                      İlan Ekle
                    </Button>
                  </Link>
                  
                  <Link href="/messages">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="flex items-center gap-2 relative"
                      data-testid="button-messages"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span className="hidden sm:inline">Mesajlar</span>
                      {unreadCount > 0 && (
                        <Badge 
                          variant="destructive" 
                          className="absolute -top-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center text-xs p-0 min-w-0"
                        >
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </Badge>
                      )}
                    </Button>
                  </Link>
                  
                  {/* Notifications */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="flex items-center gap-2 relative"
                        data-testid="button-notifications"
                      >
                        <Bell className="h-4 w-4" />
                        <span className="hidden sm:inline">Bildirimler</span>
                        {/* TODO: Add notification count */}
                        <Badge 
                          variant="destructive" 
                          className="absolute -top-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center text-xs p-0 min-w-0"
                        >
                          3
                        </Badge>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80">
                      <div className="p-3 border-b">
                        <h3 className="font-semibold">Bildirimler</h3>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {/* Sample notifications */}
                        <div className="p-3 border-b hover:bg-gray-50 cursor-pointer">
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">Yeni yıldız aldınız!</p>
                              <p className="text-xs text-gray-600">Ahmet Kaya size 5 yıldız verdi</p>
                              <p className="text-xs text-gray-400 mt-1">2 saat önce</p>
                            </div>
                          </div>
                        </div>
                        <div className="p-3 border-b hover:bg-gray-50 cursor-pointer">
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">Takas teklifi kabul edildi</p>
                              <p className="text-xs text-gray-600">Laptopunuz için teklif kabul edildi</p>
                              <p className="text-xs text-gray-400 mt-1">1 gün önce</p>
                            </div>
                          </div>
                        </div>
                        <div className="p-3 hover:bg-gray-50 cursor-pointer">
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">Yeni takas teklifi</p>
                              <p className="text-xs text-gray-600">Telefonunuz için yeni teklif geldi</p>
                              <p className="text-xs text-gray-400 mt-1">3 gün önce</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="p-3 border-t text-center">
                        <Button variant="ghost" size="sm" className="text-xs">
                          Tümünü Gör
                        </Button>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
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
            </div>
          </div>

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
