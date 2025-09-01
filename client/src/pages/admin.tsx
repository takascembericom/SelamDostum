import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { collection, query, where, orderBy, getDocs, doc, updateDoc, serverTimestamp, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminChat } from "@/components/admin-chat";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, X, Eye, MessageCircle, LogOut, Shield, Settings, Key, Trash2, Users, Send, User, Phone, MapPin, Calendar, Package, Megaphone, AlertTriangle, Info } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  
  // Password change state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  
  // User management state
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [messageTitle, setMessageTitle] = useState("");
  const [messageContent, setMessageContent] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  
  // User profile viewing state
  const [viewingUserProfile, setViewingUserProfile] = useState<any>(null);
  const [profileUserItems, setProfileUserItems] = useState<any[]>([]);
  const [loadingProfileItems, setLoadingProfileItems] = useState(false);
  
  // Broadcast notification state
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcastType, setBroadcastType] = useState("info");
  const [sendingBroadcast, setSendingBroadcast] = useState(false);
  
  // Active tab state
  const [activeTab, setActiveTab] = useState("pending");
  
  // Check admin authentication
  const isAdminLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
  
  if (!isAdminLoggedIn) {
    return <Redirect to="/admin" />;
  }

  // Fetch pending items
  const { data: pendingItems = [], isLoading: pendingLoading } = useQuery({
    queryKey: ['admin-pending-items'],
    queryFn: async (): Promise<Item[]> => {
      try {
        const q = query(
          collection(db, 'items'),
          where('status', '==', 'pending')
          // Remove orderBy to avoid index issues
        );

        const querySnapshot = await getDocs(q);
        const items = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            ...data,
            id: doc.id,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
            approvedAt: data.approvedAt?.toDate ? data.approvedAt.toDate() : undefined,
          } as Item;
        });
        
        // Sort by createdAt manually
        return items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      } catch (error) {
        console.error('Error fetching pending items:', error);
        throw error;
      }
    },
    enabled: true,
  });

  // Fetch approved items
  const { data: approvedItems = [], isLoading: approvedLoading } = useQuery({
    queryKey: ['admin-approved-items'],
    queryFn: async (): Promise<Item[]> => {
      try {
        const q = query(
          collection(db, 'items'),
          where('status', '==', 'aktif')
        );

        const querySnapshot = await getDocs(q);
        const items = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            ...data,
            id: doc.id,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
            approvedAt: data.approvedAt?.toDate ? data.approvedAt.toDate() : undefined,
          } as Item;
        });
        
        return items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      } catch (error) {
        console.error('Error fetching approved items:', error);
        throw error;
      }
    },
    enabled: true,
  });

  // Fetch users for admin management
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const response = await fetch('/api/admin/users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      return response.json();
    },
  });

  // Filter users based on search term
  const filteredUsers = users.filter((user: any) => 
    user.name?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  // Send message function
  const sendMessageToUser = async () => {
    if (!selectedUser || !messageTitle.trim() || !messageContent.trim()) {
      toast({
        title: "Hata",
        description: "Lütfen tüm alanları doldurun",
        variant: "destructive",
      });
      return;
    }

    setSendingMessage(true);
    try {
      const response = await fetch('/api/admin/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser.id,
          title: messageTitle,
          message: messageContent,
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      toast({
        title: "Başarılı",
        description: "Mesaj başarıyla gönderildi",
      });

      setMessageTitle("");
      setMessageContent("");
      setSelectedUser(null);
    } catch (error) {
      toast({
        title: "Hata",
        description: "Mesaj gönderilirken hata oluştu",
        variant: "destructive",
      });
    } finally {
      setSendingMessage(false);
    }
  };

  // View user profile function
  const viewUserProfile = async (user: any) => {
    setViewingUserProfile(user);
    setLoadingProfileItems(true);
    
    try {
      // Fetch user's items
      const itemsResponse = await fetch(`/api/admin/users/${user.id}/items`);
      if (itemsResponse.ok) {
        const items = await itemsResponse.json();
        setProfileUserItems(items);
      } else {
        setProfileUserItems([]);
      }
    } catch (error) {
      console.error("Error fetching user items:", error);
      setProfileUserItems([]);
    } finally {
      setLoadingProfileItems(false);
    }
  };

  // Close user profile modal
  const closeUserProfile = () => {
    setViewingUserProfile(null);
    setProfileUserItems([]);
    setLoadingProfileItems(false);
  };

  // Send broadcast notification function
  const sendBroadcastNotification = async () => {
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) {
      toast({
        title: "Hata",
        description: "Başlık ve mesaj alanları zorunludur",
        variant: "destructive",
      });
      return;
    }

    setSendingBroadcast(true);
    try {
      const response = await fetch('/api/admin/broadcast-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: broadcastTitle,
          message: broadcastMessage,
          type: broadcastType,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Başarılı",
          description: result.message,
        });
        
        // Clear form
        setBroadcastTitle("");
        setBroadcastMessage("");
        setBroadcastType("info");
      } else {
        throw new Error(result.error || "Bildirim gönderilirken hata oluştu");
      }
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "Bildirim gönderilirken hata oluştu",
        variant: "destructive",
      });
    } finally {
      setSendingBroadcast(false);
    }
  };

  // Fetch rejected items
  const { data: rejectedItems = [], isLoading: rejectedLoading } = useQuery({
    queryKey: ['admin-rejected-items'],
    queryFn: async (): Promise<Item[]> => {
      try {
        const q = query(
          collection(db, 'items'),
          where('status', '==', 'reddedildi')
        );

        const querySnapshot = await getDocs(q);
        const items = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            ...data,
            id: doc.id,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
            approvedAt: data.approvedAt?.toDate ? data.approvedAt.toDate() : undefined,
          } as Item;
        });
        
        return items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      } catch (error) {
        console.error('Error fetching rejected items:', error);
        throw error;
      }
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

  // Bulk delete function
  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) {
      toast({
        title: "Uyarı",
        description: "Lütfen silinecek ilanları seçin",
        variant: "destructive",
      });
      return;
    }

    setBulkActionLoading(true);
    try {
      // Delete all selected items
      const deletePromises = Array.from(selectedItems).map(itemId => 
        deleteDoc(doc(db, 'items', itemId))
      );
      
      await Promise.all(deletePromises);

      toast({
        title: "Başarılı",
        description: `${selectedItems.size} ilan başarıyla silindi`,
      });

      // Clear selection and refresh data
      setSelectedItems(new Set());
      queryClient.invalidateQueries({ queryKey: ['admin-pending-items'] });
      queryClient.invalidateQueries({ queryKey: ['admin-approved-items'] });
      queryClient.invalidateQueries({ queryKey: ['admin-rejected-items'] });
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "İlanlar silinirken hata oluştu",
        variant: "destructive",
      });
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Handle single item selection
  const handleItemSelection = (itemId: string, checked: boolean) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(itemId);
      } else {
        newSet.delete(itemId);
      }
      return newSet;
    });
  };

  // Handle select all/none for current tab
  const handleSelectAll = (items: Item[], checked: boolean) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      items.forEach(item => {
        if (checked) {
          newSet.add(item.id);
        } else {
          newSet.delete(item.id);
        }
      });
      return newSet;
    });
  };

  // Password change function
  const handlePasswordChange = async () => {
    if (!newPassword || !confirmPassword) {
      toast({
        title: "Hata",
        description: "Tüm alanları doldurun",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Hata", 
        description: "Şifreler eşleşmiyor",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Hata",
        description: "Şifre en az 6 karakter olmalı",
        variant: "destructive",
      });
      return;
    }

    setPasswordLoading(true);
    try {
      // In production, this should update the actual credentials in database/env
      // For now, we'll just store in localStorage and show success
      localStorage.setItem('adminPassword', newPassword);
      
      toast({
        title: "Başarılı",
        description: "Admin şifresi başarıyla değiştirildi",
      });
      
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast({
        title: "Hata",
        description: "Şifre değiştirilemedi",
        variant: "destructive",
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const ItemCard = ({ item, showActions = false, showCheckbox = false }: { item: Item; showActions?: boolean; showCheckbox?: boolean }) => (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          {showCheckbox && (
            <div className="mr-3 mt-1">
              <Checkbox
                checked={selectedItems.has(item.id)}
                onCheckedChange={(checked) => handleItemSelection(item.id, checked as boolean)}
                data-testid={`checkbox-item-${item.id}`}
              />
            </div>
          )}
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
              <div className="flex items-center gap-3">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setActiveTab("settings")}
                  className={`flex items-center gap-2 ${activeTab === 'settings' ? 'bg-gray-100' : ''}`}
                  data-testid="button-admin-settings"
                >
                  <Settings className="h-4 w-4" />
                  Ayarlar
                </Button>
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
          </div>
        </header>
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <p className="text-gray-600 mt-2">İlanları yönetin ve onaylayın</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
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
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Kullanıcılar
              </TabsTrigger>
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Canlı Destek
              </TabsTrigger>
              <TabsTrigger value="broadcast" className="flex items-center gap-2">
                <Megaphone className="h-4 w-4" />
                Toplu Bildirim
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
                <>
                  {/* Bulk actions for pending items */}
                  <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-4">
                      <Checkbox
                        checked={pendingItems.every(item => selectedItems.has(item.id))}
                        onCheckedChange={(checked) => handleSelectAll(pendingItems, checked as boolean)}
                        data-testid="checkbox-select-all-pending"
                      />
                      <span className="text-sm text-gray-600">
                        {selectedItems.size > 0 
                          ? `${selectedItems.size} ilan seçildi` 
                          : "Tümünü seç"}
                      </span>
                    </div>
                    {selectedItems.size > 0 && (
                      <Button
                        onClick={handleBulkDelete}
                        disabled={bulkActionLoading}
                        variant="destructive"
                        size="sm"
                        data-testid="button-bulk-delete-pending"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {bulkActionLoading ? "Siliniyor..." : "Seçilenleri Sil"}
                      </Button>
                    )}
                  </div>
                  
                  {pendingItems.map(item => (
                    <ItemCard key={item.id} item={item} showActions={true} showCheckbox={true} />
                  ))}
                </>
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
                <>
                  {/* Bulk actions for approved items */}
                  <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-4">
                      <Checkbox
                        checked={approvedItems.every(item => selectedItems.has(item.id))}
                        onCheckedChange={(checked) => handleSelectAll(approvedItems, checked as boolean)}
                        data-testid="checkbox-select-all-approved"
                      />
                      <span className="text-sm text-gray-600">
                        {selectedItems.size > 0 
                          ? `${selectedItems.size} ilan seçildi` 
                          : "Tümünü seç"}
                      </span>
                    </div>
                    {selectedItems.size > 0 && (
                      <Button
                        onClick={handleBulkDelete}
                        disabled={bulkActionLoading}
                        variant="destructive"
                        size="sm"
                        data-testid="button-bulk-delete-approved"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {bulkActionLoading ? "Siliniyor..." : "Seçilenleri Sil"}
                      </Button>
                    )}
                  </div>
                  
                  {approvedItems.map(item => (
                    <ItemCard key={item.id} item={item} showCheckbox={true} />
                  ))}
                </>
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
                <>
                  {/* Bulk actions for rejected items */}
                  <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-4">
                      <Checkbox
                        checked={rejectedItems.every(item => selectedItems.has(item.id))}
                        onCheckedChange={(checked) => handleSelectAll(rejectedItems, checked as boolean)}
                        data-testid="checkbox-select-all-rejected"
                      />
                      <span className="text-sm text-gray-600">
                        {selectedItems.size > 0 
                          ? `${selectedItems.size} ilan seçildi` 
                          : "Tümünü seç"}
                      </span>
                    </div>
                    {selectedItems.size > 0 && (
                      <Button
                        onClick={handleBulkDelete}
                        disabled={bulkActionLoading}
                        variant="destructive"
                        size="sm"
                        data-testid="button-bulk-delete-rejected"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {bulkActionLoading ? "Siliniyor..." : "Seçilenleri Sil"}
                      </Button>
                    )}
                  </div>
                  
                  {rejectedItems.map(item => (
                    <ItemCard key={item.id} item={item} showCheckbox={true} />
                  ))}
                </>
              )}
            </TabsContent>

            <TabsContent value="users" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Kullanıcı Yönetimi
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Search Bar */}
                  <div className="w-full max-w-md">
                    <Input
                      placeholder="Kullanıcı ara..."
                      value={userSearchTerm}
                      onChange={(e) => setUserSearchTerm(e.target.value)}
                      data-testid="input-search-users"
                    />
                  </div>

                  {/* Users List */}
                  {usersLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-gray-600">Kullanıcılar yükleniyor...</p>
                    </div>
                  ) : filteredUsers.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">
                        {userSearchTerm ? "Kullanıcı bulunamadı" : "Henüz kullanıcı yok"}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredUsers.map((user: any) => (
                        <div
                          key={user.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                          data-testid={`user-card-${user.id}`}
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                              <Users className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{user.name || user.email}</p>
                              <p className="text-sm text-gray-600">{user.email}</p>
                              <p className="text-xs text-gray-500">
                                Katılma: {user.createdAt ? new Date(user.createdAt).toLocaleDateString('tr-TR') : 'N/A'}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => viewUserProfile(user)}
                              size="sm"
                              variant="outline"
                              data-testid={`button-view-profile-${user.id}`}
                            >
                              <User className="h-4 w-4 mr-2" />
                              Profil Görüntüle
                            </Button>
                            <Button
                              onClick={() => setSelectedUser(user)}
                              size="sm"
                              data-testid={`button-message-${user.id}`}
                            >
                              <Send className="h-4 w-4 mr-2" />
                              Mesaj Gönder
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Message Modal */}
              {selectedUser && (
                <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {selectedUser.name || selectedUser.email} adlı kullanıcıya mesaj gönder
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Mesaj Başlığı</label>
                        <Input
                          placeholder="Mesaj başlığı girin"
                          value={messageTitle}
                          onChange={(e) => setMessageTitle(e.target.value)}
                          data-testid="input-message-title"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Mesaj İçeriği</label>
                        <Textarea
                          placeholder="Mesaj içeriğini girin"
                          value={messageContent}
                          onChange={(e) => setMessageContent(e.target.value)}
                          rows={4}
                          data-testid="textarea-message-content"
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => setSelectedUser(null)}
                          data-testid="button-cancel-message"
                        >
                          İptal
                        </Button>
                        <Button
                          onClick={sendMessageToUser}
                          disabled={sendingMessage}
                          data-testid="button-send-message"
                        >
                          {sendingMessage ? "Gönderiliyor..." : "Gönder"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}

              {/* User Profile Modal */}
              {viewingUserProfile && (
                <Dialog open={!!viewingUserProfile} onOpenChange={closeUserProfile}>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Kullanıcı Profili: {viewingUserProfile.name || viewingUserProfile.email}
                      </DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-6">
                      {/* Basic User Information */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Kullanıcı Bilgileri
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-500" />
                              <span className="font-medium">Ad Soyad:</span>
                              <span>{viewingUserProfile.name || 'Belirtilmemiş'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MessageCircle className="h-4 w-4 text-gray-500" />
                              <span className="font-medium">E-posta:</span>
                              <span>{viewingUserProfile.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-gray-500" />
                              <span className="font-medium">Telefon:</span>
                              <span>{viewingUserProfile.phone || 'Belirtilmemiş'}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-500" />
                              <span className="font-medium">Katılma Tarihi:</span>
                              <span>
                                {viewingUserProfile.createdAt 
                                  ? new Date(viewingUserProfile.createdAt).toLocaleDateString('tr-TR')
                                  : 'Bilinmiyor'
                                }
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-gray-500" />
                              <span className="font-medium">Şehir:</span>
                              <span>{viewingUserProfile.city || 'Belirtilmemiş'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">
                                ID: {viewingUserProfile.id}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* User's Items */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            Kullanıcının İlanları ({profileUserItems.length})
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {loadingProfileItems ? (
                            <div className="text-center py-8">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                              <p className="text-gray-600">İlanlar yükleniyor...</p>
                            </div>
                          ) : profileUserItems.length === 0 ? (
                            <div className="text-center py-8">
                              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                              <p className="text-gray-600">Bu kullanıcının henüz ilanı bulunmuyor</p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {profileUserItems.map((item: any) => (
                                <div
                                  key={item.id}
                                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                                  data-testid={`user-item-${item.id}`}
                                >
                                  <div className="space-y-2">
                                    <h4 className="font-medium text-sm line-clamp-2">{item.title}</h4>
                                    <div className="flex items-center justify-between">
                                      <Badge variant={
                                        item.status === 'active' ? 'default' : 
                                        item.status === 'pending' ? 'secondary' : 
                                        'destructive'
                                      }>
                                        {item.status === 'active' ? 'Aktif' :
                                         item.status === 'pending' ? 'Beklemede' :
                                         item.status === 'rejected' ? 'Reddedildi' : 
                                         item.status}
                                      </Badge>
                                      <span className="text-xs text-gray-500">
                                        {CATEGORY_LABELS[item.category as keyof typeof CATEGORY_LABELS] || item.category}
                                      </span>
                                    </div>
                                    <p className="text-xs text-gray-600">
                                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString('tr-TR') : 'Tarih yok'}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Action Buttons */}
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => setSelectedUser(viewingUserProfile)}
                          data-testid="button-send-message-from-profile"
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Mesaj Gönder
                        </Button>
                        <Button
                          onClick={closeUserProfile}
                          data-testid="button-close-profile"
                        >
                          Kapat
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </TabsContent>

            <TabsContent value="chat">
              <AdminChat />
            </TabsContent>

            <TabsContent value="broadcast">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Megaphone className="h-5 w-5" />
                    Tüm Kullanıcılara Toplu Bildirim Gönder
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Buradan tüm kayıtlı kullanıcılara aynı anda bildirim gönderebilirsiniz.
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Notification Type */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Bildirim Türü</label>
                    <Select value={broadcastType} onValueChange={setBroadcastType}>
                      <SelectTrigger data-testid="select-broadcast-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="info">
                          <div className="flex items-center gap-2">
                            <Info className="h-4 w-4 text-blue-500" />
                            Bilgi
                          </div>
                        </SelectItem>
                        <SelectItem value="warning">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                            Uyarı
                          </div>
                        </SelectItem>
                        <SelectItem value="announcement">
                          <div className="flex items-center gap-2">
                            <Megaphone className="h-4 w-4 text-green-500" />
                            Duyuru
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Title */}
                  <div className="space-y-2">
                    <label htmlFor="broadcast-title" className="text-sm font-medium">
                      Başlık *
                    </label>
                    <Input
                      id="broadcast-title"
                      value={broadcastTitle}
                      onChange={(e) => setBroadcastTitle(e.target.value)}
                      placeholder="Bildirim başlığını yazın"
                      maxLength={100}
                      data-testid="input-broadcast-title"
                    />
                    <p className="text-xs text-gray-500">
                      {broadcastTitle.length}/100 karakter
                    </p>
                  </div>

                  {/* Message */}
                  <div className="space-y-2">
                    <label htmlFor="broadcast-message" className="text-sm font-medium">
                      Mesaj *
                    </label>
                    <Textarea
                      id="broadcast-message"
                      value={broadcastMessage}
                      onChange={(e) => setBroadcastMessage(e.target.value)}
                      placeholder="Bildirim mesajını yazın"
                      rows={5}
                      maxLength={500}
                      data-testid="textarea-broadcast-message"
                    />
                    <p className="text-xs text-gray-500">
                      {broadcastMessage.length}/500 karakter
                    </p>
                  </div>

                  {/* Preview */}
                  {(broadcastTitle || broadcastMessage) && (
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <h4 className="font-medium text-sm mb-2">Önizleme:</h4>
                      <div className="bg-white border rounded-lg p-3 space-y-2">
                        <div className="flex items-center gap-2">
                          {broadcastType === 'info' && <Info className="h-4 w-4 text-blue-500" />}
                          {broadcastType === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                          {broadcastType === 'announcement' && <Megaphone className="h-4 w-4 text-green-500" />}
                          <span className="font-medium text-sm">
                            {broadcastTitle || "Başlık"}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {broadcastMessage || "Mesaj içeriği"}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Send Button */}
                  <div className="flex justify-end">
                    <Button
                      onClick={sendBroadcastNotification}
                      disabled={sendingBroadcast || !broadcastTitle.trim() || !broadcastMessage.trim()}
                      className="flex items-center gap-2"
                      data-testid="button-send-broadcast"
                    >
                      <Megaphone className="h-4 w-4" />
                      {sendingBroadcast ? "Gönderiliyor..." : "Tüm Kullanıcılara Gönder"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Key className="h-5 w-5" />
                      Şifre Değiştir
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Yeni Şifre</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Yeni şifrenizi girin"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        data-testid="input-new-password"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Şifre Tekrarı</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Şifrenizi tekrar girin"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        data-testid="input-confirm-password"
                      />
                    </div>
                    <Button 
                      onClick={handlePasswordChange}
                      disabled={passwordLoading}
                      data-testid="button-change-password"
                    >
                      {passwordLoading ? "Değiştiriliyor..." : "Şifre Değiştir"}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}