"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";

interface PromptTemplate {
  id: string;
  key: string;
  name: string;
  template: string;
  description?: string;
}

export default function SettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        setSettings(data.settings ?? {});
        setTemplates(data.templates ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    try {
      await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings, templates }),
      });
      toast("設定を保存しました", "success");
    } catch {
      toast("保存に失敗しました", "error");
    }
  };

  if (loading) {
    return <div className="py-12 text-center text-gray-400">読み込み中...</div>;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">設定</h1>

      {/* API Settings info */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">
          API設定
        </h2>
        <p className="mb-4 text-sm text-gray-500">
          APIキーは <code className="rounded bg-gray-100 px-1">.env</code>{" "}
          ファイルで管理してください。セキュリティのため、ブラウザからの設定はできません。
        </p>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              LLM_PROVIDER
            </label>
            <p className="text-sm text-gray-500">
              現在: {process.env.NEXT_PUBLIC_LLM_PROVIDER ?? "openai"}（.envで変更）
            </p>
          </div>
        </div>
      </div>

      {/* App Settings */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">
          アプリ設定
        </h2>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              デフォルトの重要度
            </label>
            <Input
              type="number"
              min={1}
              max={5}
              value={settings.default_importance ?? "3"}
              onChange={(e) =>
                setSettings((s) => ({
                  ...s,
                  default_importance: e.target.value,
                }))
              }
              className="w-20"
            />
          </div>
        </div>
      </div>

      {/* Prompt Templates */}
      {templates.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            プロンプトテンプレート
          </h2>
          <div className="space-y-4">
            {templates.map((tmpl, i) => (
              <div key={tmpl.id} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {tmpl.name}
                  {tmpl.description && (
                    <span className="ml-2 font-normal text-gray-400">
                      {tmpl.description}
                    </span>
                  )}
                </label>
                <Textarea
                  value={tmpl.template}
                  onChange={(e) => {
                    const newTemplates = [...templates];
                    newTemplates[i] = { ...tmpl, template: e.target.value };
                    setTemplates(newTemplates);
                  }}
                  rows={6}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <Button onClick={handleSave}>設定を保存</Button>
      </div>
    </div>
  );
}
