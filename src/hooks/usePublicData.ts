import { useContext } from "react";
import { PublicDataContext } from "../context/PublicDataContext";

export const usePublicData = () => {
  const context = useContext(PublicDataContext);

  if (!context) {
    throw new Error("usePublicData must be used within PublicDataProvider");
  }

  return context;
};
