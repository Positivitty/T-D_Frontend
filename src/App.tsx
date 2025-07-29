import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Text,
  Button,
  TextInput,
  Select,
  Group,
  Stack,
  Badge,
  Card,
  Grid,
  Modal,
  Tabs,
  ActionIcon,
  Loader,
  Center,
  NumberInput,
  Title,
} from '@mantine/core';
import {
  IconSearch,
  IconFilter,
  IconPlus,
  IconEdit,
  IconTrash,
  IconClock,
  IconUser,
  IconPackage,
  IconRefresh,
} from '@tabler/icons-react';

// Types
interface ContainerItem {
  id: string;
  status: 'Available' | 'In Use' | 'Needs Picked Up' | 'Dumped';
  location: string;
  contents: string;
  assignedTo?: string;
  dateDropped?: string;
  dateDumped?: string;
  weight?: number;
  lastUpdated: string;
  updatedBy: string;
}

const ContainerTracker: React.FC = () => {
  const [activeContainers, setActiveContainers] = useState<ContainerItem[]>([]);
  const [archivedContainers, setArchivedContainers] = useState<ContainerItem[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [editingContainer, setEditingContainer] = useState<ContainerItem | null>(null);
  const [selectedContainer, setSelectedContainer] = useState<ContainerItem | null>(null);
  const [activeTab, setActiveTab] = useState<string>('active');
  const [loading, setLoading] = useState<boolean>(false);

  const API_BASE = 'http://localhost:3001/api';

  const statusColors: Record<ContainerItem['status'], string> = {
    'Available': 'green',
    'In Use': 'blue',
    'Needs Picked Up': 'violet',
    'Dumped': 'orange'
  };

  // Fetch containers when component mounts
  useEffect(() => {
    fetchContainers();
  }, []);

  const fetchContainers = async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/containers`);
      const data: ContainerItem[] = await response.json();
      
      // Separate active and archived containers
      const active = data.filter(c => c.status !== 'Dumped');
      const archived = data.filter(c => c.status === 'Dumped');
      
      setActiveContainers(active);
      setArchivedContainers(archived);
    } catch (error) {
      console.error('Error fetching containers:', error);
      alert('Failed to load containers. Make sure backend is running on port 3001.');
    }
    setLoading(false);
  };

  const handleAddContainer = async (containerData: Partial<ContainerItem>): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE}/containers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(containerData),
      });
      
      if (response.ok) {
        const newContainer: ContainerItem = await response.json();
        setActiveContainers([...activeContainers, newContainer]);
        setShowAddForm(false);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to add container');
      }
    } catch (error) {
      console.error('Error adding container:', error);
      alert('Failed to add container');
    }
  };

  const handleUpdateContainer = async (updatedContainer: ContainerItem): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE}/containers/${updatedContainer.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedContainer),
      });
      
      if (response.ok) {
        const updated: ContainerItem = await response.json();
        
        if (updated.status === 'Dumped') {
          // Move to archive
          setActiveContainers(activeContainers.filter(c => c.id !== updated.id));
          setArchivedContainers([...archivedContainers, updated]);
        } else {
          // Update in active list
          setActiveContainers(activeContainers.map(c => 
            c.id === updated.id ? updated : c
          ));
        }
        setEditingContainer(null);
      } else {
        alert('Failed to update container');
      }
    } catch (error) {
      console.error('Error updating container:', error);
      alert('Failed to update container');
    }
  };

  const handleDeleteContainer = async (id: string): Promise<void> => {
    if (!window.confirm('Are you sure you want to delete this container?')) {
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE}/containers/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setActiveContainers(activeContainers.filter(c => c.id !== id));
      } else {
        alert('Failed to delete container');
      }
    } catch (error) {
      console.error('Error deleting container:', error);
      alert('Failed to delete container');
    }
  };

  const currentContainers = activeTab === 'active' ? activeContainers : archivedContainers;
  
  const filteredContainers = currentContainers.filter(container => {
    const matchesSearch = container.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         container.contents?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         container.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || container.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <Container size="xl" py="xl">
        <Center>
          <Stack align="center" gap="md">
            <Loader size="xl" />
            <Text size="lg" c="dimmed">Loading containers...</Text>
          </Stack>
        </Center>
      </Container>
    );
  }

  return (
    <Container size="xl" py="md">
      {/* Header */}
      <Paper shadow="sm" p="md" mb="md">
        <Group justify="space-between">
          <Group gap="md">
            <IconPackage size={32} color="blue" />
            <Title order={1}>T&D Rolloff Tracker</Title>
          </Group>
          
          <Group gap="md">
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => setShowAddForm(true)}
              disabled={activeTab !== 'active'}
            >
              Add Container
            </Button>
            
            <ActionIcon
              variant="filled"
              color="gray"
              onClick={fetchContainers}
              title="Refresh data"
            >
              <IconRefresh size={16} />
            </ActionIcon>
          </Group>
        </Group>
      </Paper>

      {/* Search and Filter */}
      <Paper shadow="sm" p="md" mb="md">
        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              placeholder="Search containers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.currentTarget.value)}
              leftSection={<IconSearch size={16} />}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Select
              placeholder="Filter by status"
              value={statusFilter}
              onChange={(value) => setStatusFilter(value || 'All')}
              leftSection={<IconFilter size={16} />}
              data={[
                { value: 'All', label: 'All Statuses' },
                { value: 'Available', label: 'Available' },
                { value: 'In Use', label: 'In Use' },
                { value: 'Needs Picked Up', label: 'Needs Picked Up' },
                { value: 'Dumped', label: 'Dumped' }
              ]}
            />
          </Grid.Col>
        </Grid>
      </Paper>

      {/* Tabs for Active/Archive */}
      <Tabs value={activeTab} onChange={(value) => setActiveTab(value || 'active')}>
        <Tabs.List>
          <Tabs.Tab value="active" leftSection={<IconPackage size={16} />}>
            Active ({activeContainers.length})
          </Tabs.Tab>
          <Tabs.Tab value="archived" leftSection={<IconPackage size={16} />}>
            Archive ({archivedContainers.length})
          </Tabs.Tab>
        </Tabs.List>

        {/* Status Legend */}
        <Paper p="md" mt="md" mb="md">
          <Text size="sm" fw={500} mb="xs">Status Legend:</Text>
          <Group gap="md">
            {Object.entries(statusColors).map(([status, color]) => (
              <Group key={status} gap="xs">
                <Badge color={color} variant="filled" size="sm">
                  {status}
                </Badge>
              </Group>
            ))}
          </Group>
        </Paper>

        <Tabs.Panel value="active">
          <ContainerList 
            containers={filteredContainers}
            onEdit={setEditingContainer}
            onDelete={handleDeleteContainer}
            onSelect={setSelectedContainer}
            isArchive={false}
          />
        </Tabs.Panel>

        <Tabs.Panel value="archived">
          <Text size="sm" c="dimmed" mb="md">
            Dumped containers kept for auditing and historical records
          </Text>
          <ContainerList 
            containers={filteredContainers}
            onEdit={null}
            onDelete={null}
            onSelect={setSelectedContainer}
            isArchive={true}
          />
        </Tabs.Panel>
      </Tabs>

      {/* Modals */}
      <Modal
        opened={showAddForm || editingContainer !== null}
        onClose={() => {
          setShowAddForm(false);
          setEditingContainer(null);
        }}
        title={editingContainer ? 'Edit Container' : 'Add New Container'}
        size="md"
      >
        <ContainerForm
          container={editingContainer}
          onSave={editingContainer ? handleUpdateContainer : handleAddContainer}
          onCancel={() => {
            setShowAddForm(false);
            setEditingContainer(null);
          }}
        />
      </Modal>

      <Modal
        opened={selectedContainer !== null}
        onClose={() => setSelectedContainer(null)}
        title={`${selectedContainer?.id} Details`}
        size="md"
      >
        {selectedContainer && (
          <ContainerDetails
            container={selectedContainer}
            onClose={() => setSelectedContainer(null)}
            onEdit={() => {
              setEditingContainer(selectedContainer);
              setSelectedContainer(null);
            }}
          />
        )}
      </Modal>
    </Container>
  );
};

// Container List Component
interface ContainerListProps {
  containers: ContainerItem[];
  onEdit: ((container: ContainerItem) => void) | null;
  onDelete: ((id: string) => void) | null;
  onSelect: (container: ContainerItem) => void;
  isArchive: boolean;
}

const ContainerList: React.FC<ContainerListProps> = ({ 
  containers, 
  onEdit, 
  onDelete, 
  onSelect, 
  isArchive 
}) => {
  const statusColors: Record<ContainerItem['status'], string> = {
    'Available': 'green',
    'In Use': 'blue',
    'Needs Picked Up': 'violet',
    'Dumped': 'orange'
  };

  if (containers.length === 0) {
    return (
      <Paper p="xl">
        <Center>
          <Stack align="center" gap="md">
            <IconPackage size={48} color="gray" />
            <Text c="dimmed">No containers found</Text>
          </Stack>
        </Center>
      </Paper>
    );
  }

  return (
    <Stack gap="md">
      {containers.map((container) => (
        <Card
          key={container.id}
          shadow="sm"
          padding="md"
          style={{ cursor: 'pointer' }}
          onClick={() => onSelect(container)}
        >
          <Group justify="space-between" mb="xs">
            <Group gap="md">
              <Text fw={500} size="lg">{container.id}</Text>
              <Badge color={statusColors[container.status]} variant="filled">
                {container.status}
              </Badge>
            </Group>
            
            {!isArchive && (
              <Group gap="xs">
                {onEdit && (
                  <ActionIcon
                    variant="subtle"
                    color="blue"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(container);
                    }}
                  >
                    <IconEdit size={16} />
                  </ActionIcon>
                )}
                {onDelete && (
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(container.id);
                    }}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                )}
              </Group>
            )}
            
            {isArchive && (
              <Badge color="gray" variant="outline">
                Archived
              </Badge>
            )}
          </Group>

          <Stack gap="xs">
            <Text size="sm" c="dimmed">{container.location}</Text>
            <Text size="sm"><strong>Contents:</strong> {container.contents}</Text>
            
            {container.assignedTo && (
              <Text size="sm" c="blue"><strong>Assigned to:</strong> {container.assignedTo}</Text>
            )}
            
            {container.dateDropped && (
              <Text size="sm" c="green">
                <strong>Dropped:</strong> {new Date(container.dateDropped).toLocaleDateString()}
              </Text>
            )}
            
            {container.dateDumped && (
              <Text size="sm" c="orange">
                <strong>Dumped:</strong> {new Date(container.dateDumped).toLocaleDateString()}
              </Text>
            )}
            
            {container.weight && (
              <Text size="sm" c="violet">
                <strong>Weight:</strong> {container.weight} tons
              </Text>
            )}
          </Stack>

          <Group gap="md" mt="xs">
            <Group gap="xs">
              <IconClock size={14} />
              <Text size="xs" c="dimmed">
                {new Date(container.lastUpdated).toLocaleDateString()}
              </Text>
            </Group>
            <Group gap="xs">
              <IconUser size={14} />
              <Text size="xs" c="dimmed">{container.updatedBy}</Text>
            </Group>
          </Group>
        </Card>
      ))}
    </Stack>
  );
};

// Container Form Component
interface ContainerFormProps {
  container: ContainerItem | null;
  onSave: (container: Partial<ContainerItem>) => void;
  onCancel: () => void;
}

const ContainerForm: React.FC<ContainerFormProps> = ({ container, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    id: container?.id || '',
    status: container?.status || 'Available' as ContainerItem['status'],
    location: container?.location || '',
    contents: container?.contents || '',
    assignedTo: container?.assignedTo || '',
    weight: container?.weight || undefined,
    dateDropped: container?.dateDropped || '',
    dateDumped: container?.dateDumped || ''
  });

  const handleSave = () => {
    if (!container && !formData.id.trim()) {
      alert('Please enter a container number.');
      return;
    }
    onSave({ ...container, ...formData });
  };

  return (
    <Stack gap="md">
      {!container && (
        <TextInput
          label="Container Number"
          placeholder="Enter container number (e.g., CNT-004)"
          value={formData.id}
          onChange={(e) => setFormData({ ...formData, id: e.currentTarget.value.toUpperCase() })}
          required
          description="Will be converted to uppercase"
        />
      )}
      
      <Select
        label="Status"
        value={formData.status}
        onChange={(value) => setFormData({ ...formData, status: value as ContainerItem['status'] })}
        data={[
          { value: 'Available', label: 'Available' },
          { value: 'In Use', label: 'In Use' },
          { value: 'Needs Picked Up', label: 'Needs Picked Up' },
          { value: 'Dumped', label: 'Dumped' }
        ]}
        required
      />

      <TextInput
        label="Location"
        placeholder="Enter address"
        value={formData.location}
        onChange={(e) => setFormData({ ...formData, location: e.currentTarget.value })}
        required
      />

      <TextInput
        label="Contents"
        placeholder="Describe contents"
        value={formData.contents}
        onChange={(e) => setFormData({ ...formData, contents: e.currentTarget.value })}
      />

      <TextInput
        label="Assigned To"
        placeholder="Customer or team name"
        value={formData.assignedTo}
        onChange={(e) => setFormData({ ...formData, assignedTo: e.currentTarget.value })}
      />

      <TextInput
        label="Date Dropped"
        type="date"
        value={formData.dateDropped}
        onChange={(e) => setFormData({ ...formData, dateDropped: e.currentTarget.value })}
      />

      {formData.status === 'Dumped' && (
        <>
          <NumberInput
            label="Weight (tons)"
            placeholder="Enter weight in tons"
            value={formData.weight}
            onChange={(value) => setFormData({ ...formData, weight: value as number })}
            min={0}
            max={50}
            step={0.1}
            decimalScale={1}
            required
          />
          
          <TextInput
            label="Date Dumped"
            type="date"
            value={formData.dateDumped}
            onChange={(e) => setFormData({ ...formData, dateDumped: e.currentTarget.value })}
            required
          />
        </>
      )}

      <Group justify="flex-end" gap="md">
        <Button variant="default" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          {container ? 'Update' : 'Add'} Container
        </Button>
      </Group>
    </Stack>
  );
};

// Container Details Component
interface ContainerDetailsProps {
  container: ContainerItem;
  onClose: () => void;
  onEdit: () => void;
}

const ContainerDetails: React.FC<ContainerDetailsProps> = ({ container, onClose, onEdit }) => {
  const statusColors: Record<ContainerItem['status'], string> = {
    'Available': 'green',
    'In Use': 'blue',
    'Needs Picked Up': 'violet',
    'Dumped': 'orange'
  };

  return (
    <Stack gap="md">
      <Group gap="md">
        <Text fw={500}>Status:</Text>
        <Badge color={statusColors[container.status]} variant="filled">
          {container.status}
        </Badge>
      </Group>
      
      <Text><strong>Location:</strong> {container.location}</Text>
      <Text><strong>Contents:</strong> {container.contents}</Text>
      
      {container.assignedTo && (
        <Text><strong>Assigned To:</strong> {container.assignedTo}</Text>
      )}
      
      {container.dateDropped && (
        <Text><strong>Date Dropped:</strong> {new Date(container.dateDropped).toLocaleDateString()}</Text>
      )}
      
      {container.dateDumped && (
        <Text><strong>Date Dumped:</strong> {new Date(container.dateDumped).toLocaleDateString()}</Text>
      )}
      
      {container.weight && (
        <Text><strong>Weight:</strong> {container.weight} tons</Text>
      )}
      
      <Text><strong>Last Updated:</strong> {new Date(container.lastUpdated).toLocaleString()}</Text>
      <Text><strong>Updated By:</strong> {container.updatedBy}</Text>

      <Group justify="flex-end" gap="md">
        <Button variant="default" onClick={onClose}>
          Close
        </Button>
        <Button
          onClick={onEdit}
          disabled={container.status === 'Dumped'}
        >
          {container.status === 'Dumped' ? 'Archived' : 'Edit Container'}
        </Button>
      </Group>
    </Stack>
  );
};

export default ContainerTracker;