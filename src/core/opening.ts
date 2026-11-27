import type { OpeningMods, StoryBuff } from './types'

export function emptyOpeningMods(): OpeningMods {
  return {
    maxHpBonus: 0,
    startHpBonus: 0,
    startQi: 0,
    startBlock: 0,
    startLingBonus: 0,
    qiMaxBonus: 0,
    extraCards: [],
  }
}

export function applyBuffsToMods(
  mods: OpeningMods,
  buffs: StoryBuff[] | undefined,
): OpeningMods {
  if (!buffs?.length) return mods
  const next: OpeningMods = {
    ...mods,
    extraCards: [...mods.extraCards],
  }
  for (const b of buffs) {
    switch (b.op) {
      case 'max_hp':
        next.maxHpBonus += b.value
        break
      case 'start_hp':
        next.startHpBonus += b.value
        break
      case 'start_qi':
        next.startQi += b.value
        break
      case 'start_block':
        next.startBlock += b.value
        break
      case 'start_ling':
        next.startLingBonus += b.value
        break
      case 'qi_max':
        next.qiMaxBonus += b.value
        break
      case 'add_card': {
        const n = b.count ?? 1
        for (let i = 0; i < n; i++) next.extraCards.push(b.card_id)
        break
      }
    }
  }
  return next
}

export function summarizeMods(mods: OpeningMods): string[] {
  const lines: string[] = []
  if (mods.maxHpBonus) lines.push(`气血上限 +${mods.maxHpBonus}`)
  if (mods.startHpBonus && !mods.maxHpBonus)
    lines.push(`开局气血 +${mods.startHpBonus}`)
  if (mods.startQi) lines.push(`开局气机 +${mods.startQi}`)
  if (mods.startBlock) lines.push(`开局护体 +${mods.startBlock}`)
  if (mods.startLingBonus) lines.push(`首回合灵力 +${mods.startLingBonus}`)
  if (mods.qiMaxBonus) lines.push(`气机上限 +${mods.qiMaxBonus}`)
  if (mods.extraCards.length)
    lines.push(`额外牌 ×${mods.extraCards.length}`)
  return lines
}
