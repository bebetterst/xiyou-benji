import type { StoryBuff, StoryCard } from './types'

/** 悟空前置故事卡 ×3：每卡选项写入不同开局增益 */
export const WUKONG_STORY_CARDS: StoryCard[] = [
  {
    story_card_id: 'story_wukong_chushi',
    name: '石破天惊',
    body: '花果山顶，仙石迸裂。石猴睁眼，便认了天地为父母。山风过耳，似有人唤他去寻那水帘洞天。',
    set_flags: ['born_of_stone'],
    options: [
      {
        label: '探泉',
        set_flags: ['born_of_stone'],
        buffs: [{ op: 'start_qi', value: 1 }],
        hint: '开局气机 +1',
      },
      {
        label: '嬉闹',
        set_flags: ['born_of_stone'],
        buffs: [{ op: 'start_block', value: 4 }],
        hint: '开局护体 +4',
      },
    ],
  },
  {
    story_card_id: 'story_wukong_chengwang',
    name: '水帘称王',
    body: '群猴穿瀑而入，洞中石床石碗俱全。石猴一跃称王——美猴王三字，从此钉在花果山上。',
    set_flags: ['brotherhood_seed'],
    options: [
      {
        label: '先入洞',
        set_flags: ['brotherhood_seed'],
        buffs: [{ op: 'max_hp', value: 8 }, { op: 'start_hp', value: 8 }],
        hint: '气血上限 +8',
      },
      {
        label: '让兄弟先',
        set_flags: ['brotherhood_seed', 'brotherhood_proven'],
        buffs: [{ op: 'start_qi', value: 2 }],
        hint: '开局气机 +2 · 义气更盛',
      },
    ],
  },
  {
    story_card_id: 'story_wukong_baishi',
    name: '斜月三星',
    body: '漂洋过海，方入斜月三星洞。菩提祖师点破心窍：变化、筋斗、身外身——皆从此起。下山时，师父叮嘱莫要卖弄。',
    set_flags: [],
    options: [
      {
        label: '老实听讲',
        set_flags: [],
        buffs: [
          { op: 'add_card', card_id: 'wukong_attack_maohao', count: 1 },
          { op: 'qi_max', value: 1 },
        ],
        hint: '牌库 +「毫毛一戳」· 气机上限 +1',
      },
      {
        label: '当众显摆',
        set_flags: ['wrath_seed'],
        buffs: [
          { op: 'start_ling', value: 1 },
          { op: 'add_card', card_id: 'wukong_attack_lianbang', count: 1 },
        ],
        hint: '首回合灵力 +1 · 再得一张「连棒」· 怒种',
      },
    ],
  },
]

export const TANG_INTRO = {
  title: '五行山下',
  body: '取经诏下，东土已远。五行山前揭开封皮——山中有息，石压齐天。此战非比武力，当以约法与度化收伏心猿。',
}

/** 跳过时仍写入的默认选项增益（取每卡第一选项） */
export function defaultStoryBuffsFromCards(cards: StoryCard[]): StoryBuff[] {
  const buffs: StoryBuff[] = []
  for (const card of cards) {
    const opt = card.options?.[0]
    if (opt?.buffs) buffs.push(...opt.buffs)
  }
  return buffs
}
