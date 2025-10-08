"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { mockStores } from '@/data/mockData';
import { StoreItem } from '@/components/StoreItem';
import { FavoriteProducts } from '@/components/FavoriteProducts';
import { ApiConfig } from '@/components/ApiConfig';
import { FavoritesProvider, useFavorites } from '@/contexts/FavoritesContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Heart, Search, TrendingDown, Settings, Loader2, Filter, Percent, TrendingUp, Star, Store as StoreIcon } from 'lucide-react';
import { Toaster } from 'sonner';
import { searchRadioPopularProducts } from '@/services/radioPopularApi';
import { Store, Product } from '@/types';
import { toast } from 'sonner';

type FilterType = 'all' | 'promotion' | 'bestsellers' | 'favorites';
type CategoryFilter = 'all' | 'Foto e Vídeo' | 'Lazer, Desporto e Outdoor' | 'Gaming' | 'Informática' | 'Televisão e Som' | 'Electrodomésticos' | 'Casa e Jardim' | 'Automóvel' | 'Saúde e Beleza' | 'Brinquedos' | 'Acessórios';

function MainContent() {
  const [currentView, setCurrentView] = useState<'main' | 'favorites'>('main');
  const [searchQuery, setSearchQuery] = useState('');
  const [showApiConfig, setShowApiConfig] = useState(false);
  const [isSearchingApi, setIsSearchingApi] = useState(false);
  const [apiProducts, setApiProducts] = useState<Product[]>([]);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [selectedStore, setSelectedStore] = useState<string>('all');
  
  // Estados para infinite scroll
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreProducts, setHasMoreProducts] = useState(true);
  const [allLoadedProducts, setAllLoadedProducts] = useState<Product[]>([]);
  
  // Estados para filtros de categoria da Rádio Popular
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  
  const { favorites } = useFavorites();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);

  // Verificar se existe API key salva
  useEffect(() => {
    const savedApiKey = localStorage.getItem('radiopopular_api_key');
    setHasApiKey(!!savedApiKey);
  }, []);

  // Função para carregar produtos da API com categoria específica
  const loadProductsWithCategory = useCallback(async (category: CategoryFilter, page: number = 1, limit: number = 100) => {
    const apiKey = localStorage.getItem('radiopopular_api_key');
    if (!apiKey) return [];

    try {
      // Se categoria é 'all', buscar sem filtro
      if (category === 'all') {
        return await searchRadioPopularProducts('', apiKey, page, limit);
      }
      
      // Buscar com categoria como pattern
      return await searchRadioPopularProducts(category, apiKey, page, limit);
    } catch (error) {
      console.error('Erro ao carregar produtos com categoria:', error);
      return [];
    }
  }, []);

  // Função para carregar mais produtos (infinite scroll)
  const loadMoreProducts = useCallback(async () => {
    if (isLoadingMore || !hasMoreProducts || !hasApiKey || searchQuery.trim()) return;

    setIsLoadingMore(true);
    try {
      const newProducts = await loadProductsWithCategory(selectedCategory, currentPage, 100);
      
      if (newProducts.length === 0) {
        setHasMoreProducts(false);
        toast.info('Todos os produtos foram carregados!');
      } else {
        setAllLoadedProducts(prev => [...prev, ...newProducts]);
        setCurrentPage(prev => prev + 1);
        
        toast.success(`${newProducts.length} novos produtos carregados!`);
      }
    } catch (error) {
      console.error('Erro ao carregar mais produtos:', error);
      toast.error('Erro ao carregar mais produtos.');
    } finally {
      setIsLoadingMore(false);
    }
  }, [currentPage, isLoadingMore, hasMoreProducts, hasApiKey, searchQuery, selectedCategory, loadProductsWithCategory]);

  // Configurar Intersection Observer para infinite scroll
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && selectedStore === 'radiopopular-api') {
          loadMoreProducts();
        }
      },
      { threshold: 0.1 }
    );

    if (loadingRef.current) {
      observerRef.current.observe(loadingRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loadMoreProducts, selectedStore]);

  // Carregar produtos iniciais quando a app iniciar ou categoria mudar
  useEffect(() => {
    const loadInitialProducts = async () => {
      if (hasApiKey && !searchQuery.trim()) {
        setIsLoadingMore(true);
        setAllLoadedProducts([]);
        setCurrentPage(1);
        setHasMoreProducts(true);
        
        try {
          const initialProducts = await loadProductsWithCategory(selectedCategory, 1, 100);
          
          if (initialProducts.length > 0) {
            setAllLoadedProducts(initialProducts);
            setCurrentPage(2);
            toast.success(`${initialProducts.length} produtos carregados!`);
          }
        } catch (error) {
          console.error('Erro ao carregar produtos iniciais:', error);
          toast.error('Erro ao carregar produtos da Rádio Popular.');
        } finally {
          setIsLoadingMore(false);
        }
      }
    };

    loadInitialProducts();
  }, [hasApiKey, selectedCategory, searchQuery, loadProductsWithCategory]);

  // Função para pesquisar na API da Rádio Popular
  const searchApiProducts = async (query: string) => {
    if (!query.trim()) {
      // Se não há pesquisa, voltar para o infinite scroll
      setApiProducts([]);
      return;
    }

    setIsSearchingApi(true);
    try {
      const apiKey = localStorage.getItem('radiopopular_api_key');
      const products = await searchRadioPopularProducts(query, apiKey || undefined, 1, 100);
      
      setApiProducts(products);
      
      if (products.length > 0) {
        toast.success(`${products.length} produtos encontrados na Rádio Popular!`);
      } else if (hasApiKey) {
        toast.info('Nenhum produto encontrado na Rádio Popular para esta pesquisa.');
      }
    } catch (error) {
      console.error('Erro ao pesquisar na API:', error);
      toast.error('Erro ao pesquisar produtos na Rádio Popular.');
    } finally {
      setIsSearchingApi(false);
    }
  };

  // Pesquisar quando o termo de pesquisa mudar (com debounce)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (hasApiKey) {
        searchApiProducts(searchQuery);
      } else {
        setApiProducts([]);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, hasApiKey]);

  // Filtrar produtos dos dados mock baseado na pesquisa
  const filteredStores = mockStores.map(store => ({
    ...store,
    products: store.products.filter(product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(store => store.products.length > 0);

  // Criar loja virtual para produtos da API com IDs únicos
  const radioPopularStore: Store = {
    id: 'radiopopular-api',
    name: 'Rádio Popular',
    color: '#0066CC',
    products: (searchQuery.trim() ? apiProducts : allLoadedProducts).map((product, index) => ({
      ...product,
      id: `rp-${product.id || index}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` // ID único garantido
    }))
  };

  // Função corrigida para detectar promoções
  const isProductOnPromotion = (product: Product): boolean => {
    // Verificar se tem desconto numérico válido (principal para Rádio Popular)
    if (product.discount && !isNaN(product.discount) && product.discount > 0) {
      return true;
    }
    
    // Verificar se tem preço original diferente do preço atual
    if (product.originalPrice && product.price && 
        !isNaN(product.originalPrice) && !isNaN(product.price) && 
        product.originalPrice > product.price) {
      return true;
    }
    
    return false;
  };

  // Aplicar filtros
  const applyFilter = (store: Store): Store => {
    let filteredProducts = store.products;

    switch (activeFilter) {
      case 'promotion':
        filteredProducts = store.products.filter(isProductOnPromotion);
        break;
      case 'bestsellers':
        // Simular produtos mais vendidos (ordenar por desconto ou preço)
        filteredProducts = store.products
          .filter(p => p.discount || p.price < 100)
          .sort((a, b) => (b.discount || 0) - (a.discount || 0));
        break;
      case 'favorites':
        const favoriteIds = favorites.map(f => f.id);
        filteredProducts = store.products.filter(p => favoriteIds.includes(p.id));
        break;
      default:
        filteredProducts = store.products;
    }

    return { ...store, products: filteredProducts };
  };

  // Combinar lojas (Rádio Popular sempre primeiro)
  let allStores: Store[] = [];
  
  // Para "Todas as Lojas", mostrar apenas 10 produtos mais populares de cada loja
  if (selectedStore === 'all') {
    // Rádio Popular - 10 produtos mais populares (com desconto ou mais baratos)
    const radioPopularTop10 = radioPopularStore.products
      .sort((a, b) => {
        // Priorizar produtos com desconto
        if (a.discount && !b.discount) return -1;
        if (!a.discount && b.discount) return 1;
        // Se ambos têm desconto, ordenar por maior desconto
        if (a.discount && b.discount) return b.discount - a.discount;
        // Se nenhum tem desconto, ordenar por menor preço
        return a.price - b.price;
      })
      .slice(0, 10);
    
    if (radioPopularTop10.length > 0) {
      allStores.push({ ...radioPopularStore, products: radioPopularTop10 });
    }
    
    // Outras lojas - 10 produtos mais populares de cada
    const otherStoresTop10 = filteredStores.map(store => ({
      ...store,
      products: store.products
        .sort((a, b) => {
          // Priorizar produtos com desconto
          if (a.discount && !b.discount) return -1;
          if (!a.discount && b.discount) return 1;
          // Se ambos têm desconto, ordenar por maior desconto
          if (a.discount && b.discount) return b.discount - a.discount;
          // Se nenhum tem desconto, ordenar por menor preço
          return a.price - b.price;
        })
        .slice(0, 10)
    })).filter(store => store.products.length > 0);
    
    allStores = [...allStores, ...otherStoresTop10];
  } else {
    // Sempre mostrar Rádio Popular primeiro (mesmo sem produtos para mostrar que está disponível)
    const filteredRadioPopular = applyFilter(radioPopularStore);
    if (filteredRadioPopular.products.length > 0 || (!searchQuery && hasApiKey)) {
      allStores.push(filteredRadioPopular);
    }
    
    // Adicionar outras lojas filtradas
    const otherFilteredStores = filteredStores.map(applyFilter).filter(store => store.products.length > 0);
    allStores = [...allStores, ...otherFilteredStores];
  }

  // Aplicar filtro por loja selecionada
  if (selectedStore !== 'all') {
    allStores = allStores.filter(store => store.id === selectedStore);
  }

  // Obter lista de lojas disponíveis para os botões
  const availableStores = [
    { id: 'all', name: 'Todas as Lojas', color: '#6B7280' },
    ...(hasApiKey || apiProducts.length > 0 || allLoadedProducts.length > 0 ? [{ id: 'radiopopular-api', name: 'Rádio Popular', color: '#0066CC' }] : []),
    ...mockStores.map(store => ({ id: store.id, name: store.name, color: store.color }))
  ];

  if (currentView === 'favorites') {
    return <FavoriteProducts onBack={() => setCurrentView('main')} />;
  }

  const filterButtons = [
    { key: 'all' as FilterType, label: 'Todos', icon: Filter },
    { key: 'promotion' as FilterType, label: 'Em Promoção', icon: Percent },
    { key: 'bestsellers' as FilterType, label: 'Mais Vendidos', icon: TrendingUp },
    { key: 'favorites' as FilterType, label: 'Favoritos', icon: Star }
  ];

  const categoryButtons = [
    { key: 'all' as CategoryFilter, label: 'Todas as Categorias' },
    { key: 'Foto e Vídeo' as CategoryFilter, label: 'Foto e Vídeo' },
    { key: 'Lazer, Desporto e Outdoor' as CategoryFilter, label: 'Lazer, Desporto e Outdoor' },
    { key: 'Gaming' as CategoryFilter, label: 'Gaming' },
    { key: 'Informática' as CategoryFilter, label: 'Informática' },
    { key: 'Televisão e Som' as CategoryFilter, label: 'Televisão e Som' },
    { key: 'Electrodomésticos' as CategoryFilter, label: 'Electrodomésticos' },
    { key: 'Casa e Jardim' as CategoryFilter, label: 'Casa e Jardim' },
    { key: 'Automóvel' as CategoryFilter, label: 'Automóvel' },
    { key: 'Saúde e Beleza' as CategoryFilter, label: 'Saúde e Beleza' },
    { key: 'Brinquedos' as CategoryFilter, label: 'Brinquedos' },
    { key: 'Acessórios' as CategoryFilter, label: 'Acessórios' }
  ];

  const isLoading = isSearchingApi || isLoadingMore;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                  <TrendingDown className="h-6 w-6 text-white" />
                </div>
                OlhaOPreço
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Compara preços das melhores lojas portuguesas
                {hasApiKey && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    API Rádio Popular ativa
                  </Badge>
                )}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowApiConfig(true)}
                className="hidden sm:flex"
              >
                <Settings className="h-4 w-4 mr-2" />
                API Config
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setCurrentView('favorites')}
                className="relative"
              >
                <Heart className="h-4 w-4 mr-2" />
                A Minha Lista
                {favorites.length > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                  >
                    {favorites.length}
                  </Badge>
                )}
              </Button>
            </div>
          </div>

          {/* Barra de pesquisa */}
          <div className="mt-6 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            {isLoading && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 animate-spin" />
            )}
            <Input
              placeholder={hasApiKey ? "Pesquisar produtos (inclui API da Rádio Popular)..." : "Pesquisar produtos..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 max-w-md"
            />
          </div>

          {/* Botão de configuração mobile */}
          <div className="mt-4 sm:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowApiConfig(true)}
              className="w-full"
            >
              <Settings className="h-4 w-4 mr-2" />
              Configurar API da Rádio Popular
            </Button>
          </div>
        </div>
      </div>

      {/* Filtros por Loja */}
      <div className="bg-white dark:bg-gray-800 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 mb-3">
            <StoreIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filtrar por loja:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {availableStores.map((store) => (
              <Button
                key={store.id}
                variant={selectedStore === store.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedStore(store.id)}
                className="flex items-center gap-2 transition-all duration-200 hover:scale-105"
                style={selectedStore === store.id ? {
                  backgroundColor: store.color,
                  borderColor: store.color,
                  color: 'white'
                } : {
                  borderColor: store.color,
                  color: store.color
                }}
              >
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: store.color }}
                />
                {store.name}
                {store.id === 'all' && (
                  <Badge variant="secondary" className="ml-1 text-xs bg-white/20">
                    Top 10 cada
                  </Badge>
                )}
                {store.id === 'radiopopular-api' && (apiProducts.length > 0 || allLoadedProducts.length > 0) && (
                  <Badge variant="secondary" className="ml-1 text-xs bg-white/20">
                    {searchQuery.trim() ? apiProducts.length : allLoadedProducts.length}
                  </Badge>
                )}
                {store.id !== 'all' && store.id !== 'radiopopular-api' && (
                  <Badge variant="secondary" className="ml-1 text-xs bg-white/20">
                    {mockStores.find(s => s.id === store.id)?.products.length || 0}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="container mx-auto px-4 py-6">
        {/* Filtros de Categoria */}
        <div className="flex flex-wrap gap-2 mb-6">
          {filterButtons.map(({ key, label, icon: Icon }) => (
            <Button
              key={key}
              variant={activeFilter === key ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFilter(key)}
              className="flex items-center gap-2"
            >
              <Icon className="h-4 w-4" />
              {label}
              {key === 'favorites' && favorites.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {favorites.length}
                </Badge>
              )}
            </Button>
          ))}
        </div>

        {/* Filtros de Categoria da Rádio Popular - MOVIDO PARA PERTO DOS PRODUTOS */}
        {selectedStore === 'radiopopular-api' && hasApiKey && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Categorias Rádio Popular:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {categoryButtons.map((category) => (
                <Button
                  key={category.key}
                  variant={selectedCategory === category.key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.key)}
                  className="transition-all duration-200 hover:scale-105"
                  style={selectedCategory === category.key ? {
                    backgroundColor: '#0066CC',
                    borderColor: '#0066CC',
                    color: 'white'
                  } : {
                    borderColor: '#0066CC',
                    color: '#0066CC'
                  }}
                >
                  {category.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Resultados da pesquisa */}
        {searchQuery && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Resultados para "{searchQuery}"
              {selectedStore !== 'all' && (
                <span className="text-sm font-normal text-gray-600 dark:text-gray-400 ml-2">
                  em {availableStores.find(s => s.id === selectedStore)?.name}
                </span>
              )}
            </h2>
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span>
                {allStores.reduce((sum, store) => sum + store.products.length, 0)} produtos encontrados
              </span>
              {apiProducts.length > 0 && selectedStore === 'all' && (
                <Badge variant="secondary" className="text-xs">
                  {apiProducts.length} da Rádio Popular
                </Badge>
              )}
              {!hasApiKey && searchQuery && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => setShowApiConfig(true)}
                  className="text-xs p-0 h-auto"
                >
                  Configurar API para mais resultados
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Informação sobre produtos iniciais */}
        {!searchQuery && (apiProducts.length > 0 || allLoadedProducts.length > 0) && (selectedStore === 'all' || selectedStore === 'radiopopular-api') && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Produtos em Destaque
              {selectedStore === 'radiopopular-api' && (
                <span className="text-sm font-normal text-gray-600 dark:text-gray-400 ml-2">
                  da Rádio Popular
                </span>
              )}
            </h2>
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <Badge variant="secondary" className="text-xs">
                {allLoadedProducts.length} produtos da Rádio Popular
              </Badge>
              <span>Pesquise para encontrar produtos específicos</span>
              {hasMoreProducts && (
                <Badge variant="outline" className="text-xs">
                  Carregamento automático ativo
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Informação sobre filtros ativos */}
        {(activeFilter !== 'all' || selectedStore !== 'all' || selectedCategory !== 'all') && (
          <div className="mb-4 flex flex-wrap gap-2">
            {activeFilter !== 'all' && (
              <Badge variant="outline" className="text-sm">
                Filtro: {filterButtons.find(f => f.key === activeFilter)?.label}
              </Badge>
            )}
            {selectedStore !== 'all' && (
              <Badge 
                variant="outline" 
                className="text-sm"
                style={{ borderColor: availableStores.find(s => s.id === selectedStore)?.color }}
              >
                Loja: {availableStores.find(s => s.id === selectedStore)?.name}
              </Badge>
            )}
            {selectedCategory !== 'all' && selectedStore === 'radiopopular-api' && (
              <Badge variant="outline" className="text-sm" style={{ borderColor: '#0066CC' }}>
                Categoria: {categoryButtons.find(c => c.key === selectedCategory)?.label}
              </Badge>
            )}
          </div>
        )}

        {/* Lista de lojas e produtos */}
        <div className="space-y-8">
          {allStores.map((store, storeIndex) => (
            <StoreItem key={`store-${store.id}-${storeIndex}-${selectedCategory}-${activeFilter}-${Date.now()}`} store={store} />
          ))}
        </div>

        {/* Indicador de carregamento para infinite scroll */}
        {selectedStore === 'radiopopular-api' && hasApiKey && !searchQuery.trim() && hasMoreProducts && (
          <div ref={loadingRef} className="text-center py-8">
            {isLoadingMore ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                <span className="text-gray-600 dark:text-gray-400">Carregando mais produtos...</span>
              </div>
            ) : (
              <div className="text-gray-500 dark:text-gray-500">
                Role para baixo para carregar mais produtos
              </div>
            )}
          </div>
        )}

        {/* Mensagem quando não há mais produtos */}
        {selectedStore === 'radiopopular-api' && hasApiKey && !searchQuery.trim() && !hasMoreProducts && allLoadedProducts.length > 0 && (
          <div className="text-center py-8">
            <div className="text-gray-600 dark:text-gray-400 mb-2">
              ✅ Todos os produtos foram carregados!
            </div>
            <Badge variant="secondary" className="text-sm">
              Total: {allLoadedProducts.length} produtos
            </Badge>
          </div>
        )}

        {/* Mensagem quando não há resultados */}
        {allStores.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
              {searchQuery ? 'Nenhum produto encontrado' : 'Nenhum produto disponível'}
            </h2>
            <p className="text-gray-500 dark:text-gray-500 mb-4">
              {searchQuery 
                ? `Tenta pesquisar por outro termo${selectedStore !== 'all' ? ' ou escolher outra loja' : ' ou alterar o filtro'}` 
                : activeFilter === 'all' 
                  ? selectedStore !== 'all' 
                    ? `Não há produtos disponíveis para ${availableStores.find(s => s.id === selectedStore)?.name}`
                    : 'Configura a API da Rádio Popular para ver produtos reais'
                  : 'Não há produtos para este filtro'
              }
            </p>
            {!hasApiKey && selectedStore === 'all' && (
              <Button
                variant="outline"
                onClick={() => setShowApiConfig(true)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Configurar API da Rádio Popular
              </Button>
            )}
            {selectedStore !== 'all' && (
              <Button
                variant="outline"
                onClick={() => setSelectedStore('all')}
              >
                <StoreIcon className="h-4 w-4 mr-2" />
                Ver Todas as Lojas
              </Button>
            )}
          </div>
        )}

        {/* Loading inicial */}
        {isLoadingMore && allStores.length === 0 && (
          <div className="text-center py-12">
            <Loader2 className="h-16 w-16 text-gray-300 mx-auto mb-4 animate-spin" />
            <h2 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
              Carregando produtos da Rádio Popular...
            </h2>
            <p className="text-gray-500 dark:text-gray-500">
              Aguarde enquanto buscamos os produtos disponíveis
            </p>
          </div>
        )}
      </div>

      {/* Modal de configuração da API */}
      {showApiConfig && (
        <ApiConfig onClose={() => {
          setShowApiConfig(false);
          // Verificar novamente se existe API key após fechar o modal
          const savedApiKey = localStorage.getItem('radiopopular_api_key');
          setHasApiKey(!!savedApiKey);
          // Se há uma pesquisa ativa e agora temos API key, pesquisar novamente
          if (searchQuery.trim() && savedApiKey) {
            searchApiProducts(searchQuery);
          } else if (!searchQuery.trim() && savedApiKey) {
            // Recarregar produtos iniciais se não há pesquisa
            setAllLoadedProducts([]);
            setCurrentPage(1);
            setHasMoreProducts(true);
          }
        }} />
      )}
    </div>
  );
}

export default function Home() {
  return (
    <FavoritesProvider>
      <MainContent />
      <Toaster 
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'white',
            color: 'black',
            border: '1px solid #e5e7eb'
          }
        }}
      />
    </FavoritesProvider>
  );
}