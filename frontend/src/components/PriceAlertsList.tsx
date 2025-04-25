import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PriceAlert, CoinType } from '../types';
import notificationService from '../services/notificationService';

interface PriceAlertsListProps {
  isOpen: boolean;
  onClose: () => void;
  onAddNew: () => void;
  currentCoin: CoinType;
  currentPrice: number;
}

const PriceAlertsList: React.FC<PriceAlertsListProps> = ({
  isOpen,
  onClose,
  onAddNew,
  currentCoin,
  currentPrice
}) => {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch alerts when component mounts or coin changes
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      notificationService.getAlerts(currentCoin)
        .then(fetchedAlerts => {
          setAlerts(fetchedAlerts);
          setLoading(false);
        });
    }
  }, [isOpen, currentCoin]);
  
  // Toggle alert status
  const handleToggleStatus = async (alertId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    const success = await notificationService.toggleAlertStatus(alertId, newStatus);
    
    if (success) {
      setAlerts(alerts.map(alert => 
        alert.id === alertId ? { ...alert, active: newStatus } : alert
      ));
    }
  };
  
  // Delete alert
  const handleDeleteAlert = async (alertId: string) => {
    if (window.confirm('Are you sure you want to delete this alert?')) {
      const success = await notificationService.deleteAlert(alertId);
      
      if (success) {
        setAlerts(alerts.filter(alert => alert.id !== alertId));
      }
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
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="price-alert-header">
              <h3>Price Alerts for {currentCoin}</h3>
              <button className="close-button" onClick={onClose}>×</button>
            </div>
            
            <div className="price-alert-content alerts-list-content">
              <div className="current-price-info">
                Current price: <strong>${currentPrice.toLocaleString()}</strong>
              </div>
              
              {loading ? (
                <div className="loading-message">Loading your alerts...</div>
              ) : (
                <>
                  {alerts.length === 0 ? (
                    <div className="no-alerts-message">
                      <p>You don't have any alerts set for {currentCoin}.</p>
                    </div>
                  ) : (
                    <div className="alerts-list">
                      {alerts.map(alert => (
                        <div key={alert.id} className="alert-item">
                          <div className="alert-info">
                            <div className="alert-type">
                              {alert.type === 'real-time' ? '⚡ Real-time' : '🔮 Predicted'}
                            </div>
                            <div className="alert-condition">
                              Price {alert.condition} <strong>${alert.threshold.toLocaleString()}</strong>
                            </div>
                          </div>
                          <div className="alert-actions">
                            <label className="toggle">
                              <input 
                                type="checkbox" 
                                checked={alert.active}
                                onChange={() => handleToggleStatus(alert.id, alert.active)}
                              />
                              <span className="slider"></span>
                            </label>
                            <button 
                              className="delete-button"
                              onClick={() => handleDeleteAlert(alert.id)}
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
            
            <div className="price-alert-actions">
              <button className="cancel-button" onClick={onClose}>Close</button>
              <button className="set-alert-button" onClick={onAddNew}>+ New Alert</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PriceAlertsList;
