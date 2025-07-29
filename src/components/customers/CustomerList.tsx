import { useEffect, useState } from "react";
import {
  Table,
  Group,
  Text,
  ActionIcon,
  Button,
  Modal,
  TextInput,
  Textarea,
  Stack,
} from "@mantine/core";
import { IconEdit, IconTrash, IconSearch } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import type { Customer } from "../../types";
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  searchCustomers,
} from "../../api";

export function CustomerList() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [opened, { open, close }] = useDisclosure(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    job_site_info: "",
  });

  const loadCustomers = async () => {
    try {
      const data = await getCustomers();
      setCustomers(data);
    } catch (error) {
      console.error("Error loading customers:", error);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleSubmit = async () => {
    try {
      if (selectedCustomer) {
        await updateCustomer(selectedCustomer.id, formData);
      } else {
        await createCustomer(formData);
      }
      loadCustomers();
      close();
      setSelectedCustomer(null);
      setFormData({
        name: "",
        address: "",
        phone: "",
        job_site_info: "",
      });
    } catch (error) {
      console.error("Error saving customer:", error);
    }
  };

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setFormData({
      name: customer.name,
      address: customer.address || "",
      phone: customer.phone || "",
      job_site_info: customer.job_site_info || "",
    });
    open();
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      try {
        await deleteCustomer(id);
        loadCustomers();
      } catch (error) {
        console.error("Error deleting customer:", error);
      }
    }
  };

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      try {
        const results = await searchCustomers(searchQuery);
        setCustomers(results);
      } catch (error) {
        console.error("Error searching customers:", error);
      }
    } else {
      loadCustomers();
    }
  };

  return (
    <>
      <Group justify="space-between" mb="md">
        <Text size="xl" fw={500}>
          Customers
        </Text>
        <Group>
          <TextInput
            placeholder="Search customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            rightSection={
              <ActionIcon onClick={handleSearch}>
                <IconSearch size={16} />
              </ActionIcon>
            }
          />
          <Button onClick={() => {
            setSelectedCustomer(null);
            setFormData({
              name: "",
              address: "",
              phone: "",
              job_site_info: "",
            });
            open();
          }}>
            Add Customer
          </Button>
        </Group>
      </Group>

      <Table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>Address</th>
            <th>Job Site Info</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr key={customer.id}>
              <td>{customer.name}</td>
              <td>{customer.phone}</td>
              <td>{customer.address}</td>
              <td>{customer.job_site_info}</td>
              <td>
                <Group gap={0}>
                  <ActionIcon onClick={() => handleEdit(customer)}>
                    <IconEdit size={16} />
                  </ActionIcon>
                  <ActionIcon
                    color="red"
                    onClick={() => handleDelete(customer.id)}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal
        opened={opened}
        onClose={close}
        title={selectedCustomer ? "Edit Customer" : "Add Customer"}
      >
        <Stack gap="md">
          <TextInput
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <TextInput
            label="Phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
          <TextInput
            label="Address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
          <Textarea
            label="Job Site Info"
            value={formData.job_site_info}
            onChange={(e) =>
              setFormData({ ...formData, job_site_info: e.target.value })
            }
          />
          <Button onClick={handleSubmit}>
            {selectedCustomer ? "Update" : "Create"}
          </Button>
        </Stack>
      </Modal>
    </>
  );
} 