"use client";

import { useFavorites } from '@/contexts/FavoritesContext';
import { ProductItem } from '@/components/ProductItem';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Heart, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface FavoriteProductsProps {
  onBack: () => void;
}

export function FavoriteProducts({ onBack }: FavoriteProductsProps) {
  const { favorites, clearFavorites } = useFavorites();

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const totalValue = favorites.reduce((sum, product) => sum + product.price, 0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onBack}
              className="hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Heart className="h-6 w-6 text-red-500" />
                A Minha Lista
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Produtos que estás a seguir para alertas de preço
              </p>
            </div>
          </div>

          {favorites.length > 0 && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={clearFavorites}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Limpar Lista
            </Button>
          )}
        </div>

        {/* Estatísticas */}
        {favorites.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {favorites.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Produtos Seguidos
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formatPrice(totalValue)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Valor Total
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {new Set(favorites.map(f => f.storeId)).size}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Lojas Diferentes
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Lista de produtos favoritos */}
        {favorites.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                A tua lista está vazia
              </h2>
              <p className="text-gray-500 dark:text-gray-500 mb-6">
                Adiciona produtos às tuas favoritas para receberes alertas de preço
              </p>
              <Button onClick={onBack} className="bg-blue-600 hover:bg-blue-700">
                Explorar Produtos
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Produtos agrupados por loja */}
            {Object.entries(
              favorites.reduce((acc, product) => {
                if (!acc[product.storeName]) {
                  acc[product.storeName] = [];
                }
                acc[product.storeName].push(product);
                return acc;
              }, {} as Record<string, typeof favorites>)
            ).map(([storeName, storeProducts]) => (
              <Card key={storeName}>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold">
                      {storeName}
                    </CardTitle>
                    <Badge variant="secondary">
                      {storeProducts.length} produto{storeProducts.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {storeProducts.map((product) => (
                      <div key={product.id} className="space-y-2">
                        <ProductItem
                          product={product}
                          storeId={product.storeId}
                          storeName={product.storeName}
                          storeColor="#6B7280"
                        />
                        <div className="text-xs text-gray-500 text-center">
                          Adicionado: {formatDate(product.addedAt)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}