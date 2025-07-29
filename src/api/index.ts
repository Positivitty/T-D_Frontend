import axios from "axios";
import type { Container, Customer, LogEntry } from "../types";

const API_URL = "http://localhost:8000/api/v1";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Container endpoints
export const getContainers = () => api.get<Container[]>("/containers").then((res) => res.data);
export const getContainer = (id: number) => api.get<Container>(`/containers/${id}`).then((res) => res.data);
export const createContainer = (data: Partial<Container>) => api.post<Container>("/containers", data).then((res) => res.data);
export const updateContainer = (id: number, data: Partial<Container>) => api.put<Container>(`/containers/${id}`, data).then((res) => res.data);
export const deleteContainer = (id: number) => api.delete<Container>(`/containers/${id}`).then((res) => res.data);

// Customer endpoints
export const getCustomers = () => api.get<Customer[]>("/customers").then((res) => res.data);
export const getCustomer = (id: number) => api.get<Customer>(`/customers/${id}`).then((res) => res.data);
export const createCustomer = (data: Partial<Customer>) => api.post<Customer>("/customers", data).then((res) => res.data);
export const updateCustomer = (id: number, data: Partial<Customer>) => api.put<Customer>(`/customers/${id}`, data).then((res) => res.data);
export const deleteCustomer = (id: number) => api.delete<Customer>(`/customers/${id}`).then((res) => res.data);
export const searchCustomers = (name: string) => api.get<Customer[]>(`/customers/search/${name}`).then((res) => res.data);

// Log entry endpoints
export const getLogEntries = () => api.get<LogEntry[]>("/log-entries").then((res) => res.data);
export const createLogEntry = (data: Partial<LogEntry>) => api.post<LogEntry>("/log-entries", data).then((res) => res.data);
export const getContainerLogEntries = (containerId: number) => api.get<LogEntry[]>(`/log-entries/container/${containerId}`).then((res) => res.data);
export const getCustomerLogEntries = (customerId: number) => api.get<LogEntry[]>(`/log-entries/customer/${customerId}`).then((res) => res.data); 