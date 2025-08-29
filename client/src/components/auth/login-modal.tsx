import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { loginUser, sendPasswordReset, signInWithGoogle } from "@/lib/auth";
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
import { Eye, EyeOff, Globe } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Geçerli e-posta giriniz"),
  password: z.string().min(6, "En az 6 karakter"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const resetPasswordSchema = z.object({
  email: z.string().email("Geçerli e-posta giriniz"),
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
}

export function LoginModal({ open, onClose, onSwitchToRegister }: LoginModalProps) {
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const { toast } = useToast();
  const { language, setLanguage, t } = useLanguage();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const resetForm = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    try {
      await loginUser(data.email, data.password);
      toast({
        title: "Giriş başarılı",
        description: "Hoş geldin!",
      });
      onClose();
      form.reset();
    } catch (error: any) {
      toast({
        title: "Giriş Hatası",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const onResetPassword = async (data: ResetPasswordFormData) => {
    setResetLoading(true);
    try {
      await sendPasswordReset(data.email);
      toast({
        title: "Şifre Sıfırlama E-postası Gönderildi",
        description: "E-posta adresinizi kontrol edin ve şifre sıfırlama linkine tıklayın.",
      });
      setShowResetPassword(false);
      resetForm.reset();
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setResetLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      toast({
        title: "Giriş başarılı",
        description: "Google ile giriş yapıldı!",
      });
      onClose();
      form.reset();
    } catch (error: any) {
      toast({
        title: "Google Giriş Hatası",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleClose = () => {
    setShowResetPassword(false);
    form.reset();
    resetForm.reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md" data-testid="modal-login">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle data-testid="title-login">
              {showResetPassword ? t.auth.resetPassword : t.auth.login}
            </DialogTitle>
            
            {/* Dil Seçici */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" data-testid="button-language-login">
                  <Globe className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  onClick={() => setLanguage('tr')}
                  className={language === 'tr' ? 'bg-blue-50' : ''}
                  data-testid="language-tr-login"
                >
                  🇹🇷 Türkçe
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setLanguage('en')}
                  className={language === 'en' ? 'bg-blue-50' : ''}
                  data-testid="language-en-login"
                >
                  🇺🇸 English
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setLanguage('ar')}
                  className={language === 'ar' ? 'bg-blue-50' : ''}
                  data-testid="language-ar-login"
                >
                  🇸🇦 العربية
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </DialogHeader>

        {showResetPassword ? (
          <div className="space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              E-posta adresinizi girin. Şifre sıfırlama linki e-postanıza gönderilecek.
            </div>
            
            <div>
              <label htmlFor="reset-email" className="block text-sm font-medium leading-6 text-gray-900 mb-2">
                E-posta
              </label>
              <Input 
                id="reset-email"
                type="email" 
                placeholder="ornek@email.com" 
                value={resetForm.watch('email')}
                onChange={(e) => resetForm.setValue('email', e.target.value)}
                autoComplete="email"
                className="w-full"
                data-testid="input-reset-email"
              />
              {resetForm.formState.errors.email && (
                <p className="text-sm text-red-600 mt-1">
                  {resetForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button 
                type="button"
                variant="outline"
                className="flex-1" 
                onClick={() => setShowResetPassword(false)}
                disabled={resetLoading}
                data-testid="button-cancel-reset"
              >
                Geri
              </Button>
              <Button 
                type="button" 
                className="flex-1" 
                disabled={resetLoading}
                onClick={() => {
                  const email = resetForm.getValues('email');
                  if (email && /\S+@\S+\.\S+/.test(email)) {
                    onResetPassword({ email });
                  } else {
                    resetForm.setError('email', { message: 'Geçerli e-posta giriniz' });
                  }
                }}
                data-testid="button-submit-reset"
              >
                {resetLoading ? "Gönderiliyor..." : "E-posta Gönder"}
              </Button>
            </div>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-posta</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="ornek@email.com" 
                        {...field} 
                        data-testid="input-email"
                      />
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

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading || googleLoading}
                data-testid="button-submit-login"
              >
                {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
              </Button>

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
                data-testid="button-google-signin"
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
                {googleLoading ? "Google ile giriş yapılıyor..." : "Google ile Giriş Yap"}
              </Button>
              
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowResetPassword(true)}
                  className="text-sm text-primary hover:text-primary/80 font-medium"
                  data-testid="button-forgot-password"
                >
                  Şifremi Unuttum
                </button>
              </div>
            </form>
          </Form>
        )}

        {!showResetPassword && (
          <div className="text-center pt-4">
            <p className="text-gray-600">
              Hesabın yok mu?{" "}
              <button
                onClick={onSwitchToRegister}
                className="text-primary hover:text-primary/80 font-medium"
                data-testid="button-switch-to-register"
              >
                Kayıt Ol
              </button>
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
