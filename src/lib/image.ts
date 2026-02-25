export const MAX_IMAGE_SIZE = 1.5 * 1024 * 1024; // 1.5MB

export function isValidImageFile(file: File): { valid: boolean; error?: string } {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'Formato de imagem inválido. Use JPG, PNG, WEBP ou GIF.' };
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return { valid: false, error: 'A imagem deve ter no máximo 1.5MB.' };
  }
  return { valid: true };
}

export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
