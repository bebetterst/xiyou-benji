export type CharacterId = 'tang_seng' | 'sun_wukong' | 'zhu_bajie' | 'sha_seng'

export type CardType = 'attack' | 'defend' | 'skill'

export type IntentType = 'attack' | 'defend' | 'skill' | 'enrage' | 'escape'

export type Screen =
  | 'title'
  | 'select'
  | 'story'
  | 'stage_intro'
  | 'combat'
  | 'wave_clear'
  | 'result'
  | 'ending'

export type PileView = null | 'draw' | 'discard'

export interface CardDef {
  card_id: string
  name: string
  type: CardType
  cost_ling: number
  cost_qi?: number
  desc: string
  /** 卡面详注（长按/点开说明） */
  lore?: string
  effects: Effect[]
  keywords?: string[]
  /** 收伏检定关键 */
  subdue_tag?: 'yuefa' | 'duhou' | 'jingu'
}

export type Effect =
  | { op: 'damage'; value: number; condition?: 'qi_ge_2' }
  | { op: 'gain_block'; value: number }
  | { op: 'gain_qi'; value: number }
  | { op: 'draw'; value: number }
  | { op: 'apply_jie'; value: number }
  | { op: 'mark_subdue'; tag: 'yuefa' | 'duhou' | 'jingu' }

/** 故事选项写入开局战斗状态的增益 */
export type StoryBuff =
  | { op: 'max_hp'; value: number }
  | { op: 'start_hp'; value: number }
  | { op: 'start_qi'; value: number }
  | { op: 'start_block'; value: number }
  | { op: 'start_ling'; value: number }
  | { op: 'add_card'; card_id: string; count?: number }
  | { op: 'qi_max'; value: number }

export interface StoryOption {
  label: string
  set_flags: string[]
  buffs?: StoryBuff[]
  /** 增益提示（机械） */
  hint?: string
}

export interface StoryCard {
  story_card_id: string
  name: string
  body: string
  set_flags: string[]
  options?: StoryOption[]
}

export interface Combatant {
  hp: number
  maxHp: number
  block: number
  statuses: Record<string, number>
}

export interface PlayerCombat extends Combatant {
  ling: number
  lingMax: number
  qi: number
  qiMax: number
  destinyReady: boolean
  destinyUsedThisTurn: boolean
  destinyActive: boolean
  destinyName: string
  destinyDesc: string
  hand: string[]
  drawPile: string[]
  discardPile: string[]
  subdueMarks: Set<string>
}

export interface EnemyCombat extends Combatant {
  instanceId: string
  enemy_id: string
  name: string
  intent: EnemyMove
  require_subdue: boolean
  subduePhase: boolean
  traits: string[]
}

export interface EnemyMove {
  move_id: string
  intent_type: IntentType
  value: number
  weight: number
}

export interface EnemyDef {
  enemy_id: string
  name: string
  max_hp: number
  moveset: EnemyMove[]
  traits?: string[]
  /** 气血归零后进入收伏检定而非直接胜 */
  require_subdue?: boolean
}

export interface CombatState {
  turn: number
  player: PlayerCombat
  enemies: EnemyCombat[]
  /** 当前点选目标（存活敌人下标） */
  selectedTarget: number
  log: string[]
  phase: 'player' | 'enemy' | 'won' | 'lost' | 'subdue_fail_escape'
  characterId: CharacterId
  waveIndex: number
  waveLabel: string
}

/** 开局增益累计（故事卡选项） */
export interface OpeningMods {
  maxHpBonus: number
  startHpBonus: number
  startQi: number
  startBlock: number
  startLingBonus: number
  qiMaxBonus: number
  extraCards: string[]
}

export interface StageWave {
  id: string
  label: string
  enemyIds: string[]
  /** 教学/情境一句（可空，优先用 lore beat） */
  intro: string
}

export interface StageDef {
  stage_id: string
  title: string
  waves: StageWave[]
  clearTitle: string
  clearBody: string
  endingId: string
  clearFlags: string[]
}

export interface GameState {
  screen: Screen
  characterId: CharacterId | null
  flags: Set<string>
  storyIndex: number
  openingMods: OpeningMods
  stageId: string | null
  waveIndex: number
  combat: CombatState | null
  /** 波次间保留的玩家快照 */
  runPlayer: PlayerCombat | null
  pileView: PileView
  resultTitle: string
  resultBody: string
  endingId: string | null
  /** 波次胜利旁白 */
  waveClearText: string
  /** 最近一句故事低语（月圆式，UI 飘条） */
  lastWhisper: string
  /** 选项后短暂展示的署名对白 */
  pendingAside: string | null
}
