/**
 * LegalDocumentViewer - Generic viewer for legal documents from database
 * Used for Terms, Privacy, Refund policies, etc.
 */

import { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ArrowLeft, FileText, Calendar, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../../utils/supabase/client';

interface LegalDocumentViewerProps {
  documentType: 'faq' | 'terms' | 'privacy' | 'refund' | 'about';
  onNavigate?: (page: string) => void;
}

interface LegalDocument {
  id: string;
  type: string;
  title: string;
  content: string;
  version: number;
  effective_date: string;
  updated_at: string;
}

export function LegalDocumentViewer({ documentType, onNavigate }: LegalDocumentViewerProps) {
  const [document, setDocument] = useState<LegalDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDocument();
  }, [documentType]);

  const fetchDocument = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('legal_documents')
        .select('*')
        .eq('type', documentType)
        .eq('is_published', true)
        .order('version', { ascending: false })
        .limit(1)
        .single();

      if (fetchError) {
        console.error('Error fetching legal document:', fetchError);
        setError('Document not found');
        return;
      }

      setDocument(data);
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('Failed to load document');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1426] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-[#D4AF37] animate-spin mx-auto mb-4" />
          <p className="text-[#8B92A7]">Loading document...</p>
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="min-h-screen bg-[#0B1426] p-4">
        <div className="max-w-4xl mx-auto">
          <Button
            onClick={() => onNavigate?.('profile')}
            variant="ghost"
            className="text-[#8B92A7] hover:text-[#E8EAED] mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Profile
          </Button>

          <Card className="bg-red-500/10 border-red-500">
            <CardContent className="p-12 text-center">
              <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
              <h3 className="text-xl text-red-400 mb-2">Document Not Found</h3>
              <p className="text-red-300 mb-6">{error}</p>
              <Button
                onClick={fetchDocument}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1426]">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={() => onNavigate?.('profile')}
            variant="ghost"
            className="text-[#8B92A7] hover:text-[#E8EAED] mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Profile
          </Button>

          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-[#D4AF37]/20 p-3 rounded-lg">
                <FileText className="h-6 w-6 text-[#D4AF37]" />
              </div>
              <div>
                <h1 className="text-3xl text-[#E8EAED] mb-2">{document.title}</h1>
                <div className="flex items-center gap-4 text-sm text-[#8B92A7]">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Last updated: {new Date(document.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                  <Badge variant="outline" className="border-[#2A3342] text-[#8B92A7]">
                    Version {document.version}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {document.effective_date && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <p className="text-sm text-blue-400">
                This document is effective from{' '}
                {new Date(document.effective_date).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>

        {/* Content */}
        <Card className="bg-[#0F1829] border-[#1A2332]">
          <CardContent className="p-8">
            <div 
              className="prose prose-invert max-w-none"
              style={{
                color: '#E8EAED',
                fontSize: '16px',
                lineHeight: '1.8'
              }}
            >
              {/* Format content with proper spacing */}
              {document.content.split('\n\n').map((paragraph, index) => (
                <p key={index} className="mb-4 text-[#E8EAED] whitespace-pre-wrap">
                  {paragraph}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Footer Actions */}
        <div className="mt-8 flex items-center justify-between">
          <Button
            onClick={() => window.print()}
            variant="outline"
            className="border-[#2A3342] text-[#E8EAED] hover:bg-[#2A3342]"
          >
            Print Document
          </Button>
          <Button
            onClick={() => onNavigate?.('profile')}
            className="bg-[#D4AF37] hover:bg-[#C19B2E] text-[#0B1426]"
          >
            Back to Profile
          </Button>
        </div>

        {/* Support Contact */}
        <Card className="bg-[#0F1829] border-[#1A2332] mt-6">
          <CardContent className="p-6">
            <p className="text-sm text-[#8B92A7] text-center">
              Have questions about this document?{' '}
              <a 
                href="mailto:support@sublimesdrive.com"
                className="text-[#D4AF37] hover:text-[#C19B2E] transition-colors"
              >
                Contact our support team
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
