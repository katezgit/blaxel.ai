"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { useAccountState } from "@/lib/mock/account-context";
import { AddAdminDialog } from "./add-admin-dialog";

export function AdminsClient() {
  const { state, removeAdmin } = useAccountState();
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <header className="page-header">
          <h1 className="text-display font-semibold text-foreground">Admins</h1>
          <p className="text-muted-foreground">
            Admins can manage this billing account and its workspaces.
          </p>
        </header>
        <Button
          variant="primary"
          onClick={() => setDialogOpen(true)}
        >
          <Plus aria-hidden="true" />
          <span>Add admin</span>
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full border-collapse text-body">
          <caption className="sr-only">Admins</caption>
          <thead>
            <tr className="border-b border-border bg-muted-surface text-left">
              <th
                scope="col"
                className="px-4 py-2 font-mono text-meta uppercase text-meta-foreground"
              >
                Full name
              </th>
              <th
                scope="col"
                className="px-4 py-2 font-mono text-meta uppercase text-meta-foreground"
              >
                Email
              </th>
              <th
                scope="col"
                className="px-4 py-2 font-mono text-meta uppercase text-meta-foreground"
              >
                Role
              </th>
              <th
                scope="col"
                className="px-4 py-2 text-right font-mono text-meta uppercase text-meta-foreground"
              >
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {state.admins.map((admin) => {
              const isOwner = admin.role === "Owner";
              const isPending = admin.status === "pending";
              return (
                <tr
                  key={admin.id}
                  className="border-b border-border last:border-b-0"
                >
                  <td className="px-4 py-3 text-foreground">{admin.name}</td>
                  <td className="px-4 py-3 font-mono text-muted-foreground">
                    {admin.email}
                  </td>
                  <td className="px-4 py-3">
                    {isOwner ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span
                            tabIndex={0}
                            aria-label="Owner — account creator. Cannot be removed."
                            className="inline-flex rounded-sm focus-visible:shadow-focus-ring"
                          >
                            <Badge variant="brand-soft">Owner</Badge>
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          Account creator. Cannot be removed.
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <Badge variant={isPending ? "neutral" : "success"}>
                        Admin{isPending ? " · Pending" : ""}
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {isOwner ? (
                      <span className="text-muted-foreground">&mdash;</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => removeAdmin(admin.id)}
                        className="text-caption text-state-errored-text hover:underline focus-visible:shadow-focus-ring rounded-sm"
                      >
                        {isPending ? "Revoke" : "Remove"}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <AddAdminDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
}
