import { locations } from '../data/locations'
import { npcProfiles } from '../data/npcProfiles'
import { mockDayPlans } from '../server/fixtures/mockDayPlans'
import { buildGenerateDayPrompt } from '../server/prompts/generateDayPrompt'
import { stripJsonMarkdown, validateDayPlans } from '../server/utils/validateDayPlans'

const EXPECTED_NPC_IDS = npcProfiles.map(npc => npc.id)
const VALID_LOCATION_IDS = new Set(locations.map(loc => loc.id))

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message)
  }
}

function testValidatorAcceptsMockPlans(): void {
  const validated = validateDayPlans(
    { dayPlans: mockDayPlans },
    EXPECTED_NPC_IDS,
    VALID_LOCATION_IDS,
    1,
  )
  assert(validated.length === 6, '应返回 6 份日程')
  console.log('✓ validateDayPlans 接受 mock 六人日程')
}

function testValidatorRejectsInvalidLocation(): void {
  const invalid = structuredClone(mockDayPlans)
  invalid[0].schedule[0].locationId = 'invalid_place'
  let threw = false
  try {
    validateDayPlans({ dayPlans: invalid }, EXPECTED_NPC_IDS, VALID_LOCATION_IDS, 1)
  }
  catch {
    threw = true
  }
  assert(threw, '非法 locationId 应抛出错误')
  console.log('✓ validateDayPlans 拒绝非法 locationId')
}

function testStripJsonMarkdown(): void {
  const stripped = stripJsonMarkdown('```json\n{"dayPlans":[]}\n```')
  assert(stripped === '{"dayPlans":[]}', '应剥离 markdown 代码块')
  console.log('✓ stripJsonMarkdown 正常工作')
}

function testPromptContainsRelationshipConstraints(): void {
  const { system, user } = buildGenerateDayPrompt(1, npcProfiles, locations)
  const combined = `${system}\n${user}`
  const requiredSnippets = ['secret_crush', '小满', '阿亮', 'dayPlans', 'withNpcIds', '陈伯']
  for (const snippet of requiredSnippets) {
    assert(combined.includes(snippet), `prompt 应包含「${snippet}」`)
  }
  console.log('✓ generateDayPrompt 包含关系张力与人设约束')
}

function testMockContentHasRelationshipTension(): void {
  const xiaoman = mockDayPlans.find(plan => plan.npcId === 'xiaoman')
  assert(Boolean(xiaoman), '应有小满日程')
  const hasCrushHint = xiaoman!.schedule.some(event =>
    event.locationId === 'carpentry_shop'
    && event.thought?.includes('阿亮'),
  )
  assert(hasCrushHint, '小满日程应体现暗恋线')

  const crossNpcEvents = mockDayPlans.flatMap(plan =>
    plan.schedule.filter(event => event.withNpcIds && event.withNpcIds.length > 0),
  )
  assert(crossNpcEvents.length >= 3, 'mock 数据应至少 3 次跨 NPC 同场')
  console.log('✓ mock 日程内容符合关系张力验收标准')
}

function main(): void {
  testStripJsonMarkdown()
  testValidatorAcceptsMockPlans()
  testValidatorRejectsInvalidLocation()
  testPromptContainsRelationshipConstraints()
  testMockContentHasRelationshipTension()
  console.log('\n全部 smoke test 通过')
}

main()
