# Testing & Examples

## Quick Test Data Setup

To quickly populate the database with test users and posts, you can use these steps:

### Manual Testing Steps

1. **Start both services** (Backend and Frontend)

2. **Create Test Users** by clicking "New User" for each:
   - Username: alice | Email: alice@example.com | Bio: Love coding and photography
   - Username: bob | Email: bob@example.com | Bio: Developer, gamer, coffee lover
   - Username: charlie | Email: charlie@example.com | Bio: Designer and artist
   - Username: diana | Email: diana@example.com | Bio: Tech enthusiast
   - Username: eve | Email: eve@example.com | Bio: Product manager

3. **Test Posts & Comments**:
   - Switch to Alice
   - Create post: "Just finished a new project! 🎉"
   - Switch to Bob
   - Go to Feed, click Comments on Alice's post
   - Add comment: "Looks great, Alice! Congrats 🎊"
   - Switch to Alice
   - Add reply: "Thanks Bob, I learned a lot from your posts!"

4. **Test Friend System**:
   - Switch to Alice
   - Go to Friends tab → Send request to Bob
   - Switch to Bob
   - Go to Friends tab → Accept Alice's request
   - Confirm Alice now appears in Bob's friends list

5. **Test Suggestions**:
   - Alice: friends with Bob
   - Bob: friends with Charlie
   - Alice: Check Suggestions tab → Should see Charlie suggested
   - Charlie: Check Suggestions tab → May see Alice and Bob suggested

## Testing Scenarios

### Scenario 1: Single User Posts
```
1. Create 1 user: Alice
2. Create 3 posts as Alice
3. Add comments to your own posts
4. Verify all posts appear in feed
```

### Scenario 2: Multi-User Conversation
```
1. Create 3 users: Alice, Bob, Charlie
2. Alice creates post: "Hello everyone!"
3. Bob comments: "Hi Alice!"
4. Charlie comments: "Hello there!"
5. Alice replies: "Welcome all!"
6. Verify comment thread integrity
```

### Scenario 3: Full Friend Network
```
Users: Alice, Bob, Charlie, Diana

Friendships:
- Alice ↔ Bob (mutual)
- Alice ↔ Charlie (mutual)
- Bob ↔ Diana (mutual)

Suggestions:
- Alice should see: Diana (1 mutual through Bob)
- Bob should see: Charlie (1 mutual through Alice)
- Charlie should see: Bob (1 mutual through Alice), Diana (1 mutual through Bob)
- Diana should see: Alice (1 mutual through Bob), Charlie (1 mutual through Bob)
```

### Scenario 4: Complex Network
```
Users: 5 (Alice, Bob, Charlie, Diana, Eve)

Build Network:
Day 1:
- Alice sends friend request to Bob
- Bob accepts → (Alice ↔ Bob)
- Charlie sends friend request to Bob
- Bob accepts → (Charlie ↔ Bob)
- Diana sends friend request to Charlie
- Charlie accepts → (Diana ↔ Charlie)
- Alice sends friend request to Diana
- Diana accepts → (Alice ↔ Diana)

Day 2:
- Eve creates account
- Eve sends friend request to Bob
- Bob accepts → (Eve ↔ Bob)
- Alice should see: Eve (suggested via Bob)
- Bob should see: All connected users
- Charlie should see: Eve (suggested via Bob), Alice (suggested via Diana and Bob)
```

## API Testing with cURL

### Create User
```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "bio": "Test bio"
  }'
```

### Create Post
```bash
curl -X POST http://localhost:5000/api/posts \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "content": "This is a test post"
  }'
```

### Add Comment
```bash
curl -X POST http://localhost:5000/api/posts/1/comments \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 2,
    "content": "Nice post!"
  }'
```

### Send Friend Request
```bash
curl -X POST http://localhost:5000/api/friendships \
  -H "Content-Type: application/json" \
  -d '{
    "user_id_1": 1,
    "user_id_2": 2
  }'
```

### Accept Friend Request (friendship_id = 1)
```bash
curl -X PUT http://localhost:5000/api/friendships/1 \
  -H "Content-Type: application/json" \
  -d '{"status": "accepted"}'
```

### Get Friend Suggestions
```bash
curl http://localhost:5000/api/users/1/suggestions
```

## Browser Developer Tools Testing

