import type { DayPlan } from '../types/npc'

export const mockDayPlans: DayPlan[] = [
  {
    npcId: 'chenbo',
    day: 1,
    schedule: [
      { time: '06:30', locationId: 'home_chenbo', action: '摸黑起床，在窗边辨认工具轮廓', thought: '又一夜没睡好，眼睛越来越不争气' },
      { time: '08:00', locationId: 'carpentry_shop', action: '检查阿亮昨日留下的活计', withNpcIds: ['aliang'], thought: '粗活还能瞒过去，细活得想办法推给他做', importance: 6 },
      { time: '12:00', locationId: 'bakery', action: '买两个馒头当午饭', withNpcIds: ['wenjie'], thought: '温姐话多，少停留' },
      { time: '17:30', locationId: 'tavern', action: '喝一小碗汤再回家', withNpcIds: ['laozhou'], thought: '老周眼神毒，别让他看出我在躲光线' },
    ],
  },
  {
    npcId: 'aliang',
    day: 1,
    schedule: [
      { time: '07:45', locationId: 'home_aliang', action: '把速写本塞进背包夹层', thought: '今天得找机会画几笔' },
      { time: '08:00', locationId: 'carpentry_shop', action: '被陈伯检查昨日活计', withNpcIds: ['chenbo'], thought: '师傅越来越严了，我根本不在状态' },
      { time: '09:30', locationId: 'carpentry_shop', action: '打磨桌腿时望向门口', withNpcIds: ['chenbo', 'xiaoman'], thought: '小满怎么又来了？她不会发现我在走神吧' },
      { time: '14:00', locationId: 'market_square', action: '借口买钉子，在广场边画建筑轮廓', thought: '这才是我想做的事' },
    ],
  },
  {
    npcId: 'wenjie',
    day: 1,
    schedule: [
      { time: '05:30', locationId: 'bakery', action: '开炉烤第一批面包', thought: '又是独自开工的一天' },
      { time: '10:00', locationId: 'bakery', action: '边卖面包边打听镇上消息', withNpcIds: ['xiaoman'], thought: '小满今天心事重重的样子' },
      { time: '16:00', locationId: 'tavern', action: '给老周送刚出炉的面包', withNpcIds: ['laozhou'], thought: '老周总知道些我不知道的事' },
      { time: '21:00', locationId: 'home_wenjie', action: '关店后独自收拾台面', thought: '热闹了一整天，回家还是静得吓人' },
    ],
  },
  {
    npcId: 'xiaoman',
    day: 1,
    schedule: [
      { time: '08:15', locationId: 'home_xiaoman', action: '在院子里假装看书，其实在等阿亮出门', thought: '他今天会不会去木匠铺？' },
      { time: '09:30', locationId: 'carpentry_shop', action: '借口给父亲送东西，在铺门口停留', withNpcIds: ['aliang', 'chenbo'], thought: '阿亮又在走神了……我不敢多留，怕陈伯看出来', importance: 8, conversation: { speakers: ['xiaoman', 'aliang', 'chenbo'], lines: [{ npcId: 'xiaoman', text: '陈伯，我来送点东西。' }, { npcId: 'chenbo', text: '放那儿就行，别挡光。' }, { npcId: 'aliang', text: '……嗯，小满你也来了。' }] } },
      { time: '11:00', locationId: 'bakery', action: '买面包时向温姐打听阿亮的事', withNpcIds: ['wenjie'], thought: '不能问得太明显' },
      { time: '15:00', locationId: 'well', action: '打水时故意绕远路经过集市', thought: '也许能再"偶遇"他一次' },
    ],
  },
  {
    npcId: 'laozhou',
    day: 1,
    schedule: [
      { time: '09:00', locationId: 'tavern', action: '擦拭桌椅，听早来的客人闲聊', thought: '陈伯的事，知道了也不能说透' },
      { time: '12:30', locationId: 'carpentry_shop', action: '送酒菜给陈伯当午饭', withNpcIds: ['chenbo', 'aliang'], thought: '把菜单放亮处，看他能不能看清', importance: 7, conversation: { speakers: ['laozhou', 'chenbo'], lines: [{ npcId: 'laozhou', text: '陈伯，今天的菜放窗边了。' }, { npcId: 'chenbo', text: '嗯，闻着挺香。' }] } },
      { time: '16:00', locationId: 'tavern', action: '接收温姐送来的面包', withNpcIds: ['wenjie'], thought: '她今天又打听小满的事了' },
      { time: '19:00', locationId: 'tavern', action: '和石头简短交谈', withNpcIds: ['shitou'], thought: '这小子什么都知道，但从不点破' },
    ],
  },
  {
    npcId: 'shitou',
    day: 1,
    schedule: [
      { time: '07:00', locationId: 'home_shitou', action: '检查猎具后继续补觉', thought: '白天不必出门' },
      { time: '17:00', locationId: 'market_square', action: '出售昨日猎获的野味', thought: '镇上人渐渐多了' },
      { time: '18:30', locationId: 'carpentry_shop', action: '路过时把门口灯笼调亮', withNpcIds: ['chenbo'], thought: '他需要的，不必说破' },
      { time: '21:00', locationId: 'tavern', action: '喝一碗酒听老周闲聊', withNpcIds: ['laozhou'], thought: '守夜前养精神' },
    ],
  },
]
