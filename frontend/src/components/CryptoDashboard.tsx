import { useState, useEffect } from 'react';
import CoinSelector from './CoinSelector';
import TimeRangeSelector from './TimeRangeSelector';
import FieldSelector from './FieldSelector';
import CryptoChart from './CryptoChart';
import ModelBenchmarks from './ModelBenchmarks';
import { CoinType, CryptoData, DataField, TimeRange } from '../types';
import { getCryptoData, getAvailableCoins, filterDataByTimeRange } from '../services/cryptoService';

const CryptoDashboard: React.FC = () => {
  const [selectedCoin, setSelectedCoin] = useState<CoinType>('BTC');
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('30days');
  const [selectedFields, setSelectedFields] = useState<DataField[]>(['historical_price', 'predicted_price']);
  const [cryptoData, setCryptoData] = useState<CryptoData | null>(null);
  const [originalData, setOriginalData] = useState<CryptoData | null>(null); // Store original unfiltered data
  const [availableCoins, setAvailableCoins] = useState<CoinType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get available coins
    setAvailableCoins(getAvailableCoins());
    
    // Load initial data
    fetchCryptoData(selectedCoin);
  }, []);

  useEffect(() => {
    fetchCryptoData(selectedCoin);
  }, [selectedCoin]);

  const fetchCryptoData = async (coin: CoinType) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCryptoData(coin);
      
      if (!data || !data.historical_price || data.historical_price.length === 0) {
        throw new Error(`No data available for ${coin}`);
      }
      
      setOriginalData(data); // Store the original, complete dataset
      const filteredData = filterDataByTimeRange(data, selectedTimeRange);
      setCryptoData(filteredData);
    } catch (err: any) {
      console.error(`Error loading data:`, err);
      
      // Provide more detailed error message based on the error type
      if (err.message && err.message.includes('ECONNREFUSED')) {
        setError(
          `Connection Refused: Unable to connect to the backend server at http://localhost:3001. ` +
          `Please ensure the backend server is running.`
        );
      } else if (err.message && err.message.includes('500')) {
        setError(
          `API Server Error (500): The backend server at http://localhost:3001 returned an internal error. ` +
          `Check the backend server logs for details.`
        );
      } else if (err.message && err.message.includes('Failed to fetch')) {
        // Generic network error message
        setError(
          `Network Error: Failed to fetch data. ` +
          `Verify the backend server at http://localhost:3001 is running and accessible. Use console tests (testProxy) to confirm.`
        );
      } else {
        setError(`Failed to load ${coin} data: ${err.message || 'Unknown error'}`);
      }
      
      setCryptoData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCoinChange = (coin: CoinType) => {
    setSelectedCoin(coin);
  };

  const handleTimeRangeChange = (timeRange: TimeRange) => {
    setSelectedTimeRange(timeRange);
    if (originalData) { // Always filter from the original dataset
      const filteredData = filterDataByTimeRange(originalData, timeRange);
      setCryptoData(filteredData);
    }
  };

  const handleFieldsChange = (fields: DataField[]) => {
    setSelectedFields(fields);
  };

  // Format calculation date
  const formatCalculationDate = (dateString?: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && !cryptoData) {
    return (
      <div className="loading-indicator">
        <p>Loading cryptocurrency data...</p>
        <p className="loading-subtext">Connecting to API server at http://localhost:3001</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        <h2>Error Loading Cryptocurrency Data</h2>
        <p>{error}</p>
        <p>
          <strong>Troubleshooting steps:</strong>
        </p>
        <ol>
          <li><strong>Verify the backend API server is running at http://localhost:3001.</strong> (Check its console!)</li>
          <li>Check the backend server's console output for any errors.</li>
          <li>Restart both backend and frontend servers after making changes.</li>
        </ol>
        <div className="error-actions">
          <CoinSelector 
            selectedCoin={selectedCoin}
            availableCoins={availableCoins}
            onChange={handleCoinChange}
          />
          <button 
            onClick={() => fetchCryptoData(selectedCoin)} 
            className="retry-button"
          >
            Retry
          </button>
        </div>
        <div className="api-test">
          <p>Run these commands in the browser console to diagnose:</p>
          <pre>window.testApiConnection.testDirect()  // Checks backend reachability</pre>
          <pre>window.testApiConnection.testProxy()   // Checks if proxy works</pre>
        </div>
      </div>
    );
  }

  if (!cryptoData) {
    return <div className="no-data-message">No data available for {selectedCoin}</div>;
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
        
        <FieldSelector 
          selectedFields={selectedFields}
          onChange={handleFieldsChange}
        />
      </div>
      
      {/* Moved prediction date display right above the chart */}
      {cryptoData.date && (
        <div className="calculation-date">
          <p>Prediction calculated on: <strong>{formatCalculationDate(cryptoData.date)}</strong></p>
        </div>
      )}
      
      {selectedFields.length > 0 ? (
        <div className="chart-with-controls">
          {/* TimeRangeSelector repositioned here, above the chart like CoinMarketCap */}
          <div className="chart-time-selector">
            <TimeRangeSelector 
              selectedTimeRange={selectedTimeRange}
              onChange={handleTimeRangeChange}
            />
          </div>
          <CryptoChart data={cryptoData} selectedFields={selectedFields} />
        </div>
      ) : (
        <div className="no-data-message">
          Please select at least one data field to display
        </div>
      )}
      
      {cryptoData.model_benchmarks && (
        <ModelBenchmarks benchmarks={cryptoData.model_benchmarks} />
      )}
    </div>
  );
};

export default CryptoDashboard;
