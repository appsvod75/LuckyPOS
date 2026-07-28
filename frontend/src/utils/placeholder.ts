export const placeholder = (text: string, size = 300) => {
  const safeText = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const fontSize = Math.max(14, Math.floor(size / 20));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect fill="#f1f5f9" width="${size}" height="${size}"/><text fill="#94a3b8" font-family="sans-serif" font-size="${fontSize}" text-anchor="middle" dominant-baseline="middle" x="50%" y="50%">${safeText}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};
