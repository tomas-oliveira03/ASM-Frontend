import { useState } from 'react';
import { motion } from 'framer-motion';
import { CoinType } from '../types';
import PriceAlertPopup from './PriceAlertPopup';
import PriceAlertsList from './PriceAlertsList';

interface PriceAlertButtonProps {
  coin: CoinType;
  currentPrice: number;
}

const PriceAlertButton: React.FC<PriceAlertButtonProps> = ({ coin, currentPrice }) => {
  const [isListOpen, setIsListOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  
  const handleOpenList = () => {
    setIsListOpen(true);
  };
  
  const handleCloseList = () => {
    setIsListOpen(false);
  };
  
  const handleOpenCreate = () => {
    setIsListOpen(false);
    setIsCreateOpen(true);
  };
  
  const handleCloseCreate = () => {
    setIsCreateOpen(false);
    // Go back to list after creating
    setIsListOpen(true);
  };

  return (
    <>
      <motion.div 
        className="price-alert-button"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleOpenList}
        title="Price Alerts"
      >
        <span className="bell-icon">🔔</span>
        <span className="alert-label">Price Alerts</span>
      </motion.div>
      
      <PriceAlertsList
        isOpen={isListOpen}
        onClose={handleCloseList}
        onAddNew={handleOpenCreate}
        currentCoin={coin}
        currentPrice={currentPrice}
      />
      
      <PriceAlertPopup
        isOpen={isCreateOpen}
        onClose={handleCloseCreate}
        currentCoin={coin}
        currentPrice={currentPrice}
      />
    </>
  );
};

export default PriceAlertButton;
