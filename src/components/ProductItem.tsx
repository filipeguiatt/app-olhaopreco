"use client";

import { useState } from 'react';
import { Product } from '@/types';
import { ExternalLink, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useFavorites } from '@/contexts/FavoritesContext';

interface ProductItemProps {
  product: Product;
  storeId: string;
  storeName: string;
  storeColor: string;
}

export function ProductItem({ product, storeId, storeName, storeColor }: ProductItemProps) {
  const { favorites, addToFavorites, removeFromFavorites } = useFavorites();
  const [isAnimating, setIsAnimating] = useState(false);

  const isFavorite = favorites.some(fav => fav.id === product.id);

  const handleProductClick = () => {
    const productUrl = product.document?.url || product.url;
    if (productUrl) {
      window.open(productUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAnimating(true);
    
    if (isFavorite) {
      removeFromFavorites(product.id);
    } else {
      addToFavorites({
        ...product,
        storeId,
        storeName,
        storeColor
      });
    }

    setTimeout(() => setIsAnimating(false), 300);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  return (
    <Card className="group relative overflow-hidden bg-white hover:shadow-xl transition-all duration-300 border-0 shadow-md hover:-translate-y-1">
      <CardContent className="p-0">
        {/* Container da imagem */}
        <div className="relative overflow-hidden">
          <div 
            className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 cursor-pointer relative"
            onClick={handleProductClick}
          >
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <ExternalLink className="h-8 w-8 mx-auto mb-2" />
                  <span className="text-xs">Ver produto</span>
                </div>
              </div>
            )}
            
            {/* Overlay gradiente */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          {/* Badge de desconto */}
          {product.discount && (
            <Badge className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold px-2 py-1 text-xs shadow-lg">
              -{product.discount}%
            </Badge>
          )}

          {/* Botão de favoritos */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleFavoriteClick}
            className={`absolute top-3 right-3 p-2 h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-all duration-200 ${
              isAnimating ? 'scale-125' : 'hover:scale-110'
            }`}
          >
            <Heart 
              className={`h-4 w-4 transition-colors duration-200 ${
                isFavorite 
                  ? 'fill-red-500 text-red-500' 
                  : 'text-gray-600 hover:text-red-500'
              }`}
            />
          </Button>
        </div>

        {/* Informações do produto */}
        <div className="p-4 space-y-3">
          {/* Nome do produto */}
          <h3 
            className="font-semibold text-sm leading-tight line-clamp-2 min-h-[2.5rem] cursor-pointer hover:text-blue-600 transition-colors text-gray-800"
            onClick={handleProductClick}
          >
            {product.name}
          </h3>

          {/* Preços */}
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-xl text-gray-900">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          {/* Loja e botão */}
          <div className="flex items-center justify-between pt-2">
            <span 
              className="text-xs font-bold px-3 py-1.5 rounded-full text-white shadow-sm"
              style={{ backgroundColor: storeColor }}
            >
              {storeName}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleProductClick}
              className="text-xs px-3 py-1 h-7 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Ver
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}