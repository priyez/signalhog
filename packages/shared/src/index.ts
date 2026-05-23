/**
 * A simple, deterministic string hashing function.
 * This is used for percentage rollouts to ensure a user always gets the same result.
 */
export function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Evaluates whether a feature should be enabled for a specific user based on a rollout percentage.
 * Uses the flagKey as a salt to ensure independent distribution across different flags.
 */
export function evaluateRollout(userId: string, percentage: number, flagKey: string): boolean {
  if (percentage === 0) return false;
  if (percentage === 100) return true;

  // Salt the hash with the flag key to avoid correlation between different flags
  const hash = hashString(`${flagKey}:${userId}`);
  return hash % 100 < percentage;
}


export interface TargetingRule {
  property: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'starts_with' | 'ends_with';
  value: any;
}

export function matchRules(context: Record<string, any>, rules: TargetingRule[]): boolean {
  if (!rules || rules.length === 0) return true;

  return rules.every((rule) => {
    const val = context[rule.property];
    if (val === undefined) return false;

    switch (rule.operator) {
      case 'equals': return val === rule.value;
      case 'not_equals': return val !== rule.value;
      case 'contains': return String(val).includes(String(rule.value));
      case 'not_contains': return !String(val).includes(String(rule.value));
      case 'starts_with': return String(val).startsWith(String(rule.value));
      case 'ends_with': return String(val).endsWith(String(rule.value));
      default: return false;
    }
  });
}

export interface Flag {
  key: string;
  enabled: boolean;
  rolloutPercentage: number;
  rules?: TargetingRule[];
}


export interface Environment {
  id: string;
  name: string;
  apiKey: string;
}

export interface Project {
  id: string;
  name: string;
  environments: Environment[];
}
