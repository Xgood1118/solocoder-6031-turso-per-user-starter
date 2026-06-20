"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { setupDatabase, type Region } from "./actions";
import { type TemplateType } from "../utils";

const STORAGE_KEY = "onboarding_state";

type OnboardingState = {
  step: number;
  region: Region | null;
  template: TemplateType | null;
};

const defaultState: OnboardingState = {
  step: 1,
  region: null,
  template: null,
};

function loadState(): OnboardingState {
  if (typeof window === "undefined") return defaultState;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error("Failed to load onboarding state:", e);
  }
  return defaultState;
}

function saveState(state: OnboardingState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function clearState() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export function Onboarding() {
  const router = useRouter();
  const [state, setState] = useState<OnboardingState>(defaultState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setState(loadState());
    setIsHydrated(true);
  }, []);

  const updateState = useCallback(
    (updates: Partial<OnboardingState>) => {
      setState((prev) => {
        const newState = { ...prev, ...updates };
        saveState(newState);
        return newState;
      });
    },
    [],
  );

  const goToNextStep = useCallback(() => {
    const nextStep = Math.min(state.step + 1, 3);
    updateState({ step: nextStep });
  }, [state.step, updateState]);

  const goToPrevStep = useCallback(() => {
    const prevStep = Math.max(state.step - 1, 1);
    updateState({ step: prevStep });
  }, [updateState]);

  const selectRegion = useCallback(
    (region: Region) => {
      updateState({ region });
    },
    [updateState],
  );

  const selectTemplate = useCallback(
    (template: TemplateType) => {
      updateState({ template });
    },
    [updateState],
  );

  const handleSetup = async () => {
    if (!state.region || !state.template) {
      setError("请完成所有选择");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await setupDatabase(state.region, state.template);
      if (result.success) {
        clearState();
        router.push("/dashboard");
        router.refresh();
      } else {
        setError(result.error || "设置失败，请重试");
      }
    } catch (e) {
      setError("设置失败，请重试");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-white/60">加载中...</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black tracking-tight text-white mb-2">
          欢迎使用
        </h1>
        <p className="text-white/60">
          让我们快速设置你的专属数据库
        </p>
      </div>

      <div className="flex items-center justify-center mb-8">
        {[1, 2, 3].map((stepNum, idx) => (
          <div key={stepNum} className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                state.step >= stepNum
                  ? "bg-aquamarine text-rich-black"
                  : "bg-white/10 text-white/40"
              }`}
            >
              {stepNum}
            </div>
            {idx < 2 && (
              <div
                className={`w-16 h-1 mx-2 transition-all ${
                  state.step > stepNum
                    ? "bg-aquamarine"
                    : "bg-white/10"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="space-y-6">
        {state.step === 1 && (
          <Step1
            selected={state.region}
            onSelect={selectRegion}
            onNext={goToNextStep}
          />
        )}

        {state.step === 2 && (
          <Step2
            selected={state.template}
            onSelect={selectTemplate}
            onPrev={goToPrevStep}
            onNext={goToNextStep}
          />
        )}

        {state.step === 3 && (
          <Step3
            region={state.region}
            template={state.template}
            onPrev={goToPrevStep}
            onConfirm={handleSetup}
            isLoading={isLoading}
          />
        )}
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded text-red-300 text-sm text-center">
          {error}
        </div>
      )}
    </div>
  );
}

function Step1({
  selected,
  onSelect,
  onNext,
}: {
  selected: Region | null;
  onSelect: (region: Region) => void;
  onNext: () => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-2">
          选择数据库区域
        </h2>
        <p className="text-white/60 text-sm">
          选择离你最近的区域以获得最佳性能
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => onSelect("us")}
          className={`p-6 rounded-lg border-2 transition-all text-left ${
            selected === "us"
              ? "border-aquamarine bg-aquamarine/20"
              : "border-white/10 bg-white/5 hover:border-white/20"
          }`}
        >
          <div className="text-3xl mb-2">🇺🇸</div>
          <div className="text-white font-bold">美国 (US)</div>
          <div className="text-white/60 text-sm">北美地区</div>
        </button>

        <button
          onClick={() => onSelect("eu")}
          className={`p-6 rounded-lg border-2 transition-all text-left ${
            selected === "eu"
              ? "border-aquamarine bg-aquamarine/20"
              : "border-white/10 bg-white/5 hover:border-white/20"
          }`}
        >
          <div className="text-3xl mb-2">🇪🇺</div>
          <div className="text-white font-bold">欧洲 (EU)</div>
          <div className="text-white/60 text-sm">欧洲地区</div>
        </button>
      </div>

      <div className="flex justify-end">
        <button
          onClick={onNext}
          disabled={!selected}
          className="px-6 py-2 bg-aquamarine text-rich-black font-medium rounded hover:bg-aquamarine/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          下一步 →
        </button>
      </div>
    </div>
  );
}

function Step2({
  selected,
  onSelect,
  onPrev,
  onNext,
}: {
  selected: TemplateType | null;
  onSelect: (template: TemplateType) => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const templates: {
    id: TemplateType;
    name: string;
    description: string;
    emoji: string;
  }[] = [
    {
      id: "blank",
      name: "空白模板",
      description: "从零开始，没有预设任务",
      emoji: "📝",
    },
    {
      id: "work",
      name: "工作模板",
      description: "包含项目开发、团队协作等示例",
      emoji: "💼",
    },
    {
      id: "study",
      name: "学习模板",
      description: "包含课程学习、阅读计划等示例",
      emoji: "📚",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-2">
          选择初始模板
        </h2>
        <p className="text-white/60 text-sm">
          选择一个模板快速开始，后续可以随时修改
        </p>
      </div>

      <div className="space-y-3">
        {templates.map((t) => (
          <button
            key={t.id}
            onClick={() => onSelect(t.id)}
            className={`w-full p-4 rounded-lg border-2 transition-all text-left flex items-center gap-4 ${
              selected === t.id
                ? "border-aquamarine bg-aquamarine/20"
                : "border-white/10 bg-white/5 hover:border-white/20"
            }`}
          >
            <span className="text-3xl">{t.emoji}</span>
            <div>
              <div className="text-white font-bold">{t.name}</div>
              <div className="text-white/60 text-sm">
                {t.description}
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="flex justify-between">
        <button
          onClick={onPrev}
          className="px-6 py-2 text-white/70 hover:text-white transition"
        >
          ← 上一步
        </button>
        <button
          onClick={onNext}
          disabled={!selected}
          className="px-6 py-2 bg-aquamarine text-rich-black font-medium rounded hover:bg-aquamarine/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          下一步 →
        </button>
      </div>
    </div>
  );
}

function Step3({
  region,
  template,
  onPrev,
  onConfirm,
  isLoading,
}: {
  region: Region | null;
  template: TemplateType | null;
  onPrev: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}) {
  const regionNames: Record<Region, string> = {
    us: "🇺🇸 美国 (US)",
    eu: "🇪🇺 欧洲 (EU)",
  };

  const templateNames: Record<TemplateType, { name: string; emoji: string }> = {
    blank: { name: "空白模板", emoji: "📝" },
    work: { name: "工作模板", emoji: "💼" },
    study: { name: "学习模板", emoji: "📚" },
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-2">确认设置</h2>
        <p className="text-white/60 text-sm">
          确认你的选择，点击创建后将自动为你设置数据库
        </p>
      </div>

      <div className="bg-white/5 rounded-lg p-4 space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-white/60">数据库区域</span>
          <span className="text-white font-medium">
            {region ? regionNames[region] : "未选择"}
          </span>
        </div>
        <div className="border-t border-white/10" />
        <div className="flex justify-between items-center">
          <span className="text-white/60">初始模板</span>
          <span className="text-white font-medium flex items-center gap-2">
            {template ? (
              <>
                <span>{templateNames[template].emoji}</span>
                <span>{templateNames[template].name}</span>
              </>
            ) : (
              "未选择"
            )}
          </span>
        </div>
      </div>

      <div className="bg-brunswick-green/30 border border-brunswick-green/50 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-xl">ℹ️</span>
          <div>
            <div className="text-white font-medium">即将执行</div>
            <ul className="text-white/60 text-sm mt-1 space-y-1">
              <li>• 创建你的专属 Turso 数据库</li>
              <li>• 执行数据库迁移脚本</li>
              <li>• 根据模板初始化示例数据</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={onPrev}
          className="px-6 py-2 text-white/70 hover:text-white transition"
        >
          ← 上一步
        </button>
        <button
          onClick={onConfirm}
          disabled={isLoading || !region || !template}
          className="px-6 py-2 bg-aquamarine text-rich-black font-medium rounded hover:bg-aquamarine/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "设置中..." : "确认创建 →"}
        </button>
      </div>
    </div>
  );
}
