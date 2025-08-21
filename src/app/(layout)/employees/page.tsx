
"use client";

import React, { useEffect, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { getEmployees } from "./actions";
import { EmployeeWithRelations } from "./types";
import { employeesTableMapping } from './helpers'
import { InputIcon } from 'primereact/inputicon';


const EmployeesTable: React.FC = () => {
  const [employees, setEmployees] = useState<EmployeeWithRelations[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Handle edit action
  const handleEdit = (employee: EmployeeWithRelations) => {
    console.log('Edit employee:', employee);
    // TODO: Implement edit functionality
    // You can navigate to edit page or open a dialog
  };

  // Handle delete action
  const handleDelete = (employee: EmployeeWithRelations) => {
    console.log('Delete employee:', employee);
    // TODO: Implement delete functionality
    // You might want to show a confirmation dialog first
  };

  // Action buttons template
  const actionBodyTemplate = (rowData: EmployeeWithRelations) => {
    return (
      <div className="flex gap-2">
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-success p-button-sm"
          onClick={() => handleEdit(rowData)}
          tooltip="Chỉnh sửa"
        />
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-danger p-button-sm"
          onClick={() => handleDelete(rowData)}
          tooltip="Xóa"
        />
      </div>
    );
  };

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
  console.log(employees);
  return (
    <div className="p-5 h-full shadow-md rounded-lg">
      <InputIcon />
      <DataTable
        value={employeesTableMapping(employees)}
        loading={loading}
        paginator
        rows={10}
        className="p-datatable-sm"
        emptyMessage="No employees found"
      >
        <Column field="fullName" header="Họ và tên" />
        <Column field="phone" header="Điện thoại" />
        <Column field="department.name" header="Phòng ban" />
        <Column field="position.title" header="Chức vụ" />
        <Column field="type" header="Loại" />
        <Column field="status" header="Trạng thái" />
        <Column header="Hành động" body={actionBodyTemplate} style={{ width: '120px' }} />
      </DataTable>
    </div>
  );
};

export default EmployeesTable;