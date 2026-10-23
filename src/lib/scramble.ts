const LATIN = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+~|}{[]:;?><';
const CYRILLIC = 'АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЩЫЭЮЯабвгдежзиклмнопрстуфхцчшщыэюя0123456789!@#$%^&*()_+~|}{[]:;?><';

// Для русского текста перебираем кириллицу, чтобы ширина и рисунок
// знаков во время анимации совпадали с итоговым словом.
export function charsetFor(text: string) {
  return /[а-яё]/i.test(text) ? CYRILLIC : LATIN;
}

export function randomChar(set: string) {
  return set[Math.floor(Math.random() * set.length)];
}
