import { LegalDocumentViewer } from './LegalDocumentViewer';

interface PrivacyPageProps {
  onNavigate?: (page: string) => void;
}

export function PrivacyPage({ onNavigate }: PrivacyPageProps) {
  return <LegalDocumentViewer documentType="privacy" onNavigate={onNavigate} />;
}
