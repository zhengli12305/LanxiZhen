import type { RelationshipType } from '~~/types/npc'

const RELATIONSHIP_LABELS: Record<RelationshipType, string> = {
  mentor_apprentice: '师徒',
  secret_crush: '暗恋',
  knows_secret: '知情',
  close_friend: '熟识',
  social_hub: '社交枢纽',
}

export function getRelationshipLabel(type: RelationshipType): string {
  return RELATIONSHIP_LABELS[type]
}
