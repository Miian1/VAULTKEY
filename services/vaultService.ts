
import { VaultEntry, EncryptedData, VaultSettings } from '../types';

const STORAGE_KEY = 'vaultkey_data';
const MASTER_HASH_KEY = 'vaultkey_master_hash';
const SETTINGS_KEY = 'vaultkey_settings';

export class VaultService {
  static isInitialized(): boolean {
    return !!localStorage.getItem(MASTER_HASH_KEY);
  }

  static saveMasterHash(hash: string): void {
    localStorage.setItem(MASTER_HASH_KEY, hash);
  }

  static getMasterHash(): string | null {
    return localStorage.getItem(MASTER_HASH_KEY);
  }

  static saveEncryptedVault(encryptedData: EncryptedData): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(encryptedData));
  }

  static getEncryptedVault(): EncryptedData | null {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  }

  static saveSettings(settings: VaultSettings): void {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }

  static getSettings(): VaultSettings {
    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? JSON.parse(data) : {
      autoLockTimer: 3,
      clipboardClearDelay: 10,
      theme: 'dark'
    };
  }

  static clearAllData(): void {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(MASTER_HASH_KEY);
    localStorage.removeItem(SETTINGS_KEY);
  }
}
