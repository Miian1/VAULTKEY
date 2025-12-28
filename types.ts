
export enum AppView {
  SPLASH = 'SPLASH',
  SETUP = 'SETUP',
  UNLOCK = 'UNLOCK',
  DASHBOARD = 'DASHBOARD',
  GENERATOR = 'GENERATOR',
  SETTINGS = 'SETTINGS'
}

export interface VaultEntry {
  id: string;
  title: string;
  username: string;
  password: string;
  website: string;
  notes: string;
  category: string;
  createdAt: number;
  updatedAt: number;
}

export interface VaultSettings {
  autoLockTimer: number; // in minutes
  clipboardClearDelay: number; // in seconds
  theme: 'dark' | 'light';
}

export interface EncryptedData {
  iv: string;
  salt: string;
  data: string;
}
