"use client";

import { Store } from '@/types';
import { ProductItem } from '@/components/ProductItem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface StoreItemProps {
  store: Store;
}

export function StoreItem({ store }: StoreItemProps) {
  return (
    <Card className="mb-8">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle 
            className="text-xl font-bold flex items-center gap-3"
            style={{ color: store.color }}
          >
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: store.color }}
            />
            {store.name}
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {store.products.length} produtos
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {store.products.map((product) => (
            <ProductItem
              key={product.id}
              product={product}
              storeId={store.id}
              storeName={store.name}
              storeColor={store.color}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}