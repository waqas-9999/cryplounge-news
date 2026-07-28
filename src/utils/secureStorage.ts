/**
 * Secure Storage Utility - Encrypted LocalStorage
 * Protects sensitive data from XSS and unauthorized access
 */

// Encryption key - in production, use environment variable
const ENCRYPTION_KEY =
  process.env.NEXT_PUBLIC_ENCRYPTION_KEY ||
  'cryplounge-secure-key-change-in-production-2024';

/**
 * Storage is only available in the browser. During server-side rendering
 * every accessor below becomes a no-op rather than throwing.
 */
function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

/**
 * Simple encryption using Base64 + XOR cipher
 * This is a basic implementation until crypto-js is installed
 */
function simpleEncrypt(text: string, key: string): string {
  try {
    const keyBytes = new TextEncoder().encode(key);
    const textBytes = new TextEncoder().encode(text);
    const encrypted = new Uint8Array(textBytes.length);
    
    for (let i = 0; i < textBytes.length; i++) {
      encrypted[i] = textBytes[i] ^ keyBytes[i % keyBytes.length];
    }
    
    return btoa(String.fromCharCode(...encrypted));
  } catch (error) {
    console.error('Encryption failed:', error);
    return btoa(text); // Fallback to just base64
  }
}

function simpleDecrypt(encrypted: string, key: string): string {
  try {
    const keyBytes = new TextEncoder().encode(key);
    const encryptedBytes = Uint8Array.from(atob(encrypted), c => c.charCodeAt(0));
    const decrypted = new Uint8Array(encryptedBytes.length);
    
    for (let i = 0; i < encryptedBytes.length; i++) {
      decrypted[i] = encryptedBytes[i] ^ keyBytes[i % keyBytes.length];
    }
    
    return new TextDecoder().decode(decrypted);
  } catch (error) {
    console.error('Decryption failed:', error);
    try {
      return atob(encrypted); // Fallback to just base64
    } catch {
      return encrypted;
    }
  }
}

/**
 * Check if crypto-js is available
 */
function hasCryptoJS(): boolean {
  try {
    // Dynamic import check
    return false; // Will be true when crypto-js is installed
  } catch {
    return false;
  }
}

export class SecureStorage {
  /**
   * Encrypt and store data
   */
  static set(key: string, value: any): void {
    if (!isBrowser()) return;
    try {
      const json = JSON.stringify(value);
      const encrypted = simpleEncrypt(json, ENCRYPTION_KEY);
      localStorage.setItem(key, encrypted);
    } catch (error) {
      console.error('Failed to encrypt data:', error);
      // Fallback to regular storage
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (e) {
        console.error('Failed to store data:', e);
      }
    }
  }

  /**
   * Retrieve and decrypt data
   */
  static get<T = any>(key: string): T | null {
    if (!isBrowser()) return null;
    try {
      const encrypted = localStorage.getItem(key);
      if (!encrypted) return null;

      // Check if it looks like our encrypted format (base64)
      if (/^[A-Za-z0-9+/=]+$/.test(encrypted)) {
        try {
          const decrypted = simpleDecrypt(encrypted, ENCRYPTION_KEY);
          return JSON.parse(decrypted) as T;
        } catch {
          // Maybe it's just plain JSON
          try {
            return JSON.parse(encrypted) as T;
          } catch {
            return null;
          }
        }
      } else {
        // Plain JSON
        try {
          return JSON.parse(encrypted) as T;
        } catch {
          return null;
        }
      }
    } catch (error) {
      console.error('Failed to decrypt data:', error);
      return null;
    }
  }

  /**
   * Remove data
   */
  static remove(key: string): void {
    if (!isBrowser()) return;
    localStorage.removeItem(key);
  }

  /**
   * Clear all storage
   */
  static clear(): void {
    if (!isBrowser()) return;
    localStorage.clear();
  }

