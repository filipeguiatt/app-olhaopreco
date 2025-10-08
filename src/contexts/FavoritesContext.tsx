"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { FavoriteProduct } from '@/types';
import { toast } from 'sonner';

interface FavoritesContextType {
  favorites: FavoriteProduct[];
  addToFavorites: (product: FavoriteProduct) => void;
  removeFromFavorites: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  clearFavorites: () => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([]);

  // Carregar favoritos do localStorage ao inicializar
  useEffect(() => {
    const savedFavorites = localStorage.getItem('olhaopreco-favorites');
    if (savedFavorites) {
      try {
        const parsed = JSON.parse(savedFavorites);
        setFavorites(parsed.map((fav: any) => ({
          ...fav,
          addedAt: new Date(fav.addedAt)
        })));
      } catch (error) {
        console.error('Erro ao carregar favoritos:', error);
      }
    }
  }, []);

  // Salvar favoritos no localStorage sempre que mudar
  useEffect(() => {
    localStorage.setItem('olhaopreco-favorites', JSON.stringify(favorites));
  }, [favorites]);

  const addToFavorites = (product: FavoriteProduct) => {
    setFavorites(prev => {
      const exists = prev.find(fav => fav.id === product.id);
      if (exists) {
        toast.info('Produto já está na tua lista!');
        return prev;
      }
      
      const newFavorite = {
        ...product,
        addedAt: new Date()
      };
      
      toast.success('Produto adicionado à tua lista!');
      return [...prev, newFavorite];
    });
  };

  const removeFromFavorites = (productId: string) => {
    setFavorites(prev => {
      const filtered = prev.filter(fav => fav.id !== productId);
      toast.success('Produto removido da tua lista!');
      return filtered;
    });
  };

  const isFavorite = (productId: string) => {
    return favorites.some(fav => fav.id === productId);
  };

  const clearFavorites = () => {
    setFavorites([]);
    toast.success('Lista de favoritos limpa!');
  };

  return (
    <FavoritesContext.Provider value={{
      favorites,
      addToFavorites,
      removeFromFavorites,
      isFavorite,
      clearFavorites
    }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites deve ser usado dentro de FavoritesProvider');
  }
  return context;
}