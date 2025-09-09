import { useState, useEffect } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { collection, addDoc, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Redirect, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, X, Camera, CreditCard } from "lucide-react";
import { ITEM_CATEGORIES, CATEGORY_LABELS, CONDITION_LABELS, TASINMAZLAR_SUBCATEGORIES, TURKISH_CITIES, CAR_BRANDS } from "@shared/schema";
import { containsInappropriateContent, getContentFilterErrorMessage } from "@/lib/content-filter";
import { useLanguage } from "@/contexts/LanguageContext";

const addItemSchema = z.object({
  title: z.string().min(3, "En az 3 karakter").max(100, "En fazla 100 karakter")
    .refine(val => !containsInappropriateContent(val), {
      message: getContentFilterErrorMessage()
    }),
  description: z.string().min(10, "En az 10 karakter").max(1000, "En fazla 1000 karakter")
    .refine(val => !containsInappropriateContent(val), {
      message: getContentFilterErrorMessage()
    }),
  category: z.enum(ITEM_CATEGORIES, { required_error: "Kategori seçin" }),
  subcategory: z.string().optional(),
  carBrand: z.string().optional(),
  carModel: z.string().optional(),
  carKm: z.string().optional(),
  condition: z.enum(['yeni', 'cok_iyi', 'iyi', 'orta', 'kullanilmis'], { required_error: "Durum seçin" }),
  city: z.string().min(1, "İl seçin"),
  district: z.string().min(1, "İlçe seçin"),
  neighborhood: z.string().min(1, "Mahalle seçin"),
});

type AddItemFormData = z.infer<typeof addItemSchema>;

