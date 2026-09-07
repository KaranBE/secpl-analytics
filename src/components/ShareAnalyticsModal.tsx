import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { 
  Share2, 
  Users, 
  Mail, 
  Copy, 
  Check, 
  ExternalLink, 
  ShieldCheck, 
  AlertCircle, 
  X, 
  FileSpreadsheet, 
  Database, 
  HelpCircle, 
  Send, 
  UserCheck, 
  Plus, 
  Trash2,
  Lock,
  Globe,
  Sparkles,
  ChevronDown,
  ChevronUp,
  CheckCircle2
} from 'lucide-react';
import { 
  COMPRESSOR_SPREADSHEET_ID, 
  DISPENSER_SPREADSHEET_ID,
  DEFAULT_SHEET_OWNER_EMAIL,
  getGoogleSheetShareUrl,
  getPublicSharedAppUrl,
  DEFAULT_SHARED_APP_URL
} from '../services/googleSheets';

interface ShareAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  hasPermissionError?: boolean;
  onSwitchToPreviewMode?: () => void;
  onRetrySync?: () => void;
}

interface TeamMember {
  email: string;
  role: 'Viewer' | 'Editor' | 'Manager';
  addedAt: string;
}

const STORAGE_KEY_TEAM = 'service_ops_shared_team_members';

