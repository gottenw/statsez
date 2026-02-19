"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Key, Copy, RefreshCw, ShieldCheck, Eye, EyeOff, AlertTriangle } from "lucide-react";

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showKey, setShowKey] = useState<string | null>(null);

  useEffect(() => {
    // Simulação de fetch - em produção usaria o x-user-id do auth
    setTimeout(() => {
      setKeys([
        {
          id: "1",
          key: "se_live_a1b2c3d4e5f6g7h8i9j0k1l2",
          subscription: { sport: "football", planName: "Dev" },
          createdAt: "2026-02-18T20:00:00Z",
          isActive: true
        }
      ]);
      setLoading(false);
    }, 800);
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Aqui poderia ter um toast brutalista
  };

  return (
    <div className="p-8 md:p-12 max-w-6xl mx-auto space-y-12">
      <header className="flex justify-between items-end border-b border-border pb-8">
        <div>
          <span className="data-label">SECURITY_MANAGEMENT</span>
          <h1 className="display-text text-4xl uppercase mt-2">API Keys</h1>
          <p className="text-muted-foreground mt-4 max-w-xl">
            Your secret API keys are listed below. Do not share these keys or expose them in client-side code.
          </p>
        </div>
      </header>

      {/* API Key List */}
      <div className="space-y-6">
        {loading ? (
          <div className="h-32 bg-foreground/[0.02] animate-pulse border border-border" />
        ) : (
          keys.map((key) => (
            <div key={key.id} className="border border-border bg-foreground/[0.01] overflow-hidden group">
              <div className="p-8 grid grid-cols-12 gap-8 items-center">
                
                {/* Info */}
                <div className="col-span-12 md:col-span-3">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck size={14} className="text-blue-500" />
                    <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-foreground">
                      {key.subscription.sport} License
                    </span>
                  </div>
                  <h3 className="font-sans text-xl font-medium uppercase tracking-tight">
                    {key.subscription.planName} Key
                  </h3>
                  <p className="font-mono text-[10px] text-muted-foreground mt-1 uppercase">
                    Created: {new Date(key.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Key Area */}
                <div className="col-span-12 md:col-span-6">
                  <div className="relative group/key">
                    <div className="bg-background border border-border p-4 pr-24 font-mono text-sm overflow-hidden truncate select-all">
                      {showKey === key.id ? key.key : "••••••••••••••••••••••••••••••••"}
                    </div>
                    
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                      <button 
                        onClick={() => setShowKey(showKey === key.id ? null : key.id)}
                        className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                        title="Toggle Visibility"
                      >
                        {showKey === key.id ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button 
                        onClick={() => copyToClipboard(key.key)}
                        className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                        title="Copy Key"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="col-span-12 md:col-span-3 flex justify-end gap-4">
                  <button className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-widest border border-border px-6 py-3 hover:bg-red-500 hover:text-white transition-all duration-300">
                    <RefreshCw size={14} />
                    Rotate
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Warning Box */}
      <div className="p-8 border border-border bg-foreground/[0.03] flex gap-6 items-start">
        <div className="p-2 bg-foreground text-background">
          <AlertTriangle size={20} />
        </div>
        <div>
          <span className="data-label text-foreground mb-2 block">BEST_PRACTICES</span>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
            When you rotate a key, the previous one will be deactivated immediately. Ensure your production environments are updated with the new token to avoid service interruption. For maximum security, use different keys for different environments.
          </p>
        </div>
      </div>
    </div>
  );
}
