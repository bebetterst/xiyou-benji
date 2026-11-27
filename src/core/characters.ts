import type { CharacterId } from './types'

export interface CharacterMeta {
  id: CharacterId
  name: string
  title: string
  unlocked: boolean
  lockHint?: string
  destinyName: string
  destinyDesc: string
  maxHp: number
  lingMax: number
  qiMax: number
  /** 气机门槛发动本命 */
  destinyQiCost: number
  accent: string
}

export const CHARACTERS: CharacterMeta[] = [
  {
    id: 'tang_seng',
    name: '唐僧',
    title: '金蝉转世 · 取经执念',
    unlocked: true,
    destinyName: '金蝉诵',
    destinyDesc: '耗气 2：本回合敌方攻击意图伤害 −30%（打断气势）。',
    maxHp: 70,
    lingMax: 3,
    qiMax: 5,
    destinyQiCost: 2,
    accent: '#c9a227',
  },
  {
    id: 'sun_wukong',
    name: '孙悟空',
    title: '石猴出世 · 水帘称王',
    unlocked: true,
    destinyName: '身外身法',
    destinyDesc: '耗气 2：本回合每打出 1 张攻牌，追加 3 点伤害。',
    maxHp: 80,
    lingMax: 3,
    qiMax: 6,
    destinyQiCost: 2,
    accent: '#c45c26',
  },
  {
    id: 'zhu_bajie',
    name: '猪八戒',
    title: '天蓬贬凡',
    unlocked: false,
    lockHint: '完整版开放',
    destinyName: '天蓬一耙',
    destinyDesc: '—',
    maxHp: 90,
    lingMax: 3,
    qiMax: 5,
    destinyQiCost: 2,
    accent: '#8b7355',
  },
  {
    id: 'sha_seng',
    name: '沙和尚',
    title: '卷帘赎罪',
    unlocked: false,
    lockHint: '完整版开放',
    destinyName: '流沙壁',
    destinyDesc: '—',
    maxHp: 85,
    lingMax: 3,
    qiMax: 5,
    destinyQiCost: 2,
    accent: '#5a6a7a',
  },
]

export function getCharacter(id: CharacterId): CharacterMeta {
  const c = CHARACTERS.find((x) => x.id === id)
  if (!c) throw new Error(`unknown character ${id}`)
  return c
}
