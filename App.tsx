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
  <nav className="fixed top-0 left-0 right-0 h-16 border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-xl z-40 px-6 flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-sky-700 flex items-center justify-center shadow-lg shadow-sky-500/20">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
      </div>
      <div className="flex flex-col">
        <h1 className="text-xl font-black tracking-tighter text-white cyber-glow leading-none">VAULTKEY</h1>
        {!isOnline && <span className="text-[10px] text-amber-500 mono font-bold uppercase tracking-tighter">Offline Mode</span>}
      </div>
    </div>
    <div className="flex items-center gap-1 sm:gap-4">
      <div className="flex items-center bg-slate-900/50 rounded-lg p-1 border border-slate-800">
        <button 
          onClick={() => onNavigate(AppView.DASHBOARD)}
          className={`px-3 py-1.5 rounded-md transition-all duration-300 flex items-center gap-2 text-xs font-bold mono uppercase tracking-wider ${currentView === AppView.DASHBOARD ? 'text-sky-400 bg-sky-400/10' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
          <span className="hidden md:inline">Vault</span>
        </button>
        <button 
          onClick={() => onNavigate(AppView.GENERATOR)}
          className={`px-3 py-1.5 rounded-md transition-all duration-300 flex items-center gap-2 text-xs font-bold mono uppercase tracking-wider ${currentView === AppView.GENERATOR ? 'text-sky-400 bg-sky-400/10' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
          <span className="hidden md:inline">Keys</span>
        </button>
        <button 
          onClick={() => onNavigate(AppView.SETTINGS)}
          className={`px-3 py-1.5 rounded-md transition-all duration-300 flex items-center gap-2 text-xs font-bold mono uppercase tracking-wider ${currentView === AppView.SETTINGS ? 'text-sky-400 bg-sky-400/10' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
          <span className="hidden md:inline">Settings</span>
        </button>
      </div>
      <button 
        onClick={onLogout}
        className="p-2.5 rounded-lg text-rose-400 hover:bg-rose-400/10 border border-transparent hover:border-rose-400/20 transition-all duration-300"
        title="Lock Vault"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>
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

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

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
    const events = ['mousemove', 'keydown', 'touchstart', 'scroll'];
    events.forEach(e => window.addEventListener(e, updateActivity));
    return () => events.forEach(e => window.removeEventListener(e, updateActivity));
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

  if (view === AppView.SPLASH) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-500/10 blur-[150px] rounded-full animate-pulse"></div>
        <div className="relative z-10 text-center animate-float">
          <div className="w-24 h-24 mx-auto mb-10 bg-gradient-to-br from-sky-400 to-sky-700 rounded-2xl flex items-center justify-center shadow-[0_0_60px_rgba(56,189,248,0.4)]">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-14 h-14 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          </div>
          <h1 className="text-7xl font-black tracking-tighter mb-4 cyber-glow text-white italic">VAULTKEY</h1>
          <div className="flex items-center justify-center gap-4 text-slate-500 mono tracking-[0.3em] uppercase text-xs">
            <span>ZERO DATA CLOUD</span>
            <span className="w-1 h-1 rounded-full bg-slate-800"></span>
            <span>AES-256</span>
          </div>
        </div>
        <div className="absolute bottom-16 left-0 right-0 text-center">
           <div className="inline-block px-5 py-2 rounded-full glass-panel text-[10px] text-slate-400 mono uppercase tracking-[0.2em] font-bold">
            Version 2.5.0-Release • Secured Localhost
           </div>
        </div>
      </div>
    );
  }

  if (view === AppView.SETUP || view === AppView.UNLOCK) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md p-10 rounded-3xl glass-panel shadow-2xl relative overflow-hidden animate-slide-up">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-sky-500/40 to-transparent"></div>
          
          <div className="text-center mb-10">
            <div className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-slate-950 flex items-center justify-center border border-sky-500/20 shadow-[0_0_30px_rgba(56,189,248,0.1)]">
               <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </div>
            <h2 className="text-3xl font-black mb-3 cyber-glow tracking-tighter text-white uppercase">{view === AppView.SETUP ? 'GENESIS' : 'AUTHENTICATE'}</h2>
            <p className="text-slate-400 text-sm font-medium leading-relaxed">{view === AppView.SETUP ? 'Establish your master key to initialize the encrypted local database.' : 'Access requires your biometric or master key decryption.'}</p>
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
            className="space-y-8"
          >
            <CyberInput 
              name="master"
              label="Master Key"
              type="password"
              placeholder="ENTER SECRETS..."
              required
              autoFocus
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path></svg>}
            />
            <CyberButton fullWidth type="submit" className="py-4 text-base font-black">
              {view === AppView.SETUP ? 'INITIALIZE VAULT' : 'DECRYPT & ENTER'}
            </CyberButton>
          </form>

          <div className="mt-10 pt-8 border-t border-white/5 text-center">
            <p className="text-[10px] text-rose-500 mono font-bold uppercase tracking-widest leading-relaxed opacity-80">
              WARNING: Lost keys cannot be recovered. Data is locally bound to this device.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const filteredVault = vault.filter(e => 
    e.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    e.website.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 max-w-6xl mx-auto">
      <Navbar 
        onLogout={handleLogout} 
        onNavigate={(v) => setView(v)} 
        currentView={view}
        isOnline={isOnline}
      />

      {notification && (
        <div className={`fixed bottom-8 right-8 z-50 px-8 py-4 rounded-2xl shadow-2xl mono text-xs font-bold uppercase tracking-widest flex items-center gap-4 animate-slide-up border backdrop-blur-xl ${
          notification.type === 'error' ? 'bg-rose-950/80 text-rose-100 border-rose-500/50' : 
          notification.type === 'info' ? 'bg-slate-900/80 text-slate-100 border-slate-700' :
          'bg-sky-950/80 text-sky-100 border-sky-500/50'
        }`}>
          <div className={`w-2.5 h-2.5 rounded-full ${
            notification.type === 'error' ? 'bg-rose-500 animate-pulse' : 
            notification.type === 'info' ? 'bg-slate-400' : 
            'bg-sky-500 animate-pulse'
          }`}></div>
          {notification.message}
        </div>
      )}

      {view === AppView.DASHBOARD && (
        <div className="space-y-10 animate-slide-up">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="text-5xl font-black tracking-tighter text-white mb-2 italic">ENCRYPTED STORAGE</h2>
              <p className="text-slate-500 text-xs mono font-bold uppercase tracking-[0.3em]">{vault.length} ACTIVE PROTECTIONS</p>
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-80">
                <input 
                  type="text" 
                  placeholder="SEARCH DATABASE..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-xs mono text-slate-300 outline-none focus:border-sky-500/40 transition-all font-bold placeholder:text-slate-800"
                />
                <svg className="w-5 h-5 text-slate-700 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
              <CyberButton onClick={() => setShowEntryModal({ isOpen: true })} className="px-5">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                <span className="hidden sm:inline font-black">NEW ENTRY</span>
              </CyberButton>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredVault.map(entry => (
              <div key={entry.id} className="group p-6 rounded-2xl glass-panel cyber-border relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-sky-500 opacity-0 group-hover:opacity-40 transition-opacity"></div>
                
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-950 flex items-center justify-center text-sky-400 border border-slate-800 group-hover:border-sky-500/30 transition-colors">
                      {entry.website && isOnline ? (
                        <img 
                          src={`https://www.google.com/s2/favicons?domain=${entry.website}&sz=64`} 
                          alt="favicon" 
                          className="w-7 h-7 rounded-lg"
                        />
                      ) : (
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white leading-none mb-1 uppercase tracking-tight">{entry.title}</h3>
                      <span className="text-[10px] text-sky-500/80 mono font-black uppercase tracking-widest">{entry.category}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                    <button 
                      onClick={() => setShowEntryModal({ isOpen: true, entry })}
                      className="p-2 text-slate-500 hover:text-sky-400 hover:bg-sky-400/10 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                    </button>
                    <button 
                      onClick={() => handleDeleteEntry(entry.id)}
                      className="p-2 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 border border-slate-800/50">
                    <span className="text-slate-600 mono text-[9px] font-black uppercase tracking-widest">Identity</span>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-300 font-bold text-sm truncate max-w-[120px]">{entry.username}</span>
                      <button onClick={() => copyToClipboard(entry.username)} className="text-slate-600 hover:text-sky-400 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2.5" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"></path></svg>
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 border border-slate-800/50">
                    <span className="text-slate-600 mono text-[9px] font-black uppercase tracking-widest">Password</span>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-300 mono tracking-tighter text-sm">••••••••••••</span>
                      <button onClick={() => copyToClipboard(entry.password)} className="text-slate-600 hover:text-sky-400 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2.5" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"></path></svg>
                      </button>
                    </div>
                  </div>
                </div>

                {entry.website && (
                  <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                    <a href={entry.website.startsWith('http') ? entry.website : `https://${entry.website}`} target="_blank" rel="noreferrer" className="text-[10px] text-sky-500 hover:text-sky-400 font-black mono uppercase tracking-widest transition-colors flex items-center gap-2">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                      ENDPOINT
                    </a>
                    <span className="text-[9px] text-slate-700 mono font-bold">{new Date(entry.updatedAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            ))}

            {filteredVault.length === 0 && (
              <div className="col-span-full py-24 text-center glass-panel border-2 border-dashed border-slate-800/50 rounded-3xl">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-950 flex items-center justify-center text-slate-800 border border-slate-900">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
                <h3 className="text-2xl font-black text-slate-500 mb-2 tracking-tighter italic uppercase">DATABASE EMPTY</h3>
                <p className="text-slate-700 text-sm mono font-bold uppercase tracking-widest">No matching security records found.</p>
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
            notify('System updated');
          }}
          onImport={handleImport}
          onReset={() => {
            if (confirm('CRITICAL: Purge all local data and resets?')) {
              VaultService.clearAllData();
              window.location.reload();
            }
          }}
        />
      )}

      {/* --- Entry Modal --- */}
      {showEntryModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-sm">
          <div className="w-full max-w-xl glass-panel rounded-3xl shadow-2xl overflow-hidden animate-slide-up border border-sky-500/20">
            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-slate-900/40">
              <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase">{showEntryModal.entry ? 'EDIT CREDENTIAL' : 'SECURE NEW KEY'}</h3>
              <button onClick={() => setShowEntryModal({ isOpen: false })} className="p-2 text-slate-500 hover:text-white transition-colors">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
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
              className="p-8 space-y-6"
            >
              <CyberInput label="Service Title" name="title" defaultValue={showEntryModal.entry?.title} required placeholder="e.g. CORE MAINFRAME" />
              <div className="grid grid-cols-2 gap-6">
                <CyberInput label="Identifier" name="username" defaultValue={showEntryModal.entry?.username} placeholder="ADMIN" />
                <CyberInput label="Classification" name="category" defaultValue={showEntryModal.entry?.category} placeholder="ROOT" />
              </div>
              <CyberInput 
                label="Secure Payload (Password)" 
                name="password" 
                type="text" 
                defaultValue={showEntryModal.entry?.password} 
                required 
                placeholder="••••••••"
              />
              <CyberInput label="Target URL" name="website" defaultValue={showEntryModal.entry?.website} placeholder="https://endpoint.local" />
              <div className="w-full">
                <label className="block text-[10px] font-black text-slate-600 mb-2 uppercase tracking-widest mono ml-1">Meta Observations</label>
                <textarea 
                  name="notes"
                  rows={3}
                  defaultValue={showEntryModal.entry?.notes}
                  className="w-full bg-slate-950/50 border border-slate-800 focus:border-sky-500/30 rounded-xl p-4 text-slate-200 outline-none transition-all duration-200 mono text-sm placeholder:text-slate-900"
                />
              </div>
              <div className="pt-6 flex items-center gap-4">
                <CyberButton type="button" variant="ghost" className="flex-1 py-4 font-black" onClick={() => setShowEntryModal({ isOpen: false })}>ABORT</CyberButton>
                <CyberButton type="submit" className="flex-1 py-4 font-black">ENCRYPT & SAVE</CyberButton>
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
  const [length, setLength] = useState(24);
  const [options, setOptions] = useState({ numbers: true, symbols: true, uppercase: true });
  const [result, setResult] = useState('');

  const generate = useCallback(() => {
    const charset = {
      lower: 'abcdefghijklmnopqrstuvwxyz',
      upper: options.uppercase ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' : '',
      numbers: options.numbers ? '0123456789' : '',
      symbols: options.symbols ? '!@#$%^&*()_+-=[]{}|;:,.<>?' : '',
    };
    const allChars = Object.values(charset).join('') || 'abcdefghijklmnopqrstuvwxyz';
    let pwd = '';
    const array = new Uint32Array(length);
    window.crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) {
      pwd += allChars.charAt(array[i] % allChars.length);
    }
    setResult(pwd);
  }, [length, options]);

  useEffect(() => generate(), [generate]);

  return (
    <div className="max-w-3xl mx-auto space-y-12 animate-slide-up">
      <div className="text-center">
        <h2 className="text-5xl font-black tracking-tighter text-white mb-2 italic">ENTROPY ENGINE</h2>
        <p className="text-slate-500 text-xs mono font-bold uppercase tracking-[0.3em]">LOCAL PSEUDORANDOM GENERATION</p>
      </div>

      <div className="p-10 rounded-3xl glass-panel cyber-border space-y-10 relative">
        <div className="absolute top-4 right-6 mono text-[10px] text-sky-500/50 font-black">CRYPTOGRAPHICALLY SECURE</div>
        
        <div className="relative group">
          <div className="absolute inset-0 bg-sky-500/5 blur-3xl group-hover:bg-sky-500/10 transition-colors rounded-3xl"></div>
          <div className="relative p-10 bg-slate-950/80 border border-slate-800 rounded-2xl text-center shadow-inner">
             <div className="text-2xl sm:text-4xl font-black text-sky-400 mono break-all leading-tight tracking-tighter cyber-glow">
              {result}
             </div>
          </div>
        </div>

        <div className="space-y-10">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-[10px] mono uppercase tracking-widest text-slate-500 font-black">
              <span>Bitstream Length: {length} chars</span>
              <span className={length > 20 ? 'text-sky-400' : 'text-amber-500'}>Complexity: {length < 12 ? 'VULNERABLE' : length < 20 ? 'ROBUST' : 'MILITARY GRADE'}</span>
            </div>
            <input 
              type="range" min="12" max="64" value={length} 
              onChange={(e) => setLength(parseInt(e.target.value))} 
              className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-sky-500 border border-slate-800"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {Object.entries(options).map(([key, val]) => (
              <label key={key} className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${val ? 'bg-sky-400/5 border-sky-500/30' : 'bg-slate-950/50 border-slate-800 opacity-60'}`}>
                <span className="text-[10px] mono font-black uppercase tracking-widest text-slate-400">{key}</span>
                <input 
                  type="checkbox" checked={val} 
                  onChange={() => setOptions(prev => ({ ...prev, [key]: !val }))}
                  className="w-5 h-5 accent-sky-500 rounded border-slate-700 bg-slate-900"
                />
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6">
          <CyberButton variant="secondary" fullWidth onClick={generate} className="py-4">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
            RE-RANDOMIZE
          </CyberButton>
          <CyberButton fullWidth onClick={() => onGenerate(result)} className="py-4 font-black">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
            EXTRACT TO CLIPBOARD
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
    <div className="max-w-3xl mx-auto space-y-12 animate-slide-up">
      <div className="text-center">
        <h2 className="text-5xl font-black tracking-tighter text-white mb-2 italic uppercase">CORE SYSTEMS</h2>
        <p className="text-slate-500 text-xs mono font-bold uppercase tracking-[0.3em]">VAULT PARAMETERS & OVERRIDES</p>
      </div>

      <div className="space-y-8">
        <div className="p-8 rounded-3xl glass-panel cyber-border">
           <h3 className="text-xs font-black text-sky-400 mono uppercase mb-8 tracking-[0.3em]">AUTOMATION & SECURITY</h3>
           <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-black text-lg uppercase tracking-tight">AUTO-LOCK PROTOCOL</p>
                  <p className="text-xs text-slate-500 font-medium">Automatic system shutdown after period of inactivity.</p>
                </div>
                <select 
                  value={settings.autoLockTimer}
                  onChange={(e) => onUpdate({ ...settings, autoLockTimer: parseInt(e.target.value) })}
                  className="bg-slate-950 border border-slate-800 text-sky-400 text-xs mono font-bold rounded-xl px-4 py-3 outline-none focus:border-sky-500/40"
                >
                  <option value={1}>1 MINUTE</option>
                  <option value={3}>3 MINUTES</option>
                  <option value={5}>5 MINUTES</option>
                  <option value={15}>15 MINUTES</option>
                  <option value={30}>30 MINUTES</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-black text-lg uppercase tracking-tight">CLIPBOARD PURGE</p>
                  <p className="text-xs text-slate-500 font-medium">Time elapsed before wiping secrets from system cache.</p>
                </div>
                <select 
                  value={settings.clipboardClearDelay}
                  onChange={(e) => onUpdate({ ...settings, clipboardClearDelay: parseInt(e.target.value) })}
                  className="bg-slate-950 border border-slate-800 text-sky-400 text-xs mono font-bold rounded-xl px-4 py-3 outline-none focus:border-sky-500/40"
                >
                  <option value={5}>5 SECONDS</option>
                  <option value={10}>10 SECONDS</option>
                  <option value={30}>30 SECONDS</option>
                  <option value={60}>60 SECONDS</option>
                </select>
              </div>
           </div>
        </div>

        <div className="p-8 rounded-3xl glass-panel cyber-border border-rose-500/10">
           <h3 className="text-xs font-black text-rose-500 mono uppercase mb-8 tracking-[0.3em]">DATA INTEGRITY & RECOVERY</h3>
           <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CyberButton variant="secondary" fullWidth onClick={() => {
                  const data = VaultService.getEncryptedVault();
                  if (!data) return;
                  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `vaultkey_export_${new Date().toISOString().split('T')[0]}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }} className="py-4">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                  <span className="font-black">EXPORT ARCHIVE</span>
                </CyberButton>
                <label className="flex-1 cursor-pointer group">
                  <div className="w-full px-6 py-4 rounded-xl font-black transition-all duration-300 flex items-center justify-center gap-3 uppercase tracking-wider text-sm mono bg-slate-950 border border-slate-800 group-hover:border-sky-500/30 text-sky-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                    IMPORT ARCHIVE
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
                          alert('CORRUPTED OR INVALID FILE STRUCTURE');
                        }
                      } catch (err) {
                        alert('CRITICAL PARSE ERROR');
                      }
                    };
                    reader.readAsText(file);
                    e.target.value = '';
                  }} />
                </label>
              </div>
              <CyberButton variant="danger" fullWidth onClick={onReset} className="py-4 font-black">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                INITIATE NUCLEAR PURGE
              </CyberButton>
           </div>
        </div>
      </div>
    </div>
  );
}