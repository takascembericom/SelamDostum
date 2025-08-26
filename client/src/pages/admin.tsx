import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { collection, query, where, orderBy, getDocs, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, X, Eye, MessageCircle, LogOut, Shield } from "lucide-react";
import { LiveChat } from "@/components/live-chat";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CATEGORY_LABELS, CONDITION_LABELS } from "@shared/schema";
import type { Item } from "@shared/schema";

export default function AdminPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Check admin authentication
  const isAdminLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
  
  if (!isAdminLoggedIn) {
    return <Redirect to="/admin" />;
  }

  // Fetch pending items
  const { data: pendingItems = [], isLoading: pendingLoading } = useQuery({
    queryKey: ['admin-pending-items'],
    queryFn: async (): Promise<Item[]> => {
      const q = query(
        collection(db, 'items'),
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
          approvedAt: data.approvedAt ? data.approvedAt.toDate() : undefined,
        } as Item;
      });
    },
    enabled: true,
  });

  // Fetch approved items
  const { data: approvedItems = [], isLoading: approvedLoading } = useQuery({
    queryKey: ['admin-approved-items'],
    queryFn: async (): Promise<Item[]> => {
      const q = query(
        collection(db, 'items'),
        where('status', '==', 'aktif'),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
          approvedAt: data.approvedAt ? data.approvedAt.toDate() : undefined,
        } as Item;
      });
    },
    enabled: true,
  });

  // Fetch rejected items
  const { data: rejectedItems = [], isLoading: rejectedLoading } = useQuery({
    queryKey: ['admin-rejected-items'],
    queryFn: async (): Promise<Item[]> => {
      const q = query(
        collection(db, 'items'),
        where('status', '==', 'reddedildi'),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
          approvedAt: data.approvedAt ? data.approvedAt.toDate() : undefined,
        } as Item;
      });
    },
    enabled: true,
  });

  const handleApprove = async (itemId: string, notes: string = "") => {
    try {
      setActionLoading(itemId);
      const itemRef = doc(db, 'items', itemId);
      await updateDoc(itemRef, {
        status: 'aktif',
        adminNotes: notes,
        approvedAt: serverTimestamp(),
        approvedBy: 'admin',
        updatedAt: serverTimestamp()
      });

      toast({
        title: "İlan onaylandı",
        description: "İlan başarıyla yayınlandı",
      });

      // Refresh queries
      queryClient.invalidateQueries({ queryKey: ['admin-pending-items'] });
      queryClient.invalidateQueries({ queryKey: ['admin-approved-items'] });
      setAdminNotes("");
      setSelectedItem(null);
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "İlan onaylanırken hata oluştu",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (itemId: string, notes: string = "") => {
    try {
      setActionLoading(itemId);
      const itemRef = doc(db, 'items', itemId);
      await updateDoc(itemRef, {
        status: 'reddedildi',
        adminNotes: notes,
        approvedAt: serverTimestamp(),
        approvedBy: 'admin',
        updatedAt: serverTimestamp()
      });

      toast({
        title: "İlan reddedildi",
        description: "İlan reddedildi ve yayınlanmayacak",
      });

      // Refresh queries
      queryClient.invalidateQueries({ queryKey: ['admin-pending-items'] });
      queryClient.invalidateQueries({ queryKey: ['admin-rejected-items'] });
      setAdminNotes("");
      setSelectedItem(null);
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "İlan reddedilirken hata oluştu",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Admin logout function
  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    window.location.href = '/admin';
  };

  const ItemCard = ({ item, showActions = false }: { item: Item; showActions?: boolean }) => (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg">{item.title}</CardTitle>
            <div className="flex gap-2 mt-2">
              <Badge variant="outline">
                {CATEGORY_LABELS[item.category as keyof typeof CATEGORY_LABELS]}
              </Badge>
              <Badge variant="outline">
                {CONDITION_LABELS[item.condition]}
              </Badge>
              <Badge 
                variant={item.status === 'pending' ? 'secondary' : 
                        item.status === 'aktif' ? 'default' : 'destructive'}
              >
                {item.status === 'pending' ? 'Bekliyor' : 
                 item.status === 'aktif' ? 'Onaylandı' : 'Reddedildi'}
              </Badge>
              {item.isPaid && <Badge variant="outline">Ücretli</Badge>}
            </div>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Detay
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{item.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {item.images && item.images.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {item.images.slice(0, 4).map((image, idx) => (
                      <img
                        key={idx}
                        src={image}
                        alt={`${item.title} ${idx + 1}`}
                        className="w-full h-32 object-cover rounded"
                      />
                    ))}
                  </div>
                )}
                <div>
                  <h4 className="font-medium mb-2">Açıklama</h4>
                  <p className="text-gray-600">{item.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Sahip:</span> {item.ownerName}
                  </div>
                  <div>
                    <span className="font-medium">Konum:</span> {item.location}
                  </div>
                  <div>
                    <span className="font-medium">Durum:</span> {CONDITION_LABELS[item.condition]}
                  </div>
                  <div>
                    <span className="font-medium">Kategori:</span> {CATEGORY_LABELS[item.category as keyof typeof CATEGORY_LABELS]}
                  </div>
                </div>
                {item.adminNotes && (
                  <div>
                    <h4 className="font-medium mb-2">Admin Notları</h4>
                    <p className="text-gray-600 bg-gray-50 p-3 rounded">{item.adminNotes}</p>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      {showActions && (
        <CardContent className="pt-0">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-2 block">Admin Notu (isteğe bağlı)</label>
              <Textarea
                placeholder="İlan hakkında not ekleyin..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={2}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => handleApprove(item.id, adminNotes)}
                disabled={actionLoading === item.id}
                className="flex-1"
                size="sm"
              >
                <Check className="h-4 w-4 mr-2" />
                Onayla
              </Button>
              <Button
                onClick={() => handleReject(item.id, adminNotes)}
                disabled={actionLoading === item.id}
                variant="destructive"
                className="flex-1"
                size="sm"
              >
                <X className="h-4 w-4 mr-2" />
                Reddet
              </Button>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Admin Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900">Admin Paneli</h1>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="flex items-center gap-2"
                data-testid="button-admin-logout"
              >
                <LogOut className="h-4 w-4" />
                Çıkış Yap
              </Button>
            </div>
          </div>
        </header>
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <p className="text-gray-600 mt-2">İlanları yönetin ve onaylayın</p>
          </div>

          <Tabs defaultValue="pending" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pending" className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Bekleyen İlanlar ({pendingItems.length})
              </TabsTrigger>
              <TabsTrigger value="approved" className="flex items-center gap-2">
                <Check className="h-4 w-4" />
                Onaylanan İlanlar ({approvedItems.length})
              </TabsTrigger>
              <TabsTrigger value="rejected" className="flex items-center gap-2">
                <X className="h-4 w-4" />
                Reddedilen İlanlar ({rejectedItems.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4">
              {pendingLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-gray-600">Bekleyen ilanlar yükleniyor...</p>
                </div>
              ) : pendingItems.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Bekleyen ilan bulunmuyor</p>
                </div>
              ) : (
                pendingItems.map(item => (
                  <ItemCard key={item.id} item={item} showActions={true} />
                ))
              )}
            </TabsContent>

            <TabsContent value="approved" className="space-y-4">
              {approvedLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-gray-600">Onaylanan ilanlar yükleniyor...</p>
                </div>
              ) : approvedItems.length === 0 ? (
                <div className="text-center py-8">
                  <Check className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Onaylanan ilan bulunmuyor</p>
                </div>
              ) : (
                approvedItems.map(item => (
                  <ItemCard key={item.id} item={item} />
                ))
              )}
            </TabsContent>

            <TabsContent value="rejected" className="space-y-4">
              {rejectedLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-gray-600">Reddedilen ilanlar yükleniyor...</p>
                </div>
              ) : rejectedItems.length === 0 ? (
                <div className="text-center py-8">
                  <X className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Reddedilen ilan bulunmuyor</p>
                </div>
              ) : (
                rejectedItems.map(item => (
                  <ItemCard key={item.id} item={item} />
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <LiveChat />
    </>
  );
}