import { useStore } from "../context/StoreContext";

const PartyDetailsModal = ({ party, close }) => {
  const { transactions, returns } = useStore();

  const partyTransactions = transactions.filter(
    (t) => t.partyId === party.id
  );

  const partyReturns = returns.filter(
    (r) => r.transactionId && partyTransactions.some((t) => t.id === r.transactionId)
  );

  return (
    <div className="fixed inset-0 bg-[#1A3021]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
        
        {/* HEADER: IDENTITY */}
        <div className="p-8 border-b border-slate-100 flex justify-between items-start bg-[#FBFDFA]">
          <div>
            <span className="text-[#2D6A4F] font-semibold tracking-[0.2em] text-[9px] uppercase">
              Counterparty Profile
            </span>
            <h2 className="text-3xl font-serif italic text-[#1A3021] mt-1">
              {party.name}
            </h2>
            <p className="text-[10px] font-mono text-slate-400 mt-2 uppercase tracking-widest">
              Entity Type: {party.type}
            </p>
          </div>
          <button 
            onClick={close}
            className="text-slate-300 hover:text-red-500 transition-colors p-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 bg-white custom-scrollbar">
          {/* BALANCE SECTION */}
          <section className="mb-10">
            <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400 block mb-3">Financial Standing</span>
            <div className={`p-6 border ${
              party.balance > 0 ? "bg-red-50/30 border-red-100" : "bg-emerald-50/30 border-emerald-100"
            }`}>
              <h3 className="text-2xl font-serif italic text-slate-900">
                ₹{Math.abs(party.balance).toLocaleString()}
              </h3>
              <p className="text-[9px] font-bold uppercase tracking-widest mt-1 opacity-70">
                {party.balance > 0 ? "Outstanding Receivable" : "Account Payable"}
              </p>
            </div>
          </section>

          {/* ACTIVITY LEDGER */}
          <section className="mb-10">
            <h4 className="text-[10px] uppercase tracking-[0.2em] text-[#2D6A4F] font-bold mb-4 border-b border-slate-50 pb-2">
              Transaction History
            </h4>
            <div className="space-y-4">
              {partyTransactions.length === 0 ? (
                <p className="text-xs italic text-slate-300">No transactions recorded.</p>
              ) : (
                partyTransactions.map((t) => (
                  <div key={t.id} className="flex justify-between items-center group py-2">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 block uppercase">
                        {new Date(t.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                      <span className="text-xs font-bold uppercase tracking-tight text-slate-700">
                        {t.type} Settlement
                      </span>
                    </div>
                    <span className="font-serif italic text-slate-900">
                      ₹{t.total.toLocaleString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* RETURNS RECONCILIATION */}
          {partyReturns.length > 0 && (
            <section>
              <h4 className="text-[10px] uppercase tracking-[0.2em] text-red-800 font-bold mb-4 border-b border-red-50 pb-2">
                Reversals & Returns
              </h4>
              <div className="space-y-3">
                {partyReturns.map((r) => (
                  <div key={r.id} className="bg-red-50/20 p-3 flex justify-between items-center border-l-2 border-red-200">
                    <span className="text-[10px] uppercase text-red-900 font-medium">Refund Disbursed</span>
                    <span className="text-sm font-serif italic text-red-900">₹{r.refundAmount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-6 border-t border-slate-100 bg-[#FBFDFA] flex justify-end">
          <button
            onClick={close}
            className="px-10 py-3 bg-[#1A3021] text-white text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#2D6A4F] transition-all"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};

export default PartyDetailsModal;