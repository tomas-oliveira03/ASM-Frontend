import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
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
  const [currentChangePercentage, setCurrentChangePercentage] = useState<number>(changePercentage);
  const [currentChangeAmount, setCurrentChangeAmount] = useState<number | undefined>(changeAmount);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<string>('');
  
  // Keep a reference to the baseline price (for calculating changes)
  const baselinePriceRef = useRef<number>(price);
  // Store the reference price used to calculate the initial changePercentage
  const referencePriceRef = useRef<number>(price - (changeAmount || 0));

  // Format price to have commas and 2 decimal places
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(currentPrice);

  // Format change amount if provided - no "+" symbol
  const formattedChangeAmount = currentChangeAmount !== undefined 
    ? new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(Math.abs(currentChangeAmount))
    : null;

  // Determine if change is positive or negative for styling
  const isPositive = currentChangePercentage >= 0;
  const changeColor = isPositive ? '#4ade80' : '#f87171';
  const changeSymbol = isPositive ? '+' : '';

  // Connect to WebSocket and listen for price updates
  useEffect(() => {
    if (coin && title.includes('Current')) {
      // Connect to WebSocket
      websocketService.connect();
      
      // Handler for price updates
      const handlePriceUpdate = (updatedCoin: string, newPrice: number, previousPrice: number | null) => {
        if (updatedCoin === coin) {
          console.log(`Updating price for ${coin}: $${newPrice}`);
          
          // Update the current price
          setCurrentPrice(newPrice);
          
          // Calculate changes based on original reference price
          const newChangeAmount = newPrice - referencePriceRef.current;
          const newChangePercentage = (newChangeAmount / referencePriceRef.current) * 100;
          
          setCurrentChangePercentage(newChangePercentage);
          setCurrentChangeAmount(newChangeAmount);
          
          console.log(`Updated metrics: ${newChangePercentage.toFixed(2)}% ($${newChangeAmount.toFixed(2)})`);
          
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
  
  // Update reference values when props change
  useEffect(() => {
    setCurrentPrice(price);
    setCurrentChangePercentage(changePercentage);
    setCurrentChangeAmount(changeAmount);
    baselinePriceRef.current = price;
    
    // Calculate the reference price that would have produced the given change percentage
    if (changeAmount) {
      referencePriceRef.current = price - changeAmount;
    } else {
      referencePriceRef.current = price / (1 + (changePercentage / 100));
    }
  }, [price, changePercentage, changeAmount]);
  
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
      
      <AnimatePresence mode="wait">
        <motion.div 
          key={`${currentChangePercentage}-${currentChangeAmount}`}
          className="price-change" 
          style={{ color: changeColor }}
          initial={{ opacity: 0.7, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {changeSymbol}{currentChangePercentage.toFixed(2)}%
          {formattedChangeAmount && (
            <span className="price-change-amount"> ({formattedChangeAmount})</span>
          )}
        </motion.div>
      </AnimatePresence>
      
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
          Last updated: {lastUpdateTime}
        </motion.div>
      )}
    </motion.div>
  );
};

export default PriceForecastCard;
