import React, { useState, useEffect } from 'react';
import { X, Download, Smartphone } from 'lucide-react';
import { pwaManager } from '../../utils/pwa';
import Button from './Button';
import './PWAInstallPrompt.css';

interface PWAInstallPromptProps {
  onClose?: () => void;
  showManualInstructions?: boolean;
}

const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({ 
  onClose,
  showManualInstructions = true 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (pwaManager.isRunningStandalone()) {
      return;
    }

    // Show prompt if installable
    if (pwaManager.canInstall()) {
      // Delay showing to avoid immediately interrupting user
      const timer = setTimeout(() => setIsVisible(true), 3000);
      return () => clearTimeout(timer);
    }

    // Listen for installable event
    const handleInstallable = () => {
      const timer = setTimeout(() => setIsVisible(true), 3000);
      return () => clearTimeout(timer);
    };

    const handleInstalled = () => {
      setIsVisible(false);
    };

    window.addEventListener('pwa-installable', handleInstallable);
    window.addEventListener('pwa-installed', handleInstalled);

    return () => {
      window.removeEventListener('pwa-installable', handleInstallable);
      window.removeEventListener('pwa-installed', handleInstalled);
    };
  }, []);

  const handleInstall = async () => {
    setIsInstalling(true);
    
    try {
      const result = await pwaManager.promptInstall();
      
      if (result?.outcome === 'accepted') {
        setIsVisible(false);
      } else if (result?.outcome === 'dismissed' && showManualInstructions) {
        // Show manual instructions if auto-prompt was dismissed
        setShowInstructions(true);
      }
    } catch (error) {
      console.error('Failed to install PWA:', error);
      if (showManualInstructions) {
        setShowInstructions(true);
      }
    } finally {
      setIsInstalling(false);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setShowInstructions(false);
    onClose?.();
  };

  if (!isVisible) return null;

  return (
    <div className="pwa-install-prompt" role="dialog" aria-labelledby="pwa-title">
      <div className="pwa-install-prompt__content">
        <button
          className="pwa-install-prompt__close"
          onClick={handleClose}
          aria-label="Close install prompt"
        >
          <X size={20} />
        </button>

        <div className="pwa-install-prompt__icon">
          <Smartphone size={32} />
        </div>

        <div className="pwa-install-prompt__text">
          <h3 id="pwa-title" className="pwa-install-prompt__title">
            Install Lume App
          </h3>
          
          {!showInstructions ? (
            <>
              <p className="pwa-install-prompt__description">
                Get the full Lume experience with faster loading and offline access.
              </p>

              <div className="pwa-install-prompt__actions">
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleInstall}
                  disabled={isInstalling}
                  className="pwa-install-prompt__install-btn"
                >
                  <Download size={16} />
                  {isInstalling ? 'Installing...' : 'Install App'}
                </Button>
                
                <Button
                  variant="ghost"
                  size="md"
                  onClick={handleClose}
                  className="pwa-install-prompt__later-btn"
                >
                  Maybe Later
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="pwa-install-prompt__description">
                To install Lume on your device:
              </p>
              <p className="pwa-install-prompt__instructions">
                {pwaManager.getInstallInstructions()}
              </p>
              <Button
                variant="primary"
                size="md"
                onClick={handleClose}
                className="pwa-install-prompt__got-it-btn"
              >
                Got it
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;