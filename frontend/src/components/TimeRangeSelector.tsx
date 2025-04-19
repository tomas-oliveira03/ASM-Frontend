import { TimeRange } from '../types';
import { motion } from 'framer-motion';

interface TimeRangeSelectorProps {
  selectedTimeRange: TimeRange;
  onChange: (timeRange: TimeRange) => void;
}

const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({ selectedTimeRange, onChange }) => {
  const timeRanges: { value: TimeRange; label: string; icon: string }[] = [
    { value: '7days', label: 'Last 7 Days', icon: '📅' },
    { value: '30days', label: 'Last 30 Days', icon: '📆' },
    { value: '1year', label: 'Last Year', icon: '🗓️' },
  ];

  return (
    <motion.div 
      className="time-range-selector"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <span>Time Range</span>
      <div className="button-group">
        {timeRanges.map((range) => (
          <motion.button
            key={range.value}
            className={selectedTimeRange === range.value ? 'active' : ''}
            onClick={() => onChange(range.value)}
            whileHover={{ 
              scale: selectedTimeRange !== range.value ? 1.05 : 1,
              backgroundColor: selectedTimeRange !== range.value ? 'rgba(79, 172, 254, 0.1)' : ''
            }}
            whileTap={{ scale: 0.95 }}
          >
            <span style={{ marginRight: '4px' }}>{range.icon}</span> {range.label.split(' ')[1]}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

export default TimeRangeSelector;
