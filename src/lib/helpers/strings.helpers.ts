/**
 * Check if a string includes any emoji
 */
export function hasEmoji(str: string): boolean {
  // Regex covers most common emojis (faces, symbols, flags, etc.)
  const emojiRegex =
    /(\p{Extended_Pictographic}|\d\uFE0F\u20E3|#\uFE0F\u20E3|\*\uFE0F\u20E3)/u;
  return emojiRegex.test(str);
}
