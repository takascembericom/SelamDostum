import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { logoutUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { LoginModal } from "@/components/auth/login-modal";
import { RegisterModal } from "@/components/auth/register-modal";
import { Plus, User, LogOut, Home, Shield, MessageCircle, Bell, Search, ArrowLeft, Mail, BellRing, FileSearch, ArrowRightLeft, CheckCircle, XCircle, Star, Globe, Leaf } from "lucide-react";
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
      <header className="bg-gradient-to-r from-purple-600 via-blue-600 to-teal-500 shadow-lg sticky top-0 z-40 backdrop-blur-md">
        {/* Mobile Floating Add Item Button - Removed per user request */}
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
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
                      className="flex items-center gap-2 text-white hover:text-yellow-300 hover:bg-white/20 rounded-xl transition-all duration-300 transform hover:scale-105 backdrop-blur-sm"
                      data-testid="button-home"
                    >
                      <Home className="h-4 w-4" />
                      <span className="hidden sm:inline">{t.nav.home}</span>
                    </Button>
                  </Link>
                  
                  <Link href="/items">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="flex items-center gap-2 text-white hover:text-green-300 hover:bg-white/20 rounded-xl transition-all duration-300 transform hover:scale-105 backdrop-blur-sm"
                      data-testid="button-browse"
                    >
                      <Search className="h-4 w-4" />
                      <span className="hidden sm:inline">{t.nav.items}</span>
                    </Button>
                  </Link>
                  
                  <Link href="/blog">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="flex items-center gap-2 text-white hover:text-cyan-300 hover:bg-white/20 rounded-xl transition-all duration-300 transform hover:scale-105 backdrop-blur-sm"
                      data-testid="button-blog"
                    >
                      <Leaf className="h-4 w-4" />
                      <span>{t.nav.blog}</span>
                    </Button>
                  </Link>
                  
                  <Link href="/add-item">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center gap-2 bg-white/10 border-white/30 text-white hover:bg-white hover:text-purple-600 rounded-xl transition-all duration-300 transform hover:scale-105 font-semibold shadow-lg"
                      data-testid="button-add-item"
                    >
                      <Plus className="h-4 w-4" />
                      <span className="hidden sm:inline">{t.nav.addItem}</span>
                      <span className="sm:hidden">{t.nav.addItem}</span>
                    </Button>
                  </Link>
                  
                  <Link href="/messages" className="hidden lg:block">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="flex items-center gap-2 relative text-white hover:text-pink-300 hover:bg-white/20 rounded-xl transition-all duration-300 transform hover:scale-105 backdrop-blur-sm"
                      data-testid="button-messages"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>{t.nav.messages}</span>
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
                  
                  {/* Notifications - Sadece Desktop */}
                  <div className="hidden lg:block">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="flex items-center gap-2 relative text-white hover:text-orange-300 hover:bg-white/20 rounded-xl transition-all duration-300 transform hover:scale-105 backdrop-blur-sm"
                          data-testid="button-notifications"
                        >
                          <Bell className="h-4 w-4" />
                          <span>{t.nav.notifications}</span>
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
                  </div>
                  
                  {/* Language Selector - Mobilde de görünür */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-white hover:text-cyan-300 hover:bg-white/20 rounded-xl transition-all duration-300 transform hover:scale-105 backdrop-blur-sm" data-testid="button-language">
                        <Globe className="h-4 w-4 sm:mr-2" />
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
                  
                  {/* Mobilde Profil Dropdown Menüsü */}
                  <div className="sm:hidden">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-white hover:text-pink-300 hover:bg-white/20 rounded-xl transition-all duration-300 transform hover:scale-105 backdrop-blur-sm" data-testid="button-profile-mobile-header">
                          <User className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href="/profile" data-testid="link-profile-mobile">
                            <User className="h-4 w-4 mr-2" />
                            {t.nav.profile}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleLogout} data-testid="button-logout-mobile">
                          <LogOut className="h-4 w-4 mr-2" />
                          {t.auth.logout}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Desktop Kullanıcı Menüsü */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="hidden sm:flex items-center gap-2 text-white hover:text-pink-300 hover:bg-white/20 rounded-xl transition-all duration-300 transform hover:scale-105 backdrop-blur-sm"
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
                  {/* Dil Seçici - Giriş yapmamış kullanıcılar için */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-white hover:text-cyan-300 hover:bg-white/20 rounded-xl transition-all duration-300 transform hover:scale-105 backdrop-blur-sm" data-testid="button-language-guest">
                        <Globe className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">{t.common.language}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onClick={() => setLanguage('tr')}
                        className={language === 'tr' ? 'bg-blue-50' : ''}
                        data-testid="language-tr-guest"
                      >
                        🇹🇷 Türkçe
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => setLanguage('en')}
                        className={language === 'en' ? 'bg-blue-50' : ''}
                        data-testid="language-en-guest"
                      >
                        🇺🇸 English
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => setLanguage('ar')}
                        className={language === 'ar' ? 'bg-blue-50' : ''}
                        data-testid="language-ar-guest"
                      >
                        🇸🇦 العربية
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  <Button 
                    variant="ghost" 
                    className="text-white hover:text-yellow-300 hover:bg-white/20 rounded-xl transition-all duration-300 transform hover:scale-105 backdrop-blur-sm font-medium"
                    onClick={() => setShowLoginModal(true)}
                    data-testid="button-login"
                  >
                    {t.auth.login}
                  </Button>
                  <Button 
                    className="bg-white/20 border-white/30 text-white hover:bg-white hover:text-purple-600 rounded-xl transition-all duration-300 transform hover:scale-105 font-semibold shadow-lg"
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

      {/* Mobile Bottom Navigation Bar */}
      {user && (
        <div className="fixed bottom-0 left-0 right-0 z-[100] sm:hidden bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-2xl backdrop-blur-md border-t border-white/20">
          <div className="flex justify-around items-center py-2">
            <Link href="/">
              <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1 px-3 py-2 text-white hover:text-yellow-300 hover:bg-white/20 rounded-xl transition-all duration-300 transform hover:scale-105">
                <Home className="h-5 w-5" />
                <span className="text-xs">{t.nav.home}</span>
              </Button>
            </Link>
            <Link href="/messages">
              <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1 px-3 py-2 relative text-white hover:text-green-300 hover:bg-white/20 rounded-xl transition-all duration-300 transform hover:scale-105">
                <MessageCircle className="h-5 w-5" />
                <span className="text-xs">{t.nav.messages}</span>
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs bg-red-500 text-white rounded-full">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </Link>
            <Link href="/blog">
              <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1 px-3 py-2 text-white hover:text-cyan-300 hover:bg-white/20 rounded-xl transition-all duration-300 transform hover:scale-105">
                <Leaf className="h-5 w-5" />
                <span className="text-xs">{t.nav.blog}</span>
              </Button>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1 px-3 py-2 relative text-white hover:text-orange-300 hover:bg-white/20 rounded-xl transition-all duration-300 transform hover:scale-105">
                  <Bell className="h-5 w-5" />
                  <span className="text-xs">{t.nav.notifications}</span>
                  {notificationUnreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs bg-red-500 text-white rounded-full">
                      {notificationUnreadCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 mb-16 bg-white/95 backdrop-blur-md shadow-2xl border border-white/20 rounded-2xl">
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
          </div>
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
