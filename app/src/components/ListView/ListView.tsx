import { useMemo, useState } from "react";
import { createColumnHelper, flexRender, getCoreRowModel, getSortedRowModel, useReactTable, type SortingState } from "@tanstack/react-table";
import type { Issue } from "@shared/types";
import { useLyraStore, applyFilters, useActiveFilters } from "../../state/store";
import { AppIcon } from "../AppIcon";
import { TYPE_ICON, STATUS_LABEL, PRIORITY_LABEL, issueKey } from "../../lib/issueMeta";
import styles from "./ListView.module.css";

const columnHelper = createColumnHelper<Issue>();

export function ListView({ projectId }: { projectId: string }) {
  const issues = useLyraStore((s) => s.issues);
  const users = useLyraStore((s) => s.users);
  const cycles = useLyraStore((s) => s.cycles);
  const filters = useActiveFilters();
  const openIssueDetail = useLyraStore((s) => s.openIssueDetail);
  const [sorting, setSorting] = useState<SortingState>([{ id: "key", desc: false }]);

  const data = useMemo(
    () => applyFilters(issues.filter((i) => i.projectId === projectId), filters),
    [issues, projectId, filters]
  );

  const columns = useMemo(
    () => [
      columnHelper.accessor((row) => row.type, {
        id: "type",
        header: "Type",
        cell: (ctx) => <AppIcon name={TYPE_ICON[ctx.getValue()]} size={13} />,
      }),
      columnHelper.accessor((row) => row.identifier.number, {
        id: "key",
        header: "Key",
        cell: (ctx) => <span className={styles.key}>{issueKey(ctx.row.original)}</span>,
      }),
      columnHelper.accessor("title", {
        header: "Summary",
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (ctx) => STATUS_LABEL[ctx.getValue()],
      }),
      columnHelper.accessor((row) => users.find((u) => u.id === row.assigneeId)?.name ?? "Unassigned", {
        id: "assignee",
        header: "Assignee",
      }),
      columnHelper.accessor("priority", {
        header: "Priority",
        cell: (ctx) => PRIORITY_LABEL[ctx.getValue()],
      }),
      columnHelper.accessor((row) => cycles.find((c) => c.id === row.cycleId)?.name ?? "—", {
        id: "sprint",
        header: "Sprint",
      }),
      columnHelper.accessor("updatedAt", {
        header: "Updated",
        cell: (ctx) => new Date(ctx.getValue()).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      }),
    ],
    [users, cycles]
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className={`${styles.container} lyra-scroll`}>
      <table>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} onClick={header.column.getToggleSortingHandler()}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                  {{ asc: " ▲", desc: " ▼" }[header.column.getIsSorted() as string] ?? ""}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} onClick={() => openIssueDetail(row.original.id)}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
