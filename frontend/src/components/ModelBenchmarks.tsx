import { ModelBenchmarks as ModelBenchmarksType } from '../types';

interface ModelBenchmarksProps {
  benchmarks: ModelBenchmarksType;
}

const ModelBenchmarks: React.FC<ModelBenchmarksProps> = ({ benchmarks }) => {
  return (
    <div className="model-benchmarks">
      <h3>Model Performance Metrics</h3>
      <div className="benchmarks-grid">
        <div className="benchmark-item">
          <div className="benchmark-label">MAE</div>
          <div className="benchmark-value">{benchmarks.mae.toFixed(2)}</div>
          <div className="benchmark-desc">Mean Absolute Error</div>
        </div>
        <div className="benchmark-item">
          <div className="benchmark-label">MAPE</div>
          <div className="benchmark-value">{benchmarks.mape.toFixed(2)}%</div>
          <div className="benchmark-desc">Mean Absolute Percentage Error</div>
        </div>
        <div className="benchmark-item">
          <div className="benchmark-label">RMSE</div>
          <div className="benchmark-value">{benchmarks.rmse.toFixed(2)}</div>
          <div className="benchmark-desc">Root Mean Square Error</div>
        </div>
        <div className="benchmark-item">
          <div className="benchmark-label">R²</div>
          <div className="benchmark-value">{benchmarks.r2.toFixed(4)}</div>
          <div className="benchmark-desc">Coefficient of Determination</div>
        </div>
      </div>
    </div>
  );
};

export default ModelBenchmarks;
