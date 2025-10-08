"use client";

import { Product, FavoriteProduct } from '@/types';
import { useFavorites } from '@/contexts/FavoritesContext';
import { Star, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ProductItemProps {
  product: Product;
  storeId: string;
  storeName: string;
  storeColor: string;
}

export function ProductItem({ product, storeId, storeName, storeColor }: ProductItemProps) {
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const isProductFavorite = isFavorite(product.id);

  const handleToggleFavorite = () => {
    if (isProductFavorite) {
      removeFromFavorites(product.id);
    } else {
      const favoriteProduct: FavoriteProduct = {
        ...product,
        storeId,
        storeName,
        addedAt: new Date()
      };
      addToFavorites(favoriteProduct);
    }
  };

  const handleProductClick = () => {
    const productUrl = product.document?.url || product.url;
    console.log('Clicando no produto, URL:', productUrl);
    if (productUrl) {
      // Criar um elemento <a> e simular clique para contornar restrições de sandbox
      const link = document.createElement('a');
      link.href = productUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      
      // Adicionar ao DOM temporariamente
      document.body.appendChild(link);
      
      // Simular clique
      link.click();
      
      // Remover do DOM
      document.body.removeChild(link);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
      <CardContent className="p-4">
        <div className="relative">
          {/* Imagem do produto - CLICÁVEL */}
          <div 
            className="aspect-square mb-3 overflow-hidden rounded-lg bg-gray-100 cursor-pointer"
            onClick={handleProductClick}
          >
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <span className="text-sm">Sem imagem</span>
              </div>
            )}
          </div>

          {/* Badge de desconto */}
          {product.discount && (
            <Badge 
              className="absolute top-2 left-2 bg-red-500 hover:bg-red-600 text-white"
            >
              -{product.discount}%
            </Badge>
          )}

          {/* Botão de favorito */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 bg-white/80 hover:bg-white shadow-sm"
            onClick={handleToggleFavorite}
          >
            <Star 
              className={`h-4 w-4 transition-colors ${
                isProductFavorite 
                  ? 'fill-yellow-400 text-yellow-400' 
                  : 'text-gray-400 hover:text-yellow-400'
              }`}
            />
          </Button>
        </div>

        {/* Informações do produto */}
        <div className="space-y-2">
          {/* Nome do produto - CLICÁVEL */}
          <h3 
            className="font-medium text-sm line-clamp-2 min-h-[2.5rem] cursor-pointer hover:text-blue-600 transition-colors"
            onClick={handleProductClick}
          >
            {product.name}
          </h3>

          {/* Preços */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg" style={{ color: storeColor }}>
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          {/* Loja */}
          <div className="flex items-center justify-between">
            <span 
              className="text-xs font-medium px-2 py-1 rounded-full text-white"
              style={{ backgroundColor: storeColor }}
            >
              {storeName}
            </span>
            

          </div>
        </div>
      </CardContent>
    </Card>
  );
}