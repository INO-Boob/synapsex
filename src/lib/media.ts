// Все фоновые видео в одном месте. Если в каком-то ролике остался
// персонаж-лама, замените ссылку на видео с человеком — больше ничего
// менять не нужно. Герой больше не использует видео: человек в первом
// экране рисуется кодом (см. components/NeuralHuman.tsx).
const CDN = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P';

export const VIDEOS = {
  cinematic: `${CDN}/hf_20260622_092455_089c54f8-3b03-4966-9df1-e9746063d0ef.mp4`,
  metrics: `${CDN}/hf_20260622_095810_ecea3dd2-fc5e-4e41-8696-4219290b6589.mp4`,
  technology: `${CDN}/hf_20260622_095750_32a52ce0-2005-45c9-9093-41f03fde9530.mp4`,
  footer: `${CDN}/hf_20260622_080203_fd7f4f85-3a86-4837-8192-85e7bfe68e75.mp4`,
} as const;

// Куда ведёт кнопка «Скачать». Пока это якорь на футер — замените на
// ссылку в App Store, когда она появится.
export const DOWNLOAD_URL = '#download';
