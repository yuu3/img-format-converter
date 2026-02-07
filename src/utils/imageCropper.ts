import type { CropArea } from '../types';

export const cropImage = async (
  file: File,
  cropArea: CropArea
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    img.onload = () => {
      // Set canvas size to crop area
      canvas.width = cropArea.width;
      canvas.height = cropArea.height;

      // Draw the cropped portion
      ctx.drawImage(
        img,
        cropArea.x,
        cropArea.y,
        cropArea.width,
        cropArea.height,
        0,
        0,
        cropArea.width,
        cropArea.height
      );

      canvas.toBlob(
        (blob) => {
          if (blob) {
            // Create a new File from the blob
            const croppedFile = new File(
              [blob],
              file.name.replace(/\.[^/.]+$/, '_cropped$&'),
              { type: file.type }
            );
            resolve(croppedFile);
          } else {
            reject(new Error('Failed to create blob'));
          }
        },
        file.type
      );
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = URL.createObjectURL(file);
  });
};
