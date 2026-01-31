import React from "react";
import { usePage } from "@inertiajs/react";

type FollowButtonProps = {
  authUserId?: string;
  targetUserId: string;
};

function FollowButton({ authUserId, targetUserId }: FollowButtonProps) {
  let resolvedAuthUserId = authUserId;

  // Safely attempt to read from Inertia context if available
  try {
    const page = usePage();
    resolvedAuthUserId =
      resolvedAuthUserId ??
      (page.props as any)?.auth?.user?.id;
  } catch {
    // Not running inside Inertia — ignore
  }

  // If user is not logged in or trying to follow self, render nothing
  if (!resolvedAuthUserId || resolvedAuthUserId === targetUserId) {
    return null;
  }

  return (
    <button
      type="button"
      className="px-3 py-1 text-sm font-medium rounded bg-blue-600 text-white hover:bg-blue-700"
      onClick={() => {
        console.log("Follow user:", targetUserId);
      }}
    >
      Follow
    </button>
  );
}

export { FollowButton };
export default FollowButton;

