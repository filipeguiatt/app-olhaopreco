import { Product } from '@/types';

// Configuração da API da Rádio Popular baseada na documentação do Postman
const API_BASE_URL = 'https://api.prefixbox.com/search/results/';
const API_BTR = '3c44f0a9-a1d1-4265-a853-53a0ad9ccbae';
const API_KEY = 'b6a0f0a5ef1d4f5f9ad67abe65bf14c3'; // Chave fixa conforme solicitado

// Interface para a resposta da API
interface RadioPopularApiResponse {
  documents?: Array<{
    id?: string;
    title?: string;
    name?: string;
    price?: number;
    originalPrice?: number;
    discount?: number;
    image?: string;
    imageUrl?: string;
    url?: string;
    [key: string]: any;
  }>;
  results?: Array<{
    id?: string;
    title?: string;
    name?: string;
    price?: number;
    originalPrice?: number;
    discount?: number;
    image?: string;
    imageUrl?: string;
    url?: string;
    [key: string]: any;
  }>;
  products?: Array<{
    id?: string;
    title?: string;
    name?: string;
    price?: number;
    originalPrice?: number;
    discount?: number;
    image?: string;
    imageUrl?: string;
    url?: string;
    [key: string]: any;
  }>;
  [key: string]: any;
}

// Função para converter valor para número válido
function safeParseFloat(value: any): number {
  if (value === null || value === undefined || value === '') {
    return 0;
  }
  
  const parsed = parseFloat(value.toString());
  return isNaN(parsed) ? 0 : parsed;
}

// Função para limpar o nome do produto removendo indicadores de desconto
function cleanProductName(productName: string): string {
  if (!productName) return 'Produto sem nome';
  
  // Remover formato "--15%%" da Rádio Popular
  let cleanName = productName.replace(/--\d+%%/g, '').trim();
  
  // Remover outros formatos de desconto
  cleanName = cleanName.replace(/-\d+%/g, '').trim();
  cleanName = cleanName.replace(/\d+%\s*desconto/gi, '').trim();
  
  // Remover espaços duplos
  cleanName = cleanName.replace(/\s+/g, ' ').trim();
  
  return cleanName || 'Produto sem nome';
}

