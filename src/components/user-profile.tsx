"use client";

// IMPROVEMENT NOTE:
// 1) Remove "User" type and replace with the new "PublicUser" which does not require "hashedPassword" inside its type definiton.
// This will prevent the issue of sensitive data leak issue at the front-end.
// 2) Update "UserProfileProps" interface to use "PublicUser" type instead of "User".

// import { User } from "@/lib/db/types";
// interface UserProfileProps {
//   user: User;
// }

import { PublicUser } from "@/lib/db/types";
interface UserProfileProps {
  user: PublicUser;
}

export function UserProfile({ user }: UserProfileProps) {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-gray-600 font-medium">
              {user.username.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-medium text-gray-900">{user.username}</h3>
          <p className="text-sm text-gray-500">
            Member since {new Date(user.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}
