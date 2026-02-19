"use client";

const invoices = [
  { id: "INV-88294-01", date: "2026-02-01", amount: "79,00", status: "PAID", method: "PIX_GATEWAY" },
  { id: "INV-88294-02", date: "2026-01-01", amount: "79,00", status: "PAID", method: "CREDIT_CARD" },
];

export default function BillingPage() {
  return (
    <div className="p-8 md:p-12 max-w-6xl mx-auto space-y-16">
      <header className="border-b border-border pb-12">
        <span className="text-sm font-mono font-bold tracking-[0.2em] text-foreground/50 uppercase">FINANCIAL_RECORDS</span>
        <h1 className="font-sans text-3xl font-medium uppercase mt-2 tracking-tight">Billing_&_Subscriptions</h1>
      </header>

      {/* Active Subscription Box */}
      <div className="border border-border p-10 bg-background grid grid-cols-1 md:grid-cols-3 gap-12 items-center shadow-sm">
        <div>
          <span className="text-xs font-mono font-bold text-foreground/40 uppercase tracking-widest">Active_License</span>
          <h3 className="font-sans text-2xl font-medium uppercase mt-2 tracking-tight">Dev_Tier_Subscription</h3>
        </div>
        <div>
          <span className="text-xs font-mono font-bold text-foreground/40 uppercase tracking-widest">Next_Renewal</span>
          <p className="font-mono text-base mt-2 uppercase font-bold text-foreground">March 01, 2026</p>
        </div>
        <div className="flex flex-col gap-2">
          <button className="font-mono text-[10px] font-bold border border-border py-4 uppercase tracking-[0.2em] hover:bg-foreground hover:text-background transition-all">
            UPGRADE_CAPACITY
          </button>
          <button className="font-mono text-[10px] font-bold text-muted-foreground hover:text-red-600 transition-colors uppercase tracking-widest">
            TERMINATE_SUBSCRIPTION
          </button>
        </div>
      </div>

      {/* Invoice Table */}
      <div className="space-y-6">
        <span className="text-xs font-mono font-bold text-foreground/50 uppercase tracking-[0.2em]">TRANSACTION_HISTORY</span>
        <div className="border border-border overflow-hidden bg-background shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-foreground/[0.03] border-b border-border">
                <th className="p-6 font-mono text-xs uppercase tracking-widest text-foreground font-bold">Entry_ID</th>
                <th className="p-6 font-mono text-xs uppercase tracking-widest text-foreground font-bold">Date</th>
                <th className="p-6 font-mono text-xs uppercase tracking-widest text-foreground font-bold">Amount</th>
                <th className="p-6 font-mono text-xs uppercase tracking-widest text-foreground font-bold">Provider</th>
                <th className="p-6 font-mono text-xs uppercase tracking-widest text-foreground font-bold text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-foreground/[0.01] transition-colors">
                  <td className="p-6 font-mono text-sm font-medium">{inv.id}</td>
                  <td className="p-6 font-mono text-sm text-muted-foreground">{inv.date}</td>
                  <td className="p-6 font-mono text-base font-bold text-foreground">R$ {inv.amount}</td>
                  <td className="p-6 font-mono text-xs text-muted-foreground font-bold uppercase">{inv.method}</td>
                  <td className="p-6 text-right">
                    <span className="font-mono text-[10px] font-bold border border-blue-600 text-blue-600 px-3 py-1 uppercase tracking-widest">
                      {inv.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}