import { getCard, starterDeck } from './cards'
import { getCharacter } from './characters'
import { getEnemy } from './enemies'
import type {
  CardDef,
  CharacterId,
  CombatState,
  EnemyMove,
  PlayerCombat,
} from './types'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function pickIntent(moves: EnemyMove[]): EnemyMove {
  const pool = moves.filter((m) => m.weight > 0)
  const total = pool.reduce((s, m) => s + m.weight, 0)
  let r = Math.random() * total
  for (const m of pool) {
    r -= m.weight
    if (r <= 0) return { ...m }
  }
  return { ...pool[0] }
}

function pushLog(state: CombatState, msg: string) {
  state.log = [msg, ...state.log].slice(0, 8)
}

export function createCombat(characterId: CharacterId): CombatState {
  const meta = getCharacter(characterId)
  const enemyId =
    characterId === 'sun_wukong'
      ? 'boss_hunshi_mowang'
      : 'boss_interface_wukong_shoufu'
  const enemy = getEnemy(enemyId)
  const deck = shuffle(starterDeck(characterId))

  const player: PlayerCombat = {
    hp: meta.maxHp,
    maxHp: meta.maxHp,
    block: 0,
    statuses: {},
    ling: meta.lingMax,
    lingMax: meta.lingMax,
    qi: 0,
    qiMax: meta.qiMax,
    destinyReady: true,
    destinyUsedThisTurn: false,
    destinyActive: false,
    destinyName: meta.destinyName,
    destinyDesc: meta.destinyDesc,
    hand: [],
    drawPile: deck,
    discardPile: [],
    subdueMarks: new Set(),
  }

  const state: CombatState = {
    turn: 1,
    player,
    enemy: {
      enemy_id: enemy.enemy_id,
      name: enemy.name,
      hp: enemy.max_hp,
      maxHp: enemy.max_hp,
      block: 0,
      statuses: {},
      intent: pickIntent(enemy.moveset),
      require_subdue: !!enemy.require_subdue,
      subduePhase: false,
    },
    log: [`遭遇 ${enemy.name}！`],
    phase: 'player',
    characterId,
  }

  drawCards(state, 5)
  return state
}

function ensureDraw(state: CombatState) {
  const p = state.player
  if (p.drawPile.length === 0) {
    if (p.discardPile.length === 0) return
    p.drawPile = shuffle(p.discardPile)
    p.discardPile = []
    pushLog(state, '洗牌……')
  }
}

export function drawCards(state: CombatState, n: number) {
  const p = state.player
  for (let i = 0; i < n; i++) {
    ensureDraw(state)
    if (p.drawPile.length === 0) break
    const id = p.drawPile.pop()!
    p.hand.push(id)
  }
}

function dealDamageToEnemy(state: CombatState, raw: number) {
  const e = state.enemy
  let dmg = raw
  if (e.block > 0) {
    const blocked = Math.min(e.block, dmg)
    e.block -= blocked
    dmg -= blocked
  }
  if (dmg > 0) {
    e.hp = Math.max(0, e.hp - dmg)
  }
  return dmg
}

function dealDamageToPlayer(state: CombatState, raw: number) {
  const p = state.player
  let dmg = raw
  // 唐僧本命：削弱敌攻
  if (state.characterId === 'tang_seng' && p.destinyActive) {
    dmg = Math.floor(dmg * 0.7)
  }
  // 戒：减少下次攻击
  const jie = eStatus(state, 'jie')
  if (jie > 0 && raw > 0) {
    const reduce = jie * 3
    dmg = Math.max(0, dmg - reduce)
    state.enemy.statuses['jie'] = 0
    pushLog(state, `「戒」化解 ${reduce} 点伤害`)
  }
  if (p.block > 0) {
    const blocked = Math.min(p.block, dmg)
    p.block -= blocked
    dmg -= blocked
  }
  if (dmg > 0) {
    p.hp = Math.max(0, p.hp - dmg)
  }
  return dmg
}

function eStatus(state: CombatState, key: string): number {
  return state.enemy.statuses[key] ?? 0
}

function applyEffects(state: CombatState, card: CardDef) {
  const p = state.player
  let attackPlayed = card.type === 'attack'

  for (const fx of card.effects) {
    switch (fx.op) {
      case 'damage': {
        if (fx.condition === 'qi_ge_2' && p.qi < 2) break
        const dealt = dealDamageToEnemy(state, fx.value)
        pushLog(state, `${card.name} 造成 ${dealt} 伤害`)
        break
      }
      case 'gain_block':
        p.block += fx.value
        pushLog(state, `${card.name} 获得 ${fx.value} 护体`)
        break
      case 'gain_qi':
        p.qi = Math.min(p.qiMax, p.qi + fx.value)
        break
      case 'draw':
        drawCards(state, fx.value)
        break
      case 'apply_jie':
        state.enemy.statuses['jie'] = (state.enemy.statuses['jie'] ?? 0) + fx.value
        pushLog(state, `赋予「戒」${fx.value} 层`)
        break
      case 'mark_subdue':
        p.subdueMarks.add(fx.tag)
        pushLog(state, `收伏标记：${fx.tag === 'yuefa' ? '约法' : fx.tag === 'duhou' ? '度猴' : '紧箍'}`)
        break
    }
  }

  // 悟空本命：攻牌追加
  if (
    attackPlayed &&
    state.characterId === 'sun_wukong' &&
    p.destinyActive
  ) {
    const extra = dealDamageToEnemy(state, 3)
    pushLog(state, `身外身追加 ${extra} 伤害`)
  }
}

