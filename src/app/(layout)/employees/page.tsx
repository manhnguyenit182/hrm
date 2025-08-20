
"use client";

import React, { useEffect, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { getEmployees, EmployeeWithRelations } from "./actions";
// import { EmployeeWithRelations } from "@/types/types"; // Adjust the import path as necessary

const EmployeesTable: React.FC = () => {
  const [employees, setEmployees] = useState<EmployeeWithRelations[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Fetch employee data from API or database
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const data = await getEmployees();
        setEmployees(data);
      } catch (error) {
        console.error('Error fetching employees:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  return (
    <div className="p-5 h-full shadow-md rounded-lg">
      <h2 className="flex-1 text-xl font-bold mb-4">Employees List</h2>
      <DataTable
        value={employees}
        loading={loading}
        paginator
        rows={10}
        className="p-datatable-sm"
        emptyMessage="No employees found"
      >
        <Column field="firstName" header="First Name" />
        <Column field="lastName" header="Last Name" />
        <Column field="email" header="Email" />
        <Column field="phone" header="Phone" />
        <Column field="department.name" header="Department" />
        <Column field="position.title" header="Position" />
        <Column field="status" header="Status" />
      </DataTable>
    </div>
  );
};

export default EmployeesTable;