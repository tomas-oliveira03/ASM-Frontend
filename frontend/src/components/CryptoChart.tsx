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
  Filler,
} from 'chart.js';
import { CryptoData, DataField } from '../types';
import { motion } from 'framer-motion';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface CryptoChartProps {
  data: CryptoData;
  selectedFields: DataField[];
}

const CryptoChart: React.FC<CryptoChartProps> = ({ data, selectedFields }) => {
  // Parse dates safely and format them consistently for display
  const formatDate = (dateStr: string): string => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date');
      }
      return date.toLocaleDateString();
    } catch (e) {
      console.warn("Invalid date format in chart:", dateStr);
      return dateStr; // Return the original string if parsing fails
    }
  };

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
  
  // Sort dates chronologically
  const sortedDates = Array.from(allDates).sort((a, b) => {
    try {
      return new Date(a).getTime() - new Date(b).getTime();
    } catch (e) {
      return 0;
    }
  });
  
  // Prepare datasets with enhanced styling
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
      borderWidth: 2,
      yAxisID: 'y',
      pointRadius: sortedDates.length > 60 ? 0 : 3,
      pointHoverRadius: 5,
      tension: 0.4,
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
      borderWidth: 2,
      borderDash: [5, 5],
      yAxisID: 'y',
      pointRadius: sortedDates.length > 60 ? 0 : 3,
      pointHoverRadius: 5,
      tension: 0.3,
    });
  }
  
  if (selectedFields.includes('positive_sentiment_ratio')) {
    datasets.push({
      label: 'Positive Sentiment',
      data: sortedDates.map(date => {
        const point = data.positive_sentiment_ratio.find(item => item.date === date);
        return point && point.sentiment > 0 && point.sentiment < 1 ? point.sentiment * 100 : 50;
      }),
      borderColor: 'rgba(75, 192, 192, 0.8)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      borderWidth: 2,
      fill: true,
      yAxisID: 'y1',
      pointRadius: 0,
      pointHoverRadius: 4,
      tension: 0.4,
    });
  }
  
  const chartData = {
    labels: sortedDates.map(formatDate),
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
          size: 18,
          family: "'Inter', sans-serif",
          weight: '600'
        },
        padding: {
          bottom: 20
        },
        color: '#e0e0e0'
      },
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            family: "'Inter', sans-serif",
            size: 12
          },
          color: '#e0e0e0'
        },
        // Enable legend interaction for toggling datasets
        onClick: function(e: any, legendItem: any, legend: any) {
          const index = legendItem.datasetIndex;
          const ci = legend.chart;
          
          if (ci.isDatasetVisible(index)) {
            ci.hide(index);
            legendItem.hidden = true;
          } else {
            ci.show(index);
            legendItem.hidden = false;
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 15, 26, 0.8)',
        titleFont: {
          family: "'Inter', sans-serif",
          size: 14
        },
        bodyFont: {
          family: "'Inter', sans-serif",
          size: 13
        },
        padding: 12,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
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
          maxTicksLimit: sortedDates.length > 60 ? 10 : 20,
          font: {
            family: "'Inter', sans-serif",
            size: 11
          },
          color: '#a0a0a0'
        },
        grid: {
          display: true,
          color: 'rgba(255, 255, 255, 0.05)'
        }
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Price (USD)',
          font: {
            family: "'Inter', sans-serif",
            size: 12,
          },
          color: '#e0e0e0'
        },
        ticks: {
          font: {
            family: "'Inter', sans-serif",
            size: 11
          },
          color: '#a0a0a0',
          callback: (value: number) => '$' + value.toLocaleString()
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.05)'
        }
      },
      y1: {
        type: 'linear' as const,
        display: selectedFields.includes('positive_sentiment_ratio'),
        position: 'right' as const,
        min: 0,
        max: 100,
        title: {
          display: true,
          text: 'Sentiment Ratio (%)',
          font: {
            family: "'Inter', sans-serif",
            size: 12,
          },
          color: '#e0e0e0'
        },
        ticks: {
          font: {
            family: "'Inter', sans-serif",
            size: 11
          },
          color: '#a0a0a0',
          callback: (value: number) => value.toFixed(0) + '%'
        },
        grid: {
          display: false
        }
      },
    },
  };

  return (
    <motion.div 
      className="chart-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Line data={chartData} options={options} />
    </motion.div>
  );
};

export default CryptoChart;
