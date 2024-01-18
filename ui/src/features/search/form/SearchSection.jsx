import React, { memo } from "react";

import { AppSection } from "components/app/AppSection";

import { SearchTab } from "features/search/form/SearchTab";

export const SearchSection = memo(() => {
  return <AppSection title="SEARCH" headerColor="info" content=<SearchTab /> />;
});
