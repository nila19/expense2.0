import React, { memo } from "react";

import { AppSection } from "components/app/AppSection";

import { AddAccountTab } from "features/admin/accounts/AddAccountTab";

export const AddAccountSection = memo(() => {
  return <AppSection title="ADD ACCOUNT" headerColor="success" content=<AddAccountTab /> />;
});
