import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Shield, Eye, EyeOff } from "lucide-react";
import { useLocation } from "wouter";

// Admin credentials - in production this should be in environment variables
const ADMIN_CREDENTIALS = {
  username: "admin",
  password: "admin123"
};

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Check if already logged in as admin
  const isAdminLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
  
  if (isAdminLoggedIn) {
    setLocation('/admin-panel');
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simple credential check
      if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        localStorage.setItem('adminLoggedIn', 'true');
        toast({
          title: "Giriş başarılı",
          description: "Admin paneline yönlendiriliyorsunuz...",
        });
        setLocation('/admin-panel');
      } else {
        toast({
          title: "Giriş başarısız",
          description: "Kullanıcı adı veya şifre yanlış",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Admin Girişi</CardTitle>
          <p className="text-gray-600">Admin paneline erişim için giriş yapın</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="username">Kullanıcı Adı</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Admin kullanıcı adınızı girin"
                required
                data-testid="input-admin-username"
              />
            </div>
            
            <div>
              <Label htmlFor="password">Şifre</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Admin şifrenizi girin"
                  required
                  data-testid="input-admin-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  data-testid="button-toggle-password"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
              data-testid="button-admin-login"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Giriş yapılıyor...
                </div>
              ) : (
                "Giriş Yap"
              )}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Test için:</strong><br />
              Kullanıcı adı: admin<br />
              Şifre: admin123
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}