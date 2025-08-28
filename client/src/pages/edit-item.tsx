import { useEffect } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { EditItem, editItemSchema, Item, CATEGORY_LABELS, CONDITION_LABELS } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ArrowLeft, Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function EditItemPage() {
  const { id: itemId } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  // Fetch item data
  const { data: item, isLoading: itemLoading } = useQuery({
    queryKey: ["item", itemId],
    queryFn: async (): Promise<Item | null> => {
      if (!itemId) return null;
      
      const itemDoc = await getDoc(doc(db, "items", itemId));
      if (!itemDoc.exists()) return null;
      
      const data = itemDoc.data();
      return {
        ...data,
        id: itemDoc.id,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
        approvedAt: data.approvedAt?.toDate(),
        originalPublishDate: data.originalPublishDate?.toDate(),
        expiresAt: data.expiresAt?.toDate(),
      } as Item;
    },
    enabled: !!itemId,
  });

  const form = useForm<EditItem>({
    resolver: zodResolver(editItemSchema),
    defaultValues: item ? {
      itemNumber: item.itemNumber,
      title: item.title,
      description: item.description,
      category: item.category,
      condition: item.condition,
      images: item.images,
      ownerId: item.ownerId,
      location: item.location,
      adminNotes: item.adminNotes,
    } : undefined,
  });

  // Reset form when item data loads
  useEffect(() => {
    if (item) {
      form.reset({
        itemNumber: item.itemNumber,
        title: item.title,
        description: item.description,
        category: item.category,
        condition: item.condition,
        images: item.images,
        ownerId: item.ownerId,
        location: item.location,
        adminNotes: item.adminNotes,
      });
    }
  }, [item, form]);

  const editMutation = useMutation({
    mutationFn: async (data: EditItem) => {
      if (!itemId || !item) throw new Error("Item not found");
      
      const itemRef = doc(db, "items", itemId);
      await updateDoc(itemRef, {
        ...data,
        status: "pending", // Düzenlemeden sonra admin onayı gerekiyor
        updatedAt: new Date(),
        // originalPublishDate ve expiresAt korunuyor
        approvedAt: null, // Yeni onay gerekiyor
        approvedBy: null,
      });
      
      return itemId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["item"] });
      queryClient.invalidateQueries({ queryKey: ["user-items"] });
      queryClient.invalidateQueries({ queryKey: ["items"] });
      
      toast({
        title: "İlan Güncellendi",
        description: "İlanınız başarıyla güncellendi. Admin onayından sonra yayınlanacaktır.",
      });
      
      setLocation(`/item/${itemId}`);
    },
    onError: (error) => {
      console.error("Edit error:", error);
      toast({
        title: "Hata",
        description: "İlan güncellenirken hata oluştu. Lütfen tekrar deneyin.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EditItem) => {
    editMutation.mutate(data);
  };

  if (itemLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">İlan Bulunamadı</h1>
          <p className="text-gray-600 mb-6">Düzenlemek istediğiniz ilan mevcut değil.</p>
          <Link href="/profile">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Profile Dön
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Check if user owns the item
  if (!profile || item.ownerId !== profile.id) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Yetkisiz Erişim</h1>
          <p className="text-gray-600 mb-6">Bu ilanı düzenleme yetkiniz yok.</p>
          <Link href="/profile">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Profile Dön
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href={`/item/${itemId}`}>
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            İlan Detayına Dön
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">İlan Düzenle</h1>
        <p className="text-gray-600 mt-2">
          İlanınızı düzenleyebilirsiniz. Düzenleme sonrası admin onayından sonra yayınlanacaktır.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>İlan Bilgileri</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>İlan Başlığı</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="İlanınız için açıklayıcı bir başlık" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Açıklama</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="İlanınızın detaylı açıklaması"
                            rows={4}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kategori</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Kategori seçin" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                                <SelectItem key={key} value={key}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="condition"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Durum</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Durum seçin" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.entries(CONDITION_LABELS).map(([key, label]) => (
                                <SelectItem key={key} value={key}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Konum</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Şehir" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-4">
                    <Button
                      type="submit"
                      disabled={editMutation.isPending}
                      className="flex-1"
                    >
                      {editMutation.isPending ? "Güncelleniyor..." : "İlanı Güncelle"}
                    </Button>
                    <Link href={`/item/${itemId}`}>
                      <Button type="button" variant="outline">
                        İptal
                      </Button>
                    </Link>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Current Images */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Mevcut Resimler</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {item.images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image}
                      alt={`İlan resmi ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-4">
                Resim değiştirmek için müşteri hizmetleriyle iletişime geçin.
              </p>
            </CardContent>
          </Card>

          {/* Info */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Önemli Bilgiler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-600">
              <p>• Düzenlemeden sonra ilanınız admin onayı bekleyecek</p>
              <p>• İlan tarihi değişmeyecek, süre aynı kalacak</p>
              <p>• Onay sonrası ilan tekrar yayınlanacak</p>
              {item.originalPublishDate && (
                <p>• İlk yayın: {item.originalPublishDate.toLocaleDateString('tr-TR')}</p>
              )}
              {item.expiresAt && (
                <p>• Son tarih: {item.expiresAt.toLocaleDateString('tr-TR')}</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}