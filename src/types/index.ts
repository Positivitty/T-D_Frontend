export enum ContainerStatus {
  AVAILABLE = "available",
  IN_USE = "in_use",
  NEEDS_PICKUP = "needs_pickup",
  IN_MAINTENANCE = "in_maintenance",
}

export enum LogEntryType {
  DROPOFF = "dropoff",
  PICKUP = "pickup",
  MAINTENANCE = "maintenance",
}

export interface Container {
  id: number;
  container_number: string;
  status: ContainerStatus;
  location?: string;
  notes?: string;
  current_customer_id?: number;
}

export interface Customer {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  job_site_info?: string;
  current_containers: Container[];
}

export interface LogEntry {
  id: number;
  container_id: number;
  customer_id: number;
  action: LogEntryType;
  timestamp: string;
  notes?: string;
} 