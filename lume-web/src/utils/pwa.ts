/**
 * PWA Utilities for Lume
 * Handles service worker registration and PWA install prompts
 */

// PWA install prompt event interface
interface BeforeInstallPromptEvent extends Event {
  platforms: string[];
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<void>;
}

class PWAManager {
  private deferredPrompt: BeforeInstallPromptEvent | null = null;
  private isInstallable = false;

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners() {
    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e as BeforeInstallPromptEvent;
      this.isInstallable = true;
      
      // Optional: Dispatch custom event to notify components
      window.dispatchEvent(new CustomEvent('pwa-installable', { 
        detail: { canInstall: true } 
      }));
    });

    // Listen for successful app installation
    window.addEventListener('appinstalled', () => {
      this.deferredPrompt = null;
      this.isInstallable = false;
      
      // Optional: Track successful installation
      console.log('PWA: App was successfully installed');
      
      // Optional: Dispatch custom event
      window.dispatchEvent(new CustomEvent('pwa-installed'));
    });
  }

  /**
   * Check if the app can be installed
   */
  canInstall(): boolean {
    return this.isInstallable && this.deferredPrompt !== null;
  }

  /**
   * Prompt the user to install the PWA
   */
  async promptInstall(): Promise<{ outcome: 'accepted' | 'dismissed'; platform: string } | null> {
    if (!this.deferredPrompt) {
      console.warn('PWA: Install prompt not available');
      return null;
    }

    try {
      await this.deferredPrompt.prompt();
      const choiceResult = await this.deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('PWA: User accepted the install prompt');
      } else {
        console.log('PWA: User dismissed the install prompt');
      }
      
      this.deferredPrompt = null;
      this.isInstallable = false;
      
      return choiceResult;
    } catch (error) {
      console.error('PWA: Error showing install prompt:', error);
      return null;
    }
  }

  /**
   * Check if the app is running in standalone mode (installed)
   */
  isRunningStandalone(): boolean {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      // @ts-ignore - navigator.standalone is iOS specific
      window.navigator?.standalone === true ||
      document.referrer.includes('android-app://')
    );
  }

  /**
   * Get PWA installation instructions based on the browser
   */
  getInstallInstructions(): string {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    const isChrome = /Chrome/.test(navigator.userAgent);
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);

    if (isIOS && isSafari) {
      return 'Tap the Share button and select "Add to Home Screen"';
    } else if (isAndroid && isChrome) {
      return 'Tap the menu (⋮) and select "Add to Home Screen"';
    } else if (isChrome) {
      return 'Click the install icon in the address bar or menu';
    } else {
      return 'Look for "Add to Home Screen" or "Install" option in your browser menu';
    }
  }
}

// Create singleton instance
export const pwaManager = new PWAManager();

// Utility functions for React components
export const usePWA = () => {
  return {
    canInstall: pwaManager.canInstall(),
    promptInstall: pwaManager.promptInstall.bind(pwaManager),
    isInstalled: pwaManager.isRunningStandalone(),
    getInstallInstructions: pwaManager.getInstallInstructions.bind(pwaManager),
  };
};