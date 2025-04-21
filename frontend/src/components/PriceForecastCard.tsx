import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import websocketService from '../services/websocketService';

interface PriceForecastCardProps {
  title: string;
  price: number;
  changePercentage: number;
  changeAmount?: number; 
  subtitle?: string;
  coin?: string; // Add coin prop to know which updates to listen for
}

const PriceForecastCard: React.FC<PriceForecastCardProps> = ({ 
  title, 
  price, 
  changePercentage,
  changeAmount,
  subtitle,
  coin 
}) => {
  const [currentPrice, setCurrentPrice] = useState<number>(price);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<string>('');

  // Format price to have commas and 2 decimal places
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(currentPrice);

  // Format change amount if provided - no "+" symbol
  const formattedChangeAmount = changeAmount !== undefined 
    ? new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(Math.abs(changeAmount))
    : null;

  // Determine if change is positive or negative for styling
  const isPositive = changePercentage >= 0;
  const changeColor = isPositive ? '#4ade80' : '#f87171';
  const changeSymbol = isPositive ? '+' : '';

  // Connect to WebSocket and listen for price updates
  useEffect(() => {
    if (coin && title.includes('Current')) {
      // Connect to WebSocket
      websocketService.connect();
      
      // Handler for price updates
      const handlePriceUpdate = (updatedCoin: string, newPrice: number) => {
        if (updatedCoin === coin) {
          console.log(`Updating price for ${coin}: $${newPrice}`);
          setCurrentPrice(newPrice);
          setIsUpdating(true);
          setLastUpdateTime(new Date().toLocaleTimeString());
          
          // Reset the highlight effect after animation
          setTimeout(() => setIsUpdating(false), 2000);
        }
      };
      
      // Register the handler
      websocketService.onPriceUpdate(handlePriceUpdate);
      
      // Cleanup function
      return () => {
        websocketService.removeCallback(handlePriceUpdate);
      };
    }
  }, [coin, title]);
  
  return (
    <motion.div 
      className="price-forecast-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="card-title">{title}</div>
      
      <AnimatePresence mode="wait">
        <motion.div 
          key={currentPrice}
          className="price-value"
          initial={{ opacity: 0.7, scale: 0.95 }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            backgroundColor: isUpdating ? 'rgba(79, 172, 254, 0.15)' : 'transparent',
          }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {formattedPrice}
        </motion.div>
      </AnimatePresence>
      
      <div className="price-change" style={{ color: changeColor }}>
        {changeSymbol}{changePercentage.toFixed(2)}%
        {formattedChangeAmount && (
          <span className="price-change-amount"> ({formattedChangeAmount})</span>
        )}
      </div>
      
      {subtitle && <div className="price-subtitle">{subtitle}</div>}
      
      {lastUpdateTime && title.includes('Current') && (
        <motion.div 
          className="price-update-time"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          style={{ 
            fontSize: '0.75rem', 
            color: '#a0a0a0',
            marginTop: '8px'
          }}
        >
        </motion.div>
      )}
    </motion.div>
  );
};

export default PriceForecastCard;