// Função para buscar produtos na API da Rádio Popular com paginação
export async function searchRadioPopularProducts(
  searchTerm: string = '',
  apiKey?: string,
  page: number = 1,
  top: number = 12
): Promise<Product[]> {
  try {
    // Construir URL da API conforme documentação do Postman
    const params = new URLSearchParams({
      btr: API_BTR,
      filter: '',
      orderby: '',
      top: top.toString(),
      page: page.toString(),
      useMerchandising: 'true'
    });

    // Só adicionar pattern se houver termo de pesquisa
    if (searchTerm.trim()) {
      params.append('pattern', searchTerm.trim());
    }

    const url = `${API_BASE_URL}?${params.toString()}`;
    
    console.log('Fazendo chamada à API da Rádio Popular:', url);

    // Preparar headers conforme documentação do Postman
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Connection': 'keep-alive', // Conforme solicitado
      'Ocp-Apim-Subscription-Key': API_KEY // Chave APENAS como header
    };

    console.log('Headers enviados:', headers);

    // Fazer a requisição com os headers corretos
    const response = await fetch(url, {
      method: 'GET',
      headers,
      mode: 'cors',
    });

    console.log('Status da resposta:', response.status);
    console.log('Headers da resposta:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro na API da Rádio Popular:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
        url: url,
        headers: headers
      });
      
      // Retornar erro mais específico baseado no status
      if (response.status === 401) {
        throw new Error('API key inválida ou não autorizada');
      } else if (response.status === 403) {
        throw new Error('Acesso negado - verifique a API key');
      } else if (response.status === 429) {
        throw new Error('Limite de requisições excedido');
      } else if (response.status === 404) {
        throw new Error('Endpoint da API não encontrado');
      } else {
        throw new Error(`Erro na API: ${response.status} - ${response.statusText}`);
      }
    }

    const data: RadioPopularApiResponse = await response.json();
    console.log('Resposta da API da Rádio Popular:', data);

    // CORREÇÃO: Verificar primeiro o array 'documents' onde estão os produtos
    let products = data.documents || data.results || data.products || [];
    
    // Se ainda não encontrou, tentar outras propriedades possíveis
    if (!products || products.length === 0) {
      const possibleKeys = ['items', 'data', 'searchResults', 'hits', 'content'];
      for (const key of possibleKeys) {
        if (data[key] && Array.isArray(data[key])) {
          products = data[key];
          break;
        }
      }
    }

    console.log(`Produtos encontrados: ${products.length}`);
    
    if (!products || products.length === 0) {
      console.log('Nenhum produto encontrado na resposta da API');
      console.log('Estrutura completa da resposta:', JSON.stringify(data, null, 2));
      return [];
    }
    
    console.log('Processando produtos encontrados:', products);
    
    return products.map((item, index) => {
      // Acessar os dados corretos conforme estrutura fornecida: item.document.*
      const productData = item.document || item;
      
      // Nome original do produto
      const originalName = productData.displayText || productData.title || productData.name || 'Produto sem nome';
      
      // Nome limpo (sem indicadores de desconto)
      const cleanName = cleanProductName(originalName);

      // CORREÇÃO CRÍTICA: Usar safeParseFloat para evitar NaN
      const currentPrice = safeParseFloat(productData.priceValue || productData.price);
      const originalPriceFromApi = safeParseFloat(productData.oldPriceValue);
      const discountFromApi = safeParseFloat(productData.discount);
      
      // Usar APENAS o desconto que vem da API
      let finalDiscount = discountFromApi > 0 ? discountFromApi : undefined;
      
      // Se não tem desconto mas tem preços diferentes, calcular
      if (!finalDiscount && originalPriceFromApi > 0 && currentPrice > 0 && originalPriceFromApi > currentPrice) {
        finalDiscount = Math.round(((originalPriceFromApi - currentPrice) / originalPriceFromApi) * 100);
      }
      
      // Calcular preço original se temos desconto mas não temos preço original
      let originalPrice = originalPriceFromApi > 0 ? originalPriceFromApi : undefined;
      
      if (finalDiscount && finalDiscount > 0 && !originalPrice && currentPrice > 0) {
        originalPrice = Math.round((currentPrice / (1 - finalDiscount / 100)) * 100) / 100;
      }
      
      const product: Product = {
        id: productData.id || item.id || `rp-${searchTerm || 'initial'}-${index}`,
        name: cleanName,
        price: currentPrice > 0 ? currentPrice : 0,
        originalPrice: originalPrice && originalPrice > 0 ? originalPrice : undefined,
        discount: finalDiscount && finalDiscount > 0 ? finalDiscount : undefined,
        imageUrl: productData.imageUrl || productData.image || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop',
        url: productData.url || item.url
      };
      
      console.log('Produto processado:', {
        originalName,
        cleanName,
        currentPrice: product.price,
        originalPrice: product.originalPrice,
        discount: product.discount,
        hasPromotion: !!(product.discount && product.discount > 0)
      });
      
      return product;
    });

  } catch (error) {
    console.error('Erro ao buscar produtos na Rádio Popular:', error);
    
    // Re-lançar erros específicos da API
    if (error instanceof Error && (
      error.message.includes('API key') || 
      error.message.includes('Erro na API') ||
      error.message.includes('Acesso negado') ||
      error.message.includes('não encontrado')
    )) {
      throw error;
    }
    
    // Para outros erros de rede, etc.
    throw new Error('Erro de conexão com a API da Rádio Popular');
  }
}

