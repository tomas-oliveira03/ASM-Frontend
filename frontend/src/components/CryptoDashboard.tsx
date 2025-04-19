import { useState, useEffect } from 'react';
import CoinSelector from './CoinSelector';
import TimeRangeSelector from './TimeRangeSelector';
import FieldSelector from './FieldSelector';
import CryptoChart from './CryptoChart';
import { CoinType, CryptoData, DataField, TimeRange } from '../types';
import { getCryptoData, getAvailableCoins, filterDataByTimeRange } from '../services/cryptoService';

const CryptoDashboard: React.FC = () => {
  const [selectedCoin, setSelectedCoin] = useState<CoinType>('BTC');
  // Changed default timerange to 30 days to show more meaningful data from the BTC dataset
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('30days');
  const [selectedFields, setSelectedFields] = useState<DataField[]>(['historical_price', 'predicted_price']);
  const [cryptoData, setCryptoData] = useState<CryptoData | null>(null);
  const [availableCoins, setAvailableCoins] = useState<CoinType[]>([]);

  useEffect(() => {
    // Get available coins
    setAvailableCoins(getAvailableCoins());
    
    // Get initial data
    const data = getCryptoData(selectedCoin);
    const filteredData = filterDataByTimeRange(data, selectedTimeRange);
    setCryptoData(filteredData);
  }, []);

  useEffect(() => {
    if (selectedCoin) {
      const data = getCryptoData(selectedCoin);
      const filteredData = filterDataByTimeRange(data, selectedTimeRange);
      setCryptoData(filteredData);
    }
  }, [selectedCoin, selectedTimeRange]);

  const handleCoinChange = (coin: CoinType) => {
    setSelectedCoin(coin);
  };

  const handleTimeRangeChange = (timeRange: TimeRange) => {
    setSelectedTimeRange(timeRange);
  };

  const handleFieldsChange = (fields: DataField[]) => {
    setSelectedFields(fields);
  };

  if (!cryptoData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="crypto-dashboard">
      <h1>Cryptocurrency Dashboard</h1>
      
      <div className="controls">
        <CoinSelector 
          selectedCoin={selectedCoin}
          availableCoins={availableCoins}
          onChange={handleCoinChange}
        />
        
        <TimeRangeSelector 
          selectedTimeRange={selectedTimeRange}
          onChange={handleTimeRangeChange}
        />
        
        <FieldSelector 
          selectedFields={selectedFields}
          onChange={handleFieldsChange}
        />
      </div>
      
      {selectedFields.length > 0 ? (
        <CryptoChart data={cryptoData} selectedFields={selectedFields} />
      ) : (
        <div className="no-data-message">
          Please select at least one data field to display
        </div>
      )}
    </div>
  );
};

export default CryptoDashboard;
