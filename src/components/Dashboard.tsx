"use client";
import React, { useEffect, useState } from "react";
import { OrganizationChart } from "primereact/organizationchart";
import { Avatar } from "primereact/avatar";
import { getOrganizationChart } from "./actions";
import { TreeNode } from "primereact/treenode";
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

interface ChartNode {
  expanded: boolean;
  type: string;
  data: {
    image: string;
    name: string;
    title: string;
  };
  children: ChartNode[];
}

export default function Dashboard() {
  const [data, setData] = useState<OrganizationData | null>(null);
  const [loading, setLoading] = useState(true);

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

  const createEmployeeNode = (
    employee: Employee,
    type: string = "person"
  ): ChartNode => {
    return {
      expanded: true,
      type,
      data: {
        image: employee.image || "https://i.pravatar.cc/150?img=1",
        name: `${employee.firstName || ""} ${employee.lastName || ""}`.trim(),
        title: employee.job?.job || employee.position?.title || "N/A",
      },
      children: [],
    };
  };

  const buildOrganizationChart = (): ChartNode[] => {
    if (!data || !data.ceo) return [];

    // CEO node
    const ceoNode = createEmployeeNode(data.ceo, "person");

    // Executives nodes (COO, CTO, CFO) - direct reports to CEO
    const executiveNodes = data.executives.map((executive) => {
      const executiveNode = createEmployeeNode(executive, "person");

      // Find department heads under this executive
      let departmentHeadsForExecutive: Employee[] = [];

      if (executive.position?.title === "CTO") {
        // CTO manages IT and technical departments
        departmentHeadsForExecutive = data.departmentHeads.filter(
          (head) => head.department?.name === "Phòng Kỹ Thuật"
        );
      } else if (executive.position?.title === "COO") {
        // COO manages operational departments
        departmentHeadsForExecutive = data.departmentHeads.filter(
          (head) =>
            head.department?.name === "Phòng Nhân Sự" ||
            head.department?.name === "Phòng Kinh Doanh & Marketing"
        );
      } else if (executive.position?.title === "CFO") {
        // CFO manages finance department
        departmentHeadsForExecutive = data.departmentHeads.filter(
          (head) =>
            head.department?.name === "Phòng Kế Toán" ||
            head.department?.name === "Phòng Hành Chính"
        );
      } else if (executive.position?.title === "CPO") {
        // CPO manages product and design departments
        departmentHeadsForExecutive = data.departmentHeads.filter(
          (head) => head.department?.name === "Phòng Sản Phẩm & Thiết Kế"
        );
      }

      // Add department heads as children
      executiveNode.children = departmentHeadsForExecutive.map((head) => {
        const headNode = createEmployeeNode(head, "person");

        // Add employees under this department head
        const employeesUnderHead = data.otherEmployees.filter(
          (emp) => emp.department?.name === head.department?.name
        );

        headNode.children = employeesUnderHead.map((emp) =>
          createEmployeeNode(emp, "person")
        );

        return headNode;
      });

      return executiveNode;
    });

    // Add executives as children of CEO
    ceoNode.children = executiveNodes;

    return [ceoNode];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Đang tải biểu đồ tổ chức...</div>
      </div>
    );
  }

  const chartData = buildOrganizationChart();

  return (
    <div className="w-full h-full p-4">
      <h2 className="text-2xl font-bold mb-4 text-center">
        Biểu đồ Tổ chức Công ty
      </h2>
      {chartData.length > 0 ? (
        <OrganizationChart
          value={chartData}
          nodeTemplate={(node: TreeNode) => (
            console.log(node),
            (
              <div className="bg-white border border-gray-200 rounded-lg p-4 text-center shadow-md min-w-[150px]">
                <Avatar
                  image={node.data.image}
                  size="large"
                  shape="circle"
                  className="mx-auto mb-2"
                />
                <div className="font-semibold text-sm text-gray-800">
                  {node.data.name}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {node.data.title}
                </div>
              </div>
            )
          )}
        />
      ) : (
        <div className="text-center text-gray-500">
          Không có dữ liệu biểu đồ tổ chức
        </div>
      )}
    </div>
  );
}
