import React from 'react';
import {
  LayoutDashboard,
  Activity,
  Briefcase,
  FileText,
  Mail,
  History,
  Settings,
  ShieldCheck,
  LogOut,
  Clock,
  X,
  Lock,
} from 'lucide-react';
import type { UserSession } from '../types';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  user: UserSession | null;
  onLogout: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
  counts?: {
    jobs?: number;
    outreach?: number;
    resumes?: number;
    drafts?: number;
    runs?: number;
    events?: number;
    actions?: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  user,
  onLogout,
  mobileOpen = false,
  onCloseMobile,
  counts = {},
}) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, count: counts.actions || 15 },
    { id: 'live', label: 'Live Agent', icon: Activity, count: counts.events || 13, isLive: true },
    { id: 'jobs', label: 'Job Pipeline', icon: Briefcase, count: counts.jobs || 18 },
    { id: 'profile', label: 'Resume & Profile', icon: FileText, count: counts.resumes || 5 },
    { id: 'outreach', label: 'Outreach & Drafts', icon: Mail, count: counts.drafts || 6 },
    { id: 'runs', label: 'Run History', icon: History, count: counts.runs || 2 },
    { id: 'settings', label: 'Settings & Integrations', icon: Settings, count: 6 },
  ];

  const handleSelectTab = (id: string) => {
    onTabChange(id);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`} aria-label="Sidebar Navigation">
        {/* Header Branding */}
        <div className="sidebar-header">
          <div className="brand-icon-box" aria-hidden="true">
            <ShieldCheck size={22} strokeWidth={2.4} />
          </div>

          <div className="brand-text-group">
            <div className="brand-title">CAREER COMMAND</div>
            <div className="brand-sub">Private AI Job Automation</div>
          </div>

          {/* Close button on mobile */}
          {mobileOpen && (
            <button
              onClick={onCloseMobile}
              style={{
                marginLeft: 'auto',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '6px',
              }}
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => handleSelectTab(item.id)}
                title={item.label}
              >
                <div className="nav-item-left">
                  <Icon size={18} strokeWidth={isActive ? 2.4 : 1.9} />
                  <span>{item.label}</span>
                </div>

                {item.count !== undefined && (
                  <span className="nav-count-badge">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Operational Schedule & Guardrail Widget */}
        <div className="sidebar-schedule-box">
          <div className="schedule-header">
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={12} color="var(--accent-orange)" />
              Scheduler Cadence
            </span>
            <span title="Configuration locked">
              <Lock size={11} color="var(--text-muted)" />
            </span>
          </div>

          <div className="schedule-row">
            <span>Schedule:</span>
            <strong>Weekdays 9:00 AM IST</strong>
          </div>

          <div className="schedule-row">
            <span>Timezone:</span>
            <strong>Asia/Kolkata</strong>
          </div>

          <div className="schedule-row">
            <span>Discovery Cap:</span>
            <strong>Max 25 / run</strong>
          </div>

          <div className="sidebar-guardrail-pill">
            <ShieldCheck size={12} color="#15803D" />
            <span>Human Approval: Enforced</span>
          </div>
        </div>

        {/* User Profile Card & Sign Out */}
        <div className="sidebar-footer">
          <div className="user-card">
            <div className="user-avatar" title={user?.name || 'Vikas Thirumanyam'}>VT</div>
            <div className="user-meta">
              <div className="user-name">{user?.name || 'Vikas Thirumanyam'}</div>
              <div className="user-email">{user?.email || 'vikastirumanyam@gmail.com'}</div>
            </div>
          </div>

          <button className="logout-btn" onClick={onLogout} title="Sign Out">
            <LogOut size={13} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
