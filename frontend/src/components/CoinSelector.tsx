import { CoinType } from '../types';
import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';

interface CoinSelectorProps {
  selectedCoin: CoinType;
  availableCoins: CoinType[];
  onChange: (coin: CoinType) => void;
}

// Get cryptocurrency logo path
const getCoinLogoPath = (coin: CoinType): string => {
  return `/crypto-logos/${coin}.png`;
};

const CoinSelector: React.FC<CoinSelectorProps> = ({ selectedCoin, availableCoins, onChange }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <motion.div 
      className="coin-selector"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <label htmlFor="coin-select">
      </label>
      
      {/* Custom dropdown selector */}
      <div className="custom-select-container" ref={dropdownRef}>
        {/* Selected coin display - acts as dropdown toggle */}
        <div 
          className={`selected-coin-display ${dropdownOpen ? 'active' : ''}`}
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          <img 
            src={getCoinLogoPath(selectedCoin)} 
            alt={`${selectedCoin} logo`} 
            className="coin-logo"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              (e.target as HTMLImageElement).nextSibling!.style.display = 'inline';
            }}
          />
          <span className="coin-icon-fallback" style={{ display: 'none' }}>
            {selectedCoin}
          </span>
          <span className="selected-coin-text">{selectedCoin}</span>
          <span className="dropdown-arrow">▼</span>
        </div>
        
        {/* Dropdown options */}
        {dropdownOpen && (
          <motion.div 
            className="coin-dropdown"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {availableCoins.map((coin) => (
              <div 
                key={coin} 
                className={`coin-option ${selectedCoin === coin ? 'selected' : ''}`}
                onClick={() => {
                  onChange(coin);
                  setDropdownOpen(false);
                }}
              >
                <img 
                  src={getCoinLogoPath(coin)} 
                  alt={`${coin} logo`} 
                  className="coin-logo"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).nextSibling!.style.display = 'inline';
                  }}
                />
                <span className="coin-icon-fallback" style={{ display: 'none' }}>
                  {coin}
                </span>
                <span className="coin-option-text">{coin}</span>
              </div>
            ))}
          </motion.div>
        )}
      </div>
      
      {/* Hidden actual select for form submission if needed */}
      <select 
        id="coin-select" 
        value={selectedCoin} 
        onChange={(e) => onChange(e.target.value as CoinType)}
        className="hidden-select"
        aria-hidden="true"
      >
        {availableCoins.map((coin) => (
          <option key={coin} value={coin}>{coin}</option>
        ))}
      </select>
    </motion.div>
  );
};

export default CoinSelector;
