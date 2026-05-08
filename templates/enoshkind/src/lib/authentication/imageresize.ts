export interface ResizeOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxSizeKB?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

export async function resizeImage(file: File, options: ResizeOptions = {}): Promise<File> {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.8,
    format = 'webp',
    maxSizeKB = 200
  } = options;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = async () => {
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      canvas.width = Math.floor(width);
      canvas.height = Math.floor(height);
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

      let currentQuality = quality;
      let compressedBlob: Blob | null = null;

      // Attempt to compress until under maxSizeKB or quality too low
      while (currentQuality > 0.1) {
        compressedBlob = await new Promise(r => canvas.toBlob(r, `image/${format}`, currentQuality));
        if (compressedBlob && compressedBlob.size / 1024 <= maxSizeKB) {
          break;
        }
        currentQuality -= 0.1;
      }

      if (compressedBlob) {
        resolve(new File([compressedBlob], file.name.replace(/\.[^/.]+$/, "") + "." + format, {
          type: `image/${format}`,
          lastModified: Date.now()
        }));
      } else {
        reject(new Error('Failed to compress image'));
      }
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}
