export interface Department {
  id: string;
  company_id: string;
  module_id: string;
  name: string;
  slug: string;
  color?: string;
  business_unit?: string;
  is_active: boolean;
}

export interface UserDepartment extends Department {
  role_in_department: 'member' | 'admin';
  is_primary: boolean;
}

export interface DepartmentAssignment {
  resource_type: string; // ex.: 'tarefas'
  resource_id: string;
  department_id: string;
  is_primary: boolean;
  company_id: string;
}

