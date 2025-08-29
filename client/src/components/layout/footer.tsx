import { useLanguage } from "@/contexts/LanguageContext";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export function Footer() {
  const { t } = useLanguage();
  
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="md:col-span-1">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mr-2">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <span className="text-2xl font-bold">Takas Çemberi</span>
            </div>
            <p className="text-gray-400 mb-6" data-testid="text-company-description">
              {t.common.footerDescription}
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://www.facebook.com/profile.php?id=61579785068865&mibextid=ZbWKwL" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors" 
                data-testid="link-facebook"
              >
                <span className="sr-only">Facebook</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
                </svg>
              </a>
              <a 
                href="https://www.instagram.com/takascemberi?igsh=ZWNjeHN6NjFiZ2lm" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors" 
                data-testid="link-instagram"
              >
                <span className="sr-only">Instagram</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.40s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Platform, Support, Legal - Accordion Format */}
          <div className="md:col-span-3">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="platform" className="border-gray-700">
                <AccordionTrigger className="text-lg font-semibold text-white hover:no-underline" data-testid="text-platform-title">
                  {t.common.platform}
                </AccordionTrigger>
                <AccordionContent className="space-y-2 pt-2">
                  <div className="text-gray-400 hover:text-white transition-colors cursor-pointer p-2" data-testid="link-how-it-works">
                    {t.home.howItWorksDetail.title}: {t.home.howItWorksDetail.description}
                  </div>
                  <div className="text-gray-400 hover:text-white transition-colors cursor-pointer p-2" data-testid="link-security">
                    {t.home.securityDetail.title}: {t.home.securityDetail.description}
                  </div>
                  <div className="text-gray-400 hover:text-white transition-colors cursor-pointer p-2" data-testid="link-commission">
                    {t.home.commissionDetail.title}: {t.home.commissionDetail.description}
                  </div>
                  <div className="text-gray-400 hover:text-white transition-colors cursor-pointer p-2" data-testid="link-mobile-app">
                    {t.home.mobileAppDetail.title}: {t.home.mobileAppDetail.description}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="support" className="border-gray-700">
                <AccordionTrigger className="text-lg font-semibold text-white hover:no-underline" data-testid="text-support-title">
                  {t.common.support}
                </AccordionTrigger>
                <AccordionContent className="space-y-2 pt-2">
                  <div className="text-gray-400 hover:text-white transition-colors cursor-pointer p-2" data-testid="link-help-center">
                    {t.home.helpCenterDetail.title}: {t.home.helpCenterDetail.description}
                  </div>
                  <div className="text-gray-400 hover:text-white transition-colors cursor-pointer p-2" data-testid="link-contact">
                    {t.home.contactDetail.title}: {t.home.contactDetail.description}
                  </div>
                  <div className="text-gray-400 hover:text-white transition-colors cursor-pointer p-2" data-testid="link-live-support">
                    {t.home.liveSupportDetail.title}: {t.home.liveSupportDetail.description}
                  </div>
                  <div className="text-gray-400 hover:text-white transition-colors cursor-pointer p-2" data-testid="link-faq">
                    {t.home.faqDetail.title}
                    <div className="mt-2 space-y-1">
                      {Object.entries(t.home.faqDetail.items).map(([key, item]) => (
                        <div key={key} className="text-sm text-gray-500">
                          <strong>{item.question}</strong> {item.answer}
                        </div>
                      ))}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="legal" className="border-gray-700">
                <AccordionTrigger className="text-lg font-semibold text-white hover:no-underline" data-testid="text-legal-title">
                  {t.common.legal}
                </AccordionTrigger>
                <AccordionContent className="space-y-2 pt-2">
                  <div className="text-gray-400 hover:text-white transition-colors cursor-pointer p-2" data-testid="link-terms">
                    {t.home.termsOfUseDetail.title}: {t.home.termsOfUseDetail.description}
                  </div>
                  <div className="text-gray-400 hover:text-white transition-colors cursor-pointer p-2" data-testid="link-privacy">
                    {t.home.privacyPolicyDetail.title}: {t.home.privacyPolicyDetail.description}
                  </div>
                  <div className="text-gray-400 hover:text-white transition-colors cursor-pointer p-2" data-testid="link-kvkk">
                    {t.home.kvkkDetail.title}: {t.home.kvkkDetail.description}
                  </div>
                  <div className="text-gray-400 hover:text-white transition-colors cursor-pointer p-2" data-testid="link-cookies">
                    {t.home.cookiesDetail.title}: {t.home.cookiesDetail.description}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm" data-testid="text-copyright">
            {t.common.allRightsReserved}
          </p>
          <div className="flex items-center space-x-6 mt-4 md:mt-0">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-primary rounded"></div>
              <span className="text-sm text-gray-400" data-testid="text-ssl-secure">
                {t.common.sslSecure}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-400 rounded"></div>
              <span className="text-sm text-gray-400" data-testid="text-eco-friendly">
                {t.common.ecoFriendly}
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
