import React, { createContext } from "react";

export type PageHeaderContextType = {
  actions: React.ReactNode;
  push: (node: React.ReactNode) => string; // returns id, use it to pop
  pop: (id: string) => void;
};

export const PageHeaderContext = createContext<PageHeaderContextType | null>(
  null,
);
