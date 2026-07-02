import { Skeleton } from "@repo/ui/components/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from "@repo/ui/components/table";

const SCHEDULE_ROWS = Array.from({ length: 6 }, (_, i) => i);
const EXECUTION_ROWS = Array.from({ length: 8 }, (_, i) => i);

// Heights are pinned to the populated components' rendered line-heights so
// there is no vertical shift when data resolves:
//   typography-subtitle → 22px (h-[22px])
//   typography-body     → 22px (h-[22px])
//   typography-code     → matches typography-body (14px/22px)
//   typography-meta     → 14px line-height
// See packages/ui/src/styles/primitive.css.

export default function Loading() {
  return (
    <>
      <section aria-label="Schedules loading" className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex h-[22px] items-center">
            <Skeleton className="h-4 w-28 rounded-sm" />
          </div>
          <div className="flex h-[22px] items-center">
            <Skeleton className="h-3.5 w-full max-w-[520px] rounded-sm" />
          </div>
        </div>

        <div className="flex justify-end">
          <Skeleton className="h-8 w-32 rounded-lg" />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="min-w-0 flex-1">
            <Skeleton className="h-8 w-full rounded-lg" />
          </div>
          <Skeleton className="h-8 w-40 rounded-lg" />
        </div>

        <Table
          totalCount={SCHEDULE_ROWS.length}
          pageOffset={0}
          bordered
          className="bg-card"
        >
          <TableHeader>
            <tr>
              <TableHeaderCell label="Type" />
              <TableHeaderCell label="When" />
              <TableHeaderCell label="Command" />
            </tr>
          </TableHeader>
          <TableBody>
            {SCHEDULE_ROWS.map((i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-5 w-16 rounded-md" />
                </TableCell>
                <TableCell variant="numeric" className="text-left">
                  <Skeleton className="h-3.5 w-32 rounded-sm" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-3.5 w-64 rounded-sm" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      <section
        aria-label="Execution history loading"
        className="flex flex-col gap-4"
      >
        <div className="flex h-[22px] items-center">
          <Skeleton className="h-4 w-40 rounded-sm" />
        </div>

        <div>
          <Skeleton className="h-8 w-full rounded-lg" />
        </div>

        <Table
          totalCount={EXECUTION_ROWS.length}
          pageOffset={0}
          bordered
          className="bg-card"
        >
          <TableHeader>
            <tr>
              <TableHeaderCell label="Schedule" />
              <TableHeaderCell label="Trigger status" />
              <TableHeaderCell label="When" />
              <TableHeaderCell label="Logs" />
            </tr>
          </TableHeader>
          <TableBody>
            {EXECUTION_ROWS.map((i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-3.5 w-36 rounded-sm" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-3.5 w-24 rounded-sm" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-3.5 w-40 rounded-sm" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-3.5 w-20 rounded-sm" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
    </>
  );
}
