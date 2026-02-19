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
  const [generating, setGenerating] = useState(false);

  const fetchKeys = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getApiKeys();
      if (data.success) {
        setKeys(data.data);
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

  const handleGenerateKey = async () => {
    setGenerating(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.statsez.com";
      const token = localStorage.getItem("statsez_token");

      const res = await fetch(`${apiUrl}/user/keys/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (data.success) {
        await fetchKeys();
      } else {
        alert(`Erro: ${data.error}`);
      }
    } catch (err: any) {
      alert(`Erro ao gerar chave: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  };

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
      <div className="min-h-screen bg-background">
        <div className="section-padding py-24">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-foreground/5 w-32" />
            <div className="h-16 bg-foreground/5 w-96" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="section-padding py-24 border-b border-border">
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 md:col-span-4">
              <span className="data-label tracking-[0.3em]">API KEYS</span>
            </div>
            <div className="col-span-12 md:col-span-8">
              <h2 className="headline-text">
                Chaves de<br />
                <span className="text-muted">Acesso</span>
              </h2>
            </div>
          </div>
        </div>
        <div className="section-padding py-24">
          <div className="border border-red-500/30 bg-red-500/5 p-12 text-center">
            <p className="font-mono text-lg text-red-500 uppercase tracking-widest">{error}</p>
            <button
              onClick={fetchKeys}
              className="mt-6 font-mono text-xs font-bold uppercase tracking-[0.2em] border border-border px-10 py-5 hover:bg-foreground hover:text-background transition-all"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (keys.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="section-padding py-24 border-b border-border">
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 md:col-span-4">
              <span className="data-label tracking-[0.3em]">API KEYS</span>
            </div>
            <div className="col-span-12 md:col-span-8">
              <h2 className="headline-text">
                Chaves de<br />
                <span className="text-muted">Acesso</span>
              </h2>
            </div>
          </div>
        </div>

        <div className="section-padding py-24">
          <div className="border border-border p-12 text-center">
            <p className="font-sans text-xl font-medium uppercase tracking-tight mb-4">Nenhuma Chave Encontrada</p>
            <p className="font-mono text-sm text-muted-foreground uppercase tracking-widest mb-8">
              Você ainda não possui uma chave de API. Gere uma agora para começar.
            </p>
            <button
              onClick={handleGenerateKey}
              disabled={generating}
              className="font-mono text-xs font-bold uppercase tracking-[0.2em] border border-foreground bg-foreground text-background px-10 py-5 hover:bg-background hover:text-foreground transition-all disabled:opacity-50"
            >
              {generating ? "GERANDO..." : "GERAR MINHA CHAVE API"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="section-padding py-24 border-b border-border">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 md:col-span-4">
            <span className="data-label tracking-[0.3em]">API KEYS</span>
          </div>
          <div className="col-span-12 md:col-span-8">
            <h2 className="headline-text">
              Chaves de<br />
              <span className="text-muted">Acesso</span>
            </h2>
            <p className="font-mono text-sm text-muted-foreground mt-6 uppercase tracking-widest max-w-2xl">
              Estas credenciais permitem acesso aos dados da API. Nunca exponha estas chaves em código client-side ou repositórios públicos.
            </p>
          </div>
        </div>
      </div>

      {/* Keys List */}
      <div className="section-padding py-24 border-b border-border">
        <div className="space-y-8">
          {keys.map((key, index) => {
            const daysRemaining = getDaysRemaining(key.subscription.expiresAt);
            const usagePercent = (key.subscription.currentUsage / key.subscription.biWeeklyQuota) * 100;

            return (
              <motion.div
                key={key.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="border border-border overflow-hidden"
              >
                {/* Key Header */}
                <div className="grid grid-cols-12 gap-8 p-8 border-b border-border bg-foreground/[0.02]">
                  <div className="col-span-12 md:col-span-1">
                    <span className="font-mono text-xl text-muted">
                      0{index + 1}
                    </span>
                  </div>
                  <div className="col-span-12 md:col-span-5">
                    <h3 className="font-sans text-2xl font-medium tracking-tight uppercase">
                      {key.subscription.sport} — {key.subscription.planName}
                    </h3>
                    <p className="font-mono text-sm text-muted-foreground mt-1 uppercase tracking-widest">
                      Criada em {formatDate(key.createdAt)}
                    </p>
                  </div>
                  <div className="col-span-12 md:col-span-3">
                    <span className="data-label text-xs opacity-50">EXPIRA EM</span>
                    <p className={`font-mono text-3xl font-medium tracking-tighter mt-2 ${
                      daysRemaining < 7 ? "text-red-500" : ""
                    }`}>
                      {daysRemaining}
                    </p>
                    <p className="font-mono text-sm text-muted-foreground uppercase tracking-widest">dias</p>
                  </div>
                  <div className="col-span-12 md:col-span-3">
                    <span className="data-label text-xs opacity-50">STATUS</span>
                    <p className={`font-mono text-3xl font-medium tracking-tighter mt-2 ${
                      key.isActive ? "text-green-500" : "text-red-500"
                    }`}>
                      {key.isActive ? "Ativa" : "Inativa"}
                    </p>
                  </div>
                </div>

                {/* Key Display */}
                <div className="p-8 border-b border-border">
                  <span className="data-label text-xs opacity-50 block mb-4">CHAVE DE API</span>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-foreground/[0.02] border border-border p-5 font-mono text-base truncate">
                      {showKey === key.id ? key.key : "•".repeat(40)}
                    </div>
                    <button
                      onClick={() => setShowKey(showKey === key.id ? null : key.id)}
                      className="font-mono text-xs font-bold uppercase tracking-[0.2em] px-6 border border-border hover:bg-foreground hover:text-background transition-all"
                    >
                      {showKey === key.id ? "OCULTAR" : "MOSTRAR"}
                    </button>
                    <button
                      onClick={() => copyToClipboard(key.key, key.id)}
                      className="font-mono text-xs font-bold uppercase tracking-[0.2em] px-6 border border-border hover:bg-foreground hover:text-background transition-all"
                    >
                      {copied === key.id ? "COPIADO!" : "COPIAR"}
                    </button>
                  </div>
                </div>

                {/* Usage */}
                <div className="p-8 border-b border-border">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                      Uso Quinzenal
                    </span>
                    <span className="font-mono text-xs uppercase tracking-widest">
                      {key.subscription.currentUsage.toLocaleString()} / {key.subscription.biWeeklyQuota.toLocaleString()} — {Math.round(usagePercent)}%
                    </span>
                  </div>
                  <div className="h-2 bg-foreground/10 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(usagePercent, 100)}%` }}
                      className={`h-full ${usagePercent > 90 ? "bg-red-500" : usagePercent > 70 ? "bg-yellow-500" : "bg-foreground"}`}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="p-8 bg-foreground/[0.02] flex justify-end">
                  <button
                    onClick={() => handleRotate(key.subscriptionId)}
                    disabled={rotating === key.subscriptionId}
                    className="font-mono text-xs font-bold uppercase tracking-[0.2em] border border-red-500/30 text-red-500 px-10 py-5 hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                  >
                    {rotating === key.subscriptionId ? "ROTACIONANDO..." : "ROTACIONAR CHAVE"}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Security Warning */}
      <div className="section-padding py-16">
        <div className="p-8 border border-yellow-500/30 bg-yellow-500/5">
          <span className="data-label text-xs tracking-[0.3em] text-yellow-500 block mb-4">AVISO DE SEGURANÇA</span>
          <p className="font-mono text-sm text-muted-foreground uppercase tracking-widest leading-relaxed">
            A rotação invalida imediatamente a chave atual. Todas as requisições usando a chave antiga
            retornarão erro 403. Somente rotacione se suspeitar de vazamento de credenciais.
          </p>
        </div>
      </div>
    </div>
  );
}
