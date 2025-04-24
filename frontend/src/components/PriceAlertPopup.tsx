import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CoinType } from '../types';

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
  
  // Set initial threshold based on current price when popup opens
  useEffect(() => {
    if (isOpen) {
      setThreshold(currentPrice.toFixed(2));
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

  // Handle form submission
  const handleSubmit = () => {
    // Here you would integrate with your notification system
    // For now, we'll just log the alert and close the popup
    console.log('Alert set:', {
      coin: currentCoin,
      type: notificationType,
      condition: condition,
      threshold: parseFloat(threshold)
    });
    
    // Show confirmation message to user
    alert(`${notificationType === 'real-time' ? 'Real-time' : 'Predicted'} price alert set for ${currentCoin} when price is ${condition} $${threshold}`);
    
    onClose();
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
                    className={condition === 'above' ? 'active' : ''}
                    onClick={() => setCondition('above')}
                  >
                    Above
                  </button>
                  <button 
                    className={condition === 'below' ? 'active' : ''}
                    onClick={() => setCondition('below')}
                  >
                    Below
                  </button>
                </div>
              </div>
              
              <div className="alert-section">
                <label>Price Threshold ($)</label>
                <input 
                  type="number" 
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value)}
                  placeholder="Enter price threshold"
                />
              </div>
              
              <div className="current-price-info">
                Current price: <strong>${currentPrice.toLocaleString()}</strong>
              </div>
            </div>
            
            <div className="price-alert-actions">
              <button 
                className="cancel-button"
                onClick={onClose}
              >
                Cancel
              </button>
              <button 
                className="set-alert-button"
                onClick={handleSubmit}
              >
                Set Alert
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PriceAlertPopup;
