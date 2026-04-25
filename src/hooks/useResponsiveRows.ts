import { useState, useEffect } from "react";

/**
 * Calculate the optimal number of rows per page for a DataTable
 * based on the current screen dimensions.
 */
function calculateRowsPerPage(): number {
  const screenHeight = window.innerHeight;
  const screenWidth = window.innerWidth;

  // Estimate available height for table (subtract header, padding, pagination)
  const availableHeight = screenHeight - 300;
  const rowHeight = 50;

  let calculatedRows = Math.floor(availableHeight / rowHeight - 1);

  // Adjust based on screen size breakpoints
  if (screenWidth >= 1920) {
    calculatedRows = Math.min(calculatedRows, 15);
  } else if (screenWidth >= 1440) {
    calculatedRows = Math.min(calculatedRows, 10);
  } else if (screenWidth >= 1024) {
    calculatedRows = Math.min(calculatedRows, 8);
  } else {
    calculatedRows = Math.min(calculatedRows, 5);
  }

  return Math.max(calculatedRows, 5);
}

/**
 * Hook that returns a responsive rows-per-page value based on the viewport.
 * Automatically recalculates on window resize.
 */
export function useResponsiveRows(minRows = 5): number {
  const [rowsPerPage, setRowsPerPage] = useState<number>(minRows);

  useEffect(() => {
    const handleResize = () => {
      setRowsPerPage(calculateRowsPerPage());
    };

    handleResize(); // Set initial value
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return rowsPerPage;
}
