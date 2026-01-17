// This functionality has been moved to RepairBidPage.tsx wallet tab
// Redirecting users to use the integrated wallet in RepairBidPage

interface BidWalletPageProps {
  onNavigate?: (page: string, data?: any) => void;
}

export function BidWalletPage({ onNavigate }: BidWalletPageProps = {}) {
  // Redirect to repair bid page with wallet tab
  if (onNavigate) {
    onNavigate('repair-bid');
  }
  
  return (
    <div className="p-6 bg-[var(--sublimes-dark-bg)] min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-[var(--sublimes-light-text)] mb-4">
          Wallet Moved
        </h1>
        <p className="text-gray-400 mb-6">
          Wallet functionality has been integrated into the Repair Bid page.
        </p>
        <button
          onClick={() => onNavigate?.('repair-bid')}
          className="px-6 py-3 bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)] rounded-lg hover:bg-[var(--sublimes-gold)]/90"
        >
          Go to Repair Bid → Wallet Tab
        </button>
      </div>
    </div>
  );
}