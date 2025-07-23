// moderationUtils.js
import { firestore } from '../firebaseResources'
import { doc, getDoc } from 'firebase/firestore'

let bannedWordMap = null

// Load words from Firestore once at app startup
export async function loadBannedWordsOnce() {
  const levels = ['block', 'warn', 'review']
  bannedWordMap = {}

  for (const level of levels) {
    const ref = doc(firestore, 'bannedWords', level)
    const snap = await getDoc(ref)
    if (snap.exists()) {
      const list = (snap.data().words || '').split(',').map(w => w.trim().toLowerCase())
      for (const word of list) {
        if (word) bannedWordMap[word] = level
      }
    }
  }

  console.log('✅ bannedWordMap:', bannedWordMap)
}

export function moderatePost(content) {
  if (!bannedWordMap) {
    console.warn('⚠️ Banned words not loaded yet.')
    return 'clean'
  }

  const lower = content.toLowerCase()
  for (const word in bannedWordMap) {
    if (lower.includes(word)) {
      return bannedWordMap[word]
    }
  }

  return 'clean'
}
