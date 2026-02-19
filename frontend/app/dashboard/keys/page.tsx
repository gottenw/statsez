"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getApiKeys, rotateApiKey } from "../../../lib/api";
import { Eye, EyeOff, Copy, RefreshCw, AlertTriangle, Check, Key } from "lucide-react";

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
      } else {
        setError(data.error || "Failed to load keys");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load keys");
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
      alert("Falha ao copiar");
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
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="font-mono text-red-500">{error}</p>
          <button
            onClick={fetchKeys}
            className="mt-4 font-mono text-xs uppercase border border-border px-4 py-2 hover:bg-foreground hover:text-background transition-all"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  if (keys.length === 0) {
    return (
      <div className="p-8 md:p-12 max-w-6xl mx-auto">
        <div className="border border-border p-12 text-center">
          <Key className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-sans text-xl uppercase tracking-tight">Nenhuma Chave Ativa</h3>
          <p className="font-mono text-xs text-muted-foreground mt-2">
            Assine um plano para obter sua API key
          </p>
          <a
            href="/dashboard/billing"
            className="inline-block mt-6 font-mono text-xs uppercase border border-border px-6 py-3 hover:bg-foreground hover:text-background transition-all"
          >
            Ver Planos
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 md:p-12 max-w-6xl mx-auto space-y-12">
      <header className="border-b border-border pb-8">
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Authentication
        </span>
        <h1 className="font-sans text-3xl font-medium uppercase mt-2 tracking-tight">
          API Keys
        </h1>
        <p className="font-mono text-xs text-muted-foreground mt-4 max-w-2xl">
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
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-foreground text-background flex items-center justify-center">
                    <Key size={20} />
                  </div>
                  <div>
                    <h3 className="font-sans text-lg uppercase tracking-tight">
                      {key.subscription.sport} — {key.subscription.planName}
                    </h3>
                    <p className="font-mono text-[10px] text-muted-foreground uppercase">
                      Criada em {formatDate(key.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`font-mono text-xs uppercase ${daysRemaining < 7 ? "text-red-500" : "text-green-500"}`}>
                    {daysRemaining} dias restantes
                  </span>
                </div>
              </div>

              {/* Key Display */}
              <div className="p-6 border-b border-border">
                <label className="font-mono text-[10px] uppercase text-muted-foreground tracking-widest">
                  API Key
                </label>
                <div className="mt-2 flex gap-2">
                  <div className="flex-1 bg-foreground/[0.03] border border-border p-4 font-mono text-sm truncate">
                    {showKey === key.id ? key.key : "•".repeat(40)}
                  </div>
                  <button
                    onClick={() => setShowKey(showKey === key.id ? null : key.id)}
                    className="px-4 border border-border hover:bg-foreground hover:text-background transition-all"
                  >
                    {showKey === key.id ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  <button
                    onClick={() => copyToClipboard(key.key, key.id)}
                    className="px-4 border border-border hover:bg-foreground hover:text-background transition-all"
                  >
                    {copied === key.id ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                  </button>
                </div>
              </div>

              {/* Usage Stats */}
              <div className="p-6 border-b border-border">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-mono text-xs uppercase text-muted-foreground">
                    Uso Quinzenal
                  </span>
                  <span className="font-mono text-xs">
                    {key.subscription.currentUsage.toLocaleString()} / {key.subscription.biWeeklyQuota.toLocaleString()}
                  </span>
                </div>
                <div className="h-2 bg-foreground/10 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(usagePercent, 100)}%` }}
                    className={`h-full ${usagePercent > 90 ? "bg-red-500" : usagePercent > 70 ? "bg-yellow-500" : "bg-green-500"}`}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="p-6 bg-foreground/[0.02] flex justify-between items-center">
                <div className="font-mono text-[10px] text-muted-foreground">
                  Status: {key.isActive ? "Ativa" : "Inativa"}
                </div>
                <button
                  onClick={() => handleRotate(key.subscriptionId)}
                  disabled={rotating === key.subscriptionId}
                  className="flex items-center gap-2 font-mono text-xs uppercase text-red-500 border border-red-500/30 px-4 py-2 hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                >
                  <RefreshCw size={14} className={rotating === key.subscriptionId ? "animate-spin" : ""} />
                  {rotating === key.subscriptionId ? "Rotacionando..." : "Rotacionar"}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Security Warning */}
      <div className="p-6 border border-yellow-500/30 bg-yellow-500/5">
        <div className="flex items-start gap-4">
          <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-mono text-xs uppercase tracking-widest text-yellow-500">
              Aviso de Segurança
            </h4>
            <p className="font-mono text-xs text-muted-foreground mt-2 leading-relaxed">
              A rotação invalida imediatamente a chave atual. Todas as requisições usando a chave antiga 
              retornarão erro 403. Somente rotacione se suspeitar de vazamento de credenciais.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
