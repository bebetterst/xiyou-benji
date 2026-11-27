import { getCard, starterDeck } from './cards'
import { getCharacter } from './characters'
import { getEnemy } from './enemies'
import { ENEMY_DEATH, ENEMY_OPENERS, formatLine } from './lore'
import type { OpeningMods } from './types'
import type {
  CardDef,
  CharacterId,
  CombatState,
  EnemyCombat,
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
  state.log = [msg, ...state.log].slice(0, 10)
}

let instanceSeq = 0
function nextInstanceId(enemyId: string) {
  instanceSeq += 1
  return `${enemyId}_${instanceSeq}`
}

function spawnEnemy(enemyId: string): EnemyCombat {
  const def = getEnemy(enemyId)
  return {
    instanceId: nextInstanceId(enemyId),
    enemy_id: def.enemy_id,
    name: def.name,
    hp: def.max_hp,
    maxHp: def.max_hp,
    block: 0,
    statuses: {},
    intent: pickIntent(def.moveset),
    require_subdue: !!def.require_subdue,
    subduePhase: false,
    traits: def.traits ?? [],
  }
}

export function livingEnemies(state: CombatState): EnemyCombat[] {
  return state.enemies.filter((e) => e.hp > 0)
}

export function getSelectedEnemy(state: CombatState): EnemyCombat | null {
  const living = livingEnemies(state)
  if (!living.length) return null
  const cur = state.enemies[state.selectedTarget]
  if (cur && cur.hp > 0) return cur
  return living[0]
}

export function selectTarget(state: CombatState, index: number): CombatState {
  if (state.phase !== 'player') return state
  const e = state.enemies[index]
  if (!e || e.hp <= 0) return state
  const next = cloneCombat(state)
  next.selectedTarget = index
  return next
}

function firstLivingIndex(enemies: EnemyCombat[]): number {
  const i = enemies.findIndex((e) => e.hp > 0)
  return i < 0 ? 0 : i
}

