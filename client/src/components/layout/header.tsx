import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { logoutUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { LoginModal } from "@/components/auth/login-modal";
import { RegisterModal } from "@/components/auth/register-modal";
import { Plus, User, LogOut, Home, Shield, MessageCircle, Bell, Search, ArrowLeft, Mail, BellRing, FileSearch, ArrowRightLeft, CheckCircle, XCircle, Star, Globe } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useMessageNotifications } from "@/hooks/useMessageNotifications";
import { useNotifications } from "@/hooks/useNotifications";
import { useLanguage } from "@/contexts/LanguageContext";
import { markNotificationAsRead, markAllNotificationsAsRead } from "@/lib/notifications-db";
import logoImage from "@assets/generated_images/Professional_Takas_Çemberi_Logo_7b3581dc.png";

export function Header() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const { unreadCount } = useMessageNotifications();
  const { notifications, unreadCount: notificationUnreadCount } = useNotifications();
  const { language, setLanguage, t } = useLanguage();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const handleLogout = async () => {
    try {
      await logoutUser();
      toast({
        title: language === 'tr' ? 'Çıkış yapıldı' : language === 'en' ? 'Logged out' : 'تم تسجيل الخروج',
        description: language === 'tr' ? 'İyi günler!' : language === 'en' ? 'Have a good day!' : 'نتمنى لك يوماً سعيداً!',
      });
    } catch (error: any) {
      toast({
        title: t.common.error,
        description: error.message,
        variant: "destructive",
      });
    }
  };


  return (
    <>
      <header className="bg-white shadow-sm sticky top-0 z-40">
        {/* Mobile Floating Add Item Button - Removed per user request */}
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-24">
            <div className="flex items-center">
              {/* Header left side empty as requested */}
            </div>

            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <Link href="/">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      data-testid="button-home"
                    >
                      <ArrowLeft className="h-4 w-4 sm:hidden" />
                      <Home className="h-4 w-4 hidden sm:block" />
                      <span className="hidden sm:inline">{t.nav.home}</span>
                    </Button>
                  </Link>
                  
                  <Link href="/items">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="flex items-center gap-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                      data-testid="button-browse"
                    >
                      <FileSearch className="h-4 w-4 sm:hidden" />
                      <Search className="h-4 w-4 hidden sm:block" />
                      <span className="hidden sm:inline">{t.nav.items}</span>
                    </Button>
                  </Link>
                  
                  <Link href="/add-item">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center gap-2"
                      data-testid="button-add-item"
                    >
                      <Plus className="h-4 w-4" />
                      <span className="hidden sm:inline">{t.nav.addItem}</span>
                      <span className="sm:hidden">{t.nav.addItem}</span>
                    </Button>
                  </Link>
                  
                  <Link href="/messages">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="flex items-center gap-2 relative text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                      data-testid="button-messages"
                    >
                      <Mail className="h-4 w-4 sm:hidden" />
                      <MessageCircle className="h-4 w-4 hidden sm:block" />
                      <span className="hidden sm:inline">{t.nav.messages}</span>
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
                        <BellRing className="h-4 w-4 sm:hidden" />
                        <Bell className="h-4 w-4 hidden sm:block" />
                        <span className="hidden sm:inline">{t.nav.notifications}</span>
                        {notificationUnreadCount > 0 && (
                          <Badge 
                            variant="destructive" 
                            className="absolute -top-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center text-xs p-0 min-w-0"
                          >
                            {notificationUnreadCount > 99 ? '99+' : notificationUnreadCount}
                          </Badge>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80">
                      <div className="p-3 border-b">
                        <h3 className="font-semibold">{t.nav.notifications}</h3>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center text-gray-500">
                            <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                            <p className="text-sm">{language === 'tr' ? 'Henüz bildiriminiz yok' : language === 'en' ? 'No notifications yet' : 'لا توجد إشعارات بعد'}</p>
                          </div>
                        ) : (
                          <div className="divide-y">
                            {notifications.map((notification) => (
                              <div
                                key={notification.id}
                                className={`p-3 hover:bg-gray-50 cursor-pointer ${
                                  !notification.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                                }`}
                                onClick={() => {
                                  if (!notification.isRead) {
                                    markNotificationAsRead(notification.id).catch(console.error);
                                  }
                                  // Navigate to relevant page based on notification type
                                  if (notification.type === 'trade_offer' || 
                                      notification.type === 'trade_accepted' || 
                                      notification.type === 'trade_rejected') {
                                    window.location.href = '/profile?tab=trade-offers';
                                  }
                                }}
                              >
                                <div className="flex items-start gap-3">
                                  <div className="flex-shrink-0 mt-1">
                                    {notification.type === 'trade_offer' && (
                                      <ArrowRightLeft className="h-4 w-4 text-blue-500" />
                                    )}
                                    {notification.type === 'trade_accepted' && (
                                      <CheckCircle className="h-4 w-4 text-green-500" />
                                    )}
                                    {notification.type === 'trade_rejected' && (
                                      <XCircle className="h-4 w-4 text-red-500" />
                                    )}
                                    {notification.type === 'trade_completed' && (
                                      <Star className="h-4 w-4 text-yellow-500" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                      {notification.title}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      {notification.message}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                      {notification.createdAt.toLocaleDateString('tr-TR', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </p>
                                  </div>
                                  {!notification.isRead && (
                                    <div className="flex-shrink-0">
                                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="p-3 border-t text-center">
                        {notificationUnreadCount > 0 && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-xs mr-2"
                            onClick={() => {
                              if (profile?.id) {
                                markAllNotificationsAsRead(profile.id).catch(console.error);
                              }
                            }}
                          >
                            {t.common.markAllRead}
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-xs"
                          onClick={() => window.location.href = '/profile?tab=trade-offers'}
                        >
                          {t.common.viewAll}
                        </Button>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  {/* Language Selector */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" data-testid="button-language">
                        <Globe className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">{t.common.language}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onClick={() => setLanguage('tr')}
                        className={language === 'tr' ? 'bg-blue-50' : ''}
                        data-testid="language-tr"
                      >
                        🇹🇷 Türkçe
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => setLanguage('en')}
                        className={language === 'en' ? 'bg-blue-50' : ''}
                        data-testid="language-en"
                      >
                        🇺🇸 English
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => setLanguage('ar')}
                        className={language === 'ar' ? 'bg-blue-50' : ''}
                        data-testid="language-ar"
                      >
                        🇸🇦 العربية
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="hidden sm:flex items-center gap-2"
                        data-testid="button-user-menu"
                      >
                        <User className="h-4 w-4" />
                        <span className="hidden sm:inline">
                          {profile?.firstName ? `${profile.firstName} ${profile.lastName || ''}`.trim() : user.email}
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href="/profile" data-testid="link-profile">
                          <User className="h-4 w-4 mr-2" />
                          {t.nav.profile}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleLogout} data-testid="button-logout">
                        <LogOut className="h-4 w-4 mr-2" />
                        {t.auth.logout}
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
                    {t.auth.login}
                  </Button>
                  <Button 
                    onClick={() => setShowRegisterModal(true)}
                    data-testid="button-register"
                  >
                    {t.auth.register}
                  </Button>
                </>
              )}
            </div>
          </div>

        </div>
      </header>

      {/* Mobile Bottom Left Floating Buttons */}
      {user && (
        <div className="fixed bottom-4 left-4 z-50 sm:hidden flex flex-col gap-2">
          <Link href="/profile">
            <Button
              variant="default"
              size="sm"
              className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg"
              data-testid="button-profile-mobile"
            >
              <User className="h-5 w-5" />
            </Button>
          </Link>
          <Button
            variant="default"
            size="sm"
            className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full shadow-lg"
            onClick={handleLogout}
            data-testid="button-logout-mobile"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      )}

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
