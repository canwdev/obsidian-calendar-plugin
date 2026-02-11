import type { Moment } from "moment";
import { getDateUID } from "obsidian-daily-notes-interface";
import { memo, type ReactElement, useEffect, useState } from "react";

import type { IDayMetadata } from "./types";
import { getStartOfWeek, isMetaPressed } from "./utils";
import { Dot } from "./Dot";

interface WeekNumCellProps {
  weekNum: number;
  days: Moment[];
  selectedId: string | null;
  metadataPromise: Promise<IDayMetadata> | null;
  onClick: (date: Moment, isMetaPressed: boolean) => void;
  onContextMenu: (date: Moment, e: MouseEvent) => void;
  onHover: (date: Moment, target: EventTarget, isMetaPressed: boolean) => void;
}

function WeekNumCellInner({
  weekNum,
  days,
  selectedId,
  metadataPromise,
  onClick,
  onContextMenu,
  onHover,
}: WeekNumCellProps): ReactElement {
  const [metadata, setMetadata] = useState<IDayMetadata | null>(null);
  const startOfWeek = getStartOfWeek(days);

  useEffect(() => {
    if (!metadataPromise) {
      setMetadata({ classes: [], dots: [] });
      return;
    }
    let cancelled = false;
    metadataPromise.then((m) => {
      if (!cancelled) setMetadata(m);
    });
    return () => {
      cancelled = true;
    };
  }, [metadataPromise]);

  const isActive = selectedId === getDateUID(days[0], "week");
  const classes = metadata?.classes ?? [];
  const dots = metadata?.dots ?? [];

  const handleClick = (e: React.MouseEvent) => {
    onClick(startOfWeek, isMetaPressed(e.nativeEvent));
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    onContextMenu(days[0], e.nativeEvent);
  };

  const handlePointerOver = (e: React.PointerEvent) => {
    onHover(startOfWeek, e.target, isMetaPressed(e.nativeEvent));
  };

  return (
    <td className="border-r border-[var(--background-modifier-border)] align-top">
      <div
        className={`rounded cursor-pointer text-center text-[0.65rem] p-0.5 transition-colors box-border w-full min-h-[2rem] ${classes.join(" ")}`}
        style={{
          backgroundColor: isActive ? "var(--interactive-accent)" : "var(--color-background-weeknum)",
          color: isActive ? "var(--text-on-accent)" : "var(--color-text-weeknum)",
        }}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        onPointerOver={handlePointerOver}
      >
        <span className="block leading-tight">{weekNum}</span>
        <div className="flex flex-wrap justify-center items-center gap-x-px gap-y-0.5 h-3 min-h-3 leading-none">
          {dots.map((dot, i) => (
            <Dot key={i} {...dot} isActive={isActive} />
          ))}
        </div>
      </div>
    </td>
  );
}

export const WeekNumCell = memo(WeekNumCellInner);
