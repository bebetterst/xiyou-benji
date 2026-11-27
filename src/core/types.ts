export type CharacterId = 'tang_seng' | 'sun_wukong' | 'zhu_bajie' | 'sha_seng'

export type CardType = 'attack' | 'defend' | 'skill'

export type IntentType = 'attack' | 'defend' | 'skill' | 'enrage' | 'escape'

export type Screen =
  | 'title'
  | 'select'
  | 'story'
  | 'combat'
  | 'result'
  | 'ending'

export interface CardDef {
  card_id: string
  name: string
  type: CardType
  cost_ling: number
  cost_qi?: number
  desc: string
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

export interface EnemyDef {
  enemy_id: string
  name: string
  max_hp: number
  moveset: EnemyMove[]
  traits?: string[]
  /** 气血归零后进入收伏检定而非直接胜 */
  require_subdue?: boolean
}

export interface EnemyMove {
  move_id: string
  intent_type: IntentType
  value: number
  weight: number
}

export interface StoryCard {
  story_card_id: string
  name: string
  body: string
  set_flags: string[]
  options?: { label: string; set_flags: string[] }[]
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
  enemy_id: string
  name: string
  intent: EnemyMove
  require_subdue: boolean
  subduePhase: boolean
}

export interface CombatState {
  turn: number
  player: PlayerCombat
  enemy: EnemyCombat
  log: string[]
  phase: 'player' | 'enemy' | 'won' | 'lost' | 'subdue_fail_escape'
  characterId: CharacterId
}

export interface GameState {
  screen: Screen
  characterId: CharacterId | null
  flags: Set<string>
  storyIndex: number
  combat: CombatState | null
  resultTitle: string
  resultBody: string
  endingId: string | null
}