function checkEnemyDown(state: CombatState): boolean {
  if (state.enemy.hp > 0) return false
  if (state.enemy.require_subdue) {
    const marks = state.player.subdueMarks
    if (marks.has('yuefa') || marks.has('duhou') || marks.has('jingu')) {
      state.phase = 'won'
      pushLog(state, '收伏检定通过！')
      return true
    }
    // 逸：重整
    state.enemy.hp = Math.max(1, Math.floor(state.enemy.maxHp * 0.25))
    state.enemy.subduePhase = true
    state.enemy.intent = {
      move_id: 'wk_escape',
      intent_type: 'escape',
      value: 0,
      weight: 0,
    }
    pushLog(state, '气血已尽，然未约法/度化——敌以「逸」重整！')
    return false
  }
  state.phase = 'won'
  pushLog(state, '胜利！')
  return true
}

export function canPlayCard(state: CombatState, handIndex: number): boolean {
  if (state.phase !== 'player') return false
  const id = state.player.hand[handIndex]
  if (!id) return false
  const card = getCard(id)
  if (state.player.ling < card.cost_ling) return false
  if ((card.cost_qi ?? 0) > state.player.qi) return false
  return true
}

export function playCard(state: CombatState, handIndex: number): CombatState {
  if (!canPlayCard(state, handIndex)) return state
  const next = cloneCombat(state)
  const p = next.player
  const [id] = p.hand.splice(handIndex, 1)
  const card = getCard(id)
  p.ling -= card.cost_ling
  if (card.cost_qi) p.qi -= card.cost_qi
  applyEffects(next, card)
  p.discardPile.push(id)
  checkEnemyDown(next)
  if (next.player.hp <= 0) next.phase = 'lost'
  return next
}

export function canUseDestiny(state: CombatState): boolean {
  if (state.phase !== 'player') return false
  const p = state.player
  if (p.destinyUsedThisTurn) return false
  const meta = getCharacter(state.characterId)
  return p.qi >= meta.destinyQiCost
}

export function useDestiny(state: CombatState): CombatState {
  if (!canUseDestiny(state)) return state
  const next = cloneCombat(state)
  const meta = getCharacter(next.characterId)
  next.player.qi -= meta.destinyQiCost
  next.player.destinyUsedThisTurn = true
  next.player.destinyActive = true
  pushLog(next, `发动本命「${next.player.destinyName}」！`)
  return next
}

export function endTurn(state: CombatState): CombatState {
  if (state.phase !== 'player') return state
  let next = cloneCombat(state)
  // 弃手牌
  next.player.discardPile.push(...next.player.hand)
  next.player.hand = []
  next.player.destinyActive = false
  next.phase = 'enemy'
  next = resolveEnemyTurn(next)
  return next
}

function resolveEnemyTurn(state: CombatState): CombatState {
  const e = state.enemy
  const intent = e.intent

  if (intent.intent_type === 'attack' || intent.intent_type === 'enrage') {
    const dealt = dealDamageToPlayer(state, intent.value)
    pushLog(state, `${e.name} 攻击，你受到 ${dealt} 伤害`)
  } else if (intent.intent_type === 'defend') {
    e.block += intent.value
    pushLog(state, `${e.name} 获得 ${intent.value} 护体`)
  } else if (intent.intent_type === 'skill') {
    // 简单：给玩家减一点气或加自身一层
    state.player.qi = Math.max(0, state.player.qi - intent.value)
    pushLog(state, `${e.name} 施术，气机 −${intent.value}`)
  } else if (intent.intent_type === 'escape') {
    pushLog(state, `${e.name} 逸走重整，戒备再起`)
  }

  if (state.player.hp <= 0) {
    state.phase = 'lost'
    pushLog(state, '气血归零……败北')
    return state
  }

  // 回合开始（玩家下一回合）
  state.turn += 1
  // 护体半衰
  state.player.block = Math.floor(state.player.block / 2)
  state.enemy.block = Math.floor(state.enemy.block / 2)
  state.player.ling = state.player.lingMax
  state.player.destinyUsedThisTurn = false
  state.player.destinyActive = false
  drawCards(state, 5)

  const def = getEnemy(e.enemy_id)
  e.intent = pickIntent(def.moveset)
  state.phase = 'player'
  pushLog(state, `—— 第 ${state.turn} 回合 ——`)
  return state
}

function cloneCombat(state: CombatState): CombatState {
  return {
    ...state,
    log: [...state.log],
    player: {
      ...state.player,
      statuses: { ...state.player.statuses },
      hand: [...state.player.hand],
      drawPile: [...state.player.drawPile],
      discardPile: [...state.player.discardPile],
      subdueMarks: new Set(state.player.subdueMarks),
    },
    enemy: {
      ...state.enemy,
      statuses: { ...state.enemy.statuses },
      intent: { ...state.enemy.intent },
    },
  }
}

export function intentLabel(move: EnemyMove): string {
  const map: Record<string, string> = {
    attack: '攻',
    defend: '防',
    skill: '术',
    enrage: '狂',
    escape: '逸',
  }
  const base = map[move.intent_type] ?? '?'
  if (move.intent_type === 'attack' || move.intent_type === 'enrage') {
    return `${base} ${move.value}`
  }
  if (move.intent_type === 'defend') return `${base} ${move.value}`
  if (move.intent_type === 'skill') return `${base}`
  return base
}
