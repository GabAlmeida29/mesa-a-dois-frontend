const SETS = ['abcdefghijkmnopqrstuvwxyz', 'ABCDEFGHJKLMNPQRSTUVWXYZ', '23456789', '!@#$%&*-_+?'];
const ALL = SETS.join('');

function pick(chars: string) {
  const [n] = crypto.getRandomValues(new Uint32Array(1));
  return chars[n % chars.length];
}

export function generateStrongPassword(length = 18) {
  const chars = [...SETS.map(pick), ...Array.from({ length: length - SETS.length }, () => pick(ALL))];
  for (let i = chars.length - 1; i > 0; i--) {
    const [n] = crypto.getRandomValues(new Uint32Array(1));
    const j = n % (i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
}
