"use client";

import { useState, useEffect } from "react";
import { getUserInfo } from "../../../lib/api";

export default function SettingsPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getUserInfo();
        if (data.success) {
          setName(data.data.name || "");
          setEmail(data.data.email || "");
          setUserId(data.data.id || "");
          setCreatedAt(
            data.data.createdAt
              ? new Date(data.data.createdAt).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : ""
          );
        }
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="section-padding py-24 border-b border-border">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 md:col-span-4">
            <span className="data-label tracking-[0.3em]">SETTINGS</span>
          </div>
          <div className="col-span-12 md:col-span-8">
            <h2 className="headline-text">
              Configurações<br />
              <span className="text-muted">da Conta</span>
            </h2>
          </div>
        </div>
      </div>

      {/* Profile Section */}
      <div className="section-padding py-24 border-b border-border">
        <div className="grid grid-cols-12 gap-8 mb-16">
          <div className="col-span-12 md:col-span-4">
            <span className="data-label tracking-[0.3em]">PERFIL</span>
          </div>
          <div className="col-span-12 md:col-span-8">
            <h3 className="font-sans text-2xl font-medium uppercase tracking-tight">
              Dados do Usuário
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-8 space-y-8">
            <div className="space-y-3">
              <span className="data-label text-xs opacity-50">NOME DE EXIBIÇÃO</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-background border border-border p-5 font-mono text-base focus:border-foreground outline-none transition-all"
              />
            </div>

            <div className="space-y-3">
              <span className="data-label text-xs opacity-50">E-MAIL</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-background border border-border p-5 font-mono text-base focus:border-foreground outline-none transition-all"
              />
            </div>

            <button className="font-mono text-xs font-bold uppercase tracking-[0.2em] border border-foreground bg-foreground text-background px-10 py-5 hover:bg-background hover:text-foreground transition-all">
              SALVAR ALTERAÇÕES
            </button>
          </div>

          <div className="col-span-12 lg:col-span-4">
            <div className="border border-border bg-foreground/[0.01] p-8 space-y-8">
              <span className="data-label text-xs opacity-50 block">DADOS DA CONTA</span>

              <div className="space-y-6">
                <div>
                  <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest block mb-1">
                    ID do Cliente
                  </span>
                  <span className="font-mono text-sm font-medium text-foreground break-all">
                    {userId || "—"}
                  </span>
                </div>
                <div>
                  <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest block mb-1">
                    Data de Criação
                  </span>
                  <span className="font-mono text-sm font-medium text-foreground">
                    {createdAt || "—"}
                  </span>
                </div>
                <div>
                  <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest block mb-1">
                    Região
                  </span>
                  <span className="font-mono text-sm font-medium text-foreground">
                    Brasil [SA-EAST-1]
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Section */}
      <div className="section-padding py-24 border-b border-border">
        <div className="grid grid-cols-12 gap-8 mb-16">
          <div className="col-span-12 md:col-span-4">
            <span className="data-label tracking-[0.3em]">SEGURANÇA</span>
          </div>
          <div className="col-span-12 md:col-span-8">
            <h3 className="font-sans text-2xl font-medium uppercase tracking-tight">
              Proteção da Conta
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border">
          <div className="p-8 bg-background group hover:bg-foreground/[0.02] transition-colors cursor-default">
            <span className="data-label text-xs opacity-50 block mb-6">SENHA</span>
            <span className="font-sans text-lg uppercase block mb-2 tracking-tight">
              Atualizar Senha
            </span>
            <span className="font-mono text-sm text-muted-foreground uppercase tracking-widest">
              Altere suas credenciais de acesso atuais
            </span>
          </div>
          <div className="p-8 bg-background group hover:bg-foreground/[0.02] transition-colors cursor-default">
            <span className="data-label text-xs opacity-50 block mb-6">2FA</span>
            <span className="font-sans text-lg uppercase block mb-2 tracking-tight">
              Autenticação em Dois Fatores
            </span>
            <span className="font-mono text-sm text-muted-foreground uppercase tracking-widest">
              Desativada
            </span>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="section-padding py-16">
        <div className="p-8 border border-red-500/30 bg-red-500/[0.02]">
          <span className="data-label text-xs tracking-[0.3em] text-red-500 block mb-4">ZONA DE PERIGO</span>
          <p className="font-mono text-sm text-muted-foreground uppercase tracking-widest leading-relaxed mb-6">
            Excluir permanentemente sua conta e todos os dados associados. Esta ação é irreversível.
          </p>
          <button className="font-mono text-xs font-bold uppercase tracking-[0.2em] border border-red-500/30 text-red-500 px-10 py-5 hover:bg-red-500 hover:text-white transition-all">
            EXCLUIR CONTA
          </button>
        </div>
      </div>
    </div>
  );
}
