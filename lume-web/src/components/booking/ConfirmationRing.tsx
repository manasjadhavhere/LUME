import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import './ConfirmationRing.css';

export default function ConfirmationRing() {
  const [showPulse, setShowPulse] = useState(false);

  useEffect(() => {
    // Start pulse animation after pop animation completes
    const timer = setTimeout(() => {
      setShowPulse(true);
    }, 600); // Pop animation duration

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`confirmation-ring ${showPulse ? 'pulse' : ''}`}>
      <div className="confirmation-ring-inner">
        <Check className="confirmation-check" size={48} strokeWidth={2.5} />
      </div>
    </div>
  );
}