import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PriceAlert, CoinType } from '../types';
import notificationService from '../services/notificationService';
import EditPriceAlertPopup from './EditPriceAlertPopup';

interface PriceAlertsListProps {
  isOpen: boolean;
  onClose: () => void;
  onAddNew: () => void;
  currentCoin: CoinType;
  currentPrice: number;
  refreshTrigger?: number;
}

const PriceAlertsList: React.FC<PriceAlertsListProps> = ({
  isOpen,
  onClose,
  onAddNew,
  currentCoin,
  currentPrice,
  refreshTrigger = 0
}) => {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAlert, setEditingAlert] = useState<PriceAlert | null>(null);
  
  // Fetch alerts when component mounts, coin changes, or refreshTrigger changes
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      notificationService.getAlerts(currentCoin)
        .then(fetchedAlerts => {
          setAlerts(fetchedAlerts);
          setLoading(false);
        });
    }
  }, [isOpen, currentCoin, refreshTrigger]);
  
  // Toggle alert status
  const handleToggleStatus = (alertId: string, currentStatus: boolean) => {
    // 1. Immediately update UI state (optimistic update)
    const newStatus = !currentStatus;
    setAlerts(alerts.map(alert => 
      alert.id === alertId ? { ...alert, active: newStatus } : alert
    ));
    
    // 2. Make API call in background
    notificationService.toggleAlertStatus(alertId, newStatus)
      .then(success => {
        // 3. If the API call fails, revert the UI change
        if (!success) {
          console.error('Failed to update alert status on server');
          setAlerts(alerts.map(alert => 
            alert.id === alertId ? { ...alert, active: currentStatus } : alert
          ));
        }
      });
  };
  
  // Delete alert
  const handleDeleteAlert = async (alertId: string) => {
      const success = await notificationService.deleteAlert(alertId);
      
      if (success) {
        setAlerts(alerts.filter(alert => alert.id !== alertId));
      }
  };

  // Handle edit button click
  const handleEditAlert = (alert: PriceAlert) => {
    setEditingAlert(alert);
  };
  
  // Handle close edit popup
  const handleCloseEditPopup = () => {
    setEditingAlert(null);
    // Re-fetch alerts to get updated data
    notificationService.getAlerts(currentCoin)
      .then(fetchedAlerts => {
        setAlerts(fetchedAlerts);
      });
  };
  
  return (
    <>
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
                                className="edit-button"
                                onClick={() => handleEditAlert(alert)}
                                title="Edit alert"
                              >
                                ✏️
                              </button>
                              <button 
                                className="delete-button"
                                onClick={() => handleDeleteAlert(alert.id)}
                                title="Delete alert"
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

      <EditPriceAlertPopup 
        isOpen={editingAlert !== null}
        onClose={handleCloseEditPopup}
        alert={editingAlert}
        currentPrice={currentPrice}
      />
    </>
  );
};

export default PriceAlertsList;
