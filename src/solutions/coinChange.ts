import type { MultiLanguageCode } from '../components/CodeWalkthrough';

export const COIN_CHANGE_CODE: MultiLanguageCode = {
  java: `public int coinChange(int[] coins, int amount) {
    int[] dp = new int[amount + 1];
    Arrays.fill(dp, amount + 1);
    dp[0] = 0;
    
    for (int i = 1; i <= amount; i++) {
        for (int coin : coins) {
            if (coin <= i) {
                dp[i] = Math.min(dp[i], dp[i - coin] + 1);
            }
        }
    }
    
    return dp[amount] > amount ? -1 : dp[amount];
}
// Time: O(amount × coins)  |  Space: O(amount)`,

  python: `def coinChange(coins, amount):
    dp = [amount + 1] * (amount + 1)
    dp[0] = 0
    
    for i in range(1, amount + 1):
        for coin in coins:
            if coin <= i:
                dp[i] = min(dp[i], dp[i - coin] + 1)
    
    return dp[amount] if dp[amount] != amount + 1 else -1
# Time: O(amount × coins)  |  Space: O(amount)`,

  javascript: `function coinChange(coins, amount) {
    const dp = new Array(amount + 1).fill(amount + 1);
    dp[0] = 0;
    
    for (let i = 1; i <= amount; i++) {
        for (const coin of coins) {
            if (coin <= i) {
                dp[i] = Math.min(dp[i], dp[i - coin] + 1);
            }
        }
    }
    
    return dp[amount] > amount ? -1 : dp[amount];
}
// Time: O(amount × coins)  |  Space: O(amount)`
};

// Line mappings for step synchronization across languages
export const COIN_CHANGE_LINE_MAP = {
  java: {
    'init': { current: 2, highlighted: [2, 3, 4] },
    'computing': { current: 6, highlighted: [6, 7] },
    'check_coin': { current: 8, highlighted: [8, 9] },
    'update_dp': { current: 9, highlighted: [9] },
    'complete': { current: 14, highlighted: [14] },
    'backtrack_start': { current: 14, highlighted: [14] },
    'backtrack_step': { current: 9, highlighted: [9] },
  },
  python: {
    'init': { current: 2, highlighted: [2, 3] },
    'computing': { current: 5, highlighted: [5, 6] },
    'check_coin': { current: 7, highlighted: [7, 8] },
    'update_dp': { current: 8, highlighted: [8] },
    'complete': { current: 10, highlighted: [10] },
    'backtrack_start': { current: 10, highlighted: [10] },
    'backtrack_step': { current: 8, highlighted: [8] },
  },
  javascript: {
    'init': { current: 2, highlighted: [2, 3] },
    'computing': { current: 5, highlighted: [5, 6] },
    'check_coin': { current: 7, highlighted: [7, 8] },
    'update_dp': { current: 8, highlighted: [8] },
    'complete': { current: 13, highlighted: [13] },
    'backtrack_start': { current: 13, highlighted: [13] },
    'backtrack_step': { current: 8, highlighted: [8] },
  },
};