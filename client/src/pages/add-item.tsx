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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, X, Camera } from "lucide-react";
import { ITEM_CATEGORIES, CATEGORY_LABELS, CONDITION_LABELS, TASINMAZLAR_SUBCATEGORIES, TURKISH_CITIES, CAR_BRANDS } from "@shared/schema";
import { containsInappropriateContent, getContentFilterErrorMessage } from "@/lib/content-filter";
import { useLanguage } from "@/contexts/LanguageContext";

const addItemSchema = z.object({
  title: z.string().min(3,"En az 3 karakter").max(100,"En fazla 100 karakter").refine(v=>!containsInappropriateContent(v),{message:getContentFilterErrorMessage()}),
  description: z.string().min(10,"En az 10 karakter").max(1000,"En fazla 1000 karakter").refine(v=>!containsInappropriateContent(v),{message:getContentFilterErrorMessage()}),
  category: z.enum(ITEM_CATEGORIES,{required_error:"Kategori seçin"}),
  subcategory: z.string().optional(),
  carBrand: z.string().optional(),
  carModel: z.string().optional(),
  carKm: z.string().optional(),
  condition: z.enum(['yeni','cok_iyi','iyi','orta','kullanilmis'],{required_error:"Durum seçin"}),
  city: z.string().min(1,"İl seçin"),
  district: z.string().min(1,"İlçe seçin"),
  neighborhood: z.string().min(1,"Mahalle seçin"),
});
type AddItemFormData = z.infer<typeof addItemSchema>;

