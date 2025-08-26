import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { logoutUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { LoginModal } from "@/components/auth/login-modal";
import { RegisterModal } from "@/components/auth/register-modal";
import { Plus, User, LogOut, Home, Shield, MessageCircle } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useMessageNotifications } from "@/hooks/useMessageNotifications";
import { LanguageSelector } from "@/components/ui/language-selector";
import { useTranslation } from "react-i18next";
import logoImage from "@assets/generated_images/Professional_Takas_Çemberi_Logo_7b3581dc.png";

export function Header() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const { unreadCount } = useMessageNotifications();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const { t } = useTranslation();

  const handleLogout = async () => {
    try {
      await logoutUser();
      toast({
        title: t('auth.loginSuccess'),
        description: t('common.success'),
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
              <LanguageSelector />
              
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
                      <span className="hidden sm:inline">{t('nav.home')}</span>
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
                      {t('nav.addItem')}
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
                      <span className="hidden sm:inline">{t('profile.messages')}</span>
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
                          {t('nav.profile')}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleLogout} data-testid="button-logout">
                        <LogOut className="h-4 w-4 mr-2" />
                        {t('nav.logout')}
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
                    {t('nav.login')}
                  </Button>
                  <Button 
                    onClick={() => setShowRegisterModal(true)}
                    data-testid="button-register"
                  >
                    {t('nav.register')}
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
