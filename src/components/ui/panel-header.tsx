import React from "react";
import { T } from "@/styles/tokens";

interface Props {
  title: string;
  badge?: React.ReactNode;
  action?: React.ReactNode;
}

export function PanelHeader({ title, badge, action }: Props) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          fontSize: 11, fontWeight: 500, letterSpacing: "0.08em",
          textTransform: "uppercase", color: T.textMuted,
        }}>
          {title}
        </span>
        {badge && (
          <span style={{
            fontSize: 10, padding: "2px 6px", borderRadius: 4,
            background: T.bgSubtle, color: T.textGhost, border: `0.5px solid ${T.borderFaint}`,
          }}>
            {badge}
          </span>
        )}
      </div>
      {action}
    </div>
  );
}
