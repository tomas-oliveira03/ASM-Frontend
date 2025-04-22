import { useState, useEffect } from 'react';
import CoinSelector from './CoinSelector';
import TimeRangeSelector from './TimeRangeSelector';
import CryptoChart from './CryptoChart';
import ModelBenchmarks from './ModelBenchmarks';
import PriceForecastCard from './PriceForecastCard';
import { CoinType, CryptoData, DataField, TimeRange } from '../types';
import { getCryptoData, getAvailableCoins, filterDataByTimeRange } from '../services/cryptoService';

const CryptoDashboard: React.FC = () => {
  const [selectedCoin, setSelectedCoin] = useState<CoinType>('BTC');
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('30days');
  const [selectedFields] = useState<DataField[]>(['historical_price', 'predicted_price', 'positive_sentiment_ratio']);
  const [cryptoData, setCryptoData] = useState<CryptoData | null>(null);
  const [originalData, setOriginalData] = useState<CryptoData | null>(null);
  const [availableCoins, setAvailableCoins] = useState<CoinType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [priceStats, setPriceStats] = useState<{
    current: number;
    initial: number;
    changePercentage: number;
    changeAmount: number;
    nextDay: number;
    nextDayChange: number;
    nextDayChangeAmount: number;
    sevenDay: number;
    sevenDayChange: number;
    sevenDayChangeAmount: number;
  } | null>(null);

  useEffect(() => {
    setAvailableCoins(getAvailableCoins());
    fetchCryptoData(selectedCoin);
  }, []);

  useEffect(() => {
    fetchCryptoData(selectedCoin);
  }, [selectedCoin]);

  const calculatePriceStats = (data: CryptoData) => {
    if (!data.historical_price || !data.predicted_price || 
        data.historical_price.length === 0 || data.predicted_price.length === 0) {
      return null;
    }

    // Sort the historical prices by date
    const sortedHistoricalPrices = [...data.historical_price].sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
    
    // Sort the predicted prices by date
    const sortedPredictedPrices = [...data.predicted_price].sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    // Get initial price from the first point in the selected time range
    const initialPrice = sortedHistoricalPrices[0].price;
    
    // Get current price from the last historical price point
    const currentPrice = sortedHistoricalPrices[sortedHistoricalPrices.length - 1].price;
    
    // Calculate change since initial price
    const changePercentage = ((currentPrice - initialPrice) / initialPrice) * 100;
    const changeAmount = currentPrice - initialPrice;
    
    // Next day forecast (first predicted price)
    const nextDayPrice = sortedPredictedPrices[0].price;
    const nextDayChange = ((nextDayPrice - currentPrice) / currentPrice) * 100;
    const nextDayChangeAmount = nextDayPrice - currentPrice;
    
    // Seven day forecast (if available, otherwise use the last predicted price)
    const sevenDayIndex = Math.min(6, sortedPredictedPrices.length - 1);
    const sevenDayPrice = sortedPredictedPrices[sevenDayIndex].price;
    const sevenDayChange = ((sevenDayPrice - currentPrice) / currentPrice) * 100;
    const sevenDayChangeAmount = sevenDayPrice - currentPrice;
    
    return {
      current: currentPrice,
      initial: initialPrice,
      changePercentage,
      changeAmount,
      nextDay: nextDayPrice,
      nextDayChange,
      nextDayChangeAmount,
      sevenDay: sevenDayPrice,
      sevenDayChange,
      sevenDayChangeAmount
    };
  };

  const fetchCryptoData = async (coin: CoinType) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCryptoData(coin);

      if (!data || !data.historical_price || data.historical_price.length === 0) {
        throw new Error(`No data available for ${coin}`);
      }

      setOriginalData(data);
      const filteredData = filterDataByTimeRange(data, selectedTimeRange);
      setCryptoData(filteredData);
      
      // Calculate price statistics
      const stats = calculatePriceStats(filteredData);
      setPriceStats(stats);
    } catch (err: any) {
      console.error(`Error loading data:`, err);

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
        setError(
          `Network Error: Failed to fetch data. ` +
          `Verify the backend server at http://localhost:3001 is running and accessible. Use console tests (testProxy) to confirm.`
        );
      } else {
        setError(`Failed to load ${coin} data: ${err.message || 'Unknown error'}`);
      }

      setCryptoData(null);
      setPriceStats(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCoinChange = (coin: CoinType) => {
    setSelectedCoin(coin);
  };

  const handleTimeRangeChange = (timeRange: TimeRange) => {
    setSelectedTimeRange(timeRange);
    if (originalData) {
      const filteredData = filterDataByTimeRange(originalData, timeRange);
      setCryptoData(filteredData);
      
      // Recalculate price statistics based on the new time range
      const stats = calculatePriceStats(filteredData);
      setPriceStats(stats);
    }
  };

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

  if (!cryptoData || !priceStats) {
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
      </div>
      
      {/* Current Price Card above the chart */}
      <div className="current-price-container">
        <PriceForecastCard
          title="Current Price"
          price={priceStats.current}
          changePercentage={priceStats.changePercentage}
          changeAmount={priceStats.changeAmount}
          coin={selectedCoin}  // Pass the selected coin to enable WebSocket updates
        />
      </div>
      
      {cryptoData ? (
        <div className="chart-with-controls">
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
          {loading ? "Loading data..." : "No data available"}
        </div>
      )}
      
      {/* Forecast Cards below the chart */}
      <div className="forecast-cards-container">
        <PriceForecastCard
          title="Next Day Forecast"
          price={priceStats.nextDay}
          changePercentage={priceStats.nextDayChange}
          changeAmount={priceStats.nextDayChangeAmount}
          coin={selectedCoin} // Pass coin prop
        />
        <PriceForecastCard
          title="7-Day Forecast"
          price={priceStats.sevenDay}
          changePercentage={priceStats.sevenDayChange}
          changeAmount={priceStats.sevenDayChangeAmount}
          coin={selectedCoin} // Pass coin prop
        />
      </div>
      
      {cryptoData.model_benchmarks && (
        <ModelBenchmarks benchmarks={cryptoData.model_benchmarks} />
      )}
      
      {/* Move calculation date to here - below everything else */}
      {cryptoData.date && (
        <div className="calculation-date">
          <p>Prediction calculated on: <strong>{formatCalculationDate(cryptoData.date)}</strong></p>
        </div>
      )}
    </div>
  );
};

export default CryptoDashboard;
