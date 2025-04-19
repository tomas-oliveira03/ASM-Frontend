import { motion } from 'framer-motion';

interface PriceForecastCardProps {
  title: string;
  price: number;
  changePercentage: number;
  changeAmount?: number; 
  subtitle?: string;
}

const PriceForecastCard: React.FC<PriceForecastCardProps> = ({ 
  title, 
  price, 
  changePercentage,
  changeAmount,
  subtitle 
}) => {
  // Format price to have commas and 2 decimal places
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price);

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
  
  return (
    <motion.div 
      className="price-forecast-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="card-title">{title}</div>
      <div className="price-value">{formattedPrice}</div>
      <div className="price-change" style={{ color: changeColor }}>
        {changeSymbol}{changePercentage.toFixed(2)}%
        {formattedChangeAmount && (
          <span className="price-change-amount"> ({formattedChangeAmount})</span>
        )}
      </div>
      {subtitle && <div className="price-subtitle">{subtitle}</div>}
    </motion.div>
  );
};

export default PriceForecastCard;
