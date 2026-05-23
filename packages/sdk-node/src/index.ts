import { evaluateRollout, Flag, matchRules } from '@feature-flags/shared';


export interface FlagsConfig {
  apiKey: string;
  baseUrl?: string;
  refreshInterval?: number; // ms
}

export class SignalHog {
  private apiKey: string;
  private baseUrl: string;
  private refreshInterval: number;
  private flags: Record<string, Flag> = {};
  private timer?: NodeJS.Timeout;

  constructor(config: FlagsConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'http://localhost:3001';
    this.refreshInterval = config.refreshInterval || 30000; // 30s default
  }

  private distinctId?: string;

  async waitForInitialization() {
    await this.refreshFlags();
    this.startPolling();
  }

  identify(distinctId: string) {
    this.distinctId = distinctId;
  }

  async capture(event: string, properties: Record<string, any> = {}) {
    if (!this.distinctId) {
      console.warn('Identify a user before capturing events.');
    }

    try {
      await fetch(`${this.baseUrl}/capture`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          event,
          distinctId: this.distinctId || 'anonymous',
          properties,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error('Failed to capture event:', error);
    }
  }

  private async refreshFlags() {
    try {
      const response = await fetch(`${this.baseUrl}/sdk/flags`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        this.flags = data;
      } else if (response.status === 401) {
        throw new Error('[SignalHog] Critical Error: Invalid API Key provided. Please check your dashboard for the correct key.');
      } else {
        console.error(`[SignalHog] Failed to refresh flags. Server returned status: ${response.status}`);
      }
    } catch (error) {
      console.error('[SignalHog] Failed to sync feature flags:', error);
      throw error; // Rethrow so waitForInitialization can catch it
    }
  }

  private startPolling() {
    this.timer = setInterval(() => this.refreshFlags(), this.refreshInterval);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  async isFeatureEnabled(flagKey: string, context: Record<string, any> = {}): Promise<boolean> {
    const flag = this.flags[flagKey];
    if (!flag) {
      console.warn(`[SignalHog] Warning: Feature flag "${flagKey}" not found. Returning 'false' by default.`);
      return false;
    }
    if (!flag.enabled) return false;

    // 1. Check targeting rules
    const combinedContext = { ...context, distinctId: context.userId || this.distinctId };
    if (flag.rules && flag.rules.length > 0) {
      if (!matchRules(combinedContext, flag.rules)) {
        return false;
      }
    }

    // 2. Check percentage rollout
    const userId = combinedContext.distinctId;
    if (!userId) return false;

    return evaluateRollout(userId, flag.rolloutPercentage, flagKey);
  }

}
