/**
 * Types and builder utilities for the organization chart tree.
 */

export interface Employee {
  id: string;
  firstName: string | null;
  lastName: string | null;
  image: string | null;
  position: {
    title: string | null;
  } | null;
  job: {
    job: string | null;
  } | null;
  department: {
    name: string | null;
  } | null;
}

export interface OrganizationData {
  ceo: Employee | null;
  executives: Employee[];
  departmentHeads: Employee[];
  otherEmployees: Employee[];
}

export interface TreeNodeData {
  name: string;
  id: string;
  attributes?: {
    title: string;
    image: string;
    department?: string;
    id: string;
    hasChildren?: boolean;
    childrenCount?: number;
  };
  children?: TreeNodeData[];
}

const DEFAULT_AVATAR =
  "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";

/**
 * Create a TreeNodeData object from an Employee record.
 */
export function createEmployeeNode(employee: Employee): TreeNodeData {
  return {
    name: `${employee.firstName || ""} ${employee.lastName || ""}`.trim(),
    id: employee.id,
    attributes: {
      title: employee.job?.job || employee.position?.title || "N/A",
      image: employee?.image || DEFAULT_AVATAR,
      department: employee.department?.name || undefined,
      id: employee.id,
      hasChildren: false,
      childrenCount: 0,
    },
    children: [],
  };
}

/**
 * Recursively update hasChildren and childrenCount on every node.
 */
function updateChildrenInfo(node: TreeNodeData): TreeNodeData {
  const hasChildren = node.children && node.children.length > 0;
  const childrenCount = node.children?.length || 0;

  return {
    ...node,
    attributes: {
      ...node.attributes!,
      hasChildren,
      childrenCount,
    },
    children: node.children?.map((child) => updateChildrenInfo(child)),
  };
}

/**
 * Build the full organization chart tree from flat data.
 */
export function buildOrganizationChart(data: OrganizationData): TreeNodeData {
  if (!data || !data.ceo) {
    return {
      name: "Không có dữ liệu",
      id: "no-data",
      attributes: {
        title: "N/A",
        image: "",
        id: "no-data",
        hasChildren: false,
        childrenCount: 0,
      },
    };
  }

  // CEO node
  const ceoNode = createEmployeeNode(data.ceo);

  // Executives nodes (COO, CTO, CFO) - direct reports to CEO
  const executiveNodes = data.executives.map((executive) => {
    const executiveNode = createEmployeeNode(executive);

    // Find department heads under this executive
    let departmentHeadsForExecutive: Employee[] = [];

    if (executive.position?.title === "CTO") {
      departmentHeadsForExecutive = data.departmentHeads.filter(
        (head) => head.department?.name === "Phòng Kỹ Thuật"
      );
    } else if (executive.position?.title === "COO") {
      departmentHeadsForExecutive = data.departmentHeads.filter(
        (head) =>
          head.department?.name === "Phòng Nhân Sự" ||
          head.department?.name === "Phòng Kinh Doanh & Marketing"
      );
    } else if (executive.position?.title === "CFO") {
      departmentHeadsForExecutive = data.departmentHeads.filter(
        (head) =>
          head.department?.name === "Phòng Kế Toán" ||
          head.department?.name === "Phòng Hành Chính"
      );
    } else if (executive.position?.title === "CPO") {
      departmentHeadsForExecutive = data.departmentHeads.filter(
        (head) => head.department?.name === "Phòng Sản Phẩm & Thiết Kế"
      );
    }

    // Add department heads as children
    executiveNode.children = departmentHeadsForExecutive.map((head) => {
      const headNode = createEmployeeNode(head);

      // Add employees under this department head
      const employeesUnderHead = data.otherEmployees.filter(
        (emp) => emp.department?.name === head.department?.name
      );

      headNode.children = employeesUnderHead.map((emp) =>
        createEmployeeNode(emp)
      );
      return headNode;
    });

    return executiveNode;
  });

  // Add executives as children of CEO
  ceoNode.children = executiveNodes;

  return updateChildrenInfo(ceoNode);
}

/**
 * Filter tree nodes to show/hide children based on expanded state.
 */
export function filterChildrenByExpandState(
  node: TreeNodeData,
  expandedNodes: Set<string>
): TreeNodeData {
  const nodeId = node.attributes?.id || "";
  const isExpanded = expandedNodes.has(nodeId);

  return {
    ...node,
    attributes: {
      ...node.attributes!,
      hasChildren: node.children && node.children.length > 0,
      childrenCount: node.children?.length || 0,
    },
    children:
      isExpanded && node.children
        ? node.children.map((child) =>
            filterChildrenByExpandState(child, expandedNodes)
          )
        : undefined,
  };
}

/**
 * Collect all employee IDs from the organization data.
 */
export function collectAllIds(data: OrganizationData): Set<string> {
  const allIds = new Set<string>();
  if (data.ceo) allIds.add(data.ceo.id);
  data.executives.forEach((emp) => allIds.add(emp.id));
  data.departmentHeads.forEach((emp) => allIds.add(emp.id));
  data.otherEmployees.forEach((emp) => allIds.add(emp.id));
  return allIds;
}
