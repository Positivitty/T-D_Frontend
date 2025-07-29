import { useEffect, useState } from "react";
import {
  Table,
  Group,
  Text,
  Button,
  Modal,
  Select,
  Textarea,
  Stack,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import type { LogEntry, Container, Customer } from "../../types";
import { LogEntryType } from "../../types";
import {
  getLogEntries,
  createLogEntry,
  getContainers,
  getCustomers,
} from "../../api";

export function LogEntryList() {
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [containers, setContainers] = useState<Container[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [opened, { open, close }] = useDisclosure(false);
  const [formData, setFormData] = useState({
    container_id: "",
    customer_id: "",
    action: LogEntryType.DROPOFF,
    notes: "",
  });

  const loadData = async () => {
    try {
      const [logData, containerData, customerData] = await Promise.all([
        getLogEntries(),
        getContainers(),
        getCustomers(),
      ]);
      setLogEntries(logData);
      setContainers(containerData);
      setCustomers(customerData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async () => {
    try {
      await createLogEntry({
        container_id: parseInt(formData.container_id),
        customer_id: parseInt(formData.customer_id),
        action: formData.action,
        notes: formData.notes,
      });
      loadData();
      close();
      setFormData({
        container_id: "",
        customer_id: "",
        action: LogEntryType.DROPOFF,
        notes: "",
      });
    } catch (error) {
      console.error("Error creating log entry:", error);
    }
  };

  const getContainerNumber = (id: number) => {
    const container = containers.find((c) => c.id === id);
    return container ? container.container_number : "Unknown";
  };

  const getCustomerName = (id: number) => {
    const customer = customers.find((c) => c.id === id);
    return customer ? customer.name : "Unknown";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <>
      <Group justify="space-between" mb="md">
        <Text size="xl" fw={500}>
          Log Entries
        </Text>
        <Button onClick={open}>Add Log Entry</Button>
      </Group>

      <Table>
        <thead>
          <tr>
            <th>Date/Time</th>
            <th>Container</th>
            <th>Customer</th>
            <th>Action</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          {logEntries.map((entry) => (
            <tr key={entry.id}>
              <td>{formatDate(entry.timestamp)}</td>
              <td>{getContainerNumber(entry.container_id)}</td>
              <td>{getCustomerName(entry.customer_id)}</td>
              <td>{entry.action}</td>
              <td>{entry.notes}</td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal
        opened={opened}
        onClose={close}
        title="Add Log Entry"
      >
        <Stack gap="md">
          <Select
            label="Container"
            value={formData.container_id}
            onChange={(value) => setFormData({ ...formData, container_id: value || "" })}
            data={containers.map((container) => ({
              value: container.id.toString(),
              label: container.container_number,
            }))}
            required
          />
          <Select
            label="Customer"
            value={formData.customer_id}
            onChange={(value) => setFormData({ ...formData, customer_id: value || "" })}
            data={customers.map((customer) => ({
              value: customer.id.toString(),
              label: customer.name,
            }))}
            required
          />
          <Select
            label="Action"
            value={formData.action}
            onChange={(value) => setFormData({ ...formData, action: value as LogEntryType })}
            data={Object.values(LogEntryType).map((type) => ({
              value: type,
              label: type.charAt(0).toUpperCase() + type.slice(1).toLowerCase(),
            }))}
            required
          />
          <Textarea
            label="Notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
          <Button onClick={handleSubmit}>Create</Button>
        </Stack>
      </Modal>
    </>
  );
} 