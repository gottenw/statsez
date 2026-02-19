"use client";

import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight, Key, Globe, Terminal } from "lucide-react";

export default function WelcomePage() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("payment_id");

  return (
    <div className="p-8 md:p-16 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-full">
            <CheckCircle2 size={32} />
          </div>
          <div>
            <span className="data-label text-blue-500">PAYMENT_SUCCESSFUL</span>
            <h1 className="display-text text-4xl leading-none uppercase">Welcome to Statsez</h1>
          </div>
        </div>

        {paymentId && (
          <div className="p-6 border border-border bg-foreground/[0.02] mb-16 flex justify-between items-center">
            <div>
              <span className="data-label opacity-50">TRANSACTION_ID</span>
              <p className="font-mono text-sm mt-1">{paymentId}</p>
            </div>
            <div className="text-right">
              <span className="data-label opacity-50">LICENSE_STATUS</span>
              <p className="font-mono text-sm mt-1 text-blue-500 uppercase font-bold">Activating_Provisioning</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <StepCard 
            index="01"
            title="Generate API Key"
            desc="Create your first secure token to start making requests to our servers."
            icon={Key}
            href="/dashboard/keys"
          />
          <StepCard 
            index="02"
            title="Read Documentation"
            desc="Explore our extensive library of historical football data endpoints."
            icon={Globe}
            href="/docs"
          />
          <StepCard 
            index="03"
            title="Launch Project"
            desc="Connect your application using our RESTful JSON interface."
            icon={Terminal}
            href="/dashboard/explorer"
          />
        </div>

        <div className="mt-24 border-t border-border pt-12 flex flex-col md:flex-row justify-between gap-8">
          <div className="max-w-md">
            <h3 className="font-sans text-xl font-medium uppercase mb-4 tracking-tight">Technical Support</h3>
            <p className="text-muted-foreground leading-relaxed">
              Our engineering team is ready to help you scale. If you have any issues with your provisioning, reach out to dev@statsez.com.
            </p>
          </div>
          <a 
            href="/dashboard"
            className="self-start md:self-end font-mono text-[10px] font-bold uppercase tracking-[0.2em] bg-foreground text-background px-10 py-5 hover:bg-foreground/90 transition-all duration-300 flex items-center gap-3"
          >
            Go to Console <ArrowRight size={14} />
          </a>
        </div>
      </motion.div>
    </div>
  );
}

function StepCard({ index, title, desc, icon: Icon, href }: any) {
  return (
    <a href={href} className="group p-8 border border-border hover:border-foreground transition-all duration-500 bg-background relative overflow-hidden">
      <span className="font-mono text-4xl font-light text-muted group-hover:text-foreground transition-colors duration-500">
        {index}
      </span>
      <div className="mt-8 mb-4 flex items-center justify-between">
        <h3 className="font-sans text-lg font-medium uppercase tracking-tight">{title}</h3>
        <Icon size={20} className="text-muted-foreground group-hover:text-foreground transition-colors" />
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {desc}
      </p>
      <div className="absolute bottom-0 left-0 h-1 bg-foreground w-0 group-hover:w-full transition-all duration-700" />
    </a>
  );
}
