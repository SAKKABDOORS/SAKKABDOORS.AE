"use client";

import { useState } from "react";
import { ICON_KEYS, ICON_REGISTRY, type IconKey } from "@/lib/icons/registry";

const DEFAULT_ICON: IconKey = "sparkles";

// Two usage modes:
// - Controlled: pass `value` + `onChange` (used by SiteSettingEditor, which
//   keeps the whole section as React state and PATCHes JSON directly).
// - Uncontrolled: pass `name` (+ optional `defaultValue`) to get a hidden
//   form field, for plain <form>/FormData submissions (e.g. CategoryForm,
//   mirroring ProductForm's pattern).
export default function IconPicker({
  name,
  value,
  defaultValue = DEFAULT_ICON,
  onChange
}: {
  name?: string;
  value?: IconKey;
  defaultValue?: IconKey;
  onChange?: (value: IconKey) => void;
}) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState<IconKey>(
    ICON_KEYS.includes(defaultValue) ? defaultValue : DEFAULT_ICON
  );
  const current = isControlled ? value! : internal;

  function select(key: IconKey) {
    if (isControlled) {
      onChange?.(key);
    } else {
      setInternal(key);
    }
  }

  return (
    <div>
      {name && <input type="hidden" name={name} value={current} />}
      <div className="grid grid-cols-6 gap-2 sm:grid-cols-9">
        {ICON_KEYS.map((key) => {
          const Icon = ICON_REGISTRY[key];
          const active = key === current;
          return (
            <button
              key={key}
              type="button"
              title={key}
              onClick={() => select(key)}
              className={`flex h-10 w-10 items-center justify-center rounded-lg border transition ${
                active
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-brand-100 bg-white text-ink-800 hover:border-brand-300"
              }`}
            >
              <Icon className="h-5 w-5" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
