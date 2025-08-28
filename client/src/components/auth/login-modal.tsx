import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { loginUser, sendPasswordReset } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
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
import { Eye, EyeOff } from "lucide-react";

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
  const [showPassword, setShowPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const { toast } = useToast();

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
          <DialogTitle data-testid="title-login">
            {showResetPassword ? "Şifre Sıfırla" : "Giriş Yap"}
          </DialogTitle>
        </DialogHeader>

        {showResetPassword ? (
          <Form {...resetForm}>
            <form onSubmit={resetForm.handleSubmit(onResetPassword)} className="space-y-4">
              <div className="text-sm text-gray-600 mb-4">
                E-posta adresinizi girin. Şifre sıfırlama linki e-postanıza gönderilecek.
              </div>
              
              <FormField
                control={resetForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-posta</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="ornek@email.com" 
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                        autoComplete="email"
                        data-testid="input-reset-email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                  type="submit" 
                  className="flex-1" 
                  disabled={resetLoading}
                  data-testid="button-submit-reset"
                >
                  {resetLoading ? "Gönderiliyor..." : "E-posta Gönder"}
                </Button>
              </div>
            </form>
          </Form>
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
                disabled={loading}
                data-testid="button-submit-login"
              >
                {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
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
