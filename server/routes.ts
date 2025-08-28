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
      const { collection, getDocs, doc, updateDoc } = await import("firebase/firestore");
      
      // Tüm aktif ilanları al
      const itemsSnapshot = await getDocs(collection(db, 'items'));
      const translatePromises: Promise<void>[] = [];
      let translatedCount = 0;
      let totalItems = 0;
      
      itemsSnapshot.docs.forEach((itemDoc) => {
        const itemData = itemDoc.data();
        totalItems++;
        
        console.log(`Checking item ${itemDoc.id}:`);
        console.log(`- title: "${itemData.title}"`);
        console.log(`- description: "${itemData.description}"`);
        console.log(`- titleEn: "${itemData.titleEn}"`);
        console.log(`- titleAr: "${itemData.titleAr}"`);
        
        // Her zaman çevir (test için)
        if (itemData.title && itemData.description) {
          console.log(`Will translate item ${itemDoc.id}`);
        } else {
          console.log(`Skipping item ${itemDoc.id} - missing title or description`);
        }
        
        if (itemData.title && itemData.description) {
          const translatePromise = translationService
            .translateItemContent(itemData.title, itemData.description)
            .then(async (translations) => {
              console.log(`Translating item ${itemDoc.id}:`, translations);
              const itemRef = doc(db, 'items', itemDoc.id);
              await updateDoc(itemRef, {
                titleEn: translations.titleEn,
                titleAr: translations.titleAr,
                descriptionEn: translations.descriptionEn,
                descriptionAr: translations.descriptionAr,
                updatedAt: new Date()
              });
              translatedCount++;
              console.log(`Successfully translated item ${itemDoc.id}`);
            })
            .catch(error => {
              console.error(`Translation failed for item ${itemDoc.id}:`, error);
            });
          
          translatePromises.push(translatePromise);
        }
      });
      
      console.log(`Found ${totalItems} items, ${translatePromises.length} will be translated`);
      
      // Çevirilerin tamamlanmasını bekle (max 3 concurrent for better stability)
      const chunks = [];
      for (let i = 0; i < translatePromises.length; i += 3) {
        chunks.push(translatePromises.slice(i, i + 3));
      }
      
      for (const chunk of chunks) {
        await Promise.all(chunk);
        // Rate limiting için bekleme
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      res.json({ 
        message: `Successfully translated ${translatedCount} items`,
        total: totalItems,
        translated: translatedCount
      });
    } catch (error: any) {
      console.error("Bulk translation error:", error);
      res.status(500).json({ error: "Bulk translation failed" });
    }
  });

  // Test translation service
  app.get("/api/test-translation", async (req, res) => {
    try {
      const testText = "Kullanılır temiz durumda";
      const translations = await translationService.translateFromTurkish(testText);
      res.json({
        original: testText,
        translations: translations
      });
    } catch (error: any) {
      console.error("Translation test error:", error);
      res.status(500).json({ error: "Translation test failed" });
    }
  });

  // Debug endpoint - show raw item data
  app.get("/api/debug/items", async (req, res) => {
    try {
      const { db } = await import("../client/src/lib/firebase");
      const { collection, getDocs } = await import("firebase/firestore");
      
      console.log("Fetching items from Firebase...");
      const itemsSnapshot = await getDocs(collection(db, 'items'));
      console.log(`Found ${itemsSnapshot.docs.length} items in Firebase`);
      
      const items = itemsSnapshot.docs.map(doc => {
        const data = doc.data();
        console.log(`Item ${doc.id}: title="${data.title}", description="${data.description}"`);
        return {
          id: doc.id,
          ...data
        };
      });
      
      res.json({
        count: items.length,
        items: items
      });
    } catch (error: any) {
      console.error("Debug items error:", error);
      res.status(500).json({ error: "Failed to get debug items", details: error.message });
    }
  });

  // İlanları listele endpoint'i 
  app.get("/api/items", async (req, res) => {
    try {
      const { db } = await import("../client/src/lib/firebase");
      const { collection, getDocs, orderBy, query } = await import("firebase/firestore");
      
      const itemsQuery = query(
        collection(db, 'items'),
        orderBy('createdAt', 'desc')
      );
      
      const itemsSnapshot = await getDocs(itemsQuery);
      const items = itemsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt,
        };
      });
      
      res.json(items);
    } catch (error: any) {
      console.error("Items fetch error:", error);
      res.status(500).json({ error: "Failed to fetch items" });
    }
  });

  // put other application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  const httpServer = createServer(app);

  return httpServer;
}
