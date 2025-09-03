"use client";

import { useState, useMemo, useEffect, Suspense, SetStateAction } from "react";
import { LikeButton } from "./like-button";
import { LoadingIndicator } from "./loading-indicator";
import { Post, User } from "@/lib/db/types";

interface PostsListProps {
  posts: (Post & {
    author: User;
  })[];
}

export function PostsList({ posts }: PostsListProps) {
  
  // Problems: 
  // - The inital amount of posts to display is very large
  // - Everytime user change the filter (i.e. typing into search box or change the sortBy dropdown), the app trigger an expensive filter process
  // IMPROVEMENT NOTE:
  // 1) Claude's Prompt used to get some ideas: Currently work in React. I have a component with has expensive filtering process and inside the component, there is a search bar. When user type inside the search bar, it will trigger a filtering process based on the value typed in. However, because the initial number of item is so many, typing the value inside the search bar become very unresponsive due to rendering the number of filtered items. What can we do in terms of the search bar? Is separate it to its own component help?
  // 2) The first idea is to implement Debounce for triggering the state change when user has stopped typing for around 0.5 second
  // This implementation help a little to make the typing a bit more responsive, but unfortunately not good enough.
  // 3) Further prompting for: "Built-in React Alternatives" to get simple idea that can be implemented quickly 
  // reveal simple pagination/limiting technique to limit the number of posts displayed, and ability to load more on button click.
  // This seems work well with the number of posts limited, the issue for typing is significantly reduced.
  // 4) Implement <Suspense> surround the post list area (excluding the filter) to show "LoadingIndicator" component
  // 5) Looking at the other alternatives, for future to do: virtualisation may be the best approach for case like this

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "likes">("date");
  const [visibleCount, setVisibleCount] = useState(50);

  // Debounce
  useEffect(() => {
    const timer = setTimeout(() => {

      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Filter Posts
  const processedPosts = useMemo(() => {

    let filtered = posts;

    if (debouncedSearchTerm) {

      filtered = posts.filter((post) => {

        const titleMatch = post.title
          .toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase());
        
        const contentMatch = post.content
          .toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase());

        const authorMatch = post.author?.username
          .toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase());

        // IMPROVEMENT NOTE:
        // Remove redundant complexCalculation function.
        // const complexCalculation = Array.from({ length: 1000 }, (_, i) => {
        //   return Math.sqrt(i * Math.PI) + Math.sin(i) + Math.cos(i);
        // }).reduce((sum, val) => sum + val, 0);

        return titleMatch || contentMatch || authorMatch;
      });
    }

    if (sortBy === "likes") {
      filtered = [...filtered].sort((a, b) => b.likeCount - a.likeCount);
    } else {
      filtered = [...filtered].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    return filtered;
  }, [posts, debouncedSearchTerm, sortBy]);


  // Limit Visible Posts
  const visiblePosts = useMemo(() => {
    return processedPosts.slice(0, visibleCount);
  }, [processedPosts, visibleCount]);

  const loadMorePosts = () => {
    setVisibleCount(prev => prev + 50);
  };

  // Reset visible count when search changes
  const handleSearchChange = (e: { target: { value: SetStateAction<string>; }; }) => {
    
    const value = e.target.value;

    setSearchTerm(value);
    setDebouncedSearchTerm(value);
    setVisibleCount(50); // Reset to show first 50 of new results
  };

  const hasMorePosts = visiblePosts.length < processedPosts.length;

  return (
    <div className="space-y-4">
      <div className="flex gap-4 mb-6">
        
        <input
          type="text"
          placeholder="Search posts..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
        />

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as "date" | "likes")}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
        >
          <option value="date">Sort by Date</option>
          <option value="likes">Sort by Likes</option>
        </select>
      </div>

      <Suspense fallback={<LoadingIndicator mode = {"light"} />}>
        <div className="space-y-4">
          {visiblePosts.map((post) => (
            <div key={post.id} className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 mt-2">{post.content}</p>
                  <div className="mt-4 flex items-center text-sm text-gray-500">
                    <span>By {post.author?.username || "Unknown"}</span>
                    <span className="mx-2">•</span>
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <LikeButton
                    postId={post.id}
                    initialLikeCount={post.likeCount}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {hasMorePosts && (
          <button className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed" onClick={loadMorePosts}>
            Load More ({processedPosts.length - visiblePosts.length} remaining)
          </button>
        )}
      </Suspense>
    </div>
  );
}
