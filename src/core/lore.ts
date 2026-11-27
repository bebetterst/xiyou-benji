/**
 * 月圆之夜式短句：话短、署名、藏一点线索。
 * 不做大段视觉小说；战斗节奏里插一句即走。
 */

export interface LoreLine {
  speaker: string
  text: string
  /** whisper=低语线索；threat=敌意；aside=旁白；echo=回响 */
  tone?: 'whisper' | 'threat' | 'aside' | 'echo'
}

export function formatLine(line: LoreLine): string {
  return `${line.speaker}：「${line.text}」`
}

export function formatLines(lines: LoreLine[]): string {
  return lines.map(formatLine).join('\n')
}

/** 故事卡选项旁白（选完瞬间的耐嚼一句） */
export const STORY_OPTION_ASIDES: Record<string, LoreLine> = {
  'story_wukong_chushi:探泉': {
    speaker: '石胎',
    text: '水底有影。不是鱼。',
    tone: 'whisper',
  },
  'story_wukong_chushi:嬉闹': {
    speaker: '山风',
    text: '笑够了，山才认你。',
    tone: 'aside',
  },
  'story_wukong_chengwang:先入洞': {
    speaker: '美猴王',
    text: '洞是我找的——王座却是大家让的。',
    tone: 'aside',
  },
  'story_wukong_chengwang:让兄弟先': {
    speaker: '群猴',
    text: '王先让一步，山便多一分义。',
    tone: 'whisper',
  },
  'story_wukong_baishi:老实听讲': {
    speaker: '菩提余音',
    text: '记住了？出去别卖弄……你偏要记。',
    tone: 'echo',
  },
  'story_wukong_baishi:当众显摆': {
    speaker: '菩提余音',
    text: '本事是你的。祸，也是。',
    tone: 'echo',
  },
}

export function storyAside(
  storyCardId: string,
  optionLabel: string,
): LoreLine | null {
  return STORY_OPTION_ASIDES[`${storyCardId}:${optionLabel}`] ?? null
}

/** 敌人开场（每人一句，多怪并排时各露半句线索） */
export const ENEMY_OPENERS: Record<string, LoreLine> = {
  hunshi_minion: {
    speaker: '混世小妖',
    text: '大王说了——洞里的披挂，咱们先拎走！',
    tone: 'threat',
  },
  elite_hunshi_vanguard: {
    speaker: '混世先锋',
    text: '美猴王？我只看见一只刚出师的猴。',
    tone: 'threat',
  },
  boss_hunshi_mowang: {
    speaker: '混世魔王',
    text: '花果山好地方。借你兄弟一用——换身披挂。',
    tone: 'threat',
  },
  boss_interface_wukong_shoufu: {
    speaker: '石压悟空',
    text: '……又一个念经的。山压五百年，你压得住我？',
    tone: 'threat',
  },
}

/** 敌人倒下短句 */
export const ENEMY_DEATH: Record<string, LoreLine> = {
  hunshi_minion: {
    speaker: '混世小妖',
    text: '报——山上有棒……',
    tone: 'whisper',
  },
  elite_hunshi_vanguard: {
    speaker: '混世先锋',
    text: '大王……他比传闻更疯。',
    tone: 'whisper',
  },
  boss_hunshi_mowang: {
    speaker: '混世魔王',
    text: '没有兵器……你也敢护山？下次……东海那边……',
    tone: 'echo',
  },
}

/** 悟空战斗中点选目标时的低语（线索感，非教学） */
export const WUKONG_TARGET_ASIDES: LoreLine[] = [
  { speaker: '悟空', text: '先打嗓门最大的。', tone: 'aside' },
  { speaker: '悟空', text: '披挂？我倒要看看你们抢谁的。', tone: 'aside' },
  { speaker: '悟空', text: '伤我兄弟的，一个也别跑。', tone: 'aside' },
]

/** 波次节点旁白（月圆式事件条：一行情境 + 一行角色） */
export interface WaveBeat {
  title: string
  lines: LoreLine[]
}

export const HUNSHI_WAVE_BEATS: WaveBeat[] = [
  {
    title: '山门',
    lines: [
      { speaker: '旁白', text: '黑云未落，先闻锁链声。', tone: 'aside' },
      { speaker: '小猴', text: '大王！他们绑走阿石了——', tone: 'whisper' },
      { speaker: '悟空', text: '站后面。这局，我来。', tone: 'aside' },
    ],
  },
  {
    title: '洞口',
    lines: [
      { speaker: '旁白', text: '矛影横过水帘，像一道不请自来的门闩。', tone: 'aside' },
      {
        speaker: '混世先锋',
        text: '魔王要披挂。你交人，或交命。',
        tone: 'threat',
      },
      { speaker: '悟空', text: '披挂没有。命——你的。', tone: 'aside' },
    ],
  },
  {
    title: '水帘前',
    lines: [
      {
        speaker: '旁白',
        text: '鼓停了。山知道谁来了。',
        tone: 'aside',
      },
      {
        speaker: '混世魔王',
        text: '石猴学艺归来，正好——我缺个开门的。',
        tone: 'threat',
      },
      {
        speaker: '悟空',
        text: '你缺的是眼睛。看清：这山有王。',
        tone: 'aside',
      },
    ],
  },
]

export const HUNSHI_CLEAR_LINES: LoreLine[] = [
  { speaker: '群猴', text: '大王回来了……真的回来了。', tone: 'whisper' },
  {
    speaker: '悟空',
    text: '山是护住了。兵器没有——东海那边，好像有人欠我一根。',
    tone: 'aside',
  },
  {
    speaker: '旁白',
    text: '黑云散尽。水帘仍旧，心事却新。',
    tone: 'echo',
  },
]

export const HUNSHI_FAIL_LINES: LoreLine[] = [
  { speaker: '混世魔王', text: '学艺又如何？山，照样借。', tone: 'threat' },
  {
    speaker: '旁白',
    text: '水帘后，有小猴在哭。故事未完——只是此刻跪了。',
    tone: 'echo',
  },
]

export const TANG_OPEN_LINES: LoreLine[] = [
  { speaker: '旁白', text: '揭帖字旧，山息却新。', tone: 'aside' },
  {
    speaker: '唐僧',
    text: '贫僧不求打赢你。只求你听一句——可同行否？',
    tone: 'whisper',
  },
]

export const TANG_CLEAR_LINES: LoreLine[] = [
  { speaker: '悟空', text: '……走就走。紧箍那玩意儿，你可别乱念。', tone: 'aside' },
  { speaker: '唐僧', text: '先同行。其余的，路远着。', tone: 'whisper' },
]

/** 关卡序章（进战前一屏，短句阵列） */
export const HUNSHI_PROLOGUE: LoreLine[] = [
  { speaker: '旁白', text: '师父赶出门时，海是蓝的。归山时，云是黑的。', tone: 'aside' },
  { speaker: '悟空', text: '我才学成，便有人动我山？', tone: 'aside' },
  {
    speaker: '山风',
    text: '混世要披挂。披挂在猴身上——也在猴心里。',
    tone: 'whisper',
  },
]
