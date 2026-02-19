"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getApiKeys, rotateApiKey } from "../../../lib/api";

interface ApiKeyData {
  id: string;
  key: string;
  subscriptionId: string;
  isActive: boolean;
  createdAt: string;
  subscription: {
    planName: string;
    sport: string;
    biWeeklyQuota: number;
    currentUsage: number;
    expiresAt: string;
  };
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKeyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showKey, setShowKey] = useState<string | null>(null);
  const [rotating, setRotating] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const fetchKeys = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getApiKeys();
      if (data.success) {
        setKeys(data.data);
        console.log("[Keys] Chaves carregadas:", data.data);
      } else {
        setError(data.error || "Erro ao carregar chaves");
      }
    } catch (err: any) {
      setError(err.message || "Erro ao carregar chaves");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleRotate = async (subscriptionId: string) => {
    if (!confirm("Tem certeza? A chave atual será invalidada imediatamente.")) return;

    setRotating(subscriptionId);
    try {
      const data = await rotateApiKey(subscriptionId);
      if (data.success) {
        await fetchKeys();
      } else {
        alert(`Erro: ${data.error}`);
      }
    } catch (err: any) {
      alert(`Erro: ${err.message}`);
    } finally {
      setRotating(null);
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      alert("Erro ao copiar");
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("pt-BR");
  };

  const getDaysRemaining = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div className="p-8 md:p-12 max-w-6xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-20 bg-foreground/5 border border-border" />
          <div className="h-40 bg-foreground/5 border border-border" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 md:p-12 max-w-6xl mx-auto">
        <div className="border border-red-500/30 bg-red-500/5 p-8 text-center">
          <p className="text-lg text-red-500">{error}</p>
          <button
            onClick={fetchKeys}
            className="mt-4 text-base border border-border px-4 py-2 hover:bg-foreground hover:text-background transition-all"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  // Se não houver chaves, mostra mensagem
  if (keys.length === 0) {
    return (
      <div className="p-8 md:p-12 max-w-6xl mx-auto space-y-12">
        <header className="border-b border-border pb-8">
          <span className="text-base uppercase tracking-[0.2em] text-muted-foreground">
            Autenticação
          </span>
          <h1 className="text-3xl font-medium uppercase mt-2 tracking-tight">
            Chaves de API
          </h1>
          <p className="text-base text-muted-foreground mt-4 max-w-2xl">
            Gerencie suas chaves de acesso à API.
          </p>
        </header>

        <div className="border border-border p-12 text-center">
          <p className="text-xl uppercase tracking-tight">Nenhuma Chave Encontrada</p>
          <p className="text-base text-muted-foreground mt-4">
            Não foi possível encontrar chaves de API ativas para sua conta.
          </p>
          <button
            onClick={fetchKeys}
            className="mt-8 text-base uppercase border border-border px-6 py-3 hover:bg-foreground hover:text-background transition-all"
          >
            Recarregar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 md:p-12 max-w-6xl mx-auto space-y-12">
      <header className="border-b border-border pb-8">
        <span className="text-base uppercase tracking-[0.2em] text-muted-foreground">
          Autenticação
        </span>
        <h1 className="text-3xl font-medium uppercase mt-2 tracking-tight">
          Chaves de API
        </h1>
        <p className="text-base text-muted-foreground mt-4 max-w-2xl">
          Estas credenciais permitem acesso aos dados da API. Nunca exponha estas chaves em código client-side ou repositórios públicos.
        </p>
      </header>

      <div className="space-y-6">
        {keys.map((key, index) => {
          const daysRemaining = getDaysRemaining(key.subscription.expiresAt);
          const usagePercent = (key.subscription.currentUsage / key.subscription.biWeeklyQuota) * 100;

          return (
            <motion.div
              key={key.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border border-border bg-background overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 border-b border-border bg-foreground/[0.02] flex items-center justify-between">
                <div>
                  <h3 className="text-xl uppercase tracking-tight">
                    {key.subscription.sport} — {key.subscription.planName}
                  </h3>
                  <p className="text-base text-muted-foreground mt-1">
                    Criada em {formatDate(key.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`text-base ${daysRemaining < 7 ? "text-red-500" : "text-green-500"}`}>
                    {daysRemaining} dias restantes
                  </span>
                </div>
              </div>

              {/* Key Display */}
              <div className="p-6 border-b border-border">
                <label className="text-base uppercase text-muted-foreground tracking-widest">
                  Chave de API
                </label>
                <div className="mt-2 flex gap-2">
                  <div className="flex-1 bg-foreground/[0.03] border border-border p-4 text-base font-mono truncate">
                    {showKey === key.id ? key.key : "•".repeat(40)}
                  </div>
                  <button
                    onClick={() => setShowKey(showKey === key.id ? null : key.id)}
                    className="px-4 border border-border hover:bg-foreground hover:text-background transition-all text-base"
                  >
                    {showKey === key.id ? "Ocultar" : "Mostrar"}
                  </button>
                  <button
                    onClick={() => copyToClipboard(key.key, key.id)}
                    className="px-4 border border-border hover:bg-foreground hover:text-background transition-all text-base"
                  >
                    {copied === key.id ? "Copiado!" : "Copiar"}
                  </button>
                </div>
              </div>

              {/* Usage Stats */}
              <div className="p-6 border-b border-border">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-base uppercase text-muted-foreground">
                    Uso Quinzenal
                  </span>
                  <span className="text-base">
                    {key.subscription.currentUsage.toLocaleString()} / {key.subscription.biWeeklyQuota.toLocaleString()}
                  </span>
                </div>
                <div className="h-3 bg-foreground/10 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(usagePercent, 100)}%` }}
                    className={`h-full ${usagePercent > 90 ? "bg-red-500" : usagePercent > 70 ? "bg-yellow-500" : "bg-green-500"}`}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="p-6 bg-foreground/[0.02] flex justify-between items-center">
                <div className="text-base text-muted-foreground">
                  Status: {key.isActive ? "Ativa" : "Inativa"}
                </div>
                <button
                  onClick={() => handleRotate(key.subscriptionId)}
                  disabled={rotating === key.subscriptionId}
                  className="text-base uppercase text-red-500 border border-red-500/30 px-4 py-2 hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                >
                  {rotating === key.subscriptionId ? "Rotacionando..." : "Rotacionar Chave"}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Security Warning */}
      <div className="p-6 border border-yellow-500/30 bg-yellow-500/5">
        <h4 className="text-base uppercase tracking-widest text-yellow-500">
          Aviso de Segurança
        </h4>
        <p className="text-base text-muted-foreground mt-2 leading-relaxed">
          A rotação invalida imediatamente a chave atual. Todas as requisições usando a chave antiga 
          retornarão erro 403. Somente rotacione se suspeitar de vazamento de credenciais.
        </p>
      </div>
    </div>
  );
}
