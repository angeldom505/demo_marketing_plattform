"use client";

import * as React from "react";
import {
  Table as AriaTable,
  TableHeader as AriaTableHeader,
  TableBody as AriaTableBody,
  Column as AriaColumn,
  Row as AriaRow,
  Cell as AriaCell,
  ColumnResizer,
  ResizableTableContainer,
  composeRenderProps,
  Group,
  type TableProps,
  type TableHeaderProps,
  type TableBodyProps,
  type ColumnProps,
  type RowProps,
  type CellProps,
} from "react-aria-components";
import { ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

const Table = ({ className, ...props }: TableProps) => (
  <AriaTable
    className={cn("w-full caption-bottom text-sm outline-none", className)}
    {...props}
  />
);

const TableHeader = <T extends object>({
  className,
  ...props
}: TableHeaderProps<T>) => (
  <AriaTableHeader
    className={cn("[&_tr]:border-b", className)}
    {...props}
  />
);

const TableBody = <T extends object>({
  className,
  ...props
}: TableBodyProps<T>) => (
  <AriaTableBody
    className={cn(
      "[&_tr:last-child]:border-0 outline-none",
      className
    )}
    {...props}
  />
);

const Column = ({
  className,
  children,
  isResizable: showResizer,
  ...props
}: ColumnProps & { isResizable?: boolean }) => (
  <AriaColumn
    className={composeRenderProps(
      className,
      (className) =>
        cn(
          "h-12 text-left align-middle font-medium text-muted-foreground -outline-offset-2 data-[focus-visible]:outline-ring",
          className
        )
    )}
    {...props}
  >
    {composeRenderProps(children, (children, { allowsSorting }) => (
      <div className="flex items-center">
        <Group
          role="presentation"
          tabIndex={-1}
          className={cn(
            "flex h-10 flex-1 items-center gap-1 overflow-hidden rounded-md px-4",
            allowsSorting &&
              "p-2 data-[hovered]:bg-accent data-[hovered]:text-accent-foreground",
            "focus-visible:outline-none data-[focus-visible]:-outline-offset-2 data-[focus-visible]:outline-ring"
          )}
        >
          <span className="truncate">{children}</span>
          {allowsSorting && <ArrowUpDown className="ml-2 size-4" />}
        </Group>
        {showResizer && (
          <ColumnResizer
            className={cn(
              "box-content h-5 w-0.5 translate-x-[8px] cursor-col-resize touch-none select-none rounded bg-muted-foreground opacity-0 transition-opacity",
              "group-hover/column:opacity-100 data-[resizing]:bg-primary data-[resizing]:opacity-100",
              "focus-visible:outline-none data-[focus-visible]:-outline-offset-2 data-[focus-visible]:outline-ring"
            )}
          />
        )}
      </div>
    ))}
  </AriaColumn>
);

const Row = <T extends object>({ className, ...props }: RowProps<T>) => (
  <AriaRow
    className={composeRenderProps(
      className,
      (className) =>
        cn(
          "border-b border-border/30 transition-colors",
          "data-[hovered]:bg-muted/40 data-[selected]:bg-muted/60",
          "outline-none data-[focus-visible]:outline-ring data-[focus-visible]:-outline-offset-2",
          className
        )
    )}
    {...props}
  />
);

const Cell = ({ className, ...props }: CellProps) => (
  <AriaCell
    className={composeRenderProps(
      className,
      (className) =>
        cn(
          "p-4 align-middle -outline-offset-2 data-[focus-visible]:outline-ring",
          className
        )
    )}
    {...props}
  />
);

export {
  ResizableTableContainer,
  Table,
  TableHeader,
  TableBody,
  Column,
  Row,
  Cell,
};
