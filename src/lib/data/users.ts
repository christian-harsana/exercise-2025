import { db } from "@/lib/db";
import { users, posts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
// import { email } from "zod";

export async function getUserById(userId: number) {
  const [user] = await db
    .select({
      id: users.id, // IMPROVEMENT NOTE: Omit hashPassword from the query to prevent sensitive data leak
      username: users.username,
      createdAt: users.createdAt
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return user;
}

export async function getUserWithPosts(userId: number) {
  const user = await getUserById(userId);
  if (!user) return null;

  const userPosts = await db
    .select()
    .from(posts)
    .where(eq(posts.authorId, userId));

  return {
    ...user,
    posts: userPosts,
  };
}
