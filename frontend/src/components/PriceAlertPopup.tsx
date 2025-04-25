import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CoinType } from '../types';
import notificationService from '../services/notificationService'; // Import the notification service

interface PriceAlertPopupProps {
  isOpen: boolean;
  onClose: () => void;
  currentCoin: CoinType;
  currentPrice: number;
}

const PriceAlertPopup: React.FC<PriceAlertPopupProps> = ({
  isOpen,
  onClose,
  currentCoin,
  currentPrice
}) => {
  // State for form fields
  const [notificationType, setNotificationType] = useState<'real-time' | 'predicted'>('real-time');
  const [condition, setCondition] = useState<'above' | 'below'>('above');
  const [threshold, setThreshold] = useState('');
  
  // Add ref to track if we've set the initial threshold for this popup session
  const initializedRef = useRef(false);
  
  // Set initial threshold and reset selections ONLY when popup first opens
  useEffect(() => {
    if (isOpen) {
      // Reset notification type and condition every time popup opens
      setNotificationType('real-time');
      setCondition('above');
      
      // Only set the threshold when popup first opens, not on subsequent price updates
      if (!initializedRef.current) {
        setThreshold(currentPrice.toFixed(2));
        initializedRef.current = true;
      }
    } else {
      // Reset the initialization flag when popup closes
      initializedRef.current = false;
    }
  }, [isOpen, currentPrice]);
  
  // Handle clicking outside to close popup
  const popupRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Add loading state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle form submission
  const handleSubmit = async () => {
    // Validate input
    if (!threshold || isNaN(parseFloat(threshold))) {
      setError('Please enter a valid price threshold');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    
    try {
      // Call the createAlert function from notificationService
      await notificationService.createAlert(
        currentCoin,
        notificationType,
        condition,
        parseFloat(threshold)
      );
      onClose();
      
    } catch (err) {
      console.error('Error creating alert:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="price-alert-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="price-alert-popup"
            ref={popupRef}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="price-alert-header">
              <h3>Set Price Alert for {currentCoin}</h3>
              <button 
                className="close-button"
                onClick={onClose}
              >
                ×
              </button>
            </div>
            
            <div className="price-alert-content">
              <div className="alert-section">
                <label>Notification Type</label>
                <div className="toggle-buttons">
                  <button 
                    className={notificationType === 'real-time' ? 'active' : ''}
                    onClick={() => setNotificationType('real-time')}
                  >
                    Real-time Price
                  </button>
                  <button 
                    className={notificationType === 'predicted' ? 'active' : ''}
                    onClick={() => setNotificationType('predicted')}
                  >
                    Predicted Price
                  </button>
                </div>
              </div>
              
              <div className="alert-section">
                <label>Notify me when price is:</label>
                <div className="toggle-buttons">
                  <button 
                    className={condition === 'below' ? 'active' : ''}
                    onClick={() => setCondition('below')}
                  >
                    Below
                  </button>
                  <button 
                    className={condition === 'above' ? 'active' : ''}
                    onClick={() => setCondition('above')}
                  >
                    Above
                  </button>
                </div>
              </div>
              
              <div className="alert-section">
                <label>Price Threshold ($)</label>
                <input 
                  type="number" 
                  value={threshold}
                  onChange={(e) => {
                    // Limit to 2 decimal places
                    const value = e.target.value;
                    
                    // Check if the value has more than 2 decimal places
                    const decimalParts = value.split('.');
                    if (decimalParts.length > 1 && decimalParts[1].length > 2) {
                      // Truncate to 2 decimal places
                      setThreshold(Number(value).toFixed(2));
                    } else {
                      setThreshold(value);
                    }
                  }}
                  step="0.01"
                  placeholder="Enter price threshold"
                />
              </div>
              
              <div className="current-price-info">
                {/* This will update with real-time prices since it uses the currentPrice prop directly */}
                Current price: <strong>${currentPrice.toLocaleString()}</strong>
              </div>

              {error && (
                <div className="alert-error-message">
                  {error}
                </div>
              )}
            </div>
            
            <div className="price-alert-actions">
              <button 
                className="cancel-button"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                className="set-alert-button"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Set Alert'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PriceAlertPopup;
