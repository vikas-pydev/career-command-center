import React, { useState } from 'react';
import { Lock, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';
import type { UserSession } from '../types';

interface LoginModalProps {
  onSuccess: (user: UserSession, token: string) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('vikastirumanyam@gmail.com');
  const [password, setPassword] = useState('VikasAI2026!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Invalid credentials');
      }

      onSuccess(data.user, data.token);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      style={{
        backgroundColor: 'var(--bg-app)',
        backdropFilter: 'none',
      }}
    >
      <div
        className="section-card"
        style={{
          width: '100%',
          maxWidth: '420px',
          padding: '32px 28px',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--bg-surface)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--accent-orange-subtle)',
              color: 'var(--accent-orange)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px',
              border: '1px solid var(--accent-orange-border)',
            }}
          >
            <ShieldCheck size={26} strokeWidth={2.2} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Career Command Center
          </h2>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Private AI Job Search & Telemetry Supervision
          </div>
        </div>

        {error && (
          <div
            style={{
              padding: '12px 14px',
              backgroundColor: 'var(--danger-bg)',
              color: 'var(--danger-text)',
              border: '1px solid var(--danger-border)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.84rem',
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <AlertCircle size={16} color="var(--danger)" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Authorized Candidate Email</label>
            <input
              type="email"
              required
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vikastirumanyam@gmail.com"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Private Access Passphrase</label>
            <input
              type="password"
              required
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', marginTop: '8px', minHeight: '44px', fontSize: '0.92rem' }}
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Access Command Center</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div
          style={{
            marginTop: '24px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-subtle)',
            fontSize: '0.76rem',
            color: 'var(--text-muted)',
            textAlign: 'center',
            lineHeight: 1.4,
          }}
        >
          <Lock size={12} style={{ display: 'inline', marginRight: '4px' }} />
          Local Host Single-Tenant Security • Master Tracker Synchronization
        </div>
      </div>
    </div>
  );
};
