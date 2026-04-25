/**
 * Configuration for the Organization Chart hierarchy.
 * Currently maps position titles to hierarchy levels.
 * 
 * TODO: In a future iteration, this should be replaced by a `level` field 
 * in the Positions table, or a `managerId` self-relation on Employees.
 */

export const ORG_CHART_LEVELS = {
  // Top level leadership
  LEVEL_1_TITLES: ["CEO", "Tổng Giám Đốc", "Giám Đốc"],
  
  // Executive level
  LEVEL_2_TITLES: ["COO", "CTO", "CFO", "CPO", "Phó Giám Đốc", "Giám Đốc Khối"],
  
  // Middle management / Department heads
  LEVEL_3_TITLES: ["Trưởng Phòng", "Quản Lý", "Manager", "Head of Department"],
};

/**
 * Helper to determine the hierarchy level of a position title.
 * Returns 1 (CEO), 2 (Executive), 3 (Department Head), or 4 (Staff)
 */
export function getHierarchyLevel(title?: string | null): number {
  if (!title) return 4;
  
  const normalizedTitle = title.trim();
  
  if (ORG_CHART_LEVELS.LEVEL_1_TITLES.includes(normalizedTitle)) return 1;
  if (ORG_CHART_LEVELS.LEVEL_2_TITLES.includes(normalizedTitle)) return 2;
  if (ORG_CHART_LEVELS.LEVEL_3_TITLES.includes(normalizedTitle)) return 3;
  
  return 4; // Default to staff
}
