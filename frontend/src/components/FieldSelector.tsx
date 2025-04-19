import { DataField } from '../types';

interface FieldSelectorProps {
  selectedFields: DataField[];
  onChange: (fields: DataField[]) => void;
}

const FieldSelector: React.FC<FieldSelectorProps> = ({ selectedFields, onChange }) => {
  const fields: { value: DataField; label: string }[] = [
    { value: 'historical_price', label: 'Historical Price' },
    { value: 'predicted_price', label: 'Predicted Price' },
    { value: 'positive_sentiment_ratio', label: 'Positive Sentiment' },
  ];

  const handleCheckboxChange = (field: DataField) => {
    if (selectedFields.includes(field)) {
      onChange(selectedFields.filter(f => f !== field));
    } else {
      onChange([...selectedFields, field]);
    }
  };

  return (
    <div className="field-selector">
      <span>Select Data to Display:</span>
      <div className="checkbox-group">
        {fields.map((field) => (
          <div key={field.value} className="checkbox-item">
            <input
              type="checkbox"
              id={`field-${field.value}`}
              checked={selectedFields.includes(field.value)}
              onChange={() => handleCheckboxChange(field.value)}
            />
            <label htmlFor={`field-${field.value}`}>{field.label}</label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FieldSelector;
