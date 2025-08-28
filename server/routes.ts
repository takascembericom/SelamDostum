import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  ObjectStorageService,
  ObjectNotFoundError,
} from "./objectStorage";
import { translationService } from "./translation";

export async function registerRoutes(app: Express): Promise<Server> {
  // Object storage routes for image uploads
  
  // Get upload URL for object storage
  app.post("/api/objects/upload", async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error: any) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });

  // Serve uploaded objects
  app.get("/objects/:objectPath(*)", async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const objectFile = await objectStorageService.getObjectEntityFile(
        req.path,
      );
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error serving object:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  // İlan çeviri endpoint'i - mevcut ilanları çevirmek için
  app.post("/api/translate-item/:itemId", async (req, res) => {
    try {
      const { itemId } = req.params;
      
      // Firestore'dan ilanı al
      const { db } = await import("../client/src/lib/firebase");
      const { doc, getDoc, updateDoc } = await import("firebase/firestore");
      
      const itemRef = doc(db, 'items', itemId);
      const itemSnap = await getDoc(itemRef);
      
      if (!itemSnap.exists()) {
        return res.status(404).json({ error: 'Item not found' });
      }
      
      const itemData = itemSnap.data();
      
      // Sadece çevirisi yoksa çevir
      if (!itemData.titleEn || !itemData.titleAr) {
        const translations = await translationService.translateItemContent(
          itemData.title, 
          itemData.description
        );
        
        // Firestore'u güncelle
        await updateDoc(itemRef, {
          titleEn: translations.titleEn,
          titleAr: translations.titleAr,
          descriptionEn: translations.descriptionEn,
          descriptionAr: translations.descriptionAr,
          updatedAt: new Date()
        });
        
        res.json({ 
          message: 'Item translated successfully',
          translations 
        });
      } else {
        res.json({ message: 'Item already translated' });
      }
    } catch (error: any) {
      console.error("Translation error:", error);
      res.status(500).json({ error: "Translation failed" });
    }
  });

  // Tüm ilanları çevir - Admin endpoint'i
  app.post("/api/translate-all-items", async (req, res) => {
    try {
      const { db } = await import("../client/src/lib/firebase");
      const { collection, query, where, getDocs, doc, updateDoc } = await import("firebase/firestore");
      
      // Çevirisi olmayan ilanları al
      const itemsQuery = query(
        collection(db, 'items'),
        where('status', '==', 'aktif')
      );
      
      const itemsSnapshot = await getDocs(itemsQuery);
      const translatePromises: Promise<void>[] = [];
      let translatedCount = 0;
      
      itemsSnapshot.docs.forEach((itemDoc) => {
        const itemData = itemDoc.data();
        
        // Sadece çevirisi yoksa çevir
        if (!itemData.titleEn || !itemData.titleAr) {
          const translatePromise = translationService
            .translateItemContent(itemData.title, itemData.description)
            .then(async (translations) => {
              const itemRef = doc(db, 'items', itemDoc.id);
              await updateDoc(itemRef, {
                titleEn: translations.titleEn,
                titleAr: translations.titleAr,
                descriptionEn: translations.descriptionEn,
                descriptionAr: translations.descriptionAr,
                updatedAt: new Date()
              });
              translatedCount++;
            })
            .catch(error => {
              console.error(`Translation failed for item ${itemDoc.id}:`, error);
            });
          
          translatePromises.push(translatePromise);
        }
      });
      
      // Çevirilerin tamamlanmasını bekle (max 5 concurrent)
      const chunks = [];
      for (let i = 0; i < translatePromises.length; i += 5) {
        chunks.push(translatePromises.slice(i, i + 5));
      }
      
      for (const chunk of chunks) {
        await Promise.all(chunk);
        // Rate limiting için kısa bekleme
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      res.json({ 
        message: `Successfully translated ${translatedCount} items`,
        total: itemsSnapshot.docs.length,
        translated: translatedCount
      });
    } catch (error: any) {
      console.error("Bulk translation error:", error);
      res.status(500).json({ error: "Bulk translation failed" });
    }
  });

  // put other application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  const httpServer = createServer(app);

  return httpServer;
}
