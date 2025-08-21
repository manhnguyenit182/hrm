"use client"

import { createContext, useState, useContext, useEffect } from "react";

type AppContextType = {
  selectedItem: string | null;
  setSelectedItem: (item: string | null) => void;
  toggleSelected: (item: string) => void;
}


const AppContext = createContext<AppContextType | undefined>(undefined);


export const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const toggleSelected = (item: string) => {
    setSelectedItem(item);
  };
  useEffect(() => {
    console.log("Selected item changed:", selectedItem);
  }, [selectedItem]);
  return (
    <AppContext.Provider value={{ selectedItem, setSelectedItem, toggleSelected }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppContextProvider");
  }
  return context;
};