// Função para carregar todas as páginas de produtos da Rádio Popular
export async function loadAllRadioPopularProducts(
  searchTerm: string = '',
  apiKey?: string,
  categories?: string[]
): Promise<{
  allProducts: Product[];
  pages: Product[][];
  totalPages: number;
}> {
  try {
    console.log('Carregando todas as páginas da Rádio Popular...');
    
    const pages: Product[][] = [];
    let currentPage = 1;
    const productsPerPage = 100; // Conforme especificado pelo usuário
    
    // CORREÇÃO: Carregar todas as páginas até atingir 29158 produtos
    // Estimativa: ~292 páginas com 100 produtos cada
    const maxPages = 300; // Limite de segurança
    let totalProductsLoaded = 0;
    
    while (currentPage <= maxPages && totalProductsLoaded < 29158) {
      console.log(`Carregando página ${currentPage}...`);
      
      const pageProducts = await searchRadioPopularProducts(
        searchTerm, 
        apiKey, 
        currentPage, 
        productsPerPage
      );
      
      if (pageProducts.length === 0) {
        console.log(`Página ${currentPage} vazia, parando...`);
        break;
      }
      
      // Filtrar por categorias se especificado
      let filteredProducts = pageProducts;
      if (categories && categories.length > 0) {
        filteredProducts = pageProducts.filter(product => {
          const productName = product.name.toLowerCase();
          return categories.some(category => {
            switch (category) {
              case 'Foto e Vídeo':
                return productName.includes('camera') || 
                       productName.includes('foto') || 
                       productName.includes('video') ||
                       productName.includes('lens') ||
                       productName.includes('tripé');
              case 'Lazer, Desporto e Outdoor':
                return productName.includes('desporto') || 
                       productName.includes('outdoor') || 
                       productName.includes('fitness') ||
                       productName.includes('bicicleta') ||
                       productName.includes('camping');
              case 'Gaming':
                return productName.includes('gaming') || 
                       productName.includes('game') || 
                       productName.includes('console') ||
                       productName.includes('playstation') ||
                       productName.includes('xbox');
              default:
                return true;
            }
          });
        });
      }
      
      pages.push(filteredProducts);
      totalProductsLoaded += filteredProducts.length;
      console.log(`Página ${currentPage}: ${filteredProducts.length} produtos (Total: ${totalProductsLoaded})`);
      
      currentPage++;
    }
    
    // Combinar todos os produtos
    const allProducts = pages.flat();
    
    console.log(`Total carregado: ${allProducts.length} produtos em ${pages.length} páginas`);
    
    return {
      allProducts,
      pages,
      totalPages: pages.length
    };
    
  } catch (error) {
    console.error('Erro ao carregar todas as páginas:', error);
    return {
      allProducts: [],
      pages: [],
      totalPages: 0
    };
  }
}

// Função para carregar produtos iniciais (sem termo de pesquisa)
export async function loadInitialProducts(
  apiKey?: string,
  top: number = 20
): Promise<Product[]> {
  try {
    console.log('Carregando produtos iniciais da Rádio Popular...');
    return await searchRadioPopularProducts('', apiKey, 1, top);
  } catch (error) {
    console.error('Erro ao carregar produtos iniciais:', error);
    return [];
  }
}

// Função para testar a conexão com a API
export async function testRadioPopularApi(apiKey?: string): Promise<boolean> {
  try {
    console.log('Testando API da Rádio Popular...');
    const testProducts = await searchRadioPopularProducts('smartphone', apiKey, 1, 1);
    const isValid = testProducts.length > 0;
    console.log('Resultado do teste da API:', isValid ? 'Sucesso' : 'Falhou');
    return isValid;
  } catch (error) {
    console.error('Erro ao testar API da Rádio Popular:', error);
    return false;
  }
}

// Função para validar formato da API key
export function validateApiKeyFormat(apiKey: string): boolean {
  if (!apiKey || typeof apiKey !== 'string') {
    return false;
  }
  
  // Remover espaços em branco
  const cleanKey = apiKey.trim();
  
  // Verificar se não está vazia
  if (cleanKey.length === 0) {
    return false;
  }
  
  // API keys geralmente têm pelo menos 10 caracteres
  if (cleanKey.length < 10) {
    return false;
  }
  
  return true;
}