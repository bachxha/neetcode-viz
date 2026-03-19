import type { MultiLanguageCode } from '../components/CodeWalkthrough';

export const NUMBER_OF_ISLANDS_CODE: MultiLanguageCode = {
  java: `public int numIslands(char[][] grid) {
    if (grid == null || grid.length == 0) return 0;
    
    int islands = 0;
    int rows = grid.length, cols = grid[0].length;
    
    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            if (grid[r][c] == '1') {
                islands++;
                dfs(grid, r, c);
            }
        }
    }
    
    return islands;
}

private void dfs(char[][] grid, int r, int c) {
    if (r < 0 || r >= grid.length || c < 0 || 
        c >= grid[0].length || grid[r][c] != '1') {
        return;
    }
    
    grid[r][c] = '0'; // Mark as visited
    
    // Explore all 4 directions
    dfs(grid, r + 1, c);
    dfs(grid, r - 1, c);
    dfs(grid, r, c + 1);
    dfs(grid, r, c - 1);
}
// Time: O(rows × cols)  |  Space: O(rows × cols) worst case`,

  python: `def numIslands(grid):
    if not grid or not grid[0]:
        return 0
    
    islands = 0
    rows, cols = len(grid), len(grid[0])
    
    def dfs(r, c):
        if (r < 0 or r >= rows or c < 0 or 
            c >= cols or grid[r][c] != '1'):
            return
        
        grid[r][c] = '0'  # Mark as visited
        
        # Explore all 4 directions
        dfs(r + 1, c)
        dfs(r - 1, c)
        dfs(r, c + 1)
        dfs(r, c - 1)
    
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == '1':
                islands += 1
                dfs(r, c)
    
    return islands
# Time: O(rows × cols)  |  Space: O(rows × cols) worst case`,

  javascript: `function numIslands(grid) {
    if (!grid || grid.length === 0) return 0;
    
    let islands = 0;
    const rows = grid.length, cols = grid[0].length;
    
    function dfs(r, c) {
        if (r < 0 || r >= rows || c < 0 || 
            c >= cols || grid[r][c] !== '1') {
            return;
        }
        
        grid[r][c] = '0'; // Mark as visited
        
        // Explore all 4 directions
        dfs(r + 1, c);
        dfs(r - 1, c);
        dfs(r, c + 1);
        dfs(r, c - 1);
    }
    
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (grid[r][c] === '1') {
                islands++;
                dfs(r, c);
            }
        }
    }
    
    return islands;
}
// Time: O(rows × cols)  |  Space: O(rows × cols) worst case`
};

// Line mappings for step synchronization across languages
export const NUMBER_OF_ISLANDS_LINE_MAP = {
  java: {
    'start': { current: 1, highlighted: [1, 2] },
    'found-land': { current: 8, highlighted: [8, 9, 10] },
    'explore': { current: 17, highlighted: [17] },
    'mark-visited': { current: 23, highlighted: [23] },
    'water': { current: 18, highlighted: [18, 19, 20] },
    'already-visited': { current: 18, highlighted: [18, 19, 20] },
    'island-complete': { current: 10, highlighted: [9, 10] },
    'done': { current: 14, highlighted: [14] },
  },
  python: {
    'start': { current: 1, highlighted: [1, 2] },
    'found-land': { current: 21, highlighted: [21, 22, 23] },
    'explore': { current: 8, highlighted: [8] },
    'mark-visited': { current: 13, highlighted: [13] },
    'water': { current: 9, highlighted: [9, 10, 11] },
    'already-visited': { current: 9, highlighted: [9, 10, 11] },
    'island-complete': { current: 23, highlighted: [22, 23] },
    'done': { current: 25, highlighted: [25] },
  },
  javascript: {
    'start': { current: 1, highlighted: [1, 2] },
    'found-land': { current: 19, highlighted: [19, 20, 21] },
    'explore': { current: 6, highlighted: [6] },
    'mark-visited': { current: 11, highlighted: [11] },
    'water': { current: 7, highlighted: [7, 8, 9] },
    'already-visited': { current: 7, highlighted: [7, 8, 9] },
    'island-complete': { current: 21, highlighted: [20, 21] },
    'done': { current: 25, highlighted: [25] },
  },
};