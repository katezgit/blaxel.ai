"use client";

import { useState } from "react";
import { Button } from "@repo/ui/components/button";
import AddDomainDialog from "./add-domain-dialog";

export default function AddDomainButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="primary" onClick={() => setOpen(true)}>
        Add domain
      </Button>
      <AddDomainDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