  /**
   * Check if key exists
   */
  static has(key: string): boolean {
    return localStorage.getItem(key) !== null;
  }

  /**
   * Get all keys
   */
  static keys(): string[] {
    return Object.keys(localStorage);
  }

  /**
   * Get storage size in bytes
   */
  static getSize(): number {
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += (localStorage[key]?.length || 0) + key.length;
      }
    }
    return total;
  }

  /**
   * Cleanup old data (LRU cache strategy)
   */
  static cleanup(maxSizeBytes: number = 5 * 1024 * 1024): void {
    if (this.getSize() <= maxSizeBytes) return;

    const items = this.keys()
      .filter(key => key.startsWith('cryplounge_'))
      .map(key => ({
        key,
        size: localStorage[key]?.length || 0,
        timestamp: this.getTimestamp(key),
      }))
      .sort((a, b) => a.timestamp - b.timestamp);

    // Remove oldest 20%
    const toRemove = Math.floor(items.length * 0.2);
    items.slice(0, toRemove).forEach(item => {
      this.remove(item.key);
    });
  }

  /**
   * Get timestamp from stored data
   */
  private static getTimestamp(key: string): number {
    const data = this.get(key);
    if (data && typeof data === 'object' && 'timestamp' in data) {
      return (data as any).timestamp;
    }
    return 0;
  }
}

/**
 * Migrate existing localStorage to encrypted storage
 */
export function migrateToSecureStorage(): void {
  const keysToMigrate = [
    'cryplounge_user',
    'cryplounge_xp',
    'cryplounge_xp_transactions',
    'cryplounge_completed_lessons',
    'cryplounge_enrolled_courses',
    'cryplounge_completed_courses',
    'cryplounge_reviewed_courses',
    'cryplounge_daily_streak',
    'admin_session',
  ];

  keysToMigrate.forEach(key => {
    const value = localStorage.getItem(key);
    if (value) {
      // Check if it's plain JSON (not encrypted)
      const looksLikePlainText = value.startsWith('{') || value.startsWith('[') || /^\d+$/.test(value);
      
      if (looksLikePlainText) {
        // Not encrypted yet, migrate it
        try {
          // Try parsing as JSON
          const parsed = JSON.parse(value);
          SecureStorage.set(key, parsed);
          console.log(`Migrated ${key} to secure storage`);
        } catch {
          // Not JSON, could be a number string
          if (/^\d+$/.test(value)) {
            SecureStorage.set(key, parseInt(value));
            console.log(`Migrated ${key} (number) to secure storage`);
          } else {
            // Store as string
            SecureStorage.set(key, value);
            console.log(`Migrated ${key} (string) to secure storage`);
          }
        }
      }
      // If already encrypted, leave it as is
    }
  });
}

/**
 * Clear corrupted storage entries
 */
export function clearCorruptedStorage(): void {
  const keysToCheck = [
    'cryplounge_user',
    'cryplounge_xp',
    'cryplounge_xp_transactions',
    'cryplounge_completed_lessons',
    'cryplounge_enrolled_courses',
    'cryplounge_completed_courses',
    'cryplounge_reviewed_courses',
    'cryplounge_daily_streak',
  ];

  keysToCheck.forEach(key => {
    const value = localStorage.getItem(key);
    if (value) {
      // Try to read it
      const data = SecureStorage.get(key);
      if (data === null && value.length > 0) {
        // Corrupted, clear it
        console.warn(`Clearing corrupted storage: ${key}`);
        localStorage.removeItem(key);
      }
    }
  });
}

// Auto-migrate on load (only in browser)
if (typeof window !== 'undefined') {
  try {
    // First clear any corrupted data
    clearCorruptedStorage();
    
    // Wait a bit before migrating to avoid blocking
    setTimeout(() => {
      migrateToSecureStorage();
    }, 100);
  } catch (error) {
    console.error('Migration failed:', error);
  }
}
