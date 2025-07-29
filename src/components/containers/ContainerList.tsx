import { useEffect, useState } from "react";
import {
  Table,
  Group,
  Text,
  ActionIcon,
  Badge,
  Button,
  Modal,
  TextInput,
  Select,
  Textarea,
} from "@mantine/core";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import type { Container } from "../../types";
import { ContainerStatus } from "../../types";
import {
  getContainers,
  createContainer,
  updateContainer,
  deleteContainer,
} from "../../api";

export function ContainerList() {
  const [containers, setContainers] = useState<Container[]>([]);
  const [selectedContainer, setSelectedContainer] = useState<Container | null>(null);
  const [opened, { open, close }] = useDisclosure(false);
  const [formData, setFormData] = useState({
    container_number: "",
    status: ContainerStatus.AVAILABLE,
    location: "",
    notes: "",
  });

  const loadContainers = async () => {
    try {
      const data = await getContainers();
      setContainers(data);
    } catch (error) {
      console.error("Error loading containers:", error);
    }
  };

  useEffect(() => {
    loadContainers();
  }, []);

  const handleSubmit = async () => {
    try {
      if (selectedContainer) {
        await updateContainer(selectedContainer.id, formData);
      } else {
        await createContainer(formData);
      }
      loadContainers();
      close();
      setSelectedContainer(null);
      setFormData({
        container_number: "",
        status: ContainerStatus.AVAILABLE,
        location: "",
        notes: "",
      });
    } catch (error) {
      console.error("Error saving container:", error);
    }
  };

  const handleEdit = (container: Container) => {
    setSelectedContainer(container);
    setFormData({
      container_number: container.container_number,
      status: container.status,
      location: container.location || "",
      notes: container.notes || "",
    });
    open();
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this container?")) {
      try {
        await deleteContainer(id);
        loadContainers();
      } catch (error) {
        console.error("Error deleting container:", error);
      }
    }
  };

  const getStatusColor = (status: ContainerStatus) => {
    switch (status) {
      case ContainerStatus.AVAILABLE:
        return "green";
      case ContainerStatus.IN_USE:
        return "blue";
      case ContainerStatus.NEEDS_PICKUP:
        return "yellow";
      case ContainerStatus.IN_MAINTENANCE:
        return "red";
      default:
        return "gray";
    }
  };

  return (
    <>
      <Group justify="space-between" mb="md">
        <Text size="xl" fw={500}>
          Containers
        </Text>
        <Button onClick={() => {
          setSelectedContainer(null);
          setFormData({
            container_number: "",
            status: ContainerStatus.AVAILABLE,
            location: "",
            notes: "",
          });
          open();
        }}>
          Add Container
        </Button>
      </Group>

      <Table>
        <thead>
          <tr>
            <th>Container Number</th>
            <th>Status</th>
            <th>Location</th>
            <th>Notes</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {containers.map((container) => (
            <tr key={container.id}>
              <td>{container.container_number}</td>
              <td>
                <Badge color={getStatusColor(container.status)}>
                  {container.status}
                </Badge>
              </td>
              <td>{container.location}</td>
              <td>{container.notes}</td>
              <td>
                <Group gap={0}>
                  <ActionIcon onClick={() => handleEdit(container)}>
                    <IconEdit size={16} />
                  </ActionIcon>
                  <ActionIcon
                    color="red"
                    onClick={() => handleDelete(container.id)}
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
        title={selectedContainer ? "Edit Container" : "Add Container"}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <TextInput
            label="Container Number"
            value={formData.container_number}
            onChange={(e) =>
              setFormData({ ...formData, container_number: e.target.value })
            }
            required
          />
          <Select
            label="Status"
            value={formData.status}
            onChange={(value) =>
              setFormData({ ...formData, status: value as ContainerStatus })
            }
            data={Object.values(ContainerStatus).map((status) => ({
              value: status,
              label: status.replace(/_/g, " ").toLowerCase(),
            }))}
            required
          />
          <TextInput
            label="Location"
            value={formData.location}
            onChange={(e) =>
              setFormData({ ...formData, location: e.target.value })
            }
          />
          <Textarea
            label="Notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
          <Button onClick={handleSubmit}>
            {selectedContainer ? "Update" : "Create"}
          </Button>
        </div>
      </Modal>
    </>
  );
} 