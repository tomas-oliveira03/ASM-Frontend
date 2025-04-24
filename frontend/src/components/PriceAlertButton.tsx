import { useState } from 'react';
import { motion } from 'framer-motion';
import { CoinType } from '../types';
import PriceAlertPopup from './PriceAlertPopup';

interface PriceAlertButtonProps {
  coin: CoinType;
  currentPrice: number;
}

const PriceAlertButton: React.FC<PriceAlertButtonProps> = ({ coin, currentPrice }) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  return (
    <>
      <motion.div 
        className="price-alert-button"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsPopupOpen(true)}
        title="Set Price Alert"
      >
        <span className="bell-icon">🔔</span>
        <span className="alert-label">Price Alerts</span>
      </motion.div>
      
      <PriceAlertPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        currentCoin={coin}
        currentPrice={currentPrice}
      />
    </>
  );
};

export default PriceAlertButton;
