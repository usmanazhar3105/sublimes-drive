import { LegalDocumentViewer } from './LegalDocumentViewer';

interface AboutPageProps {
  onNavigate?: (page: string) => void;
}

export function AboutPage({ onNavigate }: AboutPageProps) {
  return <LegalDocumentViewer documentType="about" onNavigate={onNavigate} />;
}
