import { useState } from 'react';
import type { ConversionOptions } from '../types';
import './ConversionControls.css';

interface ConversionControlsProps {
  onConvert: (options: ConversionOptions) => void;
  isProcessing: boolean;
  hasImages: boolean;
}

export const ConversionControls = ({ onConvert, isProcessing, hasImages }: ConversionControlsProps) => {
  const [format, setFormat] = useState<'jpeg' | 'png' | 'webp' | 'avif'>('webp');
  const [quality, setQuality] = useState(80);
  const [maxWidth, setMaxWidth] = useState<string>('');
  const [maxHeight, setMaxHeight] = useState<string>('');
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);

  const handleConvert = () => {
    const options: ConversionOptions = {
      format,
      quality,
      maxWidth: maxWidth ? parseInt(maxWidth) : undefined,
      maxHeight: maxHeight ? parseInt(maxHeight) : undefined,
      maintainAspectRatio,
    };
    onConvert(options);
  };

  return (
    <div className="conversion-controls">
      <h2>変換設定</h2>

      <div className="control-group">
        <label>出力フォーマット</label>
        <div className="format-selector">
          <button
            className={`format-btn ${format === 'jpeg' ? 'active' : ''}`}
            onClick={() => setFormat('jpeg')}
          >
            JPEG
          </button>
          <button
            className={`format-btn ${format === 'png' ? 'active' : ''}`}
            onClick={() => setFormat('png')}
          >
            PNG
          </button>
          <button
            className={`format-btn ${format === 'webp' ? 'active' : ''}`}
            onClick={() => setFormat('webp')}
          >
            WebP
          </button>
          <button
            className={`format-btn ${format === 'avif' ? 'active' : ''}`}
            onClick={() => setFormat('avif')}
          >
            AVIF
          </button>
        </div>
      </div>

      <div className="control-group">
        <label>
          品質: {quality}%
        </label>
        <input
          type="range"
          min="1"
          max="100"
          value={quality}
          onChange={(e) => setQuality(parseInt(e.target.value))}
          className="quality-slider"
        />
        <div className="quality-hints">
          <span>低品質</span>
          <span>高品質</span>
        </div>
      </div>

      <div className="control-group">
        <label>リサイズ（オプション）</label>
        <div className="resize-inputs">
          <div className="input-wrapper">
            <label htmlFor="maxWidth">最大幅 (px)</label>
            <input
              type="number"
              id="maxWidth"
              placeholder="指定なし"
              value={maxWidth}
              onChange={(e) => setMaxWidth(e.target.value)}
              min="1"
            />
          </div>
          <div className="input-wrapper">
            <label htmlFor="maxHeight">最大高さ (px)</label>
            <input
              type="number"
              id="maxHeight"
              placeholder="指定なし"
              value={maxHeight}
              onChange={(e) => setMaxHeight(e.target.value)}
              min="1"
            />
          </div>
        </div>
        <div className="checkbox-wrapper">
          <input
            type="checkbox"
            id="aspectRatio"
            checked={maintainAspectRatio}
            onChange={(e) => setMaintainAspectRatio(e.target.checked)}
          />
          <label htmlFor="aspectRatio">アスペクト比を維持</label>
        </div>
      </div>

      <button
        className="convert-btn"
        onClick={handleConvert}
        disabled={!hasImages || isProcessing}
      >
        {isProcessing ? '変換中...' : '変換開始'}
      </button>
    </div>
  );
};
