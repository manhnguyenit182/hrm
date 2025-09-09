"use client";
import React, { useEffect, useState, useRef } from "react";
import Tree from "react-d3-tree";
import { getOrganizationChart } from "./actions";
import { Avatar } from "primereact/avatar";
import { Button } from "primereact/button";
import { Expand, Minimize2 } from "lucide-react";

interface Employee {
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

interface OrganizationData {
  ceo: Employee | null;
  executives: Employee[];
  departmentHeads: Employee[];
  otherEmployees: Employee[];
}

interface NodeDatum {
  name: string;
  attributes?: {
    title?: string;
    image?: string;
    department?: string;
    id?: string;
    hasChildren?: boolean;
    childrenCount?: number;
  };
  children?: NodeDatum[];
}

interface TreeNodeData {
  name: string;
  id: string; // Thêm ID để track node
  attributes?: {
    title: string;
    image: string;
    department?: string;
    id: string; // Thêm ID vào attributes
    hasChildren?: boolean; // Thêm flag để track có children hay không
    childrenCount?: number; // Số lượng children
  };
  children?: TreeNodeData[];
}

export default function Dashboard() {
  const [data, setData] = useState<OrganizationData | null>(null);
  const [loading, setLoading] = useState(true);
  const treeContainer = useRef<HTMLDivElement>(null);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // Set default expanded state for CEO when data loads
  useEffect(() => {
    if (data && data.ceo && !expandedNodes.has(data.ceo.id)) {
      setExpandedNodes((prev) => new Set(prev).add(data.ceo!.id));
    }
  }, [data, expandedNodes]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const orgData = await getOrganizationChart();
        setData(orgData);
      } catch (error) {
        console.error("Error fetching organization chart:", error);
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Functions để handle expand/collapse
  const toggleNodeExpansion = (nodeId: string) => {
    console.log("Toggling node:", nodeId);
    console.log("Current expanded nodes:", Array.from(expandedNodes));
    setExpandedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        console.log("Collapsing node:", nodeId);
        newSet.delete(nodeId);
      } else {
        console.log("Expanding node:", nodeId);
        newSet.add(nodeId);
      }
      console.log("New expanded nodes:", Array.from(newSet));
      return newSet;
    });
  };

  const expandAllNodes = () => {
    if (!data) return;
    const allIds = new Set<string>();

    // Collect all employee IDs
    if (data.ceo) allIds.add(data.ceo.id);
    data.executives.forEach((emp) => allIds.add(emp.id));
    data.departmentHeads.forEach((emp) => allIds.add(emp.id));
    data.otherEmployees.forEach((emp) => allIds.add(emp.id));

    setExpandedNodes(allIds);
  };

  const collapseAllNodes = () => {
    setExpandedNodes(new Set());
  };

  // Function để filter children dựa trên expand state
  const filterChildrenByExpandState = (node: TreeNodeData): TreeNodeData => {
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
          ? node.children.map((child) => filterChildrenByExpandState(child))
          : undefined,
    };
  };

  const createEmployeeNode = (employee: Employee): TreeNodeData => {
    // Tạo safe image URL, loại bỏ các URL không được config

    return {
      name: `${employee.firstName || ""} ${employee.lastName || ""}`.trim(),
      id: employee.id, // Sử dụng ID của employee
      attributes: {
        title: employee.job?.job || employee.position?.title || "N/A",
        image:
          employee?.image ||
          "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y",
        department: employee.department?.name || undefined,
        id: employee.id, // Thêm ID vào attributes để dễ access
        hasChildren: false, // Sẽ được cập nhật sau khi add children
        childrenCount: 0, // Sẽ được cập nhật sau khi add children
      },
      children: [],
    };
  };

  const buildOrganizationChart = (): TreeNodeData => {
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

    // Update hasChildren và childrenCount cho tất cả nodes
    const updateChildrenInfo = (node: TreeNodeData): TreeNodeData => {
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
    };

    return updateChildrenInfo(ceoNode);
  };

  // Custom node component for better styling
  const renderCustomNode = ({ nodeDatum }: { nodeDatum: NodeDatum }) => {
    const nodeId = nodeDatum.attributes?.id || "";
    const isExpanded = expandedNodes.has(nodeId);
    const hasChildren = nodeDatum.attributes?.hasChildren || false;
    const childrenCount = nodeDatum.attributes?.childrenCount || 0;

    return (
      <g>
        {/* Background card */}
        <rect
          width="200"
          height="120"
          x="-100"
          y="-60"
          rx="10"
          fill="white"
          stroke="#e2e8f0"
          strokeWidth="2"
          filter="url(#drop-shadow)"
          style={{ cursor: hasChildren ? "pointer" : "default" }}
          onClick={() => hasChildren && toggleNodeExpansion(nodeId)}
        />

        {/* Expand/Collapse indicator */}
        {hasChildren && (
          <g>
            <circle
              cx="85"
              cy="-45"
              r="12"
              fill={isExpanded ? "#ef4444" : "#10b981"}
              stroke="white"
              strokeWidth="2"
              style={{ cursor: "pointer" }}
              onClick={(e) => {
                e.stopPropagation();
                toggleNodeExpansion(nodeId);
              }}
            />
            <text
              x="85"
              y="-40"
              textAnchor="middle"
              fontSize="14"
              fill="white"
              fontWeight="bold"
              style={{ cursor: "pointer", userSelect: "none" }}
              onClick={(e) => {
                e.stopPropagation();
                toggleNodeExpansion(nodeId);
              }}
            >
              {isExpanded ? "−" : "+"}
            </text>
            {/* Children count indicator */}
            <text
              x="85"
              y="-25"
              textAnchor="middle"
              fontSize="10"
              fill="#6b7280"
              fontWeight="500"
            >
              {childrenCount}
            </text>
          </g>
        )}

        {/* Profile image */}
        <foreignObject x="-30" y="-45" width="60" height="60">
          <div className="w-full h-full rounded-full overflow-hidden border-2 border-blue-200 bg-gray-100 flex items-center justify-center">
            <Avatar
              image={nodeDatum.attributes?.image || undefined}
              shape="circle"
              size="large"
              onImageError={() => {
                if (nodeDatum.attributes?.image) {
                  setFailedImages((prev) =>
                    new Set(prev).add(nodeDatum.attributes!.image!)
                  );
                }
              }}
            >
              {!nodeDatum.attributes?.image ||
              failedImages.has(nodeDatum.attributes.image!) ? (
                <span className="text-white font-bold text-lg">
                  {(() => {
                    const nameParts = nodeDatum.name
                      .trim()
                      .split(" ")
                      .filter((part) => part.length > 0);
                    if (nameParts.length === 0) return "N/A";
                    if (nameParts.length === 1)
                      return nameParts[0][0].toUpperCase();
                    // Lấy chữ cái đầu của từ đầu tiên và từ cuối cùng
                    const firstInitial = nameParts[0][0].toUpperCase();
                    const lastInitial =
                      nameParts[nameParts.length - 1][0].toUpperCase();
                    return firstInitial + lastInitial;
                  })()}
                </span>
              ) : null}
            </Avatar>
          </div>
        </foreignObject>

        {/* Name */}
        <text
          x="0"
          y="25"
          textAnchor="middle"
          fontSize="14"
          fontWeight="200"
          fill="#1f2937"
        >
          {nodeDatum.name.length > 20
            ? `${nodeDatum.name.substring(0, 20)}...`
            : nodeDatum.name}
        </text>

        {/* Title */}
        <text x="0" y="45" textAnchor="middle" fontSize="12" fill="#6b7280">
          {nodeDatum.attributes?.title && nodeDatum.attributes.title.length > 25
            ? `${nodeDatum.attributes.title.substring(0, 25)}...`
            : nodeDatum.attributes?.title}
        </text>
      </g>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Đang tải biểu đồ tổ chức...</div>
      </div>
    );
  }

  const chartData = buildOrganizationChart();
  const filteredChartData = filterChildrenByExpandState(chartData);

  return (
    <div>
      <div className="p-6 flex justify-between">
        <h2 className="text-3xl font-bold mb-6 text-center ">
          Biểu đồ Tổ chức Công ty
        </h2>
        <div className="mb-4 flex justify-center gap-4">
          <Button
            onClick={expandAllNodes}
            className="!bg-[color:#7152f3] px-4 py-2 text-white rounded-lg hover:!bg-[color:#5b3ed9] transition-colors duration-200 flex items-center gap-2"
          >
            <Expand />
          </Button>
          <Button
            onClick={collapseAllNodes}
            className="!bg-[color:#7f63f4] px-4 py-2 text-white rounded-lg hover:!bg-[color:#7152f3] transition-colors duration-200 flex items-center gap-2"
          >
            <Minimize2 />
          </Button>
        </div>
      </div>

      {filteredChartData.name !== "Không có dữ liệu" ? (
        <div
          ref={treeContainer}
          className="w-full h-[calc(100vh-240px)] border border-gray-200 rounded-lg bg-white shadow-lg"
        >
          <Tree
            data={filteredChartData}
            orientation="vertical"
            pathFunc="step"
            translate={{ x: 570, y: 100 }}
            zoom={0.8}
            nodeSize={{ x: 250, y: 150 }}
            separation={{ siblings: 1.2, nonSiblings: 1.5 }}
            renderCustomNodeElement={renderCustomNode}
            enableLegacyTransitions={true}
            transitionDuration={800}
            collapsible={false} // Tắt collapsible mặc định vì chúng ta tự quản lý
            initialDepth={undefined} // Không giới hạn depth
          />
        </div>
      ) : (
        <div className="text-center text-gray-500 mt-20">
          <div className="text-2xl mb-4">📊</div>
          <div>Không có dữ liệu biểu đồ tổ chức</div>
        </div>
      )}
    </div>
  );
}
