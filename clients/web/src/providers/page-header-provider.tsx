import React from "react";
import {
  PageHeaderContext,
  type PageHeaderContextType,
} from "@/shared/contexts/page-header-context";

type Props = {
  children: React.ReactNode;
};

export default function PageHeaderProvider({ children }: Props) {
  const [stack, setStack] = React.useState<{ id: string; node: React.ReactNode }[]>([]);

  const push = React.useCallback((node: React.ReactNode) => {
    const id = crypto.randomUUID();
    setStack((prev) => [...prev, { id, node }]);
    return id;
  }, []);

  const pop = React.useCallback((id: string) => {
    setStack((prev) => prev.filter((entry) => entry.id !== id));
  }, []);

  const actions = stack.length > 0 ? stack[stack.length - 1].node : null

  const value = React.useMemo<PageHeaderContextType>(
    () => ({
      actions,
      push,
      pop
    }),
    [actions, push, pop],
  );

  return (
    <PageHeaderContext.Provider value={value}>
      {children}
    </PageHeaderContext.Provider>
  );
}
