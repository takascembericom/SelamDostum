import { useParams, Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Clock, Share2, Leaf, Recycle, Heart, Globe } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent } from "@/components/ui/card";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  publishedAt: string;
  readTime: string;
  tags: string[];
  seoKeywords: string[];
  author: string;
}

// Blog yazıları veritabanı
function getBlogPosts(t: any): BlogPost[] {
  return [
    {
      id: "1",
      title: t.blog.recyclingTitle,
      slug: "geri-donusum-neden-onemli",
      excerpt: t.blog.recyclingSubtitle,
      content: `# ${t.blog.recyclingTitle} 🌍♻️

Hepimizin evinde, iş yerinde ya da çevremizde artık kullanmadığımız pek çok eşya var. Bu eşyaların çoğu ya çöpe gidiyor ya da köşede unutuluyor. Oysa geri dönüşüm sayesinde hem doğayı koruyabilir, hem de milli ekonomiye katkı sağlayabiliriz.

## 1. ${t.blog.protectNatureTitle}

${t.blog.protectNatureDesc}

* **${t.blog.plasticBottle}**
* **${t.blog.aluminumCan}**
* **${t.blog.glassBottle}**

Geri dönüşüm, bu materyallerin yeniden kullanılmasını sağlayarak doğanın yükünü hafifletir.

## 2. ${t.blog.economyTitle}

${t.blog.economyDesc}

* ${t.blog.rawMaterial}
* ${t.blog.energyConsumption}
* ${t.blog.economicContribution}

## 3. Çevre Dostu Yaşam Tarzı

Geri dönüşüm sadece doğayı korumak değil, aynı zamanda yaşam tarzımızı da dönüştürmektir. Paylaşım kültürü, ihtiyaç fazlasını değerlendirme ve sıfır atık bilinci hayatımıza değer katar.

## 4. ${t.blog.easiestWayTitle}

${t.blog.easiestWayDesc}

* ${t.blog.phoneExample}
* ${t.blog.furnitureExample}
* ${t.blog.electronicExample}

İşte bu kadar basit!

---

### Sonuç

Geri dönüşüm; doğayı korumanın, israfı önlemenin ve geleceğe daha temiz bir dünya bırakmanın en etkili yollarından biridir. Sen de bugün bir adım atarak kullanmadığın eşyaları takas etmeyi deneyebilirsin. 🌱`,
      publishedAt: "2024-01-15",
      readTime: "5 dakika",
      tags: ["Geri Dönüşüm", "Çevre", "Sürdürülebilirlik", "Takas"],
      seoKeywords: [
        "geri dönüşüm", "çevre dostu yaşam", "sürdürülebilirlik", "takas", 
        "atık yönetimi", "yeşil yaşam", "doğa koruma", "ekonomik fayda",
        "sıfır atık", "plastik geri dönüşüm", "metal geri dönüşüm", "elektronik atık",
        "doğa koruma", "çevre bilinci", "sürdürülebilir yaşam", "yeşil teknoloji"
      ],
      author: "Takas Çemberi Editörü"
    },
    {
      id: "2",
      title: t.blog.nationalCapitalTitle,
      slug: "milli-sermaye-nedir",
      excerpt: t.blog.nationalCapitalExcerpt,
      content: `# ${t.blog.nationalCapitalTitle} 💰🇹🇷

Milli sermaye, bir ülkenin sahip olduğu **maddi ve manevi tüm kaynakların toplamı**dır. Kısaca; ülkenin üretim gücü, doğal zenginlikleri, insan kaynağı, bilgi birikimi ve ekonomik değerleri milli sermayeyi oluşturur.

## Milli Sermaye Nasıl Oluşur?

Milli sermaye tek bir kaynaktan değil, pek çok farklı faktörün birleşiminden ortaya çıkar:

* **Doğal Kaynaklar:** Madenler, tarım alanları, su kaynakları.
* **Üretim ve Sanayi:** Fabrikalar, işletmeler, teknolojik yatırımlar.
* **İnsan Kaynağı:** Eğitimli ve üretken iş gücü.
* **Tasarruf ve Yatırımlar:** Bireylerin ve devletin birikimleri.
* **Bilgi ve Teknoloji:** Yenilikçi fikirler, yazılım, AR-GE çalışmaları.

Kısacası, hem devletin hem de halkın elindeki tüm değerler milli sermayeyi besler.

## Milli Sermaye Nasıl Tükenir?

Bir ülkenin sermayesini kaybetmesi, geleceğini de riske atar. Milli sermayenin tükenmesine yol açan başlıca nedenler:

* **İsraf:** Kullanılabilir ürünlerin çöpe gitmesi.
* **İthalata Aşırı Bağımlılık:** Yerli üretim yerine sürekli dışarıdan almak.
* **Doğal Kaynakların Tahribatı:** Ormanların yok edilmesi, su kaynaklarının kirlenmesi.
* **Beyin Göçü:** Eğitimli insanların başka ülkelere gitmesi.
* **Borçlanma ve Dışa Bağımlılık:** Ekonominin dış kaynaklara teslim olması.

## Neden Korumalıyız?

Milli sermaye, bir ülkenin bağımsızlığının teminatıdır. Ne kadar güçlü bir sermayemiz olursa, o kadar az dışa bağımlı oluruz. Geri dönüşüm, yerli üretimi desteklemek, tasarruf yapmak ve bilgiyi korumak milli sermayemizi güçlendirir.

## Takas ve Milli Sermaye

Kullanmadığımız eşyaları takas etmek, aslında milli sermayeyi koruma yollarından biridir:

* **İsrafı engelleriz:** Çöpe giden eşyalar yerine ihtiyaç sahipleriyle buluşturuz.
* **Yerli değeri koruruz:** İthalat yerine mevcut kaynaklarımızı değerlendiririz.
* **Ekonomik döngüyü güçlendiririz:** Para harcamak yerine değiş-tokuş yaparız.

---

### Sonuç

Milli sermaye sadece para değildir; doğamız, insanımız, kültürümüz ve üretim gücümüzdür. Eğer israf etmez, bilinçli tüketir ve paylaşım kültürünü geliştirirsek milli sermayemizi koruyabiliriz. 🌱`,
      publishedAt: "2024-01-20",
      readTime: "7 dakika",
      tags: ["Ekonomi", "Milli Sermaye", "Tasarruf", "İsraf"],
      seoKeywords: [
        "milli sermaye", "ekonomi", "yerli üretim", "tasarruf", "israf", 
        "doğal kaynaklar", "insan kaynağı", "ekonomik kalkınma", "bağımsızlık",
        "ithalat", "ihracat", "beyin göçü", "ar-ge", "teknoloji", "yatırım",
        "ekonomik bağımsızlık", "milli ekonomi", "kaynak yönetimi", "sürdürülebilir ekonomi"
      ],
      author: "Takas Çemberi Editörü"
    }
  ];
}

