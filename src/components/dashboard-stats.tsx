import { db } from '@/lib/db';
import { users, posts } from '@/lib/db/schema';
import { sum, sql } from 'drizzle-orm';

async function getTotalUsers() {
  await new Promise(resolve => setTimeout(resolve, 800));

  // IMPROVEMENT NOTE:
  // The following code is not efficient.
  // it grabs the whole users data just to count the returned number of records.
  // const userCount = await db.select().from(users);
  // return userCount.length;
  
  // Using Claude, I want to know what frameworks does this syntax come from.
  // Prompt: Can you tell what frameworks used for the following code: const userCount = await db.select().from(users);?
  // It is Drizzle ORM
  // Prompt: In drizzle, how to return number of record from a database query?
  // Claude displayed couple of methods, but it specifically said that "await db.select({ count: sql<number>`count(*)`}).from(users);" is the most efficient.
  // I want to know why it is considered the most efficient method.
  // Prompt: Why does the sql count is the most efficient method?
  // In summary: Only return a single number, Let the database do the counting (much faster), Minimize network transfer

  const userResult = await db.select({ 
    count: sql<number>`count(*)` 
  }).from(users);

  return userResult[0].count;
}

async function getTotalPosts() {
  await new Promise(resolve => setTimeout(resolve, 600));
  
  // IMPROVEMENT NOTE:
  // Applying the same approach as in getTotalUsers() using sql<number>`count(*)` 
  // const postCount = await db.select().from(posts);
  // return postCount.length;

  const postResult = await db.select({ 
    count: sql<number>`count(*)` 
  }).from(posts);

  return postResult[0].count;
}

async function getTotalLikes() {
  await new Promise(resolve => setTimeout(resolve, 400));
  const [result] = await db.select({ total: sum(posts.likeCount) }).from(posts);
  return result.total || 0;
}

export async function DashboardStats() {
  const totalUsers = await getTotalUsers();
  const totalPosts = await getTotalPosts();
  const totalLikes = await getTotalLikes();

  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-900">Users</h3>
        <p className="text-2xl font-bold text-blue-700">{totalUsers}</p>
      </div>
      <div className="bg-green-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-green-900">Posts</h3>
        <p className="text-2xl font-bold text-green-700">{totalPosts}</p>
      </div>
      <div className="bg-red-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-red-900">Likes</h3>
        <p className="text-2xl font-bold text-red-700">{totalLikes}</p>
      </div>
    </div>
  );
}