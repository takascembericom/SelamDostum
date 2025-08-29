import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, ArrowRight, Leaf, Recycle, Globe, Heart } from "lucide-react";
import { Helmet } from "react-helmet-async";

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
}

// Blog yazıları veritabanı
const blogPosts: BlogPost[] = [
  {
    id: "1",
    title: "Geri Dönüşüm Neden Bu Kadar Önemli?",
    slug: "geri-donusum-neden-onemli",
    excerpt: "Doğayı korumanın en etkili yollarından biri olan geri dönüşümün önemini keşfedin. Takas yaparak hem çevreyi koruyun hem de ekonomiye katkı sağlayın.",
    content: "", // Bu blog detay sayfasında doldurulacak
    publishedAt: "2024-01-15",
    readTime: "5 dakika",
    tags: ["Geri Dönüşüm", "Çevre", "Sürdürülebilirlik", "Takas"],
    seoKeywords: [
      "geri dönüşüm", "çevre dostu yaşam", "sürdürülebilirlik", "takas", 
      "atık yönetimi", "yeşil yaşam", "doğa koruma", "ekonomik fayda",
      "sıfır atık", "plastik geri dönüşüm", "metal geri dönüşüm", "elektronik atık"
    ]
  }
];

export default function Blog() {
  const { language, t } = useLanguage();

  return (
    <>
      <Helmet>
        <title>Blog - Takas Çemberi | Geri Dönüşüm ve Sürdürülebilir Yaşam Rehberi</title>
        <meta 
          name="description" 
          content="Geri dönüşüm, çevre dostu yaşam ve sürdürülebilirlik hakkında değerli bilgiler. Takas yaparak doğayı koruma, atık azaltma ve ekonomik fayda sağlama rehberleri."
        />
        <meta 
          name="keywords" 
          content="geri dönüşüm blog, çevre dostu yaşam, sürdürülebilirlik, takas rehberi, yeşil yaşam, atık yönetimi, doğa koruma, sıfır atık, plastik geri dönüşüm, metal geri dönüşüm, elektronik atık, ekonomik fayda, çevre bilinci"
        />
        
        {/* Open Graph Tags */}
        <meta property="og:title" content="Blog - Takas Çemberi | Geri Dönüşüm Rehberi" />
        <meta property="og:description" content="Geri dönüşüm ve sürdürülebilir yaşam hakkında değerli bilgiler. Takas yaparak doğayı koruma rehberleri." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${window.location.origin}/blog`} />
        <meta property="og:image" content={`${window.location.origin}/og-blog-image.jpg`} />
        
        {/* Twitter Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Blog - Takas Çemberi | Geri Dönüşüm Rehberi" />
        <meta name="twitter:description" content="Geri dönüşüm ve sürdürülebilir yaşam hakkında değerli bilgiler." />
        
        {/* Schema.org JSON-LD */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            "name": "Takas Çemberi Blog",
            "description": "Geri dönüşüm, çevre dostu yaşam ve sürdürülebilirlik hakkında blog yazıları",
            "url": `${window.location.origin}/blog`,
            "publisher": {
              "@type": "Organization",
              "name": "Takas Çemberi",
              "url": window.location.origin
            },
            "blogPost": blogPosts.map(post => ({
              "@type": "BlogPosting",
              "headline": post.title,
              "datePublished": post.publishedAt,
              "url": `${window.location.origin}/blog/${post.slug}`,
              "keywords": post.seoKeywords.join(", ")
            }))
          })}
        </script>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center gap-2 mb-4">
            <Leaf className="h-8 w-8 text-green-500" />
            <h1 className="text-4xl font-bold text-gray-900">
              {t.blog.blogTitle}
            </h1>
            <Recycle className="h-8 w-8 text-blue-500" />
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t.blog.blogSubtitle}
          </p>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {blogPosts.map((post) => (
            <Card key={post.id} className="hover:shadow-lg transition-shadow duration-300 group">
              <CardHeader>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                  <Calendar className="h-4 w-4" />
                  {new Date(post.publishedAt).toLocaleDateString('tr-TR')}
                  <span>•</span>
                  <span>{post.readTime}</span>
                </div>
                <CardTitle className="group-hover:text-green-600 transition-colors">
                  {post.title}
                </CardTitle>
                <CardDescription className="text-gray-600">
                  {post.excerpt}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map((tag) => (
                    <Badge 
                      key={tag} 
                      variant="secondary" 
                      className="bg-green-50 text-green-700 hover:bg-green-100"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
                <Link href={`/blog/${post.slug}`}>
                  <Button 
                    variant="outline" 
                    className="w-full group-hover:bg-green-50 group-hover:border-green-300 group-hover:text-green-700"
                  >
                    {t.blog.readMore}
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-2xl p-8 text-center">
          <Globe className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t.blog.environmentContribution}
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            {t.blog.environmentContributionDesc}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/add-item">
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                <Heart className="h-4 w-4 mr-2" />
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