export const ShareAnalyticsModal: React.FC<ShareAnalyticsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  hasPermissionError = false,
  onSwitchToPreviewMode,
  onRetrySync
}) => {
  const [targetEmail, setTargetEmail] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedInstructions, setCopiedInstructions] = useState(false);
  const [copiedEmailDraft, setCopiedEmailDraft] = useState(false);
  const [copiedMyEmail, setCopiedMyEmail] = useState(false);
  const [inviteStatusMsg, setInviteStatusMsg] = useState<string | null>(null);
  const [showInviteDrawer, setShowInviteDrawer] = useState(false);
  const [activeTab, setActiveTab] = useState<'share' | 'guide' | 'team'>('share');
  
  // Team members list with local persistence
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TEAM);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return [
      { email: DEFAULT_SHEET_OWNER_EMAIL, role: 'Editor', addedAt: 'Sheet Owner' }
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TEAM, JSON.stringify(teamMembers));
    } catch (e) {
      console.warn('Failed to save team members to storage', e);
    }
  }, [teamMembers]);

  if (!isOpen) return null;

  const isOwner = currentUser?.email?.toLowerCase() === DEFAULT_SHEET_OWNER_EMAIL.toLowerCase();
  const compressorShareUrl = getGoogleSheetShareUrl(COMPRESSOR_SPREADSHEET_ID);
  const dispenserShareUrl = getGoogleSheetShareUrl(DISPENSER_SPREADSHEET_ID);
  const publicAppUrl = getPublicSharedAppUrl();

  const getSharingInstructionsText = (emailToShare: string) => {
    const recipient = emailToShare.trim() || '[Colleague Email]';
    const compressorUrl = compressorShareUrl || `https://docs.google.com/spreadsheets/d/${COMPRESSOR_SPREADSHEET_ID}/edit?usp=sharing`;
    const dispenserUrl = dispenserShareUrl || `https://docs.google.com/spreadsheets/d/${DISPENSER_SPREADSHEET_ID}/edit?usp=sharing`;

    return `Service Operations Analytics Dashboard Access:
--------------------------------------------------
To view live incident telemetry for Compressor & Dispenser fleets:

1. Application URL:
${publicAppUrl}

2. Google Sheets owned by: ${DEFAULT_SHEET_OWNER_EMAIL}

Google Sheets to grant 'Viewer' access to (${recipient}):
- Compressor Fleet Sheet:
${compressorUrl}

- Dispenser Fleet Sheet:
${dispenserUrl}

Steps to access:
1. Open the Application URL:
${publicAppUrl}

2. For instant access (Guests & Viewers):
Click "Explore in Preview Mode" on the dashboard to access all analytics directly.

3. For live Google Sheets synchronization:
Grant 'Viewer' permission on both Google Sheets to ${recipient} and click "Sign in with Google".`;
  };

  const getGmailComposeUrl = (emailToShare: string) => {
    const recipient = emailToShare.trim();
    const subject = 'Invitation to Service Operations Analytics Dashboard';
    const body = getSharingInstructionsText(recipient);
    return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(recipient)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const getOutlookComposeUrl = (emailToShare: string) => {
    const recipient = emailToShare.trim();
    const subject = 'Invitation to Service Operations Analytics Dashboard';
    const body = getSharingInstructionsText(recipient);
    return `https://outlook.office.com/mail/deeplink/compose?to=${encodeURIComponent(recipient)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const getMailtoUrl = (emailToShare: string) => {
    const recipient = emailToShare.trim();
    const subject = encodeURIComponent('Invitation to Service Operations Analytics Dashboard');
    const body = encodeURIComponent(getSharingInstructionsText(recipient));
    return `mailto:${encodeURIComponent(recipient)}?subject=${subject}&body=${body}`;
  };

  const handleCopyInstructions = () => {
    const text = getSharingInstructionsText(targetEmail);
    navigator.clipboard.writeText(text).then(() => {
      setCopiedInstructions(true);
      setTimeout(() => setCopiedInstructions(false), 2500);
    });
  };

  const handleCopyDraft = () => {
    const text = getSharingInstructionsText(targetEmail);
    navigator.clipboard.writeText(text).then(() => {
      setCopiedEmailDraft(true);
      setTimeout(() => setCopiedEmailDraft(false), 2500);
    });
  };

  const handleCopyDashboardLink = () => {
    navigator.clipboard.writeText(publicAppUrl).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    });
  };

  const handleCopyMyEmail = () => {
    if (currentUser?.email) {
      navigator.clipboard.writeText(currentUser.email).then(() => {
        setCopiedMyEmail(true);
        setTimeout(() => setCopiedMyEmail(false), 2000);
      });
    }
  };

  const handleSendEmailInvite = () => {
    const email = targetEmail.trim();
    if (!email) return;

    setShowInviteDrawer(true);

    // Auto-add to roster if not already present
    if (email.includes('@') && !teamMembers.some(m => m.email.toLowerCase() === email.toLowerCase())) {
      setTeamMembers(prev => [
        ...prev,
        {
          email,
          role: 'Viewer',
          addedAt: new Date().toLocaleDateString()
        }
      ]);
    }

    // Attempt to open Gmail compose in new tab
    const gmailUrl = getGmailComposeUrl(email);
    try {
      const opened = window.open(gmailUrl, '_blank', 'noopener,noreferrer');
      if (opened) {
        setInviteStatusMsg(`Gmail compose window opened for ${email}!`);
      } else {
        setInviteStatusMsg(`Email prepared for ${email}. Click "Open in Gmail" or your email app below.`);
      }
    } catch {
      setInviteStatusMsg(`Email prepared for ${email}. Click "Open in Gmail" or your email app below.`);
    }

    setTimeout(() => {
      setInviteStatusMsg(null);
    }, 5000);
  };

  const handleAddTeamMember = (e: React.FormEvent) => {
    e.preventDefault();
    const email = targetEmail.trim().toLowerCase();
    if (!email || !email.includes('@')) return;
    if (teamMembers.some(m => m.email.toLowerCase() === email)) {
      setTargetEmail('');
      return;
    }
    setTeamMembers([
      ...teamMembers,
      {
        email,
        role: 'Viewer',
        addedAt: new Date().toLocaleDateString()
      }
    ]);
    setTargetEmail('');
  };

  const handleRemoveTeamMember = (emailToRemove: string) => {
    if (emailToRemove.toLowerCase() === DEFAULT_SHEET_OWNER_EMAIL.toLowerCase()) return;
    setTeamMembers(teamMembers.filter(m => m.email !== emailToRemove));
  };

  return (
    <div 
      id="share-analytics-modal-container"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-modal-title"
    >
      {/* Blurred Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Center Modal Card */}
      <div 
        id="share-analytics-card"
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200/90 z-10 flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Header Bar */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200 shrink-0 mt-0.5">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="share-modal-title" className="text-lg font-bold text-slate-900 tracking-tight">
                  Share Operations Analytics
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  <Users className="w-3 h-3" /> Multi-Account Access
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Grant view access to team members, clients, or executives while maintaining sheet ownership with <span className="font-semibold text-slate-700">{DEFAULT_SHEET_OWNER_EMAIL}</span>.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-6 bg-white gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('share')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'share' 
                ? 'border-indigo-600 text-indigo-600' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Invite & Share</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('guide')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'guide' 
                ? 'border-indigo-600 text-indigo-600' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Google Sheets Permissions Guide</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('team')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'team' 
                ? 'border-indigo-600 text-indigo-600' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Team Roster ({teamMembers.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-700 text-xs">
          
          {/* Permission Notice Banner (if active) */}
          {hasPermissionError && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-3">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold text-sm">Sheet Permission Required for Live Sync</div>
                  <div className="text-xs text-amber-800 leading-relaxed">
                    Signed in as <span className="font-semibold underline">{currentUser?.email || 'this account'}</span>. 
                    The underlying sheets are owned by <span className="font-semibold">{DEFAULT_SHEET_OWNER_EMAIL}</span>. 
                    Google Sheets API requires the owner to grant your email <span className="font-semibold">Viewer</span> access on Google Drive.
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-amber-200/80">
                {currentUser?.email && (
                  <button
                    type="button"
                    onClick={handleCopyMyEmail}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-amber-100/50 text-amber-900 border border-amber-300 font-semibold text-xs shadow-2xs transition-colors cursor-pointer"
                  >
                    {copiedMyEmail ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedMyEmail ? 'Email Copied!' : 'Copy My Email to Send to Owner'}</span>
                  </button>
                )}

                {onSwitchToPreviewMode && (
                  <button
                    type="button"
                    onClick={onSwitchToPreviewMode}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-2xs transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Continue in Read-Only Preview Mode</span>
                  </button>
                )}

                {onRetrySync && (
                  <button
                    type="button"
                    onClick={onRetrySync}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-2xs transition-colors cursor-pointer"
                  >
                    <span>Retry Live Sync</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 1: SHARE & INVITE */}
          {activeTab === 'share' && (
            <div className="space-y-5">
              {/* Account Status Card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm border border-indigo-200 shrink-0">
                    {currentUser?.email ? currentUser.email.slice(0, 2).toUpperCase() : 'G'}
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-500 font-medium">Currently Signed In</div>
                    <div className="text-sm font-bold text-slate-900">{currentUser?.email || 'Not Signed In (Preview Mode)'}</div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                      {isOwner ? (
                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" /> Sheet Owner Account
                        </span>
                      ) : (
                        <span className="text-indigo-600 font-medium flex items-center gap-1">
                          <UserCheck className="w-3.5 h-3.5" /> Invited Viewer / Collaborator
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleCopyDashboardLink}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium text-xs transition-colors cursor-pointer shadow-2xs"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Link Copied!' : 'Copy Public App URL'}</span>
                  </button>
                  <a
                    href={publicAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs transition-colors shadow-2xs"
                    title="Open public app in new tab to test"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open App</span>
                  </a>
                </div>
              </div>

              {/* Public App URL & 403 Prevention Info Card */}
              <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-2.5">
                <div className="flex items-start gap-2 text-xs">
                  <Globe className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div className="space-y-1 w-full">
                    <div className="font-bold text-slate-900 flex items-center justify-between">
                      <span>Public Application URL for Colleagues</span>
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100/70 px-2 py-0.5 rounded-full border border-emerald-200">
                        Publicly Accessible
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 leading-relaxed">
                      Share this URL with your team. <strong className="text-rose-700 font-semibold">Do not copy the address bar if it starts with aistudio.google.com</strong> (that gives Error 403 Forbidden).
                    </div>
                    <div className="p-2.5 rounded-xl bg-amber-100/70 border border-amber-300/80 text-[11px] text-amber-900 leading-relaxed">
                      <strong>Important:</strong> If colleagues see <span className="font-mono text-rose-800 bg-rose-50 px-1 py-0.2 rounded font-semibold">Page not found (404)</span> when opening this link, click the <strong className="underline decoration-indigo-500">Share</strong> button in the top-right corner of Google AI Studio and click <strong>Create link</strong> or <strong>Share app</strong> to activate the public preview.
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <input 
                        type="text" 
                        readOnly 
                        value={publicAppUrl} 
                        className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-mono text-[11px] text-slate-800 select-all"
                        title="Public dashboard URL"
                      />
                      <button
                        type="button"
                        onClick={handleCopyDashboardLink}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer shrink-0"
                      >
                        {copiedLink ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Share with Another Email Box */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800">
                    Share with Colleague, Client, or Manager Email
                  </label>
                  {targetEmail && (
                    <button
                      type="button"
                      onClick={() => setShowInviteDrawer(!showInviteDrawer)}
                      className="text-[11px] text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <span>{showInviteDrawer ? 'Hide Send Options' : 'Show Send Options & Preview'}</span>
                      {showInviteDrawer ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="email"
                    value={targetEmail}
                    onChange={(e) => {
                      setTargetEmail(e.target.value);
                      if (e.target.value && !showInviteDrawer) {
                        setShowInviteDrawer(true);
                      }
                    }}
                    placeholder="e.g. colleague@shahgroup.co or manager@client.com"
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSendEmailInvite}
                      disabled={!targetEmail}
                      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Invite Email</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyInstructions}
                      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                      title="Copy pre-formatted sharing instructions"
                    >
                      {copiedInstructions ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedInstructions ? 'Instructions Copied!' : 'Copy Instructions'}</span>
                    </button>
                  </div>
                </div>

                {/* Status Message Alert */}
                {inviteStatusMsg && (
                  <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 flex items-center justify-between text-xs animate-fadeIn">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-medium">{inviteStatusMsg}</span>
                    </div>
                  </div>
                )}

                {/* Direct Dispatch Options Card (Always available when email entered or drawer opened) */}
                {(showInviteDrawer || targetEmail) && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-indigo-600" />
                        Choose How to Dispatch Invitation
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">Direct One-Click Delivery</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {/* Gmail Web Compose (Direct URL - 100% reliable in browser & iframes) */}
                      <a
                        href={getGmailComposeUrl(targetEmail)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-xl bg-white hover:bg-rose-50/50 border border-slate-200 hover:border-rose-300 text-slate-800 flex flex-col items-center justify-center text-center gap-1 transition-all shadow-2xs group"
                      >
                        <span className="w-6 h-6 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-xs group-hover:scale-105 transition-transform">
                          M
                        </span>
                        <span className="font-bold text-xs text-slate-900 flex items-center gap-1">
                          Open in Gmail <ExternalLink className="w-2.5 h-2.5 text-slate-400 group-hover:text-rose-600" />
                        </span>
                        <span className="text-[10px] text-slate-500">Google Workspace webmail</span>
                      </a>

                      {/* Outlook Web Compose */}
                      <a
                        href={getOutlookComposeUrl(targetEmail)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-xl bg-white hover:bg-blue-50/50 border border-slate-200 hover:border-blue-300 text-slate-800 flex flex-col items-center justify-center text-center gap-1 transition-all shadow-2xs group"
                      >
                        <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs group-hover:scale-105 transition-transform">
                          O
                        </span>
                        <span className="font-bold text-xs text-slate-900 flex items-center gap-1">
                          Open in Outlook <ExternalLink className="w-2.5 h-2.5 text-slate-400 group-hover:text-blue-600" />
                        </span>
                        <span className="text-[10px] text-slate-500">Office 365 / Outlook.com</span>
                      </a>

                      {/* Default Desktop Mail (mailto) */}
                      <a
                        href={getMailtoUrl(targetEmail)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-xl bg-white hover:bg-indigo-50/50 border border-slate-200 hover:border-indigo-300 text-slate-800 flex flex-col items-center justify-center text-center gap-1 transition-all shadow-2xs group"
                      >
                        <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs group-hover:scale-105 transition-transform">
                          <Mail className="w-3.5 h-3.5" />
                        </span>
                        <span className="font-bold text-xs text-slate-900 flex items-center gap-1">
                          System Mail App <ExternalLink className="w-2.5 h-2.5 text-slate-400 group-hover:text-indigo-600" />
                        </span>
                        <span className="text-[10px] text-slate-500">Apple Mail, Outlook, etc.</span>
                      </a>
                    </div>

                    {/* Collapsible Invitation Message Preview */}
                    <div className="pt-2 border-t border-slate-200/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-600">
                          Pre-formatted Invitation Message:
                        </span>
                        <button
                          type="button"
                          onClick={handleCopyDraft}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
                        >
                          {copiedEmailDraft ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedEmailDraft ? 'Copied to Clipboard!' : 'Copy Invitation Message'}</span>
                        </button>
                      </div>

                      <div className="p-3 bg-white border border-slate-200 rounded-xl font-mono text-[10px] text-slate-700 whitespace-pre-wrap leading-relaxed select-all max-h-36 overflow-y-auto">
                        {getSharingInstructionsText(targetEmail)}
                      </div>
                    </div>
                  </div>
                )}

                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Sends or copies direct links to both spreadsheets along with instructions to sign in and view real-time fleet analytics.
                </p>
              </div>

              {/* Dual Spreadsheet Quick Links (for Sheet Owner) */}
              <div className="space-y-2.5 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-xs">
                    Direct Google Sheets (Owned by {DEFAULT_SHEET_OWNER_EMAIL})
                  </span>
                  <span className="text-[11px] text-slate-400">Click to open & grant Viewer access</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Compressor Sheet */}
                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2 hover:border-indigo-300 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                        <Database className="w-3.5 h-3.5 text-indigo-600" />
                        Compressor Fleet Sheet
                      </span>
                      <span className="text-[10px] font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">
                        Primary Data
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono break-all">
                      ID: {COMPRESSOR_SPREADSHEET_ID.slice(0, 16)}...
                    </div>
                    <a
                      href={compressorShareUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs transition-colors"
                    >
                      <span>Open & Share in Google Drive</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {/* Dispenser Sheet */}
                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2 hover:border-emerald-300 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                        <Database className="w-3.5 h-3.5 text-emerald-600" />
                        Dispenser Fleet Sheet
                      </span>
                      <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                        Primary Data
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono break-all">
                      ID: {DISPENSER_SPREADSHEET_ID.slice(0, 16)}...
                    </div>
                    <a
                      href={dispenserShareUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-xs transition-colors"
                    >
                      <span>Open & Share in Google Drive</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STEP-BY-STEP PERMISSION GUIDE */}
          {activeTab === 'guide' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-indigo-950 space-y-2">
                <div className="font-bold text-xs flex items-center gap-1.5 text-indigo-900">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  How Google Workspace Access Architecture Works
                </div>
                <p className="text-[11px] leading-relaxed text-indigo-800">
                  Because Google Drive spreadsheets are privately stored under <span className="font-semibold">{DEFAULT_SHEET_OWNER_EMAIL}</span>, Google requires explicit read authorization before another email address can query them via the API.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-slate-900 text-xs">Choose Your Preferred Sharing Method:</h3>

                {/* Option A */}
                <div className="p-3.5 rounded-2xl border border-slate-200 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-xs flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">1</span>
                      Option A: Share with Specific Email (Recommended for Security)
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Private & Secure
                    </span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-slate-600 pl-1">
                    <li>As <span className="font-medium">{DEFAULT_SHEET_OWNER_EMAIL}</span>, open both sheets in Google Drive.</li>
                    <li>Click the blue <span className="font-semibold">Share</span> button in the upper right.</li>
                    <li>Type the colleague or client's email address and set their role to <span className="font-semibold">Viewer</span>.</li>
                    <li>Uncheck "Notify people" if desired, then click <span className="font-semibold">Done</span>.</li>
                    <li>The recipient can now sign in with their Google account on this dashboard to stream live telemetry.</li>
                  </ol>
                </div>

                {/* Option B */}
                <div className="p-3.5 rounded-2xl border border-slate-200 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-xs flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">2</span>
                      Option B: Enable Link Sharing (Zero Maintenance)
                    </span>
                    <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                      Easiest for Teams
                    </span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-slate-600 pl-1">
                    <li>Open both sheets as the owner.</li>
                    <li>In the <span className="font-semibold">Share</span> window, look for <span className="font-semibold">General access</span>.</li>
                    <li>Change from "Restricted" to <span className="font-semibold">"Anyone with the link" &rarr; "Viewer"</span>.</li>
                    <li>Now any authorized user signed in to this app can immediately synchronize live data without individual approvals.</li>
                  </ol>
                </div>

                {/* Option C */}
                <div className="p-3.5 rounded-2xl border border-slate-200 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-xs flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-700 text-white flex items-center justify-center text-[10px] font-bold">3</span>
                      Option C: Read-Only Preview Mode
                    </span>
                    <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                      No Login Needed
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed pl-1">
                    Stakeholders who do not have a Google account or Google Sheets access can still examine the entire dashboard, filter by engineer, zone, and date, and review charts using the pre-loaded baseline fleet data.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TEAM ROSTER */}
          {activeTab === 'team' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-xs">
                  Authorized Team Accounts & Collaborators
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  {teamMembers.length} member{teamMembers.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Add email to roster form */}
              <form onSubmit={handleAddTeamMember} className="flex gap-2">
                <input
                  type="email"
                  value={targetEmail}
                  onChange={(e) => setTargetEmail(e.target.value)}
                  placeholder="Add team member email..."
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
                <button
                  type="submit"
                  disabled={!targetEmail}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-semibold text-xs shadow-2xs transition-colors cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add to Roster</span>
                </button>
              </form>

              {/* Roster list */}
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
                {teamMembers.map((member) => (
                  <div key={member.email} className="p-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center border border-indigo-100">
                        {member.email.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                          <span>{member.email}</span>
                          {member.email.toLowerCase() === DEFAULT_SHEET_OWNER_EMAIL.toLowerCase() && (
                            <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-sm">
                              OWNER
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Role: {member.role} &bull; {member.addedAt}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={getGmailComposeUrl(member.email)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors inline-flex items-center justify-center"
                        title={`Open Gmail invite compose for ${member.email}`}
                      >
                        <Mail className="w-3.5 h-3.5" />
                      </a>

                      {member.email.toLowerCase() !== DEFAULT_SHEET_OWNER_EMAIL.toLowerCase() && (
                        <button
                          type="button"
                          onClick={() => handleRemoveTeamMember(member.email)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Remove from roster"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-500 text-[11px]">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Google Workspace OAuth 2.0 Access Control</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
