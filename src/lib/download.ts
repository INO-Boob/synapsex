import { DOWNLOAD_URL } from './media';

export function openDownload() {
  if (DOWNLOAD_URL.startsWith('#')) {
    document.querySelector(DOWNLOAD_URL)?.scrollIntoView({ behavior: 'smooth' });
  } else {
    window.open(DOWNLOAD_URL, '_blank', 'noopener');
  }
}
