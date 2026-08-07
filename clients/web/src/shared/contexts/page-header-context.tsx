import React, { createContext } from "react";

export type PageHeaderContextType = {
  actions: React.ReactNode;
  setActions: (actions: React.ReactNode) => void;
  clearActions: () => void;
};

export const PageHeaderContext = createContext<PageHeaderContextType | null>(
  null,
);
