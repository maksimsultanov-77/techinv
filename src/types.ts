import { Location } from './db/database';

export interface EmployeeStats {
  total: number;
  byDepartment: { id: number; name: string; count: number }[];
  byWorkMode: { mode: string; label: string; icon: string; count: number }[];
  byGender: { gender: string; count: number }[];
  byType: { type: string; label: string; icon: string; count: number }[];
}

export interface WorkMode {
  mode: string;
  label: string;
  icon: string;
  count: number;
}

export interface LocationTreeNode extends Location {
  children: LocationTreeNode[];
  equipmentCount: number;
}
