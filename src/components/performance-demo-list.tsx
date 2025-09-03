"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { PerformanceDemoItem } from "./performance-demo-item";
import { LoadingIndicator } from "./loading-indicator";

// Generate a large dataset
const generateItems = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    name: `Item ${i}`,
    description: `This is a description for item ${i}. It contains some text that makes each item unique.`,
    price: Math.floor(Math.random() * 1000) + 10,
    category: `Category ${i % 10}`,
    tags: [`tag${i % 5}`, `tag${(i + 1) % 5}`, `tag${(i + 2) % 5}`],
    inStock: Math.random() > 0.3,
    rating: Math.floor(Math.random() * 5) + 1,
  }));
};

const ITEMS = generateItems(5000); // 5000 items to cause performance issues

// IMPROVEMENT NOTE:
// Reallocate the categories declaration outside the component to avoid redeclaration everytime the component re-render

// Generate categories for filter
const categories = ["all", ...Array.from(new Set(ITEMS.map(item => item.category)))];


export function PerformanceDemoList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [showInStockOnly, setShowInStockOnly] = useState(false);

  // This filter runs on every render - performance issue #1
  // const filteredItems = ITEMS.filter((item) => {
  //   const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //                        item.description.toLowerCase().includes(searchTerm.toLowerCase());
  //   const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
  //   const matchesStock = !showInStockOnly || item.inStock;
    
  //   return matchesSearch && matchesCategory && matchesStock;
  // });

  // IMPROVEMENT NOTE: 
  // 1) Implement debounce to only trigger searchTerm state change when user stop typing for 500ms
  // This will cause the filter result dependent on the value of searchTerm, but provide better UX when the intial data is too large.
  // Idea for implementation obtained when prompting the following on Claude:
  // "In React, what are the best practices to prevent unecessary expensive computation on every render?"
  // Future Improvement: Find a ways to improve the slowness when deleting searchTerm input with backspace 
  // 2) Implement useMemo to cache filteredItems so the filtering won't run on every render.
  // The cache will be updatead if only ITEMS, debouncedSearchTerm, showInStockOnly, selectedCategory changed.

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);
  
  const filteredItems = useMemo(() => {

    if (!debouncedSearchTerm) return [];

    return ITEMS.filter((item) => {

      const matchesSearch = item.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) || item.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
      const matchesStock = !showInStockOnly || item.inStock;
      
      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [ITEMS, debouncedSearchTerm, showInStockOnly, selectedCategory]);
  
  
  // This sort runs on every render - performance issue #2
  // const sortedItems = [...filteredItems].sort((a, b) => {
  //     switch (sortBy) {
  //       case "name":
  //         return a.name.localeCompare(b.name);
  //       case "price":
  //         return a.price - b.price;
  //       case "rating":
  //         return b.rating - a.rating;
  //       default:
  //         return 0;
  //     }
  //   });

  // IMPROVEMENT NOTE: 
  // Implement useMemo to cache sortedItems so the filtering won't run on every render.
  // The cache will be updatead if only filteredItems and sortBy changed.
  // I was a bit unsure if it's best to have 2 useMemo for filteredItems and sortedItems so I consulted Claude.
  // Prompt: Is it considered a best practice to have 2 separate useMemo for filter and sort, considering the sorting logic is complex to be chained inside the filter useMemo?
  // It was considered as best practice for better performance, easier debugging and better testability
  const sortedItems = useMemo(() => {

    return [...filteredItems].sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "price":
          return a.price - b.price;
        case "rating":
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

  }, [filteredItems, sortBy]);
  
  return (
    <div className="space-y-6">

      {/* Controls that cause re-renders */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search items..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sort by
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="name">Name</option>
              <option value="price">Price</option>
              <option value="rating">Rating</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showInStockOnly}
                onChange={(e) => setShowInStockOnly(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">In stock only</span>
            </label>
          </div>
        </div>
        
        <div className="text-sm text-gray-600">
          Showing {sortedItems.length} of {ITEMS.length} items
        </div>
      </div>

      {/* The expensive list - renders all items without virtualization */}
      <Suspense fallback={<LoadingIndicator mode={"dark"} />}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sortedItems.map((item) => (
            <PerformanceDemoItem
              key={item.id}
              item={item}
              searchTerm={searchTerm} // Passing searchTerm causes unnecessary re-renders
            />
          ))}
        </div>
      </Suspense>
    </div>
  );
}