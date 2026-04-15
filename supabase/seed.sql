-- ============================================================
-- SAMPLE SEED DATA (Run AFTER schema.sql)
-- Run in Supabase SQL Editor for demo purposes
-- Note: Replace '<your-user-id>' with an actual user UUID after signing up
-- ============================================================

-- Sample questions across predefined topics
DO $$
DECLARE
  arrays_id     UUID;
  strings_id    UUID;
  trees_id      UUID;
  graphs_id     UUID;
  dp_id         UUID;
  ll_id         UUID;
  stack_id      UUID;
  greedy_id     UUID;
  bits_id       UUID;
BEGIN
  SELECT id INTO arrays_id FROM topics WHERE name = 'Arrays';
  SELECT id INTO strings_id FROM topics WHERE name = 'Strings';
  SELECT id INTO trees_id FROM topics WHERE name = 'Trees';
  SELECT id INTO graphs_id FROM topics WHERE name = 'Graphs';
  SELECT id INTO dp_id FROM topics WHERE name = 'Dynamic Programming';
  SELECT id INTO ll_id FROM topics WHERE name = 'Linked List';
  SELECT id INTO stack_id FROM topics WHERE name = 'Stack';
  SELECT id INTO greedy_id FROM topics WHERE name = 'Greedy';
  SELECT id INTO bits_id FROM topics WHERE name = 'Bit Manipulation';

  -- Arrays
  INSERT INTO questions (title, link, difficulty, topic_id, tags, notes) VALUES
    ('Two Sum', 'https://leetcode.com/problems/two-sum/', 'Easy', arrays_id, ARRAY['hash-map'], '## Approach\nUse a hash map to store seen elements and their indices.'),
    ('Best Time to Buy and Sell Stock', 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/', 'Easy', arrays_id, ARRAY['sliding-window'], '## Approach\nTrack minimum price seen so far, compute profit at each step.'),
    ('Container With Most Water', 'https://leetcode.com/problems/container-with-most-water/', 'Medium', arrays_id, ARRAY['two-pointer'], NULL),
    ('3Sum', 'https://leetcode.com/problems/3sum/', 'Medium', arrays_id, ARRAY['two-pointer', 'sorting'], NULL),
    ('Product of Array Except Self', 'https://leetcode.com/problems/product-of-array-except-self/', 'Medium', arrays_id, ARRAY['prefix-sum'], NULL)
  ON CONFLICT DO NOTHING;

  -- Strings
  INSERT INTO questions (title, link, difficulty, topic_id, tags, notes) VALUES
    ('Valid Anagram', 'https://leetcode.com/problems/valid-anagram/', 'Easy', strings_id, ARRAY['hash-map', 'sorting'], NULL),
    ('Longest Substring Without Repeating Characters', 'https://leetcode.com/problems/longest-substring-without-repeating-characters/', 'Medium', strings_id, ARRAY['sliding-window', 'hash-map'], NULL),
    ('Minimum Window Substring', 'https://leetcode.com/problems/minimum-window-substring/', 'Hard', strings_id, ARRAY['sliding-window'], NULL)
  ON CONFLICT DO NOTHING;

  -- Trees
  INSERT INTO questions (title, link, difficulty, topic_id, tags, notes) VALUES
    ('Maximum Depth of Binary Tree', 'https://leetcode.com/problems/maximum-depth-of-binary-tree/', 'Easy', trees_id, ARRAY['dfs', 'recursion'], NULL),
    ('Binary Tree Level Order Traversal', 'https://leetcode.com/problems/binary-tree-level-order-traversal/', 'Medium', trees_id, ARRAY['bfs'], NULL),
    ('Lowest Common Ancestor', 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/', 'Medium', trees_id, ARRAY['dfs', 'recursion'], NULL),
    ('Binary Tree Maximum Path Sum', 'https://leetcode.com/problems/binary-tree-maximum-path-sum/', 'Hard', trees_id, ARRAY['dfs', 'dp'], NULL)
  ON CONFLICT DO NOTHING;

  -- Graphs
  INSERT INTO questions (title, link, difficulty, topic_id, tags, notes) VALUES
    ('Number of Islands', 'https://leetcode.com/problems/number-of-islands/', 'Medium', graphs_id, ARRAY['bfs', 'dfs', 'union-find'], NULL),
    ('Clone Graph', 'https://leetcode.com/problems/clone-graph/', 'Medium', graphs_id, ARRAY['bfs', 'dfs'], NULL),
    ('Course Schedule', 'https://leetcode.com/problems/course-schedule/', 'Medium', graphs_id, ARRAY['topological-sort', 'dfs'], NULL)
  ON CONFLICT DO NOTHING;

  -- DP
  INSERT INTO questions (title, link, difficulty, topic_id, tags, notes) VALUES
    ('Climbing Stairs', 'https://leetcode.com/problems/climbing-stairs/', 'Easy', dp_id, ARRAY['memoization'], NULL),
    ('Coin Change', 'https://leetcode.com/problems/coin-change/', 'Medium', dp_id, ARRAY['dp', 'bfs'], NULL),
    ('Longest Common Subsequence', 'https://leetcode.com/problems/longest-common-subsequence/', 'Medium', dp_id, ARRAY['2d-dp'], NULL),
    ('0/1 Knapsack', 'https://www.geeksforgeeks.org/0-1-knapsack-problem-dp-10/', 'Medium', dp_id, ARRAY['dp'], NULL)
  ON CONFLICT DO NOTHING;

  -- Linked List
  INSERT INTO questions (title, link, difficulty, topic_id, tags, notes) VALUES
    ('Reverse Linked List', 'https://leetcode.com/problems/reverse-linked-list/', 'Easy', ll_id, ARRAY['iterative', 'recursive'], NULL),
    ('Detect Cycle in Linked List', 'https://leetcode.com/problems/linked-list-cycle/', 'Easy', ll_id, ARRAY['floyd', 'two-pointer'], NULL),
    ('Merge K Sorted Lists', 'https://leetcode.com/problems/merge-k-sorted-lists/', 'Hard', ll_id, ARRAY['heap', 'divide-conquer'], NULL)
  ON CONFLICT DO NOTHING;

  -- Stack
  INSERT INTO questions (title, link, difficulty, topic_id, tags, notes) VALUES
    ('Valid Parentheses', 'https://leetcode.com/problems/valid-parentheses/', 'Easy', stack_id, ARRAY['stack'], NULL),
    ('Daily Temperatures', 'https://leetcode.com/problems/daily-temperatures/', 'Medium', stack_id, ARRAY['monotonic-stack'], NULL)
  ON CONFLICT DO NOTHING;

  -- Greedy
  INSERT INTO questions (title, link, difficulty, topic_id, tags, notes) VALUES
    ('Jump Game', 'https://leetcode.com/problems/jump-game/', 'Medium', greedy_id, ARRAY['greedy'], NULL),
    ('Meeting Rooms II', 'https://leetcode.com/problems/meeting-rooms-ii/', 'Medium', greedy_id, ARRAY['heap', 'sorting'], NULL)
  ON CONFLICT DO NOTHING;

  -- Bit Manipulation
  INSERT INTO questions (title, link, difficulty, topic_id, tags, notes) VALUES
    ('Single Number', 'https://leetcode.com/problems/single-number/', 'Easy', bits_id, ARRAY['xor'], NULL),
    ('Counting Bits', 'https://leetcode.com/problems/counting-bits/', 'Easy', bits_id, ARRAY['dp', 'bits'], NULL)
  ON CONFLICT DO NOTHING;

END $$;
