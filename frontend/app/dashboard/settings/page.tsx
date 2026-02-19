"use client";

import { useState } from "react";

export default function SettingsPage() {
  const [name, setName] = useState("Usuario");
  const [email, setEmail] = useState("usuario@statsez.com");

  return (
    <div className="p-8 md:p-12 max-w-6xl mx-auto space-y-16">
      <header className="border-b border-border pb-12">
        <span className="text-sm font-mono font-bold tracking-[0.2em] text-foreground/50 uppercase">
          PREFERÊNCIAS
        </span>
        <h1 className="font-sans text-3xl font-medium uppercase mt-2 tracking-tight">
          Configurações
        </h1>
      </header>

      <div className="grid grid-cols-12 gap-16">
        {/* Profile Settings */}
        <div className="col-span-12 lg:col-span-7 space-y-12">
          <section className="space-y-8">
            <span className="text-xs font-mono font-bold text-foreground/40 uppercase tracking-widest block">
              01_PERFIL_DO_USUÁRIO
            </span>
            
            <div className="space-y-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-mono font-bold text-foreground/60 uppercase tracking-widest">
                  Nome de Exibição
                </label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-background border border-border p-5 font-mono text-base focus:border-foreground outline-none transition-all"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-mono font-bold text-foreground/60 uppercase tracking-widest">
                  E-mail
                </label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background border border-border p-5 font-mono text-base focus:border-foreground outline-none transition-all"
                />
              </div>
            </div>

            <button className="font-mono text-base font-bold bg-foreground text-background px-10 py-5 uppercase tracking-[0.2em] hover:bg-foreground/90 transition-all">
              Salvar Alterações
            </button>
          </section>

          <section className="space-y-8 pt-8 border-t border-border">
            <span className="text-xs font-mono font-bold text-foreground/40 uppercase tracking-widest block">
              02_SEGURANÇA
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button className="border border-border p-6 text-left hover:bg-foreground/[0.02] transition-all group">
                <p className="font-mono text-base font-bold text-foreground mb-2 tracking-widest uppercase">
                  Atualizar Senha
                </p>
                <p className="text-base text-muted-foreground leading-relaxed">
                  Altere suas credenciais de acesso atuais.
                </p>
              </button>
              <button className="border border-border p-6 text-left hover:bg-foreground/[0.02] transition-all group">
                <p className="font-mono text-base font-bold text-foreground mb-2 tracking-widest uppercase">
                  Autenticação em Dois Fatores
                </p>
                <p className="text-base text-muted-foreground leading-relaxed text-blue-600">
                  Desativada [Ativar]
                </p>
              </button>
            </div>
          </section>
        </div>

        {/* Account Info Sidebar */}
        <div className="col-span-12 lg:col-span-5 space-y-8">
          <div className="p-10 border border-border bg-foreground/[0.01] space-y-10">
            <span className="text-xs font-mono font-bold text-foreground/40 uppercase tracking-widest block">
              DADOS_DA_CONTA
            </span>
            
            <div className="space-y-6">
              <div>
                <p className="text-sm font-mono text-muted-foreground uppercase tracking-widest">
                  ID do Cliente
                </p>
                <p className="font-mono text-base font-bold text-foreground mt-1">
                  UID_88294_PRD
                </p>
              </div>
              <div>
                <p className="text-sm font-mono text-muted-foreground uppercase tracking-widest">
                  Data de Criação
                </p>
                <p className="font-mono text-base font-bold text-foreground mt-1">
                  18 Fev 2026
                </p>
              </div>
              <div>
                <p className="text-sm font-mono text-muted-foreground uppercase tracking-widest">
                  Região
                </p>
                <p className="font-mono text-base font-bold text-foreground mt-1">
                  Brasil [SA-EAST-1]
                </p>
              </div>
            </div>
          </div>

          <div className="p-10 border border-red-500/30 bg-red-500/[0.02] space-y-6">
            <span className="text-xs font-mono font-bold text-red-600 uppercase tracking-widest block">
              ZONA_DE_PERIGO
            </span>
            <p className="text-base text-muted-foreground leading-loose">
              Excluir permanentemente sua conta e todos os dados associados. Esta ação é irreversível.
            </p>
            <button className="font-mono text-base font-bold border border-red-500 text-red-600 px-8 py-4 uppercase tracking-[0.2em] hover:bg-red-500 hover:text-white transition-all">
              Excluir Conta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