export default function AddItem(){
  const { user, profile, loading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const [selectedImages,setSelectedImages]=useState<File[]>([]);
  const [imageURLs,setImageURLs]=useState<string[]>([]);
  const [uploading,setUploading]=useState(false);
  const [selectedCategory,setSelectedCategory]=useState<string>("");
  const [userListingCount,setUserListingCount]=useState<number>(0);
  const [loadingListingCount,setLoadingListingCount]=useState(true);

  useEffect(()=>()=>{ imageURLs.forEach(u=>{ try{URL.revokeObjectURL(u)}catch{}})},[imageURLs]);

  useEffect(()=>{
    const run=async()=>{
      if(!user) return;
      try{
        setLoadingListingCount(true);
        const q=query(collection(db,'items'),where('ownerId','==',user.uid));
        const snap=await getDocs(q);
        setUserListingCount(snap.size);
      }finally{ setLoadingListingCount(false); }
    };
    run();
  },[user]);

  const form=useForm<AddItemFormData>({
    resolver:zodResolver(addItemSchema),
    defaultValues:{ title:"",description:"",category:undefined,subcategory:"",carBrand:"",carModel:"",carKm:"",condition:undefined,city:"",district:"",neighborhood:"" },
  });

  const handleImageUpload=(e:React.ChangeEvent<HTMLInputElement>)=>{
    const files=Array.from(e.target.files||[]);
    if(files.length===0) return;
    e.target.value='';
    if(files.length+selectedImages.length>5){ toast({title:"Çok fazla fotoğraf",description:"En fazla 5 fotoğraf ekleyebilirsiniz.",variant:"destructive"}); return; }
    const big=files.filter(f=>f.size>10*1024*1024);
    if(big.length){ toast({title:"Dosya boyutu çok büyük",description:"Her fotoğraf en fazla 10MB olabilir.",variant:"destructive"}); return; }
    const allowed=['image/jpeg','image/jpg','image/png','image/webp'];
    const bad=files.filter(f=>!allowed.includes(f.type));
    if(bad.length){ toast({title:"Desteklenmeyen dosya türü",description:"Sadece JPG, PNG ve WebP formatları desteklenir.",variant:"destructive"}); return; }
    setSelectedImages(p=>[...p,...files]);
    files.forEach(f=>{ try{ const u=URL.createObjectURL(f); setImageURLs(p=>[...p,u]); }catch{ toast({title:"Fotoğraf önizleme hatası",description:"Bazı fotoğraflar önizlenemedi.",variant:"destructive"});} });
  };

  const removeImage=(i:number)=>{
    setSelectedImages(p=>p.filter((_,x)=>x!==i));
    setImageURLs(p=>{ try{ if(p[i]) URL.revokeObjectURL(p[i]); }catch{} return p.filter((_,x)=>x!==i); });
  };

  // 🔁 SADECE Firebase Storage — /api/objects/upload YOK
  const uploadImages=async():Promise<string[]>=>{
    if(selectedImages.length===0) throw new Error("En az 1 fotoğraf ekleyin");
    toast({title:`${selectedImages.length} resim yükleniyor...`,description:"Lütfen bekleyin."});
    const urls:string[]=[];
    const batchSize=3;
    for(let i=0;i<selectedImages.length;i+=batchSize){
      const batch=selectedImages.slice(i,i+batchSize);
      const res=await Promise.all(batch.map(async(file)=>{
        const path=`items/${Date.now()}-${file.name}`;
        const r=ref(storage,path);
        await uploadBytes(r,file);
        return await getDownloadURL(r);
      }));
      urls.push(...res);
    }
    return urls;
  };

  const handleSubmit=async()=>{
    if(userListingCount>=5){
      toast({title:"6. İlan İçin Ödeme Gerekli",description:"İlk 5 ilan ücretsiz! 6. ve sonrası 10 TL.",variant:"destructive"});
      return;
    }
    return await submitItem();
  };

  const submitItem=async()=>{
    if(!user||!profile) return;
    setUploading(true);
    try{
      toast({title:"Resimler yükleniyor...",description:"Firebase'e yükleniyor."});
      const imageUrls=await uploadImages();
      toast({title:"İlan kaydediliyor...",description:"Veritabanına yazılıyor."});

      const expireDate=new Date(); expireDate.setDate(expireDate.getDate()+30);
      const itemNumber=Date.now()+Math.floor(Math.random()*1000)+500000;
      const now=new Date();

      const itemData={ ...form.getValues(),
        itemNumber,
        location:`${form.getValues().city}, ${form.getValues().district}, ${form.getValues().neighborhood}`,
        images:imageUrls, ownerId:user.uid, ownerName:`${profile.firstName} ${profile.lastName}`, ownerAvatar:profile.avatar||"",
        status:'pending', expireAt:expireDate, createdAt:now, updatedAt:now };

      let ok=false, tries=0;
      while(!ok && tries<3){
        try{ await addDoc(collection(db,'items'),itemData); ok=true; }
        catch(e:any){ tries++; if(tries>=3) throw new Error(`Veritabanı hatası: ${e.code||e.message}`); await new Promise(r=>setTimeout(r,1000*tries)); }
      }

      if(profile.totalListings!==undefined){
        const userRef=doc(db,'users',user.uid);
        updateDoc(userRef,{ totalListings:(profile.totalListings||0)+1 }).catch(()=>{});
      }

      const vq=query(collection(db,'items'),where('itemNumber','==',itemNumber),where('ownerId','==',user.uid));
      const vs=await getDocs(vq);
      if(vs.empty) throw new Error("İlan kaydedilemedi - veritabanında bulunamadı");

      queryClient.invalidateQueries({queryKey:['user-items']});
      queryClient.invalidateQueries({queryKey:['admin-pending-items']});
      toast({title:"✅ İlanınız onay sürecindedir",description:"Onaydan sonra yayınlanacaktır."});
      setLocation('/profile');
    }catch(e:any){
      toast({title:"❌ Hata",description:e.message||"İlan eklenirken hata oluştu.",variant:"destructive"});
    }finally{ setUploading(false); }
  };

  const onSubmit=async (_data:AddItemFormData)=>{ await handleSubmit(); };

  if(loading){
    return(<div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center" data-testid="loading-add-item">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Sayfa yükleniyor...</p>
      </div>
    </div>);
  }
  if(!user) return <Redirect to="/" />;

  return(
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
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">{t.addItem.photos} {t.addItem.required}</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {imageURLs.map((url,idx)=>(
                      <div key={idx} className="relative aspect-square" data-testid={`image-preview-${idx}`}>
                        <img src={url} alt={`Preview ${idx+1}`} className="w-full h-full object-cover rounded-lg border"/>
                        <button type="button" onClick={()=>removeImage(idx)} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600" data-testid={`button-remove-image-${idx}`}>
                          <X className="h-3 w-3"/>
                        </button>
                      </div>
                    ))}
                    {imageURLs.length<5&&(
                      <div className="aspect-square">
                        <label className="w-full h-full border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                          <Camera className="h-8 w-8 text-gray-400 mb-2"/><span className="text-sm text-gray-500">{t.addItem.addPhoto}</span>
                          <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" multiple onChange={handleImageUpload} className="hidden" data-testid="input-image-upload"/>
                        </label>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{t.addItem.photoHint}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="category" render={({field})=>(
                    <FormItem>
                      <FormLabel>{t.addItem.category} {t.addItem.required}</FormLabel>
                      <div className="block sm:hidden">
                        <FormControl>
                          <select {...field} onChange={(e)=>{field.onChange(e.target.value); setSelectedCategory(e.target.value);}}
                            className="flex h-12 w-full rounded-md border px-3 py-2" data-testid="select-category-mobile">
                            <option value="">Kategori seçin</option>
                            {ITEM_CATEGORIES.map(c=>(<option key={c} value={c}>{CATEGORY_LABELS[c]}</option>))}
                          </select>
                        </FormControl>
                      </div>
                      <div className="hidden sm:block">
                        <Select onValueChange={(v)=>{field.onChange(v); setSelectedCategory(v);}} defaultValue={field.value}>
                          <FormControl><SelectTrigger data-testid="select-category-desktop" className="h-10 text-sm"><SelectValue placeholder={t.addItem.selectCategory}/></SelectTrigger></FormControl>
                          <SelectContent>{ITEM_CATEGORIES.map(c=>(<SelectItem key={c} value={c}>{CATEGORY_LABELS[c]}</SelectItem>))}</SelectContent>
                        </Select>
                      </div>
                      <FormMessage/>
                    </FormItem>
                  )}/>
                  {selectedCategory==='tasinmazlar'&&(
                    <FormField control={form.control} name="subcategory" render={({field})=>(
                      <FormItem>
                        <FormLabel>{t.addItem.subcategory} {t.addItem.required}</FormLabel>
                        <div className="block sm:hidden">
                          <FormControl>
                            <select {...field} className="flex h-12 w-full rounded-md border px-3 py-2" data-testid="select-subcategory-mobile">
                              <option value="">Alt Kategori seçin</option>
                              {Object.entries(TASINMAZLAR_SUBCATEGORIES).map(([k,l])=>(<option key={k} value={k}>{l}</option>))}
                            </select>
                          </FormControl>
                        </div>
                        <div className="hidden sm:block">
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger data-testid="select-subcategory-desktop"><SelectValue placeholder={t.addItem.selectSubcategory}/></SelectTrigger></FormControl>
                            <SelectContent>{Object.entries(TASINMAZLAR_SUBCATEGORIES).map(([k,l])=>(<SelectItem key={k} value={k}>{l}</SelectItem>))}</SelectContent>
                          </Select>
                        </div>
                        <FormMessage/>
                      </FormItem>
                    )}/>
                  )}
                </div>

                {selectedCategory==='araba'&&(
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField control={form.control} name="carBrand" render={({field})=>(
                      <FormItem>
                        <FormLabel>{t.addItem.carBrand} {t.addItem.required}</FormLabel>
                        <div className="block sm:hidden">
                          <FormControl>
                            <select {...field} className="flex h-12 w-full rounded-md border px-3 py-2" data-testid="select-car-brand-mobile">
                              <option value="">Marka seçin</option>{CAR_BRANDS.map(b=>(<option key={b} value={b}>{b}</option>))}
                            </select>
                          </FormControl>
                        </div>
                        <div className="hidden sm:block">
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger data-testid="select-car-brand-desktop"><SelectValue placeholder={t.addItem.selectCarBrand}/></SelectTrigger></FormControl>
                            <SelectContent>{CAR_BRANDS.map(b=>(<SelectItem key={b} value={b}>{b}</SelectItem>))}</SelectContent>
                          </Select>
                        </div>
                        <FormMessage/>
                      </FormItem>
                    )}/>
                    <FormField control={form.control} name="carModel" render={({field})=>(
                      <FormItem><FormLabel>{t.addItem.carModel} {t.addItem.required}</FormLabel>
                        <FormControl><Input placeholder={t.addItem.enterCarModel} {...field} data-testid="input-car-model"/></FormControl>
                        <FormMessage/></FormItem>
                    )}/>
                    <FormField control={form.control} name="carKm" render={({field})=>(
                      <FormItem><FormLabel>{t.addItem.carKm} {t.addItem.required}</FormLabel>
                        <FormControl><Input placeholder={t.addItem.enterCarKm} type="number" {...field} data-testid="input-car-km"/></FormControl>
                        <FormMessage/></FormItem>
                    )}/>
                  </div>
                )}

                <FormField control={form.control} name="condition" render={({field})=>(
                  <FormItem>
                    <FormLabel>{t.addItem.condition} {t.addItem.required}</FormLabel>
                    <div className="block sm:hidden">
                      <FormControl>
                        <select {...field} className="flex h-12 w-full rounded-md border px-3 py-2" data-testid="select-condition-mobile">
                          <option value="">Durum seçin</option>
                          {Object.entries(CONDITION_LABELS).map(([k,l])=>(<option key={k} value={k}>{l}</option>))}
                        </select>
                      </FormControl>
                    </div>
                    <div className="hidden sm:block">
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger data-testid="select-condition-desktop"><SelectValue placeholder={t.addItem.selectCondition}/></SelectTrigger></FormControl>
                        <SelectContent>{Object.entries(CONDITION_LABELS).map(([k,l])=>(<SelectItem key={k} value={k}>{l}</SelectItem>))}</SelectContent>
                      </Select>
                    </div>
                    <FormMessage/>
                  </FormItem>
                )}/>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField control={form.control} name="city" render={({field})=>(
                    <FormItem>
                      <FormLabel>{t.addItem.city} {t.addItem.required}</FormLabel>
                      <div className="block sm:hidden">
                        <FormControl>
                          <select {...field} className="flex h-12 w-full rounded-md border px-3 py-2" data-testid="select-city-mobile">
                            <option value="">İl seçin</option>{TURKISH_CITIES.map(c=>(<option key={c} value={c}>{c}</option>))}
                          </select>
                        </FormControl>
                      </div>
                      <div className="hidden sm:block">
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger data-testid="select-city-desktop"><SelectValue placeholder={t.addItem.selectCity}/></SelectTrigger></FormControl>
                          <SelectContent>{TURKISH_CITIES.map(c=>(<SelectItem key={c} value={c}>{c}</SelectItem>))}</SelectContent>
                        </Select>
                      </div>
                      <FormMessage/>
                    </FormItem>
                  )}/>
                  <FormField control={form.control} name="district" render={({field})=>(
                    <FormItem><FormLabel>{t.addItem.district} {t.addItem.required}</FormLabel>
                      <FormControl><Input placeholder={t.addItem.enterDistrict} {...field} data-testid="input-district"/></FormControl>
                      <FormMessage/></FormItem>
                  )}/>
                  <FormField control={form.control} name="neighborhood" render={({field})=>(
                    <FormItem><FormLabel>{t.addItem.neighborhood} {t.addItem.required}</FormLabel>
                      <FormControl><Input placeholder={t.addItem.enterNeighborhood} {...field} data-testid="input-neighborhood"/></FormControl>
                      <FormMessage/></FormItem>
                  )}/>
                </div>

                <FormField control={form.control} name="title" render={({field})=>(
                  <FormItem><FormLabel>{t.addItem.title_field} {t.addItem.required}</FormLabel>
                    <FormControl><Input placeholder={t.addItem.enterTitle} {...field} data-testid="input-title"/></FormControl>
                    <FormMessage/></FormItem>
                )}/>
                <FormField control={form.control} name="description" render={({field})=>(
                  <FormItem><FormLabel>{t.addItem.description} {t.addItem.required}</FormLabel>
                    <FormControl><Textarea placeholder={t.addItem.enterDescription} rows={4} {...field} data-testid="textarea-description"/></FormControl>
                    <FormMessage/></FormItem>
                )}/>

                <div className="flex gap-4">
                  <Button type="submit" className="flex-1" disabled={uploading||loadingListingCount} data-testid="button-submit-add-item">
                    {uploading ? (<><Upload className="h-4 w-4 mr-2 animate-spin"/>{t.common.loading}...</>) : t.addItem.submitButton}
                  </Button>
                  <Button type="button" variant="outline" onClick={()=>setLocation('/profile')} data-testid="button-cancel">{t.addItem.cancel}</Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
