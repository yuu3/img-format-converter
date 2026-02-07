import { useState, useCallback } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { ImagePreview } from './components/ImagePreview';
import { ConversionControls } from './components/ConversionControls';
import type { ImageFile, ConversionOptions } from './types';
import { convertImage } from './utils/imageConverter';
import { downloadSingleImage, downloadAllImages } from './utils/downloadHelper';
import './App.css';

function App() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentFormat, setCurrentFormat] = useState<'jpeg' | 'png' | 'webp' | 'avif'>('webp');

  const handleFilesSelected = useCallback((files: File[]) => {
    const newImages: ImageFile[] = files.map((file) => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      preview: URL.createObjectURL(file),
      originalSize: file.size,
      status: 'idle',
    }));

    setImages((prev) => [...prev, ...newImages]);
  }, []);

  const handleRemove = useCallback((id: string) => {
    setImages((prev) => {
      const image = prev.find((img) => img.id === id);
      if (image) {
        URL.revokeObjectURL(image.preview);
      }
      return prev.filter((img) => img.id !== id);
    });
  }, []);

  const handleConvert = useCallback(async (options: ConversionOptions) => {
    setIsProcessing(true);
    setCurrentFormat(options.format);

    // Mark all images as processing
    setImages((prev) =>
      prev.map((img) => ({ ...img, status: 'processing' as const }))
    );

    // Process images sequentially
    for (const image of images) {
      try {
        const convertedBlob = await convertImage(image.file, options);

        setImages((prev) =>
          prev.map((img) =>
            img.id === image.id
              ? {
                  ...img,
                  status: 'completed' as const,
                  convertedBlob,
                  convertedSize: convertedBlob.size,
                }
              : img
          )
        );
      } catch (error) {
        console.error(`Failed to convert ${image.file.name}:`, error);
        setImages((prev) =>
          prev.map((img) =>
            img.id === image.id
              ? {
                  ...img,
                  status: 'error' as const,
                  error: error instanceof Error ? error.message : '変換に失敗しました',
                }
              : img
          )
        );
      }
    }

    setIsProcessing(false);
  }, [images]);

  const handleDownload = useCallback((id: string) => {
    const image = images.find((img) => img.id === id);
    if (image) {
      downloadSingleImage(image, currentFormat);
    }
  }, [images, currentFormat]);

  const handleDownloadAll = useCallback(() => {
    downloadAllImages(images, currentFormat);
  }, [images, currentFormat]);

  const completedCount = images.filter((img) => img.status === 'completed').length;

  return (
    <div className="app">
      <header className="app-header">
        <h1>画像変換・軽量化ツール</h1>
        <p>画像を簡単にフォーマット変換・圧縮できます</p>
      </header>

      <main className="app-main">
        <ImageUploader onFilesSelected={handleFilesSelected} />

        {images.length > 0 && (
          <>
            <ConversionControls
              onConvert={handleConvert}
              isProcessing={isProcessing}
              hasImages={images.length > 0}
            />

            <ImagePreview
              images={images}
              onRemove={handleRemove}
              onDownload={handleDownload}
            />

            {completedCount > 0 && (
              <div className="batch-download">
                <button
                  className="batch-download-btn"
                  onClick={handleDownloadAll}
                  disabled={isProcessing}
                >
                  すべてダウンロード ({completedCount}件)
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <footer className="app-footer">
        <p>すべての処理はブラウザ上で行われます。画像がサーバーにアップロードされることはありません。</p>
      </footer>
    </div>
  );
}

export default App;
