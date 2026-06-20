import { Suspense } from "react";
import { Todos } from "./todos";

export default function Page() {
  return (
    <div className="space-y-3">
      <div className="pb-6 text-center">
        <h1 className="text-3xl font-black tracking-tight text-white">
          我的任务
        </h1>
        <p className="text-white/60">
          管理你的任务和项目，每个任务都有独立的数据库存储。
        </p>
      </div>
      <Suspense
        fallback={<p className="text-white/60 text-center">加载中...</p>}
      >
        <Todos />
      </Suspense>
    </div>
  );
}
