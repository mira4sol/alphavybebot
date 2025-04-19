export const telegramLinkMarkdown = (label: string, url: string) =>
  `[${label}](${url})`

export const escapeTelegramChar = (text: string): string => {
  // Characters that need to be escaped in MarkdownV2:
  // '_', '*', '[', ']', '(', ')', '~', '`', '>', '#', '+', '-', '=', '|', '{', '}', '.', '!'
  return text.replace(/([_*\[\]()~`>#+=|{}.!-])/g, '\\$1')
}
