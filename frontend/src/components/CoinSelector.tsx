import { CoinType } from '../types';
import { motion } from 'framer-motion';

interface CoinSelectorProps {
  selectedCoin: CoinType;
  availableCoins: CoinType[];
  onChange: (coin: CoinType) => void;
}

// Cryptocurrency icons mapping 
const coinIcons: Record<CoinType, string> = {
  BTC: "₿",
  ETH: "Ξ",
  XRP: "✗",
  BNB: "🔶",
  SOL: "◎",
  DOGE: "Ð",
  TRX: "♦",
  ADA: "₳"
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
        <span style={{ fontSize: '24px' }}>{coinIcons[selectedCoin]}</span>
      </label>
      <select 
        id="coin-select" 
        value={selectedCoin} 
        onChange={(e) => onChange(e.target.value as CoinType)}
      >
        {availableCoins.map((coin) => (
          <option key={coin} value={coin}>
            {coinIcons[coin]} {coin}
          </option>
        ))}
      </select>
    </motion.div>
  );
};

export default CoinSelector;
