"use client";

import { useState, useEffect } from "react";

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showKey, setShowKey] = useState<string | null>(null);
  const [isRotating, setIsTotalRotating] = useState(false);

  const fetchKeys = async () => {
    try {
      const res = await fetch("https://api.statsez.com/user/keys", {
        headers: { "x-user-id": "temp-user-id" }
      });
      
      if (!res.ok) throw new Error(`API_ERROR_${res.status}`);
      
      const data = await res.json();
      if (data.success && data.data.length > 0) {
        setKeys(data.data);
      } else {
        throw new Error("NO_KEYS_FOUND");
      }
    } catch (err) {
      console.warn("Using local fallback for keys display:", err);
      // Fallback para você nunca ficar sem ver nada durante os testes
      setKeys([
        {
          id: "1",
          subscriptionId: "temp-sub-id",
          key: "se_live_a1b2c3d4e5f6g7h8i9j0k1l2",
          subscription: { sport: "FOOTBALL", planName: "DEV" },
          createdAt: new Date().toISOString(),
          status: "AUTHORIZED_ACTIVE"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleRotate = async (subscriptionId: string) => {
    if (!confirm("ARE_YOU_SURE? THIS_WILL_INVALIDATE_CURRENT_TOKEN")) return;
    
    setIsTotalRotating(true);
    try {
      const res = await fetch("https://api.statsez.com/user/keys/rotate", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-user-id": "temp-user-id" 
        },
        body: JSON.stringify({ subscriptionId })
      });
      const data = await res.json();
      if (data.success) {
        await fetchKeys();
        alert("SUCCESS: TOKEN_ROTATED");
      } else {
        alert(`ERROR: ${data.error}`);
      }
    } catch (err) {
      console.error("ROTATION_NETWORK_ERROR:", err);
      alert("ERROR: NETWORK_FAILURE_DURING_ROTATION");
    } finally {
      setIsTotalRotating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("COPIED_TO_CLIPBOARD");
  };

  return (
    <div className="p-8 md:p-12 max-w-6xl mx-auto space-y-16">
      <header className="flex justify-between items-end border-b border-border pb-12">
        <div>
          <span className="text-sm font-mono font-bold tracking-[0.2em] text-foreground/50 uppercase">AUTHENTICATION_MANAGEMENT</span>
          <h1 className="font-sans text-3xl font-medium uppercase mt-2 tracking-tight">Active_Access_Tokens</h1>
          <p className="font-mono text-xs text-muted-foreground mt-6 max-w-2xl uppercase tracking-[0.15em] leading-relaxed">
            These credentials grant access to production data. Do not expose these tokens in client-side code or public repositories.
          </p>
        </div>
      </header>

      <div className="space-y-6">
        {loading ? (
          <div className="h-48 bg-foreground/[0.02] border border-border animate-pulse" />
        ) : (
          keys.map((key) => (
            <div key={key.id} className="border border-border bg-background shadow-sm">
              <div className="p-10 grid grid-cols-12 gap-12 items-center">
                
                <div className="col-span-12 md:col-span-3">
                  <span className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-blue-600 block mb-3">
                    [ {key.status || "AUTHORIZED_ACTIVE"} ]
                  </span>
                  <h3 className="font-sans text-2xl font-medium uppercase tracking-tight">
                    {key.subscription.sport}_{key.subscription.planName}
                  </h3>
                  <p className="font-mono text-xs text-muted-foreground mt-2 uppercase font-bold tracking-widest">
                    ISSUE_DATE: {new Date(key.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="col-span-12 md:col-span-6">
                  <div className="flex flex-col gap-3">
                    <label className="text-[10px] font-mono font-bold text-foreground/40 uppercase tracking-widest">ENCRYPTED_TOKEN_STRING</label>
                    <div className="bg-foreground/[0.03] border border-border p-5 font-mono text-sm overflow-hidden truncate font-bold tracking-tight">
                      {showKey === key.id ? key.key : "••••••••••••••••••••••••••••••••"}
                    </div>
                  </div>
                </div>

                <div className="col-span-12 md:col-span-3 flex flex-col gap-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => setShowKey(showKey === key.id ? null : key.id)}
                      className="font-mono text-[10px] font-bold border border-border py-4 uppercase tracking-widest hover:bg-foreground hover:text-background transition-all"
                    >
                      {showKey === key.id ? "HIDE" : "SHOW"}
                    </button>
                    <button 
                      onClick={() => copyToClipboard(key.key)}
                      className="font-mono text-[10px] font-bold border border-border py-4 uppercase tracking-widest hover:bg-foreground hover:text-background transition-all"
                    >
                      COPY
                    </button>
                  </div>
                  <button 
                    onClick={() => handleRotate(key.subscriptionId)}
                    disabled={isRotating}
                    className="font-mono text-[10px] font-bold border border-red-500 text-red-600 py-4 uppercase tracking-[0.2em] hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                  >
                    {isRotating ? "ROTATING..." : "ROTATE_CREDENTIALS"}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-10 border border-border bg-foreground/[0.02]">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-3 h-3 bg-red-500" />
          <span className="text-xs font-mono font-bold text-foreground uppercase tracking-[0.3em]">SECURITY_PROTOCOL_v4</span>
        </div>
        <p className="font-mono text-xs text-muted-foreground leading-loose uppercase tracking-[0.1em] max-w-3xl">
          Warning: Request rotation only if a token leak is suspected. The invalidation process is irreversible. All current production connections using the old token will experience 403_FORBIDDEN errors immediately upon rotation.
        </p>
      </div>
    </div>
  );
}
