import React from "react";
import {
  PageHeaderContext,
  type PageHeaderContextType,
} from "@/shared/contexts/page-header-context";

type Props = {
  children: React.ReactNode;
};

export default function PageHeaderProvider({ children }: Props) {
  const [actions, setActions] = React.useState<React.ReactNode>(null);

  const clearActions = React.useCallback(() => {
    setActions(null);
  }, []);

  const value = React.useMemo<PageHeaderContextType>(
    () => ({
      actions,
      setActions,
      clearActions,
    }),
    [actions, clearActions],
  );

  return (
    <PageHeaderContext.Provider value={value}>
      {children}
    </PageHeaderContext.Provider>
  );
}
