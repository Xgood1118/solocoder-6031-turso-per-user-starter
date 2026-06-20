"use client";

export function TodayDueCard({
  count,
  onClick,
}: {
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-lg bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 p-4 text-left hover:from-orange-500/30 hover:to-red-500/30 transition group"
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="text-orange-300 text-sm font-medium mb-1">
            📅 今日到期
          </div>
          <div className="text-white text-3xl font-bold">
            {count}
            <span className="text-lg font-normal text-white/60 ml-2">
              个任务待完成
            </span>
          </div>
        </div>
        <div className="text-orange-400 group-hover:translate-x-1 transition-transform">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
            />
          </svg>
        </div>
      </div>
      {count > 0 && (
        <div className="mt-2 text-orange-300/70 text-sm">
          点击查看今日到期的任务列表
        </div>
      )}
    </button>
  );
}
