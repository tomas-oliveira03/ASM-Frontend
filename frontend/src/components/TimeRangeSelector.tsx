import { TimeRange } from '../types';

interface TimeRangeSelectorProps {
  selectedTimeRange: TimeRange;
  onChange: (timeRange: TimeRange) => void;
}

const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({ selectedTimeRange, onChange }) => {
  const timeRanges: { value: TimeRange; label: string }[] = [
    { value: '7days', label: 'Last 7 Days' },
    { value: '30days', label: 'Last 30 Days' },
    { value: '1year', label: 'Last Year' },
  ];

  return (
    <div className="time-range-selector">
      <span>Time Range:</span>
      <div className="button-group">
        {timeRanges.map((range) => (
          <button
            key={range.value}
            className={selectedTimeRange === range.value ? 'active' : ''}
            onClick={() => onChange(range.value)}
          >
            {range.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TimeRangeSelector;