function buildPlayer(
  characterId: CharacterId,
  mods: OpeningMods,
  reuse?: PlayerCombat | null,
): PlayerCombat {
  if (reuse) {
    return {
      ...reuse,
      statuses: { ...reuse.statuses },
      hand: [],
      drawPile: shuffle([
        ...reuse.hand,
        ...reuse.drawPile,
        ...reuse.discardPile,
      ]),
      discardPile: [],
      block: 0,
      ling: reuse.lingMax,
      destinyUsedThisTurn: false,
      destinyActive: false,
      subdueMarks: new Set(reuse.subdueMarks),
    }
  }

  const meta = getCharacter(characterId)
  const maxHp = meta.maxHp + mods.maxHpBonus
  const deck = shuffle([
    ...starterDeck(characterId),
    ...mods.extraCards,
  ])

  return {
    hp: Math.min(maxHp, meta.maxHp + mods.maxHpBonus + mods.startHpBonus),
    maxHp,
    block: mods.startBlock,
    statuses: {},
    ling: meta.lingMax + mods.startLingBonus,
    lingMax: meta.lingMax,
    qi: Math.min(meta.qiMax + mods.qiMaxBonus, mods.startQi),
    qiMax: meta.qiMax + mods.qiMaxBonus,
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
}

export function createCombat(opts: {
  characterId: CharacterId
  enemyIds: string[]
  mods?: OpeningMods
  reusePlayer?: PlayerCombat | null
  waveIndex?: number
  waveLabel?: string
}): CombatState {
  const {
    characterId,
    enemyIds,
    mods,
    reusePlayer,
    waveIndex = 0,
    waveLabel = '',
  } = opts
  const opening = mods ?? {
    maxHpBonus: 0,
    startHpBonus: 0,
    startQi: 0,
    startBlock: 0,
    startLingBonus: 0,
    qiMaxBonus: 0,
    extraCards: [],
  }

  const enemies = enemyIds.map(spawnEnemy)
  const player = buildPlayer(characterId, opening, reusePlayer ?? null)

  // 首回合灵力加成仅第一波生效
  if (!reusePlayer && opening.startLingBonus > 0) {
    player.ling = Math.min(
      player.lingMax + opening.startLingBonus,
      player.lingMax + opening.startLingBonus,
    )
  } else if (reusePlayer) {
    player.ling = player.lingMax
  }

  const names = enemies.map((e) => e.name).join('、')
  const openLogs: string[] = [`遭遇 ${names}！`]
  const seen = new Set<string>()
  for (const e of enemies) {
    if (seen.has(e.enemy_id)) continue
    seen.add(e.enemy_id)
    const opener = ENEMY_OPENERS[e.enemy_id]
    if (opener) openLogs.unshift(formatLine(opener))
  }

  const state: CombatState = {
    turn: 1,
    player,
    enemies,
    selectedTarget: firstLivingIndex(enemies),
    log: openLogs.slice(0, 10),
    phase: 'player',
    characterId,
    waveIndex,
    waveLabel,
  }

  drawCards(state, 5)
  return state
}

/** 唐僧收伏战便捷入口 */
export function createTangCombat(): CombatState {
  return createCombat({
    characterId: 'tang_seng',
    enemyIds: ['boss_interface_wukong_shoufu'],
    waveLabel: '收伏',
  })
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

function dealDamageToEnemy(
  _state: CombatState,
  enemy: EnemyCombat,
  raw: number,
) {
  let dmg = raw
  if (enemy.block > 0) {
    const blocked = Math.min(enemy.block, dmg)
    enemy.block -= blocked
    dmg -= blocked
  }
  if (dmg > 0) {
    enemy.hp = Math.max(0, enemy.hp - dmg)
  }
  return dmg
}

function dealDamageToPlayer(state: CombatState, raw: number) {
  const p = state.player
  let dmg = raw
  if (state.characterId === 'tang_seng' && p.destinyActive) {
    dmg = Math.floor(dmg * 0.7)
  }
  const jie = targetJie(state)
  if (jie > 0 && raw > 0) {
    const reduce = jie * 3
    dmg = Math.max(0, dmg - reduce)
    // 清除任意存活敌人上的戒（挂在被施加的目标）
    for (const e of state.enemies) {
      if (e.statuses['jie']) e.statuses['jie'] = 0
    }
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

function targetJie(state: CombatState): number {
  let max = 0
  for (const e of state.enemies) {
    max = Math.max(max, e.statuses['jie'] ?? 0)
  }
  return max
}

function applyEffects(state: CombatState, card: CardDef) {
  const p = state.player
  const attackPlayed = card.type === 'attack'
  const target = getSelectedEnemy(state)

  for (const fx of card.effects) {
    switch (fx.op) {
      case 'damage': {
        if (!target) break
        if (fx.condition === 'qi_ge_2' && p.qi < 2) break
        const dealt = dealDamageToEnemy(state, target, fx.value)
        pushLog(state, `${card.name} → ${target.name} 造成 ${dealt} 伤害`)
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
      case 'apply_jie': {
        if (!target) break
        target.statuses['jie'] = (target.statuses['jie'] ?? 0) + fx.value
        pushLog(state, `赋予 ${target.name}「戒」${fx.value} 层`)
        break
      }
      case 'mark_subdue':
        p.subdueMarks.add(fx.tag)
        pushLog(
          state,
          `收伏标记：${fx.tag === 'yuefa' ? '约法' : fx.tag === 'duhou' ? '度猴' : '紧箍'}`,
        )
        break
    }
  }

  if (
    attackPlayed &&
    state.characterId === 'sun_wukong' &&
    p.destinyActive &&
    target &&
    target.hp > 0
  ) {
    const extra = dealDamageToEnemy(state, target, 3)
    pushLog(state, `身外身追加 ${extra} 伤害`)
  }

  // 目标死后自动切到下一存活目标
  if (target && target.hp <= 0) {
    const death = ENEMY_DEATH[target.enemy_id]
    pushLog(state, death ? formatLine(death) : `${target.name} 倒下！`)
    state.selectedTarget = firstLivingIndex(state.enemies)
  }
}

function checkWaveCleared(state: CombatState): boolean {
  const living = livingEnemies(state)
  if (living.length) {
    // 收伏专用：单敌 require_subdue
    const only = living[0]
    if (
      living.length === 1 &&
      only.require_subdue &&
      only.hp <= 0
    ) {
      // unreachable: living filters hp>0
    }
    return false
  }

  // 全部倒下：检查是否有 require_subdue 且未标记（唐僧）
  const subdueTargets = state.enemies.filter((e) => e.require_subdue)
  if (subdueTargets.length) {
    const marks = state.player.subdueMarks
    if (marks.has('yuefa') || marks.has('duhou') || marks.has('jingu')) {
      state.phase = 'won'
      pushLog(state, '收伏检定通过！')
      return true
    }
    // 重整第一个
    const e = subdueTargets[0]
    e.hp = Math.max(1, Math.floor(e.maxHp * 0.25))
    e.subduePhase = true
    e.intent = {
      move_id: 'wk_escape',
      intent_type: 'escape',
      value: 0,
      weight: 0,
    }
    state.selectedTarget = state.enemies.indexOf(e)
    pushLog(state, '气血已尽，然未约法/度化——敌以「逸」重整！')
    return false
  }

  state.phase = 'won'
  pushLog(state, '本波肃清！')
  return true
}

/** 对 require_subdue 敌人：血归零时走检定而非立刻从 living 消失的逻辑 */
function handleEnemyDown(state: CombatState, enemy: EnemyCombat) {
  if (enemy.hp > 0) return
  if (!enemy.require_subdue) return
  const marks = state.player.subdueMarks
  if (marks.has('yuefa') || marks.has('duhou') || marks.has('jingu')) {
    return
  }
  enemy.hp = Math.max(1, Math.floor(enemy.maxHp * 0.25))
  enemy.subduePhase = true
  enemy.intent = {
    move_id: 'wk_escape',
    intent_type: 'escape',
    value: 0,
    weight: 0,
  }
  pushLog(state, '气血已尽，然未约法/度化——敌以「逸」重整！')
}

export function canPlayCard(state: CombatState, handIndex: number): boolean {
  if (state.phase !== 'player') return false
  const id = state.player.hand[handIndex]
  if (!id) return false
  const card = getCard(id)
  if (state.player.ling < card.cost_ling) return false
  if ((card.cost_qi ?? 0) > state.player.qi) return false
  if (card.type === 'attack' && !getSelectedEnemy(state)) return false
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

  for (const e of next.enemies) {
    if (e.hp <= 0 && e.require_subdue) handleEnemyDown(next, e)
  }

  checkWaveCleared(next)
  if (next.player.hp <= 0) next.phase = 'lost'
  p.discardPile.push(id)
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
  next.player.discardPile.push(...next.player.hand)
  next.player.hand = []
  next.player.destinyActive = false
  next.phase = 'enemy'
  next = resolveEnemyTurn(next)
  return next
}

function resolveEnemyTurn(state: CombatState): CombatState {
  for (const e of state.enemies) {
    if (e.hp <= 0) continue
    const intent = e.intent
    if (intent.intent_type === 'attack' || intent.intent_type === 'enrage') {
      const dealt = dealDamageToPlayer(state, intent.value)
      pushLog(state, `${e.name} 攻击，你受到 ${dealt} 伤害`)
    } else if (intent.intent_type === 'defend') {
      e.block += intent.value
      pushLog(state, `${e.name} 获得 ${intent.value} 护体`)
    } else if (intent.intent_type === 'skill') {
      state.player.qi = Math.max(0, state.player.qi - intent.value)
      pushLog(state, `${e.name} 施术，气机 −${intent.value}`)
    } else if (intent.intent_type === 'escape') {
      pushLog(state, `${e.name} 逸走重整，戒备再起`)
    }
    if (state.player.hp <= 0) break
  }

  if (state.player.hp <= 0) {
    state.phase = 'lost'
    pushLog(state, '气血归零……败北')
    return state
  }

  state.turn += 1
  state.player.block = Math.floor(state.player.block / 2)
  for (const e of state.enemies) {
    if (e.hp > 0) e.block = Math.floor(e.block / 2)
  }
  state.player.ling = state.player.lingMax
  state.player.destinyUsedThisTurn = false
  state.player.destinyActive = false
  drawCards(state, 5)

  for (const e of state.enemies) {
    if (e.hp <= 0) continue
    const def = getEnemy(e.enemy_id)
    e.intent = pickIntent(def.moveset)
  }
  state.selectedTarget = firstLivingIndex(state.enemies)
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
    enemies: state.enemies.map((e) => ({
      ...e,
      statuses: { ...e.statuses },
      intent: { ...e.intent },
      traits: [...e.traits],
    })),
  }
}

export function snapshotPlayer(state: CombatState): PlayerCombat {
  const p = state.player
  return {
    ...p,
    statuses: { ...p.statuses },
    hand: [...p.hand],
    drawPile: [...p.drawPile],
    discardPile: [...p.discardPile],
    subdueMarks: new Set(p.subdueMarks),
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

export function enemyGlyph(enemyId: string): string {
  if (enemyId.includes('boss_hunshi')) return '魔'
  if (enemyId.includes('vanguard')) return '锋'
  if (enemyId.includes('minion')) return '妖'
  if (enemyId.includes('wukong')) return '猴'
  return '敌'
}
