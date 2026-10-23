// Image Storage Reference Manager for Landora Real Estate
// Stores property photographs in Cloudinary / S3 and references in PostgreSQL

export interface UploadedImageResult {
  url: string;
  storageProvider: "cloudinary" | "s3" | "local";
  storageKey?: string;
  caption?: string;
  isPrimary?: boolean;
}

export const StorageService = {
  // Validate photograph format and size limit (Max 8MB per real estate image)
  validateImageFile(file: File): { valid: boolean; error?: string } {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: "Only JPEG, PNG, WebP and AVIF photographs are permitted." };
    }
    const maxBytes = 8 * 1024 * 1024; // 8MB
    if (file.size > maxBytes) {
      return { valid: false, error: "Photograph size cannot exceed 8MB." };
    }
    return { valid: true };
  },

  // Upload or register property photograph URL
  async uploadPropertyImage(
    fileOrUrl: File | string,
    metadata?: { caption?: string; isPrimary?: boolean; order?: number }
  ): Promise<UploadedImageResult> {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;

    // If Cloudinary credentials are fully configured, dispatch upload
    if (cloudName && apiKey && typeof fileOrUrl !== "string") {
      try {
        const formData = new FormData();
        formData.append("file", fileOrUrl);
        formData.append("upload_preset", "landora_properties");

        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          return {
            url: data.secure_url,
            storageProvider: "cloudinary",
            storageKey: data.public_id,
            caption: metadata?.caption,
            isPrimary: metadata?.isPrimary ?? false,
          };
        }
      } catch (err) {
        console.warn("[STORAGE WARNING] Cloudinary upload unavailable, using reference storage:", err);
      }
    }

    // Default reference URL handler
    const url = typeof fileOrUrl === "string" 
      ? fileOrUrl 
      : URL.createObjectURL(fileOrUrl);

    return {
      url,
      storageProvider: "cloudinary",
      caption: metadata?.caption,
      isPrimary: metadata?.isPrimary ?? false,
    };
  },
};
