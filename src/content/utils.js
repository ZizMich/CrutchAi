function formatContent(text) {
  return text
    .replace(/([^#])[#]+([^#])/g, '$1$2')
    .replace(/([^*])[*]+([^*])/g, '$1$2')
    .replace(/[#*]{3,}/g, '')
    .split('\n')
    .map(line => line.match(/^#+\s+[A-ZА-Я]/) ? line.replace(/^#+\s+/, '🔹 ') : line.trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function detectLanguage(text) {
  const cyrillic = /[а-яА-Я]/, chinese = /[\u4e00-\u9fff]/, japanese = /[\u3040-\u30ff]/;
  if (cyrillic.test(text)) return 'ru-RU';
  if (chinese.test(text)) return 'zh-CN';
  if (japanese.test(text)) return 'ja-JP';
  return 'en-US';
} 