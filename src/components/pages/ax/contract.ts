/** Stable analytics and Worker API identifiers for AX consultation topics. */
export const axTopicIds = [
  'strategy_discovery',
  'decision_map',
  'operations_transition',
  'organization_adoption',
  'openai_adoption',
  'other',
] as const;

export type AxTopicId = (typeof axTopicIds)[number];
