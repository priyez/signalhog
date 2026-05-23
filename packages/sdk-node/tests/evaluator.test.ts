import { describe, it, expect } from 'vitest';
import { evaluateRollout, hashString } from '@feature-flags/shared';

describe('Rollout Evaluator', () => {
  it('should always return true for 100% rollout', () => {
    expect(evaluateRollout('user1', 100)).toBe(true);
    expect(evaluateRollout('user2', 100)).toBe(true);
    expect(evaluateRollout('user3', 100)).toBe(true);
  });

  it('should always return false for 0% rollout', () => {
    expect(evaluateRollout('user1', 0)).toBe(false);
    expect(evaluateRollout('user2', 0)).toBe(false);
    expect(evaluateRollout('user3', 0)).toBe(false);
  });

  it('should be deterministic (same user gets same result repeatedly)', () => {
    const result = evaluateRollout('deterministic_user', 50);
    for (let i = 0; i < 100; i++) {
      expect(evaluateRollout('deterministic_user', 50)).toBe(result);
    }
  });

  it('should distribute users somewhat evenly based on percentage', () => {
    let enabledCount = 0;
    const totalUsers = 1000;
    const targetPercentage = 25;

    for (let i = 0; i < totalUsers; i++) {
      if (evaluateRollout(`user_id_${i}`, targetPercentage)) {
        enabledCount++;
      }
    }

    // With 1000 users, expecting roughly 250 to be enabled.
    // Allowing a small variance margin (e.g. 200 to 300).
    expect(enabledCount).toBeGreaterThan(200);
    expect(enabledCount).toBeLessThan(300);
  });
});

describe('String Hashing', () => {
  it('should generate same hash for same string', () => {
    expect(hashString('hello')).toBe(hashString('hello'));
  });

  it('should generate different hashes for different strings', () => {
    expect(hashString('hello')).not.toBe(hashString('world'));
  });
});
