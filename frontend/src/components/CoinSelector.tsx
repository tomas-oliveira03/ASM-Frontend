import { CoinType } from '../types';

interface CoinSelectorProps {
  selectedCoin: CoinType;
  availableCoins: CoinType[];
  onChange: (coin: CoinType) => void;
}

const CoinSelector: React.FC<CoinSelectorProps> = ({ selectedCoin, availableCoins, onChange }) => {
  return (
    <div className="coin-selector">
      <label htmlFor="coin-select">Select Cryptocurrency:</label>
      <select 
        id="coin-select" 
        value={selectedCoin} 
        onChange={(e) => onChange(e.target.value as CoinType)}
      >
        {availableCoins.map((coin) => (
          <option key={coin} value={coin}>
            {coin}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CoinSelector;
