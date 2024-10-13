WITH UserPostCounts AS (
  SELECT userId, COUNT(*) AS postCount
  FROM posts
  GROUP BY userId
),
TopUsers AS (
  SELECT u.id, u.name, upc.postCount
  FROM users u
  JOIN UserPostCounts upc ON u.id = upc.userId
  ORDER BY upc.postCount DESC
  LIMIT 3
),
LatestComments AS (
  SELECT DISTINCT ON (p.userId) 
    p.userId, 
    p.id AS postId, 
    p.title AS postTitle, 
    c.content AS commentContent
  FROM posts p
  JOIN comments c ON p.id = c.postId
  WHERE p.userId IN (SELECT id FROM TopUsers)
  ORDER BY p.userId, c.createdAt DESC
)
SELECT 
  tu.id AS userId, 
  tu.name AS userName, 
  tu.postCount,
  lc.postTitle, 
  lc.commentContent
FROM TopUsers tu
LEFT JOIN LatestComments lc ON tu.id = lc.userId
ORDER BY tu.postCount DESC;