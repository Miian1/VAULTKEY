
import React, { useState, useEffect, useCallback } from 'react';
import { AppView, VaultEntry, VaultSettings, EncryptedData } from './types';
import { CryptoService } from './services/cryptoService';
import { VaultService } from './services/vaultService';
import CyberButton from './components/CyberButton';
import CyberInput from './components/CyberInput';

// --- Shared Components ---

const Navbar: React.FC<{ 
  onLogout: () => void;
  onNavigate: (view: AppView) => void;
  currentView: AppView;
  isOnline: boolean;
}> = ({ onLogout, onNavigate, currentView, isOnline }) => (
  <nav className="fixed top-0 left-0 right-0 h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md z-40 px-6 flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded bg-sky-600 flex items-center justify-center shadow-[0_0_10px_rgba(56,189,248,0.5)]">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
      </div>
      <div className="flex flex-col">
        <h1 className="text-xl font-bold tracking-tighter text-white cyber-glow leading-none">VAULTKEY</h1>
        {!isOnline && <span className="text-[8px] text-amber-500 mono uppercase tracking-tighter">Offline Mode</span>}
      </div>
    </div>
    <div className="flex items-center gap-2">
      <button 
        onClick={() => onNavigate(AppView.DASHBOARD)}
        className={`p-2 rounded-md transition-colors ${currentView === AppView.DASHBOARD ? 'text-sky-400 bg-sky-400/10' : 'text-slate-400 hover:text-white'}`}
        title="Vault"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
      </button>
      <button 
        onClick={() => onNavigate(AppView.GENERATOR)}
        className={`p-2 rounded-md transition-colors ${currentView === AppView.GENERATOR ? 'text-sky-400 bg-sky-400/10' : 'text-slate-400 hover:text-white'}`}
        title="Password Generator"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
      </button>
      <button 
        onClick={() => onNavigate(AppView.SETTINGS)}
        className={`p-2 rounded-md transition-colors ${currentView === AppView.SETTINGS ? 'text-sky-400 bg-sky-400/10' : 'text-slate-400 hover:text-white'}`}
        title="Settings"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
      </button>
      <div className="w-px h-6 bg-slate-800 mx-2"></div>
      <button 
        onClick={onLogout}
        className="p-2 rounded-md text-rose-400 hover:bg-rose-400/10 transition-colors"
        title="Lock Vault"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>
      </button>
    </div>
  </nav>
);

// --- Main App ---

