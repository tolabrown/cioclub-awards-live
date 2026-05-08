// utils/imageResize.ts

export interface ResizeOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0
  maxSizeKB?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

export function resizeImage(
  file: File, 
  options: ResizeOptions = {}
): Promise<File> {
  const {
    maxWidth = 800,
    maxHeight = 800,
    quality = 0.8,
    maxSizeKB = 200,
    format = 'jpeg'
  } = options;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = calculateDimensions(
        img.width, 
        img.height, 
        maxWidth, 
        maxHeight
      );

      canvas.width = width;
      canvas.height = height;

      // Draw resized image
      ctx?.drawImage(img, 0, 0, width, height);

      // Try different quality levels to meet size requirement
      compressToSize(canvas, format, quality, maxSizeKB)
        .then(blob => {
          const resizedFile = new File([blob], file.name, {
            type: `image/${format}`,
            lastModified: Date.now()
          });
          resolve(resizedFile);
        })
        .catch(reject);
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

function calculateDimensions(
  originalWidth: number, 
  originalHeight: number, 
  maxWidth: number, 
  maxHeight: number
) {
  let width = originalWidth;
  let height = originalHeight;

  // Scale down if necessary
  if (width > maxWidth) {
    height = (height * maxWidth) / width;
    width = maxWidth;
  }
  
  if (height > maxHeight) {
    width = (width * maxHeight) / height;
    height = maxHeight;
  }

  return { width: Math.floor(width), height: Math.floor(height) };
}

async function compressToSize(
  canvas: HTMLCanvasElement, 
  format: string, 
  initialQuality: number, 
  maxSizeKB: number
): Promise<Blob> {
  let quality = initialQuality;
  let blob: Blob;

  do {
    blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob(resolve as BlobCallback, `image/${format}`, quality);
    });

    if (blob && blob.size <= maxSizeKB * 1024) {
      break;
    }

    quality -= 0.1;
  } while (quality > 0.1);

  if (!blob) {
    throw new Error('Failed to compress image');
  }

  return blob;
}

// Alternative: Resize by file size with automatic dimension adjustment
export async function resizeToFileSize(
  file: File,
  maxSizeKB: number = 200,
  format: 'jpeg' | 'png' | 'webp' = 'jpeg'
): Promise<File> {
  let maxDimension = 1200;
  let quality = 0.8;
  let resizedFile: File;

  do {
    resizedFile = await resizeImage(file, {
      maxWidth: maxDimension,
      maxHeight: maxDimension,
      quality,
      format
    });

    if (resizedFile.size <= maxSizeKB * 1024) {
      break;
    }

    // Reduce dimensions and quality
    maxDimension = Math.floor(maxDimension * 0.8);
    quality = Math.max(0.3, quality - 0.1);
    
  } while (maxDimension > 200 && quality > 0.3);

  return resizedFile;
}