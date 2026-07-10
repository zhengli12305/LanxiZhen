// 溪桥镇 NPC 社会仿真 —— 核心类型定义
// 这份类型贯穿三处：角色静态数据(data/npcProfiles.ts)、AI生成的当日计划、以及地图/详情面板的渲染

/**
 * 关系类型。用枚举而不是自由字符串，是为了让AI prompt生成时
 * 能按类型给出不同的行为倾向（比如 secret_crush 和 mentor_apprentice
 * 应该导向完全不同的互动语气）。
 */
export type RelationshipType =
  | 'mentor_apprentice' // 师徒
  | 'secret_crush'      // 单向暗恋
  | 'knows_secret'       // 知情但未说破
  | 'close_friend'       // 熟识/朋友
  | 'social_hub'         // 社交枢纽型关系（八卦/消息互通）

/**
 * 关系是有向的：a.relationships 里指向 b，不代表 b.relationships 里一定有对称的一条。
 * 例如小满暗恋阿亮，是单向的——阿亮的 relationships 里不会出现对小满的对应关系。
 * 这个不对称性本身就是行为生成时的戏剧张力来源。
 */
export interface Relationship {
  targetId: string
  type: RelationshipType
  note: string // 一句话说明这段关系的张力，直接会喂给AI prompt
}

/**
 * NPC的静态人设。这部分不会因为"哪一天"而改变，
 * 是骰子入场界面和AI生成prompt共用的唯一数据源。
 */
export interface NpcProfile {
  id: string
  name: string
  role: string          // 例如"老木匠"，用于骰子面和列表展示
  avatar: string         // 头像/精灵图资源路径
  personality: string   // 简短性格描述，直接喂给AI
  secretGoal: string    // 隐藏动机/心事，影响AI生成行为的倾向
  relationships: Relationship[]
  homeLocationId: string
  workLocationId: string
}

export interface ConversationLine {
  npcId: string
  text: string
}

export interface ScheduleConversation {
  speakers: string[]
  lines: ConversationLine[]
}

/**
 * 当天日程里的单个事件，由AI生成。
 * thought 是这个NPC此刻的内心独白，是详情面板里最有可读性的部分。
 */
export interface ScheduleEvent {
  time: string           // "HH:mm" 24小时制，例如 "08:30"
  locationId: string
  action: string          // 简短动作描述，例如"在木匠铺打磨桌腿"
  withNpcIds?: string[]  // 如果这个事件涉及和其他NPC互动
  thought?: string        // 内心独白
  importance?: number     // 1-10，详情面板高亮关键事件
  conversation?: ScheduleConversation // 同地点短对话（批量生成时内嵌）
}

/**
 * 某个NPC在第几天的完整日程，AI生成的输出会被解析成这个结构。
 */
export interface DayPlan {
  npcId: string
  day: number
  schedule: ScheduleEvent[]
}

/**
 * 根据当前时间指针派生出的NPC"此刻"状态。
 * 由 useNpcCurrentState 这个composable计算得出，不直接存进store。
 */
export interface NpcRuntimeState {
  npcId: string
  currentLocationId: string
  currentAction: string
  currentThought?: string
  isMoving: boolean
  nextEvent?: ScheduleEvent // 用于地图上做"即将出发"的预告动画
}

/**
 * 地图上的一个可到达地点。
 */
export interface LocationDefinition {
  id: string
  name: string
  x: number // 地图坐标，单位:像素，基于设计稿的参考尺寸
  y: number
}
