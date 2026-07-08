import type { LocationDefinition, NpcProfile } from '~~/types/npc'

export interface GenerateDayPrompt {
  system: string
  user: string
}

const EXAMPLE_JSON = `{
  "dayPlans": [
    {
      "npcId": "xiaoman",
      "day": 1,
      "schedule": [
        {
          "time": "08:15",
          "locationId": "home_xiaoman",
          "action": "在院子里假装看书，其实在等阿亮出门的时间",
          "thought": "他今天会不会去木匠铺？我能不能'顺路'去集市？"
        },
        {
          "time": "09:30",
          "locationId": "carpentry_shop",
          "action": "借口给父亲送东西，在木匠铺门口停留片刻",
          "withNpcIds": ["aliang", "chenbo"],
          "thought": "阿亮又在走神了……我不敢多留，怕陈伯看出来"
        }
      ]
    },
    {
      "npcId": "aliang",
      "day": 1,
      "schedule": [
        {
          "time": "08:00",
          "locationId": "home_aliang",
          "action": "把画稿藏进床底，匆匆出门",
          "thought": "昨晚又画到很晚，今天别被师傅看出来"
        },
        {
          "time": "09:30",
          "locationId": "carpentry_shop",
          "action": "打磨桌腿时偷偷看窗外",
          "withNpcIds": ["chenbo", "xiaoman"],
          "thought": "小满怎么来了？她不会发现我在走神吧"
        }
      ]
    }
  ]
}`

function formatNpcBlock(npc: NpcProfile): string {
  const relationships = npc.relationships.length > 0
    ? npc.relationships.map(r => `    - targetId: ${r.targetId}, type: ${r.type}, note: ${r.note}`).join('\n')
    : '    （无）'

  return `- id: ${npc.id}
  name: ${npc.name}
  role: ${npc.role}
  personality: ${npc.personality}
  secretGoal: ${npc.secretGoal}
  homeLocationId: ${npc.homeLocationId}
  workLocationId: ${npc.workLocationId}
  relationships:
${relationships}`
}

function formatLocations(locations: LocationDefinition[]): string {
  return locations.map(loc => `- ${loc.id}: ${loc.name}`).join('\n')
}

export function buildGenerateDayPrompt(
  day: number,
  profiles: NpcProfile[],
  locations: LocationDefinition[],
): GenerateDayPrompt {
  const npcIds = profiles.map(p => p.id).join(', ')

  const system = `你是溪桥镇 NPC 社会仿真的日程编剧。你的任务是为六位居民生成第 ${day} 天的完整日程。

输出要求（必须严格遵守）：
1. 只输出纯 JSON，禁止 markdown 代码块，禁止任何 JSON 以外的文字
2. 根结构必须是 { "dayPlans": DayPlan[] }
3. dayPlans 数组长度必须为 6，npcId 必须与输入完全一致：${npcIds}
4. 每个 DayPlan 包含：npcId（string）、day（number，值为 ${day}）、schedule（ScheduleEvent[]）
5. 每条 ScheduleEvent 必填：time（"HH:mm" 24小时制）、locationId（string）、action（string）
6. 鼓励填写 thought（内心独白）和 withNpcIds（互动对象 id 数组）
7. locationId 只能使用提供的地点 ID，不得编造
8. 每人 schedule 6-10 条，时间范围 06:00-22:00，按时间升序排列

叙事要求（关系驱动，禁止六条平行流水账）：
- 至少 3 组跨 NPC 同场互动：同一地点、相近时间，withNpcIds 互相引用
- 小满：单向暗恋阿亮，找借口路过木匠铺，内心独白带暗恋，绝不直接表白
- 阿亮：木工走神、偷偷画画，不知小满心意
- 陈伯：回避精细活、掩饰视力退化、对阿亮更严厉
- 石头：白天少出门、傍晚活跃；遇陈伯时 subtly 把光线好的位置让给他
- 老周：消息枢纽，对陈伯视力问题点到为止
- 温姐：面包店社交、与老周消息互换，关店后独处时体现孤单

JSON 格式示例（字段结构参考，内容需重新创作）：
${EXAMPLE_JSON}`

  const user = `请为溪桥镇第 ${day} 天生成六位居民的日程。

## 地点列表（locationId 只能从中选择）
${formatLocations(locations)}

## 六位居民人设
${profiles.map(formatNpcBlock).join('\n\n')}

请输出 { "dayPlans": [...] } 格式的完整 JSON。`

  return { system, user }
}
