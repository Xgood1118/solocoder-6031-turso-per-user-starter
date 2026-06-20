import { Suspense } from "react";
import { Onboarding } from "./onboarding";

export default function WelcomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Suspense
        fallback={<p className="text-white/60 text-center">加载中...</p>}
      >
        <Onboarding />
      </Suspense>
    </div>
  );
}
