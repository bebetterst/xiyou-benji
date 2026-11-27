import type { StoryCard } from './types'

/** 悟空前置故事卡 ×3（可跳过，默认 flag 仍写） */
export const WUKONG_STORY_CARDS: StoryCard[] = [
  {
    story_card_id: 'story_wukong_chushi',
    name: '石破天惊',
    body: '花果山顶，仙石迸裂。石猴睁眼，便认了天地为父母。山风过耳，似有人唤他去寻那水帘洞天。',
    set_flags: ['born_of_stone'],
  },
  {
    story_card_id: 'story_wukong_chengwang',
    name: '水帘称王',
    body: '群猴穿瀑而入，洞中石床石碗俱全。石猴一跃称王——美猴王三字，从此钉在花果山上。',
    set_flags: ['brotherhood_seed'],
    options: [
      { label: '与群猴结义更深', set_flags: ['brotherhood_seed', 'brotherhood_proven'] },
      { label: '笑纳王位便是', set_flags: ['brotherhood_seed'] },
    ],
  },
  {
    story_card_id: 'story_wukong_baishi',
    name: '斜月三星',
    body: '漂洋过海，方入斜月三星洞。菩提祖师点破心窍：变化、筋斗、身外身——皆从此起。下山时，师父叮嘱莫要卖弄。',
    set_flags: [],
    options: [
      { label: '谨记师训', set_flags: [] },
      { label: '忍不住显摆一番', set_flags: ['wrath_seed'] },
    ],
  },
]

export const TANG_INTRO = {
  title: '五行山下',
  body: '取经诏下，东土已远。五行山前揭开封皮——山中有息，石压齐天。此战非比武力，当以约法与度化收伏心猿。',
}
