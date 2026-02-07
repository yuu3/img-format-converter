export type CropArea = {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type ImageFile = {
  id: string;
  file: File;
  preview: string;
  originalSize: number;
  convertedSize?: number;
  convertedBlob?: Blob;
  status: 'idle' | 'processing' | 'completed' | 'error';
  error?: string;
  cropArea?: CropArea;
}

export type ConversionOptions = {
  format: 'jpeg' | 'png' | 'webp' | 'avif';
  quality: number; // 0-100
  maxWidth?: number;
  maxHeight?: number;
  maintainAspectRatio: boolean;
}
