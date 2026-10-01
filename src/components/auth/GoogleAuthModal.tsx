import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../../context/AuthContext';
import type { TotpSecret } from '../../lib/firebase';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { setupGoogleAuthenticator, verifyAndEnrollGoogleAuth, authMode } =
    useAuth();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [secretKey, setSecretKey] = useState<string>('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [secretObj, setSecretObj] = useState<TotpSecret | undefined>(undefined);
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setError(null);
      setVerificationCode('');
      setLoading(true);

      setupGoogleAuthenticator()
        .then((res) => {
          setSecretKey(res.secretKey);
          setQrCodeUrl(res.qrCodeUrl);
          setSecretObj(res.secretObj);
        })
        .catch((err) => {
          setError(
            err instanceof Error
              ? err.message
              : 'Failed to initialize Google Authenticator setup.',
          );
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen, setupGoogleAuthenticator]);

  if (!isOpen) return null;

  const handleCopyKey = () => {
    if (secretKey) {
      navigator.clipboard.writeText(secretKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await verifyAndEnrollGoogleAuth(secretObj, secretKey, verificationCode);
      setStep(3);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Invalid code. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  const formatKey = (key: string) => {
    return key.replace(/(.{4})/g, '$1 ').trim();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="card w-full max-w-md p-6 bg-bg-card border-border/80 shadow-2xl relative space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-subtle pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-accent-bg border border-accent/30 flex items-center justify-center text-accent">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                <line x1="12" y1="18" x2="12.01" y2="18" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">
                Google Authenticator 2FA
              </h2>
              <p className="text-xs text-text-secondary">
                Two-Factor Authentication Setup
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary p-1 rounded-md transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between text-xs text-text-muted px-2">
          <span className={`font-medium ${step >= 1 ? 'text-accent' : ''}`}>
            1. Scan QR Code
          </span>
          <span className="text-border">•</span>
          <span className={`font-medium ${step >= 2 ? 'text-accent' : ''}`}>
            2. Verify Code
          </span>
          <span className="text-border">•</span>
          <span className={`font-medium ${step === 3 ? 'text-safe' : ''}`}>
            3. Enabled
          </span>
        </div>

        {error && (
          <div className="p-3 rounded-md bg-danger-bg border border-danger/30 text-danger-light text-xs animate-fade-in">
            {error}
          </div>
        )}

        {authMode === 'demo' && (
          <div className="p-2.5 rounded-md bg-warn-bg/40 border border-warn/30 text-warn-light text-[11px]">
            Demo Mode Active — simulated Google Authenticator pairing. Any 6-digit code will verify.
          </div>
        )}

        {/* Step 1 & 2 content */}
        {step < 3 && (
          <div className="space-y-4">
            {loading && !secretKey ? (
              <div className="py-12 text-center text-text-muted text-sm animate-pulse">
                Generating Google Authenticator key…
              </div>
            ) : (
              <>
                <div className="p-4 rounded-xl bg-white flex flex-col items-center justify-center space-y-2 mx-auto w-fit shadow-md">
                  {qrCodeUrl ? (
                    <QRCodeSVG
                      value={qrCodeUrl}
                      size={170}
                      level="M"
                      includeMargin={false}
                    />
                  ) : (
                    <div className="w-40 h-40 bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                      Loading QR...
                    </div>
                  )}
                </div>

                <div className="space-y-1 text-center">
                  <p className="text-xs text-text-muted">
                    Scan with Google Authenticator or enter key manually:
                  </p>
                  <div className="flex items-center justify-center gap-2 pt-1">
                    <code className="px-3 py-1.5 rounded bg-bg-tertiary border border-border mono text-sm text-accent font-semibold tracking-wider">
                      {formatKey(secretKey || '—')}
                    </code>
                    <button
                      type="button"
                      onClick={handleCopyKey}
                      className="px-2.5 py-1.5 rounded text-xs bg-bg-secondary hover:bg-bg-tertiary border border-border text-text-secondary transition-colors"
                      title="Copy Key"
                    >
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>

                <form onSubmit={handleVerify} className="space-y-3 pt-2">
                  <div className="space-y-1.5">
                    <label className="label-sm text-center block">
                      Enter 6-Digit Google Authenticator Code
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      required
                      placeholder="000000"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      className="input-field text-center mono text-lg tracking-[0.4em] font-semibold"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="w-1/3 btn-secondary text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading || verificationCode.length !== 6}
                      className="w-2/3 btn-primary text-sm disabled:opacity-50"
                    >
                      {loading ? 'Verifying…' : 'Verify & Enable'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        )}

        {/* Step 3: Success */}
        {step === 3 && (
          <div className="py-6 text-center space-y-4 animate-fade-in">
            <div className="w-14 h-14 rounded-full bg-safe-bg border border-safe/40 text-safe mx-auto flex items-center justify-center shadow-glow-safe">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-text-primary">
                Google Authenticator Enabled!
              </h3>
              <p className="text-xs text-text-secondary max-w-xs mx-auto">
                Your account is now protected with Two-Factor Authentication.
                You will be prompted for your code during future logins.
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-full btn-primary mt-2"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoogleAuthModal;
