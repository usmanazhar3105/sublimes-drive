import { LegalDocumentViewer } from './LegalDocumentViewer';

interface TermsPageProps {
  onNavigate?: (page: string) => void;
}

export function TermsPage({ onNavigate }: TermsPageProps) {
  return <LegalDocumentViewer documentType="terms" onNavigate={onNavigate} />;
}