### Network Tab Checks
1. Verify API responses are JSON
2. Check status codes (200, 201, 400, 404, etc.)
3. Monitor request/response sizes
4. Check CORS headers

### Console Checks
1. No errors should appear for normal operations
2. CORS errors indicate backend not running
3. Network errors indicate connectivity issues

## Common Issues & Solutions

### Issue: "Cannot POST /api/users"
**Cause**: Backend not running
**Solution**: Start Flask backend with `python app.py` in backend directory

### Issue: "Failed to fetch" in console
**Cause**: CORS issues or backend not running
**Solution**: 
1. Verify backend is running on http://localhost:5000
2. Check that Flask-CORS is installed

### Issue: Database locked error
**Cause**: Multiple processes accessing database
**Solution**: 
1. Stop backend
2. Delete `social_network.db`
3. Restart backend

### Issue: Empty suggestions always
**Cause**: Not enough friend connections built yet
**Solution**: 
1. Create more users
2. Build friendship chains
3. Build multiple friendships per user

### Issue: "Port 5000 already in use"
**Cause**: Another process on port 5000
**Solution**: 
```bash
# Find process on port 5000
lsof -i :5000
# Kill process (replace PID with actual process id)
kill -9 PID
```

### Issue: npm modules not installing
**Cause**: Network or corrupted cache
**Solution**:
```bash
cd frontend
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

## Performance Testing

### Load Test - Multiple Posts
1. Create 1 user
2. Create 50+ posts in succession
3. Verify all posts load without lag
4. Check response times in Network tab

### Load Test - Many Users
1. Create 20+ users
2. Create friendship network between them
3. View suggestions
4. Check loading performance

### Load Test - Deep Comments
1. Create 1 post
2. Add 30+ comments
3. Expand comments section
4. Verify no UI freezing

## Database Inspection

### Using SQLite Command Line
```bash
# Open database
sqlite3 backend/social_network.db

# List all tables
.tables

# View users
SELECT * FROM users;

# View posts
SELECT p.id, u.username, p.content, p.created_at FROM posts p 
JOIN users u ON p.user_id = u.id;

# View friendships
SELECT f.id, u1.username, u2.username, f.status 
FROM friendships f 
JOIN users u1 ON f.user_id_1 = u1.id 
JOIN users u2 ON f.user_id_2 = u2.id;

# Exit
.exit
```

## Debugging Tips

### Enable Flask Debug Mode
Edit `backend/app.py` and set:
```python
app.run(debug=True, port=5000)
```

### Monitor Network Requests
1. Open DevTools (F12)
2. Go to Network tab
3. Perform actions and watch requests
4. Check response bodies for errors

### Check Database State
```bash
sqlite3 backend/social_network.db ".schema"
```

### View Backend Logs
Backend logs appear in terminal where you ran `python app.py`

## Example User Profiles

### Alice (Tech Lead)
- Email: alice@tech.com
- Bio: Full-stack developer, passionate about clean code
- Posts: Technology, tutorials, code reviews
- Friends: Bob, Charlie, Diana
- Suggestions: Eve (1 mutual), Frank (1 mutual)

### Bob (Designer)
- Email: bob@design.com
- Bio: UI/UX designer, coffee enthusiast
- Posts: Design patterns, creative work
- Friends: Alice, Charlie, Eve
- Suggestions: Diana (1 mutual), Frank (1 mutual)

### Charlie (DevOps)
- Email: charlie@ops.com
- Bio: DevOps engineer, automation expert
- Posts: Infrastructure, deployment strategies
- Friends: Alice, Bob, Diana
- Suggestions: Eve (1 mutual), Frank (1 mutual)

## Expected Behavior Checklist

- [ ] Users created with unique usernames
- [ ] Users created with unique emails
- [ ] Posts display with correct author
- [ ] Comments nested under correct post
- [ ] Friend requests can be accepted/rejected
- [ ] Friends list shows only accepted friends
- [ ] Suggestions show mutual friend count
- [ ] Suggestions don't show existing friends
- [ ] Suggestions don't show current user
- [ ] Posts appear in newest-first order
- [ ] Real-time updates work (3-second intervals)
- [ ] Deleting post also deletes comments
- [ ] Only authors can delete their content
- [ ] Profile edits save correctly
- [ ] Auto-refresh doesn't cause flickering
