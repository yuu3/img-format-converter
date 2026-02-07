import imageCompression from 'browser-image-compression';
import type { ConversionOptions } from '../types';

export const convertImage = async (
  file: File,
  options: ConversionOptions
): Promise<Blob> => {
  const { format, quality, maxWidth, maxHeight, maintainAspectRatio } = options;

  // Convert quality from 0-100 to 0-1
  const qualityDecimal = quality / 100;

  const compressionOptions = {
    maxWidthOrHeight: maxWidth || maxHeight || undefined,
    useWebWorker: true,
    fileType: `image/${format}`,
    initialQuality: qualityDecimal,
  };

  try {
    // If custom dimensions are specified and aspect ratio should not be maintained
    if ((maxWidth || maxHeight) && !maintainAspectRatio) {
      return await resizeImageCustom(file, format, quality, maxWidth, maxHeight);
    }

    // Use browser-image-compression for standard conversion
    const compressedFile = await imageCompression(file, compressionOptions);
    return compressedFile;
  } catch (error) {
    console.error('Image conversion error:', error);
    throw new Error('画像の変換に失敗しました');
  }
};

// Custom resize function that doesn't maintain aspect ratio
const resizeImageCustom = async (
  file: File,
  format: string,
  quality: number,
  maxWidth?: number,
  maxHeight?: number
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    img.onload = () => {
      let targetWidth = maxWidth || img.width;
      let targetHeight = maxHeight || img.height;

      // If only one dimension is specified, calculate the other maintaining aspect ratio
      if (maxWidth && !maxHeight) {
        targetHeight = (img.height * maxWidth) / img.width;
      } else if (maxHeight && !maxWidth) {
        targetWidth = (img.width * maxHeight) / img.height;
      }

      canvas.width = targetWidth;
      canvas.height = targetHeight;

      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        },
        `image/${format}`,
        quality / 100
      );
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = URL.createObjectURL(file);
  });
};
