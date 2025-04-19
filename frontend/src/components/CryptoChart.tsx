import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { CryptoData, DataField } from '../types';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface CryptoChartProps {
  data: CryptoData;
  selectedFields: DataField[];
}

const CryptoChart: React.FC<CryptoChartProps> = ({ data, selectedFields }) => {
  // Prepare all dates from all selected datasets
  const allDates = new Set<string>();
  
  if (selectedFields.includes('historical_price')) {
    data.historical_price.forEach(item => allDates.add(item.date));
  }
  
  if (selectedFields.includes('predicted_price')) {
    data.predicted_price.forEach(item => allDates.add(item.date));
  }
  
  if (selectedFields.includes('positive_sentiment_ratio')) {
    data.positive_sentiment_ratio.forEach(item => allDates.add(item.date));
  }
  
  // Sort dates
  const sortedDates = Array.from(allDates).sort();
  
  // Prepare datasets
  const datasets = [];
  
  if (selectedFields.includes('historical_price')) {
    datasets.push({
      label: 'Historical Price',
      data: sortedDates.map(date => {
        const point = data.historical_price.find(item => item.date === date);
        return point ? point.price : null;
      }),
      borderColor: 'rgb(53, 162, 235)',
      backgroundColor: 'rgba(53, 162, 235, 0.5)',
      yAxisID: 'y',
      // For large datasets, reduce point radius and avoid hover highlighting every point
      pointRadius: sortedDates.length > 60 ? 1 : 3,
      pointHoverRadius: sortedDates.length > 60 ? 3 : 5,
    });
  }
  
  if (selectedFields.includes('predicted_price')) {
    datasets.push({
      label: 'Predicted Price',
      data: sortedDates.map(date => {
        const point = data.predicted_price.find(item => item.date === date);
        return point ? point.price : null;
      }),
      borderColor: 'rgb(255, 99, 132)',
      backgroundColor: 'rgba(255, 99, 132, 0.5)',
      borderDash: [5, 5],
      yAxisID: 'y',
      pointRadius: 0, // Hide all points for a cleaner look
      pointHoverRadius: 6, // Still show points on hover for interaction
    });
  }
  
  if (selectedFields.includes('positive_sentiment_ratio')) {
    datasets.push({
      label: 'Positive Sentiment',
      data: sortedDates.map(date => {
        const point = data.positive_sentiment_ratio.find(item => item.date === date);
        // Transform sentiment value from 0-1 to 0-100 for percentage display
        return point ? point.sentiment * 100 : null;
      }),
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.3)', // Semi-transparent fill
      borderWidth: 2,
      fill: true, // Enable fill below the line
      yAxisID: 'y1',
      pointRadius: 0, // Hide points for a cleaner line
      pointHoverRadius: 4, // Show points on hover
      tension: 0.3, // Add slight curve to the line for smoother appearance
    });
  }
  
  const chartData = {
    labels: sortedDates,
    datasets,
  };
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    stacked: false,
    plugins: {
      title: {
        display: true,
        text: `${data.coin} - Price and Sentiment Analysis`,
        font: {
          size: 16
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              if (context.dataset.yAxisID === 'y1') {
                label += context.parsed.y.toFixed(2) + '%';
              } else {
                label += '$' + context.parsed.y.toLocaleString();
              }
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          // For large datasets, show fewer x-axis labels
          maxTicksLimit: sortedDates.length > 60 ? 10 : 20,
        }
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Price (USD)',
        },
        ticks: {
          callback: (value: number) => '$' + value.toLocaleString()
        }
      },
      y1: {
        type: 'linear' as const,
        display: selectedFields.includes('positive_sentiment_ratio'),
        position: 'right' as const,
        grid: {
          drawOnChartArea: false,
        },
        min: 0,
        max: 100,
        title: {
          display: true,
          text: 'Sentiment Ratio (%)',
        },
        ticks: {
          callback: (value: number) => value.toFixed(0) + '%'
        }
      },
    },
  };

  return (
    <div className="chart-container">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default CryptoChart;
