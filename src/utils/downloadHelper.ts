import JSZip from 'jszip';
import type { ImageFile } from '../types';

export const downloadSingleImage = (imageFile: ImageFile, format: string) => {
  if (!imageFile.convertedBlob) {
    console.error('No converted blob available');
    return;
  }

  const url = URL.createObjectURL(imageFile.convertedBlob);
  const a = document.createElement('a');
  a.href = url;

  // Generate filename with new extension
  const originalName = imageFile.file.name;
  const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
  a.download = `${nameWithoutExt}_converted.${format}`;

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const downloadAllImages = async (images: ImageFile[], format: string) => {
  const completedImages = images.filter(
    (img) => img.status === 'completed' && img.convertedBlob
  );

  if (completedImages.length === 0) {
    console.error('No completed images to download');
    return;
  }

  if (completedImages.length === 1) {
    downloadSingleImage(completedImages[0], format);
    return;
  }

  // Create ZIP file for multiple images
  const zip = new JSZip();

  completedImages.forEach((img, index) => {
    if (img.convertedBlob) {
      const originalName = img.file.name;
      const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
      const filename = `${nameWithoutExt}_converted.${format}`;
      zip.file(filename, img.convertedBlob);
    }
  });

  try {
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `converted_images_${Date.now()}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to create ZIP file:', error);
    throw new Error('ZIPファイルの作成に失敗しました');
  }
};