export default function AddItem() {
  const { user, profile, loading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imageURLs, setImageURLs] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [userListingCount, setUserListingCount] = useState<number>(0);
  const [loadingListingCount, setLoadingListingCount] = useState(true);

  // Cleanup function for blob URLs
  useEffect(() => {
    return () => {
      imageURLs.forEach(url => {
        try { URL.revokeObjectURL(url); } catch {}
      });
    };
  }, [imageURLs]);

  // Check user's current listing count for display purposes only
  useEffect(() => {
    const checkUserListings = async () => {
      if (!user) return;
      try {
        setLoadingListingCount(true);
        const q = query(collection(db, 'items'), where('ownerId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const count = querySnapshot.size;
        setUserListingCount(count);
      } catch (error) {
        console.error('Error checking user listings:', error);
      } finally {
        setLoadingListingCount(false);
      }
    };
    checkUserListings();
  }, [user]);

  const form = useForm<AddItemFormData>({
    resolver: zodResolver(addItemSchema),
    defaultValues: {
      title: "",
      description: "",
      category: undefined,
      subcategory: "",
      carBrand: "",
      carModel: "",
      carKm: "",
      condition: undefined,
      city: "",
      district: "",
      neighborhood: "",
    },
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    e.target.value = '';

    if (files.length + selectedImages.length > 5) {
      toast({ title: "Çok fazla fotoğraf", description: "En fazla 5 fotoğraf ekleyebilirsiniz.", variant: "destructive" });
      return;
    }

    const oversizedFiles = files.filter(file => file.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast({ title: "Dosya boyutu çok büyük", description: "Her fotoğraf en fazla 10MB olabilir.", variant: "destructive" });
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const invalidFiles = files.filter(file => !allowedTypes.includes(file.type));
    if (invalidFiles.length > 0) {
      toast({ title: "Desteklenmeyen dosya türü", description: "Sadece JPG, PNG ve WebP formatları desteklenir.", variant: "destructive" });
      return;
    }

    setSelectedImages(prev => [...prev, ...files]);

    files.forEach(file => {
      try {
        const url = URL.createObjectURL(file);
        setImageURLs(prev => [...prev, url]);
      } catch (error) {
        console.error('Error creating preview URL:', error);
        toast({ title: "Fotoğraf önizleme hatası", description: "Bazı fotoğraflar önizlenemedi, ancak yüklenecekler.", variant: "destructive" });
      }
    });
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImageURLs(prev => {
      try { if (prev[index]) URL.revokeObjectURL(prev[index]); } catch {}
      return prev.filter((_, i) => i !== index);
    });
  };

  // 🔁 Firebase Storage ile yükleme
  const uploadImages = async (): Promise<string[]> => {
    if (selectedImages.length === 0) throw new Error("En az 1 fotoğraf ekleyin");

    toast({
      title: `${selectedImages.length} resim yükleniyor...`,
      description: "Lütfen bekleyin.",
    });

    const urls: string[] = [];
    const batchSize = 3;

    for (let i = 0; i < selectedImages.length; i += batchSize) {
      const batch = selectedImages.slice(i, i + batchSize);
      const results = await Promise.all(
        batch.map(async (file) => {
          const path = `items/${Date.now()}-${file.name}`;
          const r = ref(storage, path);
          await uploadBytes(r, file);
          return await getDownloadURL(r);
        })
      );
      urls.push(...results);
    }

    return urls;
  };

  // Mobile-optimized image compression function (kept for future use)
  const compressImageMobile = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) { resolve(file); return; }
        const img = new Image();
        img.onload = () => {
          try {
            const maxSize = 800;
            let { width, height } = img;
            if (width > height) { if (width > maxSize) { height = (height * maxSize) / width; width = maxSize; } }
            else { if (height > maxSize) { width = (width * maxSize) / height; height = maxSize; } }
            canvas.width = width; canvas.height = height;
            requestAnimationFrame(() => {
              ctx.drawImage(img, 0, 0, width, height);
              canvas.toBlob((blob) => {
                try {
                  if (blob) resolve(new File([blob], file.name, { type: 'image/jpeg' }));
                  else resolve(file);
                  URL.revokeObjectURL(img.src);
                } catch { resolve(file); }
              }, 'image/jpeg', 0.7);
            });
          } catch { resolve(file); }
        };
        img.onerror = () => { resolve(file); };
        img.src = URL.createObjectURL(file);
      } catch { resolve(file); }
    });
  };

  // Full compression (kept for future use)
  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) { resolve(file); return; }
        const img = new Image();
        img.onload = () => {
          try {
            const maxSize = 1200;
            let { width, height } = img;
            if (width > height) { if (width > maxSize) { height = (height * maxSize) / width; width = maxSize; } }
            else { if (height > maxSize) { width = (width * maxSize) / height; height = maxSize; } }
            canvas.width = width; canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob((blob) => {
              try {
                if (blob) resolve(new File([blob], file.name, { type: 'image/jpeg' }));
                else resolve(file);
                URL.revokeObjectURL(img.src);
              } catch { resolve(file); }
            }, 'image/jpeg', 0.8);
          } catch { resolve(file); }
        };
        img.onerror = () => { resolve(file); };
        img.src = URL.createObjectURL(file);
      } catch { resolve(file); }
    });
  };

  const handleSubmit = async () => {
    if (userListingCount >= 5) {
      toast({
        title: "6. İlan İçin Ödeme Gerekli",
        description: "İlk 5 ilan ücretsiz! 6. ilan ve sonrasında her ilan için 10 TL ödeme gereklidir.",
        variant: "destructive",
      });
      return;
    }
    return await submitItem();
  };

  const submitItem = async () => {
    if (!user || !profile) return;

    setUploading(true);
    try {
      toast({ title: "Resimler yükleniyor...", description: "Lütfen bekleyin, resimler Firebase'e yükleniyor." });
      const imageUrls = await uploadImages();

      toast({ title: "İlan kaydediliyor...", description: "Resimler yüklendi, ilan veritabanına kaydediliyor." });

      const expireDate = new Date();
      expireDate.setDate(expireDate.getDate() + 30);

      const itemNumber = Date.now() + Math.floor(Math.random() * 1000) + 500000;

      const currentTime = new Date();
      const itemData = {
        ...form.getValues(),
        itemNumber,
        location: `${form.getValues().city}, ${form.getValues().district}, ${form.getValues().neighborhood}`,
        images: imageUrls,
        ownerId: user.uid,
        ownerName: `${profile.firstName} ${profile.lastName}`,
        ownerAvatar: profile.avatar || "",
        status: 'pending',
        expireAt: expireDate,
        createdAt: currentTime,
        updatedAt: currentTime,
      };

      console.log('About to save item to Firestore:', itemData);
      let addDocSuccess = false;
      let retryCount = 0;
      const maxRetries = 3;

      while (!addDocSuccess && retryCount < maxRetries) {
        try {
          console.log(`Save attempt ${retryCount + 1}...`);
          const docRef = await addDoc(collection(db, 'items'), itemData);
          console.log('Successfully saved item with ID:', docRef.id);
          addDocSuccess = true;
        } catch (docError: any) {
          retryCount++;
          console.error(`Add document attempt ${retryCount} failed:`, docError);
          if (retryCount >= maxRetries) throw new Error(`Veritabanı hatası: ${docError.code || docError.message}`);
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        }
      }

      if (profile.totalListings !== undefined) {
        const userRef = doc(db, 'users', user.uid);
        updateDoc(userRef, { totalListings: (profile.totalListings || 0) + 1 }).catch(console.error);
      }

      const verifyQuery = query(
        collection(db, 'items'),
        where('itemNumber', '==', itemNumber),
        where('ownerId', '==', user.uid)
      );
      const verifySnapshot = await getDocs(verifyQuery);
      if (verifySnapshot.empty) throw new Error('İlan kaydedilemedi - veritabanında bulunamadı');

      queryClient.invalidateQueries({ queryKey: ['user-items'] });
      queryClient.invalidateQueries({ queryKey: ['admin-pending-items'] });

      toast({ title: "✅ İlanınız onay sürecindedir", description: "Onaylandıktan sonra yayınlanacaktır. Admin panelinde beklemede." });
      setLocation('/profile');
    } catch (error: any) {
      console.error('Add item error:', error);
      toast({ title: "❌ Hata", description: error.message || "İlan eklenirken bir hata oluştu. Tekrar deneyin.", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (_data: AddItemFormData) => {
    await handleSubmit();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center" data-testid="loading-add-item">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Sayfa yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Redirect to="/" />;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl" data-testid="title-add-item">{t.addItem.title}</CardTitle>
            <p className="text-gray-600">{t.addItem.subtitle}</p>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Images */}
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">
                    {t.addItem.photos} {t.addItem.required}
                  </label>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {imageURLs.map((url, index) => (
                      <div key={index} className="relative aspect-square" data-testid={`image-preview-${index}`}>
                        <img src={url} alt={`Preview ${index + 1}`} className="w-full h-full object-cover rounded-lg border" />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                          data-testid={`button-remove-image-${index}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}

                    {imageURLs.length < 5 && (
                      <div className="aspect-square">
                        <label className="w-full h-full border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                          <Camera className="h-8 w-8 text-gray-400 mb-2" />
                          <span className="text-sm text-gray-500">{t.addItem.addPhoto}</span>
                          <input
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            multiple
                            onChange={handleImageUpload}
                            className="hidden"
                            data-testid="input-image-upload"
                          />
                        </label>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-gray-500">{t.addItem.photoHint}</p>
                </div>

                {/* Category & Subcategory */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.addItem.category} {t.addItem.required}</FormLabel>

                        <div className="block sm:hidden">
                          <FormControl>
                            <select
                              {...field}
                              onChange={(e) => { field.onChange(e.target.value); setSelectedCategory(e.target.value); }}
                              className="flex h-12 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              data-testid="select-category-mobile"
                            >
                              <option value="">Kategori seçin</option>
                              {ITEM_CATEGORIES.map((category) => (
                                <option key={category} value={category}>{CATEGORY_LABELS[category]}</option>
                              ))}
                            </select>
                          </FormControl>
                        </div>

                        <div className="hidden sm:block">
                          <Select onValueChange={(value) => { field.onChange(value); setSelectedCategory(value); }} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-category-desktop" className="h-10 text-sm">
                                <SelectValue placeholder={t.addItem.selectCategory} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {ITEM_CATEGORIES.map((category) => (
                                <SelectItem key={category} value={category}>{CATEGORY_LABELS[category]}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {selectedCategory === 'tasinmazlar' && (
                    <FormField
                      control={form.control}
                      name="subcategory"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t.addItem.subcategory} {t.addItem.required}</FormLabel>

                          <div className="block sm:hidden">
                            <FormControl>
                              <select
                                {...field}
                                className="flex h-12 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                data-testid="select-subcategory-mobile"
                              >
                                <option value="">Alt Kategori seçin</option>
                                {Object.entries(TASINMAZLAR_SUBCATEGORIES).map(([key, label]) => (
                                  <option key={key} value={key}>{label}</option>
                                ))}
                              </select>
                            </FormControl>
                          </div>

                          <div className="hidden sm:block">
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-subcategory-desktop">
                                  <SelectValue placeholder={t.addItem.selectSubcategory} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Object.entries(TASINMAZLAR_SUBCATEGORIES).map(([key, label]) => (
                                  <SelectItem key={key} value={key}>{label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                {/* Car Details */}
                {selectedCategory === 'araba' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="carBrand"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t.addItem.carBrand} {t.addItem.required}</FormLabel>

                          <div className="block sm:hidden">
                            <FormControl>
                              <select
                                {...field}
                                className="flex h-12 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                data-testid="select-car-brand-mobile"
                              >
                                <option value="">Marka seçin</option>
                                {CAR_BRANDS.map((brand) => (
                                  <option key={brand} value={brand}>{brand}</option>
                                ))}
                              </select>
                            </FormControl>
                          </div>

                          <div className="hidden sm:block">
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-car-brand-desktop">
                                  <SelectValue placeholder={t.addItem.selectCarBrand} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {CAR_BRANDS.map((brand) => (
                                  <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="carModel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t.addItem.carModel} {t.addItem.required}</FormLabel>
                          <FormControl>
                            <Input placeholder={t.addItem.enterCarModel} {...field} data-testid="input-car-model" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="carKm"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t.addItem.carKm} {t.addItem.required}</FormLabel>
                          <FormControl>
                            <Input placeholder={t.addItem.enterCarKm} type="number" {...field} data-testid="input-car-km" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* Condition */}
                <FormField
                  control={form.control}
                  name="condition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.addItem.condition} {t.addItem.required}</FormLabel>

                      <div className="block sm:hidden">
                        <FormControl>
                          <select
                            {...field}
                            className="flex h-12 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            data-testid="select-condition-mobile"
                          >
                            <option value="">Durum seçin</option>
                            {Object.entries(CONDITION_LABELS).map(([key, label]) => (
                              <option key={key} value={key}>{label}</option>
                            ))}
                          </select>
                        </FormControl>
                      </div>

                      <div className="hidden sm:block">
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-condition-desktop">
                              <SelectValue placeholder={t.addItem.selectCondition} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(CONDITION_LABELS).map(([key, label]) => (
                              <SelectItem key={key} value={key}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Location */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.addItem.city} {t.addItem.required}</FormLabel>

                        <div className="block sm:hidden">
                          <FormControl>
                            <select
                              {...field}
                              className="flex h-12 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              data-testid="select-city-mobile"
                            >
                              <option value="">İl seçin</option>
                              {TURKISH_CITIES.map((city) => (
                                <option key={city} value={city}>{city}</option>
                              ))}
                            </select>
                          </FormControl>
                        </div>

                        <div className="hidden sm:block">
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-city-desktop">
                                <SelectValue placeholder={t.addItem.selectCity} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {TURKISH_CITIES.map((city) => (
                                <SelectItem key={city} value={city}>{city}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="district"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.addItem.district} {t.addItem.required}</FormLabel>
                        <FormControl>
                          <Input placeholder={t.addItem.enterDistrict} {...field} data-testid="input-district" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="neighborhood"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.addItem.neighborhood} {t.addItem.required}</FormLabel>
                        <FormControl>
                          <Input placeholder={t.addItem.enterNeighborhood} {...field} data-testid="input-neighborhood" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Title */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.addItem.title_field} {t.addItem.required}</FormLabel>
                      <FormControl>
                        <Input placeholder={t.addItem.enterTitle} {...field} data-testid="input-title" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.addItem.description} {t.addItem.required}</FormLabel>
                      <FormControl>
                        <Textarea placeholder={t.addItem.enterDescription} rows={4} {...field} data-testid="textarea-description" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit */}
                <div className="flex gap-4">
                  <Button type="submit" className="flex-1" disabled={uploading || loadingListingCount} data-testid="button-submit-add-item">
                    {uploading ? (
                      <>
                        <Upload className="h-4 w-4 mr-2 animate-spin" />
                        {t.common.loading}...
                      </>
                    ) : loadingListingCount ? (
                      t.addItem.submitButton
                    ) : (
                      t.addItem.submitButton
                    )}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setLocation('/profile')} data-testid="button-cancel">
                    {t.addItem.cancel}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// --- Firebase Storage upload helper ---
async function uploadImagesToFirebase(files: File[]): Promise<string[]> {
  const urls: string[] = [];
  for (const file of files) {
    const path = `items/${Date.now()}-${file.name}`;
    const r = ref(storage, path);
    await uploadBytes(r, file);
    const url = await getDownloadURL(r);
    urls.push(url);
  }
  return urls;
}
