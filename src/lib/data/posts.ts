import { db } from "@/lib/db";
import { posts, users } from "@/lib/db/schema";

export async function getAllPosts() {
  return await db.select().from(posts);
}

export async function getPostsWithAuthors() {
  return await db.query.posts.findMany({
    with: {
      author: true,
    },
  });
}
