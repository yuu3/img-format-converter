import type { ImageFile } from '../types';
import './ImagePreview.css';

interface ImagePreviewProps {
  images: ImageFile[];
  onRemove: (id: string) => void;
  onDownload: (id: string) => void;
  onCrop?: (id: string) => void;
}

export const ImagePreview = ({ images, onRemove, onDownload, onCrop }: ImagePreviewProps) => {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getCompressionRate = (original: number, converted?: number): string => {
    if (!converted) return '-';
    const rate = ((original - converted) / original) * 100;
    return rate > 0 ? `-${rate.toFixed(1)}%` : `+${Math.abs(rate).toFixed(1)}%`;
  };

  if (images.length === 0) {
    return null;
  }

  return (
    <div className="image-preview-container">
      <h2>アップロード済み画像 ({images.length})</h2>
      <div className="image-grid">
        {images.map((img) => (
          <div key={img.id} className="image-card">
            <div className="image-wrapper">
              <img src={img.preview} alt={img.file.name} />
              {img.status === 'processing' && (
                <div className="processing-overlay">
                  <div className="spinner"></div>
                </div>
              )}
              {img.status === 'error' && (
                <div className="error-overlay">
                  <span>エラー</span>
                </div>
              )}
            </div>
            <div className="image-info">
              <p className="image-name" title={img.file.name}>
                {img.file.name}
              </p>
              <div className="size-info">
                <div>
                  <span className="label">元のサイズ:</span>
                  <span className="value">{formatFileSize(img.originalSize)}</span>
                </div>
                {img.convertedSize && (
                  <>
                    <div>
                      <span className="label">変換後:</span>
                      <span className="value">{formatFileSize(img.convertedSize)}</span>
                    </div>
                    <div className="compression-rate">
                      <span className="label">削減率:</span>
                      <span className={`value ${getCompressionRate(img.originalSize, img.convertedSize).startsWith('-') ? 'positive' : 'negative'}`}>
                        {getCompressionRate(img.originalSize, img.convertedSize)}
                      </span>
                    </div>
                  </>
                )}
              </div>
              {img.error && (
                <p className="error-message">{img.error}</p>
              )}
              <div className="button-group">
                {onCrop && img.status === 'idle' && (
                  <button
                    className="crop-btn"
                    onClick={() => onCrop(img.id)}
                  >
                    トリミング
                  </button>
                )}
                {img.status === 'completed' && img.convertedBlob && (
                  <button
                    className="download-btn"
                    onClick={() => onDownload(img.id)}
                  >
                    ダウンロード
                  </button>
                )}
                <button
                  className="remove-btn"
                  onClick={() => onRemove(img.id)}
                  disabled={img.status === 'processing'}
                >
                  削除
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
