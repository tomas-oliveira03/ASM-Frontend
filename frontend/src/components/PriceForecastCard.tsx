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

  // Keep a reference to the baseline price (for calculating changes)
  // For "Current", this is the initial current price. For "Forecast", this is the predicted price.
  const baselinePriceRef = useRef<number>(price);
  // Store the reference price used to calculate the initial changePercentage for the "Current" card
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
    // Allow connection if coin is provided, regardless of title
    if (coin) {
      // Connect to WebSocket
      websocketService.connect();
      
      // Handler for price updates
      const handlePriceUpdate = (updatedCoin: string, newPrice: number, previousPrice: number | null) => {
        if (updatedCoin === coin) {
          
          if (title.includes('Current')) {
            // --- Update Current Price Card ---
            console.log(`Updating Current price for ${coin}: $${newPrice}`);
            setCurrentPrice(newPrice); // Update displayed price to the latest
            
            // Recalculate changes based on the original reference price
            const newChangeAmount = newPrice - referencePriceRef.current;
            const newChangePercentage = referencePriceRef.current === 0 ? 0 : (newChangeAmount / referencePriceRef.current) * 100;
            
            setCurrentChangePercentage(newChangePercentage);
            setCurrentChangeAmount(newChangeAmount);
            
            console.log(`Current metrics updated: ${newChangePercentage.toFixed(2)}% ($${newChangeAmount.toFixed(2)})`);
            
          } else if (title.includes('Forecast')) {
            // --- Update Forecast Card ---
            // Keep the predicted price (currentPrice state) the same
            const predictedPrice = baselinePriceRef.current; 
            console.log(`Recalculating Forecast for ${coin} based on new current price $${newPrice}. Predicted: $${predictedPrice}`);

            // Recalculate change based on the *new current price* and the *fixed predicted price*
            const newChangeAmount = predictedPrice - newPrice;
            const newChangePercentage = newPrice === 0 ? 0 : (newChangeAmount / newPrice) * 100;

            setCurrentChangePercentage(newChangePercentage);
            setCurrentChangeAmount(newChangeAmount);

            console.log(`Forecast metrics updated: ${newChangePercentage.toFixed(2)}% ($${newChangeAmount.toFixed(2)})`);
          }

          // Trigger visual update effect
          setIsUpdating(true);
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
  // Removed title from dependency array as it's only checked inside the handler now
  }, [coin]); 
  
  // Update reference values when props change
  useEffect(() => {
    setCurrentPrice(price);
    setCurrentChangePercentage(changePercentage);
    setCurrentChangeAmount(changeAmount);
    baselinePriceRef.current = price; // Store the initial price (current or predicted)
    
    // Calculate the reference price for the "Current" card
    if (title.includes('Current')) {
      if (changeAmount !== undefined) {
        referencePriceRef.current = price - changeAmount;
      } else if (changePercentage !== 0) {
        referencePriceRef.current = price / (1 + (changePercentage / 100));
      } else {
        referencePriceRef.current = price; // Avoid division by zero if percentage is 0
      }
    }
    // No need to calculate referencePriceRef for forecast cards here
  }, [price, changePercentage, changeAmount, title]);
  
  return (
    <motion.div 
      className="price-forecast-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="card-title">{title}</div>
      
      {/* Price Value Animation */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={currentPrice} // Key remains currentPrice for visual update trigger
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
      
      {/* Price Change Animation */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={`${currentChangePercentage}-${currentChangeAmount}`} // Key updates when change values update
          className="price-change" 
          style={{ color: changeColor }}
          initial={{ opacity: 0.7, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {changeSymbol}{currentChangePercentage.toFixed(2)}%
          {formattedChangeAmount && (
            <span className="price-change-amount"> ({changeSymbol}{formattedChangeAmount})</span> // Add symbol here too
          )}
        </motion.div>
      </AnimatePresence>
      
      {subtitle && <div className="price-subtitle">{subtitle}</div>}
    </motion.div>
  );
};

export default PriceForecastCard;
