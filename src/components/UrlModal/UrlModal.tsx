import React, { useState, useCallback, useEffect } from 'react';
import {
  ModalOverlay,
  ModalContainer,
  ModalHeader,
  ModalTitle,
  CloseButton,
  ModalBody,
  UrlInputContainer,
  UrlInput,
  SampleUrlButton,
  ModalFooter,
  LoadButton,
  CancelButton,
  ErrorMessage,
  LoadingSpinner,
} from './UrlModal.styles';

export interface UrlModalProps {
  show: boolean;
  onClose: () => void;
  onLoad: (url: string) => Promise<void>;
  title?: string;
  sampleUrl?: string;
  viewType?: string;
}

export const UrlModal: React.FC<UrlModalProps> = ({
  show,
  onClose,
  onLoad,
  title = 'Load URL',
  sampleUrl,
  viewType,
}) => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (show) {
      setUrl('');
      setError(null);
      setLoading(false);
    }
  }, [show]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await onLoad(url.trim());
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load URL');
    } finally {
      setLoading(false);
    }
  }, [url, onLoad, onClose]);

  const handleClose = useCallback(() => {
    if (!loading) {
      setUrl('');
      setError(null);
      onClose();
    }
  }, [loading, onClose]);

  const handleSampleUrl = useCallback(() => {
    if (sampleUrl) {
      setUrl(sampleUrl);
      setError(null);
    }
  }, [sampleUrl]);

  if (!show) return null;

  return (
    <ModalOverlay onClick={handleClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>{title}</ModalTitle>
          <CloseButton onClick={handleClose} disabled={loading} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </CloseButton>
        </ModalHeader>
        <ModalBody>
          <form onSubmit={handleSubmit}>
            <UrlInputContainer>
              <UrlInput
                type="url"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setError(null);
                }}
                placeholder={viewType?.includes('xml') ? "https://example.com/data.xml" : "https://example.com/data.json"}
                disabled={loading}
                autoFocus
              />
              {sampleUrl && (
                <SampleUrlButton type="button" onClick={handleSampleUrl} disabled={loading} title="Load sample URL">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                  <span>Sample</span>
                </SampleUrlButton>
              )}
            </UrlInputContainer>
            {error && <ErrorMessage>{error}</ErrorMessage>}
            <ModalFooter>
              <CancelButton type="button" onClick={handleClose} disabled={loading}>
                Cancel
              </CancelButton>
              <LoadButton type="submit" disabled={loading || !url.trim()}>
                {loading ? (
                  <>
                    <LoadingSpinner />
                    <span>Loading...</span>
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                    <span>Load</span>
                  </>
                )}
              </LoadButton>
            </ModalFooter>
          </form>
        </ModalBody>
      </ModalContainer>
    </ModalOverlay>
  );
};

