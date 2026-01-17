import { LegalDocumentViewer } from './LegalDocumentViewer';

interface RefundPageProps {
  onNavigate?: (page: string) => void;
}

export function RefundPage({ onNavigate }: RefundPageProps) {
  return <LegalDocumentViewer documentType="refund" onNavigate={onNavigate} />;
}
