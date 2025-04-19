import { CoinType } from '../types';
import { motion } from 'framer-motion';

interface CoinSelectorProps {
  selectedCoin: CoinType;
  availableCoins: CoinType[];
  onChange: (coin: CoinType) => void;
}

// Get cryptocurrency logo path
const getCoinLogoPath = (coin: CoinType): string => {
  return `/crypto-logos/${coin.toLowerCase()}.png`;
};

const CoinSelector: React.FC<CoinSelectorProps> = ({ selectedCoin, availableCoins, onChange }) => {
  return (
    <motion.div 
      className="coin-selector"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <label htmlFor="coin-select">
        <span style={{ display: 'block', marginBottom: '8px' }}>Select Cryptocurrency</span>
        <div className="selected-coin-display">
          <img 
            src={getCoinLogoPath(selectedCoin)} 
            alt={`${selectedCoin} logo`} 
            className="coin-logo"
            onError={(e) => {
              // Fallback if image fails to load
              (e.target as HTMLImageElement).style.display = 'none';
              (e.target as HTMLImageElement).nextSibling!.style.display = 'inline';
            }}
          />
          <span className="coin-icon-fallback" style={{ display: 'none' }}>
            {selectedCoin}
          </span>
          <span className="selected-coin-text">{selectedCoin}</span>
        </div>
      </label>
      <select 
        id="coin-select" 
        value={selectedCoin} 
        onChange={(e) => onChange(e.target.value as CoinType)}
        className="enhanced-select"
      >
        {availableCoins.map((coin) => (
          <option key={coin} value={coin}>
            {coin}
          </option>
        ))}
      </select>
    </motion.div>
  );
};

export default CoinSelector;