export default function App() {
  const [view, setView] = useState<AppView>(AppView.SPLASH);
  const [masterPassword, setMasterPassword] = useState('');
  const [vault, setVault] = useState<VaultEntry[]>([]);
  const [settings, setSettings] = useState<VaultSettings>(VaultService.getSettings());
  const [isLocked, setIsLocked] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showEntryModal, setShowEntryModal] = useState<{ isOpen: boolean, entry?: VaultEntry }>({ isOpen: false });
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [needsFirstRunInternet, setNeedsFirstRunInternet] = useState(false);

  // --- Helpers ---

  const notify = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const syncToDisk = async (newVault: VaultEntry[], passwordToUse?: string) => {
    const pwd = passwordToUse || masterPassword;
    if (!pwd) return;
    try {
      const encrypted = await CryptoService.encrypt(JSON.stringify(newVault), pwd);
      VaultService.saveEncryptedVault(encrypted);
    } catch (err) {
      notify('Failed to save data', 'error');
    }
  };

  const handleLogout = useCallback(() => {
    setMasterPassword('');
    setVault([]);
    setIsLocked(true);
    setView(AppView.UNLOCK);
  }, []);

  // --- Effects ---

  // Check for connectivity
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // If we've just come online and were waiting for internet, clear the requirement
      if (needsFirstRunInternet) {
        localStorage.setItem('vaultkey_styles_ready', 'true');
        setNeedsFirstRunInternet(false);
      }
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check for "Offline First Time"
    const isStylesCached = localStorage.getItem('vaultkey_styles_ready') === 'true';
    if (!navigator.onLine && !isStylesCached) {
      setNeedsFirstRunInternet(true);
    } else if (navigator.onLine) {
      localStorage.setItem('vaultkey_styles_ready', 'true');
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [needsFirstRunInternet]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (VaultService.isInitialized()) {
        setView(AppView.UNLOCK);
      } else {
        setView(AppView.SETUP);
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isLocked) return;
    const interval = setInterval(() => {
      const now = Date.now();
      if (now - lastActivity > settings.autoLockTimer * 60 * 1000) {
        handleLogout();
        notify('Auto-locked due to inactivity', 'info');
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [isLocked, lastActivity, settings.autoLockTimer, handleLogout]);

  useEffect(() => {
    const updateActivity = () => setLastActivity(Date.now());
    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('keydown', updateActivity);
    window.addEventListener('touchstart', updateActivity);
    return () => {
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      window.removeEventListener('touchstart', updateActivity);
    };
  }, []);

  // --- Handlers ---

  const handleSetupVault = async (pwd: string) => {
    if (pwd.length < 8) {
      notify('Master password must be at least 8 characters', 'error');
      return;
    }
    try {
      const hash = await CryptoService.hashMasterPassword(pwd);
      VaultService.saveMasterHash(hash);
      const encrypted = await CryptoService.encrypt(JSON.stringify([]), pwd);
      VaultService.saveEncryptedVault(encrypted);
      
      setMasterPassword(pwd);
      setVault([]);
      setIsLocked(false);
      setView(AppView.DASHBOARD);
      notify('Vault initialized successfully!');
    } catch (err) {
      notify('Setup failed', 'error');
    }
  };

  const handleUnlock = async (pwd: string) => {
    const storedHash = VaultService.getMasterHash();
    const hash = await CryptoService.hashMasterPassword(pwd);
    
    if (hash === storedHash) {
      const encryptedData = VaultService.getEncryptedVault();
      if (encryptedData) {
        try {
          const decrypted = await CryptoService.decrypt(encryptedData, pwd);
          setVault(JSON.parse(decrypted));
        } catch (e) {
          notify('Vault decryption failed. Data might be corrupted.', 'error');
          return;
        }
      }
      setMasterPassword(pwd);
      setIsLocked(false);
      setView(AppView.DASHBOARD);
      notify('Vault unlocked', 'success');
    } else {
      notify('Invalid master password', 'error');
    }
  };

  const handleAddEntry = async (entry: Partial<VaultEntry>) => {
    const newEntry: VaultEntry = {
      id: crypto.randomUUID(),
      title: entry.title || 'Untitled',
      username: entry.username || '',
      password: entry.password || '',
      website: entry.website || '',
      notes: entry.notes || '',
      category: entry.category || 'General',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const updatedVault = [...vault, newEntry];
    setVault(updatedVault);
    await syncToDisk(updatedVault);
    setShowEntryModal({ isOpen: false });
    notify('Credential saved');
  };

  const handleUpdateEntry = async (updatedEntry: VaultEntry) => {
    const updatedVault = vault.map(e => e.id === updatedEntry.id ? { ...updatedEntry, updatedAt: Date.now() } : e);
    setVault(updatedVault);
    await syncToDisk(updatedVault);
    setShowEntryModal({ isOpen: false });
    notify('Credential updated');
  };

  const handleDeleteEntry = async (id: string) => {
    const updatedVault = vault.filter(e => e.id !== id);
    setVault(updatedVault);
    await syncToDisk(updatedVault);
    notify('Credential removed', 'info');
  };

  const handleImport = async (data: EncryptedData) => {
    if (masterPassword) {
      try {
        const decrypted = await CryptoService.decrypt(data, masterPassword);
        const importedVault = JSON.parse(decrypted);
        setVault(importedVault);
        VaultService.saveEncryptedVault(data);
        notify('Vault data imported and active');
      } catch (err) {
        VaultService.saveEncryptedVault(data);
        notify('Imported vault saved, but it uses a different password.', 'info');
      }
    } else {
      VaultService.saveEncryptedVault(data);
      notify('Vault data imported. Unlock to access.', 'success');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    notify('Copied to clipboard');
    setTimeout(() => {
      try {
        navigator.clipboard.writeText('');
        notify('Clipboard cleared', 'info');
      } catch(e) {}
    }, settings.clipboardClearDelay * 1000);
  };

  // --- Render Sections ---

  if (needsFirstRunInternet) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-[#0a0a0c]">
        <div className="w-20 h-20 mb-8 bg-amber-500/20 rounded-full flex items-center justify-center text-amber-500 border border-amber-500/30 animate-pulse">
           <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"></path></svg>
        </div>
        <h2 className="text-2xl font-bold mb-4 cyber-glow">Initial Setup Required</h2>
        <p className="text-slate-400 max-w-sm mb-8 leading-relaxed">
          To finalize your offline vault setup, VAULTKEY needs to connect to the internet <span className="text-sky-400">one time</span> to cache essential security assets and styles.
        </p>
        <CyberButton onClick={() => window.location.reload()}>Check Connectivity</CyberButton>
      </div>
    );
  }

  if (view === AppView.SPLASH) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0c] relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-sky-500/10 blur-[120px] rounded-full animate-pulse"></div>
        <div className="relative z-10 text-center">
          <div className="w-20 h-20 mx-auto mb-8 bg-sky-600 rounded-2xl flex items-center justify-center shadow-[0_0_50px_rgba(56,189,248,0.4)] animate-bounce">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          </div>
          <h1 className="text-5xl font-black tracking-tighter mb-2 cyber-glow">VAULTKEY</h1>
          <p className="text-slate-500 mono tracking-widest uppercase text-sm">Your secrets. Offline.</p>
        </div>
        <div className="absolute bottom-12 left-0 right-0 text-center">
           <div className="inline-block px-4 py-1 rounded-full border border-slate-800 text-[10px] text-slate-500 mono uppercase tracking-widest">
            Security v2.5.0 • Local Only
           </div>
        </div>
      </div>
    );
  }

  if (view === AppView.SETUP || view === AppView.UNLOCK) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#0a0a0c]">
        <div className="w-full max-w-md p-8 rounded-2xl bg-slate-900/40 border border-slate-800/50 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-sky-500/50 to-transparent"></div>
          
          <div className="text-center mb-10">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-slate-950 flex items-center justify-center border border-sky-900/50 shadow-[0_0_20px_rgba(56,189,248,0.1)]">
               <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-sky-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </div>
            <h2 className="text-2xl font-bold mb-2 cyber-glow">{view === AppView.SETUP ? 'Initialize Vault' : 'Welcome Back'}</h2>
            <p className="text-slate-400 text-sm">{view === AppView.SETUP ? 'Set a master password to secure your local database.' : 'Enter your master key to decrypt the vault.'}</p>
          </div>

          <form 
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const pwd = formData.get('master') as string;
              if (view === AppView.SETUP) {
                handleSetupVault(pwd);
              } else {
                handleUnlock(pwd);
              }
            }}
            className="space-y-6"
          >
            <CyberInput 
              name="master"
              label="Master Password"
              type="password"
              placeholder="••••••••••••"
              required
              autoFocus
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path></svg>}
            />
            <CyberButton fullWidth type="submit">
              {view === AppView.SETUP ? 'Create Vault' : 'Access Vault'}
            </CyberButton>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-800/50 text-center">
            <p className="text-[10px] text-rose-500 mono uppercase tracking-widest leading-relaxed">
              Caution: If you lose this password, your vault data cannot be recovered. We do not store your master key.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // --- Authenticated Layouts ---

  const filteredVault = vault.filter(e => 
    e.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    e.website.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen pt-20 pb-10 px-6 max-w-5xl mx-auto">
      <Navbar 
        onLogout={handleLogout} 
        onNavigate={(v) => setView(v)} 
        currentView={view}
        isOnline={isOnline}
      />

      {notification && (
        <div className={`fixed bottom-6 right-6 z-50 px-6 py-3 rounded-lg shadow-2xl mono text-sm flex items-center gap-3 animate-slide-up border ${
          notification.type === 'error' ? 'bg-rose-900/80 text-rose-100 border-rose-500' : 
          notification.type === 'info' ? 'bg-slate-800/80 text-slate-100 border-slate-600' :
          'bg-sky-900/80 text-sky-100 border-sky-500'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            notification.type === 'error' ? 'bg-rose-500 animate-pulse' : 
            notification.type === 'info' ? 'bg-slate-400' : 
            'bg-sky-500 animate-pulse'
          }`}></div>
          {notification.message}
        </div>
      )}

      {view === AppView.DASHBOARD && (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-white mb-1">Encrypted Vault</h2>
              <p className="text-slate-500 text-sm mono uppercase tracking-wider">{vault.length} Stored Credentials</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative w-full md:w-64">
                <input 
                  type="text" 
                  placeholder="SEARCH VAULT..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 pl-10 pr-4 text-xs mono text-slate-300 outline-none focus:border-sky-500/50 transition-colors"
                />
                <svg className="w-4 h-4 text-slate-600 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
              <CyberButton onClick={() => setShowEntryModal({ isOpen: true })}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                <span className="hidden sm:inline">Add New</span>
              </CyberButton>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVault.map(entry => (
              <div key={entry.id} className="group p-5 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-sky-900/50 transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-0.5 bg-sky-500/0 group-hover:bg-sky-500/30 transition-all"></div>
                
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-950 flex items-center justify-center text-sky-500 border border-slate-800">
                      {entry.website && isOnline ? (
                        <img 
                          src={`https://www.google.com/s2/favicons?domain=${entry.website}&sz=64`} 
                          alt="favicon" 
                          className="w-6 h-6 rounded"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const svg = '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>';
                            e.currentTarget.parentElement!.innerHTML = svg;
                          }}
                        />
                      ) : (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-100 leading-tight">{entry.title}</h3>
                      <p className="text-xs text-slate-500 mono">{entry.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => setShowEntryModal({ isOpen: true, entry })}
                      className="p-1.5 text-slate-500 hover:text-sky-400"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                    </button>
                    <button 
                      onClick={() => handleDeleteEntry(entry.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 mono text-[10px] uppercase">User</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-300 font-medium">{entry.username}</span>
                      <button onClick={() => copyToClipboard(entry.username)} className="text-slate-600 hover:text-sky-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"></path></svg>
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 mono text-[10px] uppercase">Password</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-300 mono">••••••••••••</span>
                      <button onClick={() => copyToClipboard(entry.password)} className="text-slate-600 hover:text-sky-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"></path></svg>
                      </button>
                    </div>
                  </div>
                </div>

                {entry.website && (
                  <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
                    <a href={entry.website.startsWith('http') ? entry.website : `https://${entry.website}`} target="_blank" rel="noreferrer" className="text-[10px] text-sky-500 hover:underline mono uppercase tracking-widest truncate max-w-[150px]">
                      Visit Site
                    </a>
                    <span className="text-[9px] text-slate-700 mono">MODIFIED {new Date(entry.updatedAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            ))}

            {filteredVault.length === 0 && (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-800 rounded-2xl">
                <div className="text-slate-700 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
                <h3 className="text-xl font-medium text-slate-400 mb-1">No matches found</h3>
                <p className="text-slate-600 text-sm">Adjust your search or add a new entry to the vault.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {view === AppView.GENERATOR && (
        <PasswordGenerator onGenerate={(p) => copyToClipboard(p)} />
      )}

      {view === AppView.SETTINGS && (
        <SettingsView 
          settings={settings} 
          onUpdate={(s) => {
            setSettings(s);
            VaultService.saveSettings(s);
            notify('Settings updated');
          }}
          onImport={handleImport}
          onReset={() => {
            if (confirm('CRITICAL WARNING: This will permanently delete all stored data. Continue?')) {
              VaultService.clearAllData();
              window.location.reload();
            }
          }}
        />
      )}

      {/* --- Entry Modal --- */}
      {showEntryModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden animate-slide-up">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
              <h3 className="text-xl font-bold text-white">{showEntryModal.entry ? 'Edit Credential' : 'Add New Credential'}</h3>
              <button onClick={() => setShowEntryModal({ isOpen: false })} className="text-slate-500 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const data = Object.fromEntries(formData.entries());
                if (showEntryModal.entry) {
                  handleUpdateEntry({ ...showEntryModal.entry, ...data } as VaultEntry);
                } else {
                  handleAddEntry(data);
                }
              }}
              className="p-6 space-y-4"
            >
              <CyberInput label="Title / Service Name" name="title" defaultValue={showEntryModal.entry?.title} required placeholder="Google, GitHub, Banking..." />
              <div className="grid grid-cols-2 gap-4">
                <CyberInput label="Username / Email" name="username" defaultValue={showEntryModal.entry?.username} placeholder="user@example.com" />
                <CyberInput label="Category" name="category" defaultValue={showEntryModal.entry?.category} placeholder="Social, Work, Bank..." />
              </div>
              <CyberInput 
                label="Password" 
                name="password" 
                type="text" 
                defaultValue={showEntryModal.entry?.password} 
                required 
                placeholder="SecureKey123!"
              />
              <CyberInput label="Website URL" name="website" defaultValue={showEntryModal.entry?.website} placeholder="https://..." />
              <div className="w-full">
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-widest mono ml-1">Notes</label>
                <textarea 
                  name="notes"
                  rows={3}
                  defaultValue={showEntryModal.entry?.notes}
                  className="w-full bg-slate-900/50 border border-slate-800 focus:border-sky-500/50 rounded-lg p-3 text-slate-200 outline-none transition-all duration-200 mono text-sm placeholder:text-slate-700"
                />
              </div>
              <div className="pt-4 flex items-center gap-3">
                <CyberButton type="button" variant="ghost" className="flex-1" onClick={() => setShowEntryModal({ isOpen: false })}>Cancel</CyberButton>
                <CyberButton type="submit" className="flex-1">Save Securely</CyberButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Sub-Views ---

const PasswordGenerator: React.FC<{ onGenerate: (p: string) => void }> = ({ onGenerate }) => {
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState({ numbers: true, symbols: true, uppercase: true });
  const [result, setResult] = useState('');

  const generate = useCallback(() => {
    const charset = {
      lower: 'abcdefghijklmnopqrstuvwxyz',
      upper: options.uppercase ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' : '',
      numbers: options.numbers ? '0123456789' : '',
      symbols: options.symbols ? '!@#$%^&*()_+-=[]{}|;:,.<>?' : '',
    };
    const allChars = Object.values(charset).join('') || 'abcdefghijklmnopqrstuvwxyz1234567890';
    let pwd = '';
    for (let i = 0; i < length; i++) {
      pwd += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }
    setResult(pwd);
  }, [length, options]);

  useEffect(() => generate(), [generate]);

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-slide-up">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Entropy Generator</h2>
        <p className="text-slate-500 text-sm mono">GENERATE CRYPTOGRAPHICALLY SECURE PASSWORDS LOCALLY.</p>
      </div>

      <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 backdrop-blur-xl space-y-8">
        <div className="relative group">
          <div className="absolute inset-0 bg-sky-500/5 blur-xl group-hover:bg-sky-500/10 transition-colors rounded-xl"></div>
          <div className="relative p-6 bg-slate-950 border border-slate-800 rounded-xl text-center">
             <div className="text-2xl sm:text-4xl font-bold text-sky-400 mono break-all leading-tight tracking-tighter">
              {result}
             </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs mono uppercase tracking-widest text-slate-500">
              <span>Password Length: {length}</span>
              <span>Strength: {length < 12 ? 'Weak' : length < 20 ? 'Strong' : 'Military Grade'}</span>
            </div>
            <input 
              type="range" min="8" max="64" value={length} 
              onChange={(e) => setLength(parseInt(e.target.value))} 
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {Object.entries(options).map(([key, val]) => (
              <label key={key} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors">
                <span className="text-xs mono uppercase text-slate-400">{key}</span>
                <input 
                  type="checkbox" checked={val} 
                  onChange={() => setOptions(prev => ({ ...prev, [key]: !val }))}
                  className="w-4 h-4 accent-sky-500"
                />
              </label>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <CyberButton variant="secondary" fullWidth onClick={generate}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
            Regenerate
          </CyberButton>
          <CyberButton fullWidth onClick={() => onGenerate(result)}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
            Copy Password
          </CyberButton>
        </div>
      </div>
    </div>
  );
};

const SettingsView: React.FC<{ 
  settings: VaultSettings; 
  onUpdate: (s: VaultSettings) => void;
  onImport: (d: EncryptedData) => void;
  onReset: () => void;
}> = ({ settings, onUpdate, onImport, onReset }) => {
  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-slide-up">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Vault Settings</h2>
        <p className="text-slate-500 text-sm mono uppercase tracking-wider">Configure your security parameters.</p>
      </div>

      <div className="space-y-4">
        <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 backdrop-blur-xl">
           <h3 className="text-sm font-bold text-sky-500 mono uppercase mb-6 tracking-widest">Security Configuration</h3>
           <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-100 font-medium">Auto-lock Inactivity Timer</p>
                  <p className="text-xs text-slate-500">Automatically lock the vault after being idle.</p>
                </div>
                <select 
                  value={settings.autoLockTimer}
                  onChange={(e) => onUpdate({ ...settings, autoLockTimer: parseInt(e.target.value) })}
                  className="bg-slate-950 border border-slate-800 text-slate-300 text-xs mono rounded-lg p-2 outline-none focus:border-sky-500"
                >
                  <option value={1}>1 Minute</option>
                  <option value={3}>3 Minutes</option>
                  <option value={5}>5 Minutes</option>
                  <option value={15}>15 Minutes</option>
                  <option value={30}>30 Minutes</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-100 font-medium">Clipboard Clear Delay</p>
                  <p className="text-xs text-slate-500">How long to keep secrets in clipboard before wiping.</p>
                </div>
                <select 
                  value={settings.clipboardClearDelay}
                  onChange={(e) => onUpdate({ ...settings, clipboardClearDelay: parseInt(e.target.value) })}
                  className="bg-slate-950 border border-slate-800 text-slate-300 text-xs mono rounded-lg p-2 outline-none focus:border-sky-500"
                >
                  <option value={5}>5 Seconds</option>
                  <option value={10}>10 Seconds</option>
                  <option value={30}>30 Seconds</option>
                  <option value={60}>60 Seconds</option>
                </select>
              </div>
           </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 backdrop-blur-xl">
           <h3 className="text-sm font-bold text-sky-500 mono uppercase mb-6 tracking-widest">Vault Maintenance</h3>
           <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <CyberButton variant="secondary" fullWidth onClick={() => {
                  const data = VaultService.getEncryptedVault();
                  if (!data) return;
                  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `vaultkey_backup_${new Date().toISOString().split('T')[0]}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                  Export Backup
                </CyberButton>
                <label className="flex-1 cursor-pointer">
                  <div className="w-full px-6 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 uppercase tracking-wider text-sm mono bg-slate-800 hover:bg-slate-700 text-sky-400 border border-sky-900/50">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                    Import Vault
                  </div>
                  <input type="file" className="hidden" accept=".json" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      try {
                        const data = JSON.parse(ev.target?.result as string);
                        if (data.iv && data.salt && data.data) {
                          onImport(data);
                        } else {
                          alert('Invalid vault file format.');
                        }
                      } catch (err) {
                        alert('Error parsing vault file.');
                      }
                    };
                    reader.readAsText(file);
                    e.target.value = ''; // Reset input
                  }} />
                </label>
              </div>
              <CyberButton variant="danger" fullWidth onClick={onReset}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                Destroy Vault
              </CyberButton>
           </div>
        </div>
      </div>
    </div>
  );
}
