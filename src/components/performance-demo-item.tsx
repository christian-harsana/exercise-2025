"use client";

import { useState, useMemo } from "react";

interface Item {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  tags: string[];
  inStock: boolean;
  rating: number;
}

interface PerformanceDemoItemProps {
  item: Item;
  searchTerm: string; // This prop causes unnecessary re-renders
}

export function PerformanceDemoItem({ item, searchTerm }: PerformanceDemoItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  // Expensive computation that runs on every render - performance issue #3
  // const highlightedName = item.name.split(new RegExp(`(${searchTerm})`, 'gi')).map((part, i) => (
  //   <span
  //     key={i}
  //     className={part.toLowerCase() === searchTerm.toLowerCase() ? 'bg-yellow-200' : ''}
  //   >
  //     {part}
  //   </span>
  // ));

  // IMPROVEMENT NOTE:
  // Implement useMemo with item.name and searchTerm as dependencies to prevent unecessary highlightedName computation on every PerformanceDemoItem rendering.
  // For example: this computation won't be run when user change the sortBy filter.
  const highlightedName = useMemo(() => {

    return item.name.split(new RegExp(`(${searchTerm})`, 'gi')).map((part, i) => (
      <span
        key={i}
        className={part.toLowerCase() === searchTerm.toLowerCase() ? 'bg-yellow-200' : ''}
      >
        {part}
      </span>
    ));

  }, [item.name, searchTerm]);
  

  // Another expensive computation - performance issue #4
  // const highlightedDescription = item.description.split(new RegExp(`(${searchTerm})`, 'gi')).map((part, i) => (
  //   <span
  //     key={i}
  //     className={part.toLowerCase() === searchTerm.toLowerCase() ? 'bg-yellow-200' : ''}
  //   >
  //     {part}
  //   </span>
  // ));

  // IMPROVEMENT NOTE:
  // Similar approach to optimise highlightedName above with item.description and searchTerm as dependencies.
  const highlightedDescription = useMemo(() => {

    return item.description.split(new RegExp(`(${searchTerm})`, 'gi')).map((part, i) => (
      <span
        key={i}
        className={part.toLowerCase() === searchTerm.toLowerCase() ? 'bg-yellow-200' : ''}
      >
        {part}
      </span>
    ));

  }, [item.description, searchTerm]);


  // Expensive operation that doesn't need to run on every render
  // const relatedItems = Array.from({ length: 10 }, (_, i) => ({
  //   id: item.id * 100 + i,
  //   name: `Related ${i}`,
  // }));

  // IMPROVEMENT NOTE:
  // Similar approach to optimise highlightedName above using useMemo with item.id as dependency.
  const relatedItems = useMemo(() => {

    return Array.from({ length: 10 }, (_, i) => ({
      id: item.id * 100 + i,
      name: `Related ${i}`,
    }));

  }, [item.id]);


  // Simulating some complex calculations
  // const discountPrice = item.price * 0.9;
  // const taxAmount = discountPrice * 0.08;
  // const totalPrice = (discountPrice + taxAmount) * quantity;

  // IMPROVEMENT NOTE:
  // Similar approach as item.price and quantity as dependencies
  // Initial plan is to combine all the calculations into 1 useMemo implementation
  // But decide to separate into 3 separate useMemo for slight advantage of not updating discountPrice and taxAmount when only quantity value change
  const discountPrice = useMemo(() => item.price * 0.9, [item.price]);
  const taxAmount = useMemo(() => discountPrice * 0.08, [discountPrice]);
  const totalPrice = useMemo(() => (discountPrice + taxAmount) * quantity, [discountPrice, taxAmount, quantity]);


  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-lg text-gray-900">
          {searchTerm ? highlightedName : item.name}
        </h3>
        <button
          onClick={() => setIsFavorite(!isFavorite)}
          className={`text-xl ${isFavorite ? 'text-red-500' : 'text-gray-300'}`}
        >
          ♥
        </button>
      </div>

      <div className="text-sm text-gray-600 mb-2">
        {searchTerm ? highlightedDescription : item.description}
      </div>

      <div className="flex justify-between items-center mb-2">
        <span className="text-lg font-bold text-green-600">
          ${item.price}
        </span>
        <span className={`px-2 py-1 rounded text-xs ${
          item.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {item.inStock ? 'In Stock' : 'Out of Stock'}
        </span>
      </div>

      <div className="flex items-center mb-2">
        <span className="text-yellow-400">
          {'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}
        </span>
        <span className="ml-2 text-sm text-gray-600">({item.rating}/5)</span>
      </div>

      <div className="mb-3">
        <div className="text-xs text-gray-500 mb-1">Tags:</div>
        <div className="flex flex-wrap gap-1">
          {item.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {isExpanded && (
        <div className="border-t pt-3 mt-3 text-sm text-gray-600">
          <div className="mb-2">
            <strong>Category:</strong> {item.category}
          </div>
          <div className="mb-2">
            <strong>Discount Price:</strong> ${discountPrice.toFixed(2)}
          </div>
          <div className="mb-2">
            <strong>Tax:</strong> ${taxAmount.toFixed(2)}
          </div>
          <div className="mb-2">
            <strong>Total for {quantity} item(s):</strong> ${totalPrice.toFixed(2)}
          </div>
          <div className="mb-2">
            <strong>Related Items:</strong>
            <ul className="ml-4 mt-1">
              {relatedItems.slice(0, 3).map((related) => (
                <li key={related.id} className="text-blue-600 hover:underline cursor-pointer">
                  {related.name}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mt-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="px-2 py-1 bg-gray-200 rounded text-sm"
            disabled={quantity <= 1}
          >
            -
          </button>
          <span className="px-2">{quantity}</span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="px-2 py-1 bg-gray-200 rounded text-sm"
          >
            +
          </button>
        </div>
        
        <div className="space-x-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
          >
            {isExpanded ? 'Less' : 'More'}
          </button>
          <button
            disabled={!item.inStock}
            className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 disabled:bg-gray-300"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}