// Markdown-style content'i HTML'e çeviren basit parser
function parseMarkdownContent(content: string) {
  return content
    .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-2">$1</h1>')
    .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-semibold text-gray-800 mb-4 mt-8 flex items-center gap-2"><span class="w-2 h-2 bg-green-500 rounded-full"></span>$1</h2>')
    .replace(/^### (.*$)/gm, '<h3 class="text-xl font-semibold text-gray-700 mb-3 mt-6">$1</h3>')
    .replace(/^\* \*\*(.*?):\*\* (.*$)/gm, '<li class="flex items-start gap-3 mb-2"><CheckCircle class="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" /><span><strong class="text-gray-900">$1:</strong> <span class="text-gray-700">$2</span></span></li>')
    .replace(/^\* (.*$)/gm, '<li class="flex items-start gap-3 mb-2"><div class="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div><span class="text-gray-700">$1</span></li>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
    .replace(/^---$/gm, '<hr class="my-8 border-gray-200" />')
    .replace(/\n\n/g, '</p><p class="text-gray-700 leading-relaxed mb-4">')
    .replace(/^(?!<[h|l|hr])(.*$)/gm, '<p class="text-gray-700 leading-relaxed mb-4">$1</p>')
    .replace(/<p class="text-gray-700 leading-relaxed mb-4"><\/p>/g, '');
}

export default function BlogDetail() {
  const params = useParams();
  const { language, t } = useLanguage();
  const slug = params.slug;
  const blogPosts = getBlogPosts(t);
  
  const post = blogPosts.find(p => p.slug === slug);
  
  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{t.blog.notFound}</h1>
        <Link href="/blog">
          <Button>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Blog'a Dön
          </Button>
        </Link>
      </div>
    );
  }

  const shareUrl = `${window.location.origin}/blog/${post.slug}`;
  
  return (
    <>
      <Helmet>
        <title>{post.title} | Takas Çemberi Blog</title>
        <meta name="description" content={post.excerpt} />
        <meta name="keywords" content={post.seoKeywords.join(", ")} />
        <meta name="author" content={post.author} />
        
        {/* Open Graph Tags */}
        <meta property="og:title" content={`${post.title} | Takas Çemberi`} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={shareUrl} />
        <meta property="og:image" content={`${window.location.origin}/og-blog-recycling.jpg`} />
        <meta property="article:published_time" content={post.publishedAt} />
        <meta property="article:author" content={post.author} />
        <meta property="article:tag" content={post.tags.join(", ")} />
        
        {/* Twitter Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${post.title} | Takas Çemberi`} />
        <meta name="twitter:description" content={post.excerpt} />
        
        {/* Schema.org JSON-LD */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": post.title,
            "description": post.excerpt,
            "datePublished": post.publishedAt,
            "author": {
              "@type": "Organization",
              "name": post.author
            },
            "publisher": {
              "@type": "Organization",
              "name": "Takas Çemberi",
              "url": window.location.origin
            },
            "url": shareUrl,
            "keywords": post.seoKeywords.join(", "),
            "articleSection": "Geri Dönüşüm ve Sürdürülebilirlik",
            "wordCount": post.content.length,
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": shareUrl
            }
          })}
        </script>
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <div className="mb-8">
          <Link href="/blog">
            <Button variant="ghost" className="text-green-600 hover:text-green-700 hover:bg-green-50">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t.blog.backToBlog}
            </Button>
          </Link>
        </div>

        {/* Article Header */}
        <header className="mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag) => (
              <Badge 
                key={tag} 
                variant="secondary" 
                className="bg-green-50 text-green-700"
              >
                {tag}
              </Badge>
            ))}
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
            {post.title}
          </h1>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(post.publishedAt).toLocaleDateString('tr-TR')}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {post.readTime}
              </div>
            </div>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigator.share ? navigator.share({
                title: post.title,
                text: post.excerpt,
                url: shareUrl
              }) : navigator.clipboard.writeText(shareUrl)}
              className="border-green-300 text-green-700 hover:bg-green-50"
            >
              <Share2 className="h-4 w-4 mr-2" />
              {t.blog.share}
            </Button>
          </div>
        </header>

        {/* Article Content */}
        <Card className="mb-8">
          <CardContent className="prose prose-lg max-w-none p-8">
            <div 
              className="blog-content"
              dangerouslySetInnerHTML={{ 
                __html: parseMarkdownContent(post.content)
              }} 
            />
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8 text-center">
          <div className="flex justify-center items-center gap-2 mb-4">
            <Recycle className="h-8 w-8 text-green-600" />
            <Heart className="h-6 w-6 text-red-500" />
            <Globe className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t.blog.startTradingNow}
          </h2>
          <p className="text-gray-600 mb-6">
            {t.blog.startTradingDesc}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/add-item">
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                <Leaf className="h-4 w-4 mr-2" />
                {t.blog.addItem}
              </Button>
            </Link>
            <Link href="/items">
              <Button variant="outline" className="border-green-300 text-green-700 hover:bg-green-50">
                <Recycle className="h-4 w-4 mr-2" />
                {t.blog.browseItems}
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
    </>
  );
}