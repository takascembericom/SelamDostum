import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TermsModalProps {
  open: boolean;
  onClose: () => void;
  onAccept: () => void;
  loading?: boolean;
}

export function TermsModal({ open, onClose, onAccept, loading = false }: TermsModalProps) {
  const [accepted, setAccepted] = useState(false);

  const handleClose = () => {
    setAccepted(false);
    onClose();
  };

  const handleAccept = () => {
    if (accepted) {
      onAccept();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col" data-testid="modal-terms">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-center" data-testid="title-terms">
            📜 Kullanım Şartları ve Gizlilik Politikası
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 max-h-[60vh] pr-4" data-testid="scroll-terms">
          <div className="space-y-6 text-sm">
            
            {/* Kullanım Şartları */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-primary">📜 Takas Çemberi Kullanım Şartları</h2>
              
              <div className="space-y-3">
                <div>
                  <h3 className="font-medium mb-2">1. Genel Hükümler</h3>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-gray-700">
                    <li>Takas Çemberi, üyelerinin ihtiyaç fazlası ürünlerini ücretsiz veya belirlenen şartlarda takas etmelerine imkân sağlayan bir dijital platformdur.</li>
                    <li>Platforma üye olan her kullanıcı, bu kullanım şartlarını okumuş ve kabul etmiş sayılır.</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium mb-2">2. Üyelik ve Hesap Güvenliği</h3>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-gray-700">
                    <li>Üyeler, kayıt sırasında doğru ve güncel bilgiler vermekle yükümlüdür.</li>
                    <li>Hesap güvenliğinden kullanıcı sorumludur. Kullanıcı adı ve şifrenin üçüncü kişilerle paylaşılmasından doğacak sorumluluk kullanıcıya aittir.</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium mb-2">3. İlan ve Paylaşımlar</h3>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-gray-700">
                    <li>Kullanıcılar yalnızca kendilerine ait veya takas hakkına sahip oldukları ürünleri paylaşabilir.</li>
                    <li>Kapora, ön ödeme veya kullanıcılar arası para transferi <strong>kesinlikle yasaktır</strong>.</li>
                    <li>Platform, şüpheli veya kural dışı ilanları kaldırma hakkını saklı tutar.</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium mb-2">4. Sorumluluk Reddi</h3>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-gray-700">
                    <li>Takas Çemberi, kullanıcılar arasında gerçekleşen takas işlemlerinin tarafı değildir.</li>
                    <li>Ürün kalitesi, teslimi veya takas sonrası yaşanabilecek anlaşmazlıklardan kullanıcılar sorumludur.</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium mb-2">5. Hizmetin Sınırları</h3>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-gray-700">
                    <li>Takas Çemberi, hizmeti dilediği zaman değiştirme, askıya alma veya sonlandırma hakkını saklı tutar.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Gizlilik Politikası */}
            <div className="space-y-4 border-t pt-6">
              <h2 className="text-lg font-semibold text-primary">🔒 Gizlilik Politikası</h2>
              
              <div className="space-y-3">
                <div>
                  <h3 className="font-medium mb-2">1. Kişisel Verilerin Toplanması</h3>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-gray-700">
                    <li>Üyelik sırasında ad, e-posta ve iletişim bilgileri gibi temel veriler talep edilmektedir.</li>
                    <li>Bu bilgiler yalnızca kullanıcı deneyimini iyileştirmek ve güvenli bir platform sağlamak amacıyla kullanılmaktadır.</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium mb-2">2. Verilerin Kullanımı</h3>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-gray-700">
                    <li>Kullanıcı bilgileri üçüncü kişilerle <strong>kesinlikle paylaşılmaz</strong>.</li>
                    <li>Ancak yasal zorunluluk halinde resmi makamlarla paylaşılabilir.</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium mb-2">3. Çerezler (Cookies)</h3>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-gray-700">
                    <li>Platform, kullanıcı deneyimini artırmak için çerezlerden faydalanabilir.</li>
                    <li>Dileyen kullanıcı tarayıcı ayarlarından çerezleri kapatabilir.</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium mb-2">4. Güvenlik</h3>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-gray-700">
                    <li>Kullanıcı verilerinin korunması için gerekli teknik ve idari önlemler alınmaktadır.</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium mb-2">5. Haklarınız</h3>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-gray-700">
                    <li>Kullanıcılar, kişisel verilerinin silinmesini, güncellenmesini veya düzeltilmesini talep edebilir.</li>
                    <li>Bu talepler için iletişim bölümünden bizimle irtibat kurulabilir.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="flex flex-col space-y-4 pt-4 border-t">
          {/* Kabul Checkbox'ı */}
          <div className="flex items-start space-x-3 w-full">
            <Checkbox
              id="accept-terms-modal"
              checked={accepted}
              onCheckedChange={(checked) => setAccepted(!!checked)}
              data-testid="checkbox-accept-terms-modal"
            />
            <label 
              htmlFor="accept-terms-modal" 
              className="text-sm font-medium leading-5 cursor-pointer"
            >
              ✅ Yukarıdaki <strong>Kullanım Şartları</strong> ve <strong>Gizlilik Politikası</strong>'nı okudum, anladım ve kabul ediyorum.
            </label>
          </div>

          {/* Butonlar */}
          <div className="flex gap-3 w-full">
            <Button 
              variant="outline" 
              onClick={handleClose} 
              className="flex-1"
              disabled={loading}
              data-testid="button-cancel-terms"
            >
              ❌ İptal
            </Button>
            <Button 
              onClick={handleAccept}
              disabled={!accepted || loading}
              className="flex-1 bg-green-600 hover:bg-green-700"
              data-testid="button-accept-terms"
            >
              {loading ? "Kayıt oluşturuluyor..." : "✅ Kabul Et & Kayıt Ol"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}