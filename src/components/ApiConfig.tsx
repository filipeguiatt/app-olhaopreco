"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings, Key, CheckCircle, XCircle, Loader2, AlertTriangle, ExternalLink } from 'lucide-react';
import { testRadioPopularApi, validateApiKeyFormat } from '@/services/radioPopularApi';
import { toast } from 'sonner';

interface ApiConfigProps {
  onClose: () => void;
}

export function ApiConfig({ onClose }: ApiConfigProps) {
  const [apiKey, setApiKey] = useState('');
  const [isTestingApi, setIsTestingApi] = useState(false);
  const [apiStatus, setApiStatus] = useState<'unknown' | 'valid' | 'invalid' | 'error'>('unknown');
  const [errorMessage, setErrorMessage] = useState('');

  // Carregar API key salva
  useEffect(() => {
    const savedApiKey = localStorage.getItem('radiopopular_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
      testApi(savedApiKey);
    }
  }, []);

  const testApi = async (keyToTest?: string) => {
    const testKey = keyToTest || apiKey;
    if (!testKey.trim()) {
      setApiStatus('unknown');
      setErrorMessage('');
      return;
    }

    // Validar formato da API key primeiro
    if (!validateApiKeyFormat(testKey)) {
      setApiStatus('invalid');
      setErrorMessage('Formato da API key inválido');
      toast.error('Formato da API key inválido');
      return;
    }

    setIsTestingApi(true);
    setErrorMessage('');
    
    try {
      const isValid = await testRadioPopularApi(testKey);
      
      if (isValid) {
        setApiStatus('valid');
        setErrorMessage('');
        toast.success('API key válida! Conexão estabelecida com sucesso.');
      } else {
        setApiStatus('invalid');
        setErrorMessage('API key inválida ou sem resultados');
        toast.error('API key inválida ou não retornou resultados.');
      }
    } catch (error) {
      setApiStatus('error');
      const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
      setErrorMessage(errorMsg);
      
      if (errorMsg.includes('API key')) {
        toast.error(`Erro de autenticação: ${errorMsg}`);
      } else if (errorMsg.includes('CORS')) {
        toast.error('Erro de CORS - a API pode não permitir requisições do browser');
      } else {
        toast.error(`Erro ao testar a API: ${errorMsg}`);
      }
    } finally {
      setIsTestingApi(false);
    }
  };

  const saveApiKey = () => {
    if (apiKey.trim()) {
      if (!validateApiKeyFormat(apiKey)) {
        toast.error('Formato da API key inválido');
        return;
      }
      
      localStorage.setItem('radiopopular_api_key', apiKey.trim());
      toast.success('API key guardada com sucesso!');
      testApi(apiKey.trim());
    } else {
      localStorage.removeItem('radiopopular_api_key');
      setApiStatus('unknown');
      setErrorMessage('');
      toast.success('API key removida.');
    }
  };

  const getStatusBadge = () => {
    switch (apiStatus) {
      case 'valid':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Válida
          </Badge>
        );
      case 'invalid':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Inválida
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="destructive">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Erro
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <Key className="h-3 w-3 mr-1" />
            Não testada
          </Badge>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuração da API
          </CardTitle>
          <CardDescription>
            Configure a sua API key da Rádio Popular para aceder aos produtos reais
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apikey">API Key da Rádio Popular</Label>
            <Input
              id="apikey"
              type="password"
              placeholder="Insira a sua API key..."
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setApiStatus('unknown');
                setErrorMessage('');
              }}
            />
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Status: {getStatusBadge()}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => testApi()}
                disabled={!apiKey.trim() || isTestingApi}
              >
                {isTestingApi ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    A testar...
                  </>
                ) : (
                  'Testar API'
                )}
              </Button>
            </div>
            
            {errorMessage && (
              <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg text-sm">
                <p className="text-red-800 dark:text-red-200">
                  <strong>Erro:</strong> {errorMessage}
                </p>
              </div>
            )}
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-sm space-y-2">
            <p className="text-blue-800 dark:text-blue-200">
              <strong>Como obter a API key:</strong>
            </p>
            <ol className="text-blue-700 dark:text-blue-300 list-decimal list-inside space-y-1 text-xs">
              <li>Aceda à documentação da API da Rádio Popular</li>
              <li>Registe-se ou faça login na plataforma</li>
              <li>Obtenha a sua API key pessoal</li>
              <li>Cole a key no campo acima</li>
            </ol>
            <div className="pt-2">
              <a
                href="https://www.postman.com/radiopopular-2023/radiopopular-workspace/request/pqfbdpb/searchengine-api"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline text-xs"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Ver documentação no Postman
              </a>
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg text-sm">
            <p className="text-amber-800 dark:text-amber-200">
              <strong>Nota:</strong> A API key é opcional. Sem ela, a aplicação funcionará apenas com dados de exemplo.
            </p>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={saveApiKey} className="flex-1">
              Guardar
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1">
              Fechar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}