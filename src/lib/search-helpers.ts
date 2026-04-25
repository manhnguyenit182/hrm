/**
 * Shared search helpers for building Prisma where conditions.
 * Used by employees and departments search to avoid code duplication.
 */

type StringFilter = {
  contains: string;
  mode: "insensitive";
};

type NameCondition = {
  firstName?: StringFilter;
  lastName?: StringFilter;
  phone?: StringFilter;
};

type AndCondition = {
  AND: NameCondition[];
};

type OrCondition = {
  OR: (NameCondition | AndCondition)[];
};

/**
 * Build Prisma OR conditions for searching by firstName, lastName, phone.
 * Supports multi-word queries (e.g. "Nguyen Manh" searches both orderings).
 */
export function buildNameSearchCondition(query: string): OrCondition | Record<string, never> {
  if (!query || !query.trim()) return {};

  const trimmed = query.trim();
  const conditions: (NameCondition | AndCondition)[] = [
    { firstName: { contains: trimmed, mode: "insensitive" as const } },
    { lastName: { contains: trimmed, mode: "insensitive" as const } },
    { phone: { contains: trimmed, mode: "insensitive" as const } },
  ];

  // If query contains spaces, also search for split name combinations
  if (trimmed.includes(" ")) {
    const nameParts = trimmed.split(/\s+/);
    if (nameParts.length >= 2) {
      // "firstName lastName" order
      conditions.push({
        AND: [
          {
            firstName: {
              contains: nameParts[0],
              mode: "insensitive" as const,
            },
          },
          {
            lastName: {
              contains: nameParts[1],
              mode: "insensitive" as const,
            },
          },
        ],
      });
      // "lastName firstName" order
      conditions.push({
        AND: [
          {
            lastName: {
              contains: nameParts[0],
              mode: "insensitive" as const,
            },
          },
          {
            firstName: {
              contains: nameParts[1],
              mode: "insensitive" as const,
            },
          },
        ],
      });
    }
  }

  return { OR: conditions };
}
