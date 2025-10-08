import { Store } from '@/types';

export const mockStores: Store[] = [
  {
    id: 'worten',
    name: 'Worten',
    color: '#E31E24',
    products: [
      {
        id: 'worten-iphone15',
        name: 'iPhone 15 128GB',
        price: 899.99,
        originalPrice: 999.99,
        discount: 10,
        imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop'
      },
      {
        id: 'worten-macbook',
        name: 'MacBook Air M2 13"',
        price: 1299.99,
        originalPrice: 1449.99,
        discount: 10,
        imageUrl: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&h=400&fit=crop'
      },
      {
        id: 'worten-airpods',
        name: 'AirPods Pro 2ª Geração',
        price: 249.99,
        imageUrl: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400&h=400&fit=crop'
      },
      {
        id: 'worten-ipad',
        name: 'iPad Air 10.9" 64GB',
        price: 649.99,
        originalPrice: 699.99,
        discount: 7,
        imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop'
      }
    ]
  },
  {
    id: 'fnac',
    name: 'Fnac',
    color: '#F39800',
    products: [
      {
        id: 'fnac-samsung-s24',
        name: 'Samsung Galaxy S24 256GB',
        price: 799.99,
        originalPrice: 899.99,
        discount: 11,
        imageUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&h=400&fit=crop'
      },
      {
        id: 'fnac-ps5',
        name: 'PlayStation 5 Standard',
        price: 549.99,
        imageUrl: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400&h=400&fit=crop'
      },
      {
        id: 'fnac-nintendo',
        name: 'Nintendo Switch OLED',
        price: 349.99,
        originalPrice: 379.99,
        discount: 8,
        imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop'
      },
      {
        id: 'fnac-headphones',
        name: 'Sony WH-1000XM5',
        price: 329.99,
        originalPrice: 399.99,
        discount: 18,
        imageUrl: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=400&fit=crop'
      }
    ]
  },
  {
    id: 'amazon',
    name: 'Amazon',
    color: '#FF9900',
    products: [
      {
        id: 'amazon-echo',
        name: 'Amazon Echo Dot 5ª Geração',
        price: 59.99,
        originalPrice: 79.99,
        discount: 25,
        imageUrl: 'https://images.unsplash.com/photo-1543512214-318c7553f230?w=400&h=400&fit=crop'
      },
      {
        id: 'amazon-kindle',
        name: 'Kindle Paperwhite 11ª Geração',
        price: 149.99,
        imageUrl: 'https://images.unsplash.com/photo-1592496431122-2349e0fbc666?w=400&h=400&fit=crop'
      },
      {
        id: 'amazon-tablet',
        name: 'Fire HD 10 Tablet 32GB',
        price: 159.99,
        originalPrice: 199.99,
        discount: 20,
        imageUrl: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=400&h=400&fit=crop'
      },
      {
        id: 'amazon-watch',
        name: 'Apple Watch Series 9 45mm',
        price: 449.99,
        originalPrice: 499.99,
        discount: 10,
        imageUrl: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=400&h=400&fit=crop'
      }
    ]
  },
  {
    id: 'mediamarkt',
    name: 'MediaMarkt',
    color: '#D50000',
    products: [
      {
        id: 'mediamarkt-tv',
        name: 'Samsung QLED 55" 4K Smart TV',
        price: 899.99,
        originalPrice: 1199.99,
        discount: 25,
        imageUrl: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=400&fit=crop'
      },
      {
        id: 'mediamarkt-laptop',
        name: 'ASUS VivoBook 15" i5 8GB',
        price: 649.99,
        originalPrice: 749.99,
        discount: 13,
        imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop'
      },
      {
        id: 'mediamarkt-camera',
        name: 'Canon EOS R50 + Lente 18-45mm',
        price: 699.99,
        imageUrl: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=400&fit=crop'
      },
      {
        id: 'mediamarkt-speaker',
        name: 'JBL Charge 5 Bluetooth',
        price: 149.99,
        originalPrice: 179.99,
        discount: 17,
        imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop'
      }
    ]
  },
  {
    id: 'pccomponentes',
    name: 'PcComponentes',
    color: '#FF6900',
    products: [
      {
        id: 'pc-gpu',
        name: 'NVIDIA RTX 4070 Super',
        price: 649.99,
        originalPrice: 699.99,
        discount: 7,
        imageUrl: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400&h=400&fit=crop'
      },
      {
        id: 'pc-cpu',
        name: 'AMD Ryzen 7 7700X',
        price: 349.99,
        originalPrice: 399.99,
        discount: 13,
        imageUrl: 'https://images.unsplash.com/photo-1555617981-dac3880eac6e?w=400&h=400&fit=crop'
      },
      {
        id: 'pc-monitor',
        name: 'Monitor Gaming 27" 144Hz',
        price: 299.99,
        imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&h=400&fit=crop'
      },
      {
        id: 'pc-keyboard',
        name: 'Teclado Mecânico RGB',
        price: 89.99,
        originalPrice: 119.99,
        discount: 25,
        imageUrl: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400&h=400&fit=crop'
      }
    ]
  }
];