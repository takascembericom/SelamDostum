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
import { useLanguage } from "@/contexts/LanguageContext";

interface TermsModalProps {
  open: boolean;
  onClose: () => void;
  onAccept: () => void;
  loading?: boolean;
}

export function TermsModal({ open, onClose, onAccept, loading = false }: TermsModalProps) {
  const [accepted, setAccepted] = useState(false);
  const { t } = useLanguage();

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
      <DialogContent className="sm:max-w-4xl w-[90vw] max-h-[90vh] flex flex-col" data-testid="modal-terms">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-xl font-semibold text-center" data-testid="title-terms">
            {t.terms.title}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0" data-testid="scroll-terms">
          <div className="pr-4 pb-4">
          <div className="space-y-6 text-sm">
            
            {/* Kullanım Şartları */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-primary">{t.terms.usageTermsTitle}</h2>
              
              <div className="space-y-3">
                <div>
                  <h3 className="font-medium mb-2">{t.terms.generalProvisionsTitle}</h3>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-gray-700">
                    {t.terms.generalProvisions.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium mb-2">{t.terms.membershipSecurityTitle}</h3>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-gray-700">
                    {t.terms.membershipSecurity.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium mb-2">{t.terms.adsSharesTitle}</h3>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-gray-700">
                    {t.terms.adsShares.map((item, index) => (
                      <li key={index}>
                        {index === 1 ? (
                          <span dangerouslySetInnerHTML={{
                            __html: item
                              .replace(/kesinlikle yasaktır/g, '<strong>kesinlikle yasaktır</strong>')
                              .replace(/strictly prohibited/g, '<strong>strictly prohibited</strong>')
                              .replace(/محظورة تماماً/g, '<strong>محظورة تماماً</strong>')
                          }} />
                        ) : (
                          item
                        )}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium mb-2">{t.terms.liabilityDisclaimerTitle}</h3>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-gray-700">
                    {t.terms.liabilityDisclaimer.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium mb-2">{t.terms.serviceLimitsTitle}</h3>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-gray-700">
                    {t.terms.serviceLimits.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Gizlilik Politikası */}
            <div className="space-y-4 border-t pt-6">
              <h2 className="text-lg font-semibold text-primary">{t.terms.privacyPolicyTitle}</h2>
              
              <div className="space-y-3">
                <div>
                  <h3 className="font-medium mb-2">{t.terms.dataCollectionTitle}</h3>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-gray-700">
                    {t.terms.dataCollection.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium mb-2">{t.terms.dataUsageTitle}</h3>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-gray-700">
                    {t.terms.dataUsage.map((item, index) => (
                      <li key={index}>
                        {index === 0 ? (
                          <span dangerouslySetInnerHTML={{
                            __html: item
                              .replace(/kesinlikle paylaşılmaz/g, '<strong>kesinlikle paylaşılmaz</strong>')
                              .replace(/never shared/g, '<strong>never shared</strong>')
                              .replace(/لا تُشارك أبداً/g, '<strong>لا تُشارك أبداً</strong>')
                          }} />
                        ) : (
                          item
                        )}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium mb-2">{t.terms.cookiesTitle}</h3>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-gray-700">
                    {t.terms.cookies.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium mb-2">{t.terms.securityTitle}</h3>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-gray-700">
                    {t.terms.security.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium mb-2">{t.terms.rightsTitle}</h3>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-gray-700">
                    {t.terms.rights.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
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
              {t.terms.acceptText}
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
              {t.terms.cancelButton}
            </Button>
            <Button 
              onClick={handleAccept}
              disabled={!accepted || loading}
              className="flex-1 bg-green-600 hover:bg-green-700"
              data-testid="button-accept-terms"
            >
              {loading ? t.terms.loading : t.terms.acceptButton}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}