// moderationUtils.js
const bannedWords = {
  'hate': 'block',
  'stupid': 'warn',
  'spoiler': 'review'
}

export function moderatePost(content) {
  const found = Object.entries(bannedWords).find(([word]) =>
    content.toLowerCase().includes(word)
  )
  return found ? bannedWords[found[0]] : 'clean'
}
