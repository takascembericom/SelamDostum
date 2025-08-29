import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { registerUser, signInWithGoogle } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Globe } from "lucide-react";

const registerSchema = z.object({
  firstName: z.string().min(2, "En az 2 karakter"),
  lastName: z.string().min(2, "En az 2 karakter"),
  username: z.string().min(3, "En az 3 karakter").max(20, "En fazla 20 karakter"),
  email: z.string().email("Geçerli e-posta giriniz"),
  phone: z.string().min(10, "En az 10 rakam"),
  password: z.string().min(6, "En az 6 karakter"),
  acceptTerms: z.boolean().refine(val => val, "Şartları kabul edin"),
});

type RegisterFormData = z.infer<typeof registerSchema>;

interface RegisterModalProps {
  open: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export function RegisterModal({ open, onClose, onSwitchToLogin }: RegisterModalProps) {
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const { language, setLanguage, t } = useLanguage();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      phone: "",
      password: "",
      acceptTerms: false,
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    try {
      const { acceptTerms, ...userData } = data;
      await registerUser(userData);
      toast({
        title: "Kayıt başarılı! 🎉",
        description: "E-posta adresinize doğrulama bağlantısı gönderildi. Eğer gelen kutusunda yoksa SPAM klasörünüze bakınız. E-posta doğrulaması yapmadan giriş yapamazsınız.",
      });
      onClose();
      form.reset();
    } catch (error: any) {
      toast({
        title: "Kayıt Hatası",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      toast({
        title: "Kayıt başarılı! 🎉",
        description: "Google ile başarıyla giriş yapıldı!",
      });
      onClose();
      form.reset();
    } catch (error: any) {
      toast({
        title: "Google Kayıt Hatası",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto" data-testid="modal-register">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle data-testid="title-register">{t.auth.register}</DialogTitle>
            
            {/* Dil Seçici */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" data-testid="button-language-register">
                  <Globe className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  onClick={() => setLanguage('tr')}
                  className={language === 'tr' ? 'bg-blue-50' : ''}
                  data-testid="language-tr-register"
                >
                  🇹🇷 Türkçe
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setLanguage('en')}
                  className={language === 'en' ? 'bg-blue-50' : ''}
                  data-testid="language-en-register"
                >
                  🇺🇸 English
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setLanguage('ar')}
                  className={language === 'ar' ? 'bg-blue-50' : ''}
                  data-testid="language-ar-register"
                >
                  🇸🇦 العربية
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ad</FormLabel>
                    <FormControl>
                      <Input placeholder="Adınız" {...field} data-testid="input-firstName" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Soyad</FormLabel>
                    <FormControl>
                      <Input placeholder="Soyadınız" {...field} data-testid="input-lastName" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kullanıcı Adı</FormLabel>
                  <FormControl>
                    <Input placeholder="kullaniciadi" {...field} data-testid="input-username" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-posta</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="ornek@email.com" {...field} data-testid="input-email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefon</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="05XX XXX XX XX" {...field} data-testid="input-phone" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Şifre</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="••••••••" 
                        {...field} 
                        data-testid="input-password"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        data-testid="button-toggle-password"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="acceptTerms"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      data-testid="checkbox-accept-terms"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm">
                      <a href="#" className="text-primary hover:text-primary/80">Kullanım Şartları</a> ve{" "}
                      <a href="#" className="text-primary hover:text-primary/80">Gizlilik Politikası</a>'nı kabul ediyorum
                    </FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || googleLoading}
              data-testid="button-submit-register"
            >
              {loading ? "Kayıt oluşturuluyor..." : "Kayıt Ol"}
            </Button>
          </form>
        </Form>

        <div className="space-y-4 pt-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">veya</span>
            </div>
          </div>

          <Button 
            type="button"
            variant="outline" 
            className="w-full" 
            disabled={loading || googleLoading}
            onClick={handleGoogleSignIn}
            data-testid="button-google-signin-register"
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            {googleLoading ? "Google ile kayıt olunuyor..." : "Google ile Kayıt Ol"}
          </Button>
        </div>

        <div className="text-center pt-4">
          <p className="text-gray-600">
            Zaten hesabın var mı?{" "}
            <button
              onClick={onSwitchToLogin}
              className="text-primary hover:text-primary/80 font-medium"
              data-testid="button-switch-to-login"
            >
              Giriş Yap
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
