// Détecte et masque les numéros de téléphone dans les descriptions
const PHONE_PATTERNS = [
  // Formats internationaux: +241 XX XX XX XX, +241XXXXXXXX
  /(?:\+\d{1,3}[\s.-]?)?\(?\d{2,4}\)?[\s.-]?\d{2,3}[\s.-]?\d{2,3}[\s.-]?\d{2,4}/g,
  // Numéros écrits en lettres partielles: zero sept six...
  /\b(?:zero|zéro|un|deux|trois|quatre|cinq|six|sept|huit|neuf)(?:\s+(?:zero|zéro|un|deux|trois|quatre|cinq|six|sept|huit|neuf)){5,}\b/gi,
  // Séquences de 8+ chiffres (avec ou sans espaces/tirets)
  /\b\d[\d\s.\-]{6,}\d\b/g,
];

export const sanitizePhoneNumbers = (text: string): string => {
  if (!text) return text;
  let result = text;
  for (const pattern of PHONE_PATTERNS) {
    result = result.replace(pattern, '***numéro masqué***');
  }
  return result;
};

export const containsPhoneNumber = (text: string): boolean => {
  if (!text) return false;
  return PHONE_PATTERNS.some(pattern => {
    pattern.lastIndex = 0;
    return pattern.test(text);
  });
};
