// hook para persistir galeria no IndexedDB (sem limite de 5MB do localStorage)
import { useState, useEffect, useCallback } from 'react';

const DB_NAME = 'designer-do-futuro';
const DB_VERSION = 1;
const STORE_GALLERY = 'gallery';

interface GalleryImage {
  src: string;
  prompt: string;
  timestamp: number;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_GALLERY)) {
        const store = db.createObjectStore(STORE_GALLERY, { keyPath: 'timestamp' });
        store.createIndex('timestamp', 'timestamp', { unique: true });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function getAllImages(): Promise<GalleryImage[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_GALLERY, 'readonly');
    const req = tx.objectStore(STORE_GALLERY).index('timestamp').getAll();
    req.onsuccess = () => {
      // Ordena do mais recente para o mais antigo
      const sorted = (req.result as GalleryImage[]).sort((a, b) => b.timestamp - a.timestamp);
      resolve(sorted);
    };
    req.onerror = () => reject(req.error);
  });
}

async function putImage(img: GalleryImage): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_GALLERY, 'readwrite');
    tx.objectStore(STORE_GALLERY).put(img);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function deleteImage(timestamp: number): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_GALLERY, 'readwrite');
    tx.objectStore(STORE_GALLERY).delete(timestamp);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function clearAllImages(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_GALLERY, 'readwrite');
    tx.objectStore(STORE_GALLERY).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export function useGalleryDB() {
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  // Carrega a galeria do IndexedDB ao montar
  useEffect(() => {
    getAllImages()
      .then((imgs) => {
        setGallery(imgs);
      })
      .catch((err) => {
        console.warn('[GalleryDB] Erro ao carregar galeria:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  // Adiciona imagem ao topo da galeria
  const addImage = useCallback(async (img: GalleryImage) => {
    try {
      await putImage(img);
      setGallery((prev) => [img, ...prev]);
    } catch (err) {
      console.error('[GalleryDB] Erro ao salvar imagem:', err);
    }
  }, []);

  // Remove imagem da galeria
  const removeImage = useCallback(async (timestamp: number) => {
    try {
      await deleteImage(timestamp);
      setGallery((prev) => prev.filter((img) => img.timestamp !== timestamp));
    } catch (err) {
      console.error('[GalleryDB] Erro ao remover imagem:', err);
    }
  }, []);

  // Limpa toda a galeria
  const clearGallery = useCallback(async () => {
    try {
      await clearAllImages();
      setGallery([]);
    } catch (err) {
      console.error('[GalleryDB] Erro ao limpar galeria:', err);
    }
  }, []);

  // Seta galeria completa (para compatibilidade com projetos)
  const setGalleryFull = useCallback(async (images: GalleryImage[]) => {
    try {
      await clearAllImages();
      for (const img of images) {
        await putImage(img);
      }
      setGallery([...images]);
    } catch (err) {
      console.error('[GalleryDB] Erro ao definir galeria:', err);
    }
  }, []);

  return { gallery, setGallery: setGalleryFull, addImage, removeImage, clearGallery, loading };
}
