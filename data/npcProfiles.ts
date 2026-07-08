import type { NpcProfile } from '~~/types/npc'

// 溪桥镇六位居民。relationships是有向的——
// 比如小满暗恋阿亮，只出现在小满这一条数据里，阿亮的relationships里不会有对称记录。
// 这份数据是唯一数据源：骰子入场界面、AI生成prompt、地图初始定位都从这里读取。

export const npcProfiles: NpcProfile[] = [
  {
    id: 'chenbo',
    name: '陈伯',
    role: '老木匠',
    avatar: '/avatars/chenbo.png',
    personality: '沉默寡言，做事一丝不苟，几十年只守着这一间木匠铺，不太擅长表达情感',
    secretGoal: '视力这两年明显在退化，怕被人发现露了怯就没法继续接活，一直瞒着所有人硬撑',
    relationships: [
      {
        targetId: 'aliang',
        type: 'mentor_apprentice',
        note: '阿亮是他唯一的徒弟，他看得出这孩子心不在焉，但没点破，只是更严厉地盯着手上的活',
      },
    ],
    homeLocationId: 'home_chenbo',
    workLocationId: 'carpentry_shop',
  },
  {
    id: 'aliang',
    name: '阿亮',
    role: '木匠学徒',
    avatar: '/avatars/aliang.png',
    personality: '活泼、爱幻想，手上做着木工，心里想着别的事，藏不住情绪，容易分心',
    secretGoal: '其实一点都不想学木工，偷偷在画画，梦想是有一天离开小镇去外面当画师',
    relationships: [
      {
        targetId: 'chenbo',
        type: 'mentor_apprentice',
        note: '敬重师傅，但学木工这件事让他觉得离自己的梦想越来越远，常常在店里走神',
      },
    ],
    homeLocationId: 'home_aliang',
    workLocationId: 'carpentry_shop',
  },
  {
    id: 'wenjie',
    name: '温姐',
    role: '面包店老板娘',
    avatar: '/avatars/wenjie.png',
    personality: '热心、爱说话，镇上大小消息几乎都会经过她的面包店，对谁都笑脸相迎',
    secretGoal: '丈夫去世后一个人撑着店，嘴上说一个人挺好、不缺人陪，其实晚上关店后常常觉得很孤单',
    relationships: [
      {
        targetId: 'laozhou',
        type: 'social_hub',
        note: '和老周算是镇上消息流通的两个节点，两人常互相打听、交换消息，带点心照不宣的默契',
      },
    ],
    homeLocationId: 'home_wenjie',
    workLocationId: 'bakery',
  },
  {
    id: 'xiaoman',
    name: '小满',
    role: '镇长的女儿',
    avatar: '/avatars/xiaoman.png',
    personality: '叛逆、直率，看不惯镇上一些约定俗成的规矩，说话经常不顾场合',
    secretGoal: '偷偷喜欢阿亮，但心里清楚父亲绝不会同意她跟一个学徒有什么牵扯，所以从没表露过',
    relationships: [
      {
        targetId: 'aliang',
        type: 'secret_crush',
        note: '单向暗恋，阿亮本人并不知情。她会找各种借口路过木匠铺，但从不多留',
      },
    ],
    homeLocationId: 'home_xiaoman',
    workLocationId: 'mayor_house',
  },
  {
    id: 'laozhou',
    name: '老周',
    role: '酒馆老板',
    avatar: '/avatars/laozhou.png',
    personality: '圆滑世故，见多识广，很少表态站队,更喜欢当一个不掺和的旁观者',
    secretGoal: '镇上大部分人的秘密他多少都听过风声，包括陈伯视力的事，但他习惯把话都烂在肚子里',
    relationships: [
      {
        targetId: 'wenjie',
        type: 'social_hub',
        note: '和温姐互通消息，但他比温姐更谨慎，很多话点到为止不会说透',
      },
      {
        targetId: 'chenbo',
        type: 'knows_secret',
        note: '隐约察觉陈伯眼神不对劲，但从没问出口，只是偶尔不动声色地照应一下',
      },
    ],
    homeLocationId: 'home_laozhou',
    workLocationId: 'tavern',
  },
  {
    id: 'shitou',
    name: '石头',
    role: '守夜猎人',
    avatar: '/avatars/shitou.png',
    personality: '孤僻、话少，白天很少出现在人群里，习惯独来独往，观察力很强',
    secretGoal: '有一次巡夜时撞见陈伯在暗处眯着眼摸黑辨认东西,自此知道了他的秘密,但一直没说破',
    relationships: [
      {
        targetId: 'chenbo',
        type: 'knows_secret',
        note: '两人交集不多，但每次遇到，石头都会不动声色地把光线好的位置让给陈伯',
      },
    ],
    homeLocationId: 'home_shitou',
    workLocationId: 'home_shitou',
  },
]

export function getNpcById(id: string): NpcProfile | undefined {
  return npcProfiles.find(npc => npc.id === id)
}
