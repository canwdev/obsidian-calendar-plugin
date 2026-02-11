import type { Moment } from "moment";
import { getDateUID } from "obsidian-daily-notes-interface";
import { memo, type ReactElement, useEffect, useState } from "react";

import type { IDayMetadata } from "./types";
import { isMetaPressed } from "./utils";
import { Dot } from "./Dot";

interface DayCellProps {
  date: Moment;
  today: Moment;
  displayedMonth: Moment;
  selectedId: string | null;
  metadataPromise: Promise<IDayMetadata> | null;
  onClick: (date: Moment, isMetaPressed: boolean) => void;
  onContextMenu: (date: Moment, e: MouseEvent) => void;
  onHover: (date: Moment, target: EventTarget, isMetaPressed: boolean) => void;
}

function DayCellInner({
  date,
  today,
  displayedMonth,
  selectedId,
  metadataPromise,
  onClick,
  onContextMenu,
  onHover,
}: DayCellProps): ReactElement {
  const [metadata, setMetadata] = useState<IDayMetadata | null>(null);

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

  const isActive = selectedId === getDateUID(date, "day");
  const isToday = date.isSame(today, "day");
  const isAdjacent = !date.isSame(displayedMonth, "month");
  const classes = metadata?.classes ?? [];
  const dataAttrs = metadata?.dataAttributes ?? {};
  const dots = metadata?.dots ?? [];

  const handleClick = (e: React.MouseEvent) => {
    onClick(date, isMetaPressed(e.nativeEvent));
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    onContextMenu(date, e.nativeEvent);
  };

  const handlePointerOver = (e: React.PointerEvent) => {
    onHover(date, e.target, isMetaPressed(e.nativeEvent));
  };

  return (
    <td className="align-top">
      <div
        className={`rounded cursor-pointer text-center text-sm p-1 relative transition-colors box-border w-full min-h-[2.25rem] ${classes.join(" ")} ${isAdjacent ? "opacity-25" : ""}`}
        style={{
          backgroundColor: isActive ? "var(--interactive-accent)" : "var(--color-background-day)",
          color: isActive ? "var(--text-on-accent)" : isToday ? "var(--color-text-today)" : "var(--color-text-day)",
        }}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        onPointerOver={handlePointerOver}
        {...dataAttrs}
      >
        <span className="block leading-tight">{date.format("D")}</span>
        <div className="flex flex-wrap justify-center items-center h-4 min-h-4 leading-none">
          {dots.map((dot, i) => (
            <Dot key={i} {...dot} isActive={isActive} />
          ))}
        </div>
      </div>
    </td>
  );
}

export const DayCell = memo(DayCellInner);
