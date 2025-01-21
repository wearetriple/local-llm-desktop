/* eslint-disable @typescript-eslint/no-misused-promises */
import {
  ScrollArea,
  Stack,
  Text,
  Paper,
  Group,
  Button,
  ActionIcon,
  Modal,
  Box,
} from '@mantine/core';
import { NameAvatar } from '@renderer/components/atom/name-avatar';
import { PersonasContainer } from '@renderer/state/personas';
import { useNavigate } from 'react-router-dom';
import { IconEdit, IconTrash, IconPlus } from '@tabler/icons-react';
import { useState } from 'react';

export function PersonaPanel() {
  const navigate = useNavigate();
  const { personas, activePersona, setActivePersona, updatePersonas } =
    PersonasContainer.useContainer();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [personaToDelete, setPersonaToDelete] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!personas || !personaToDelete) {
      return;
    }

    const updatedPersonas = personas.filter((p) => p.id !== personaToDelete);
    await updatePersonas(updatedPersonas);

    if (activePersona?.id === personaToDelete) {
      setActivePersona(null);
    }

    setDeleteModalOpen(false);
    setPersonaToDelete(null);
  };

  return (
    <Box style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Modal
        opened={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setPersonaToDelete(null);
        }}
        title="Delete Persona"
      >
        <Text>Are you sure you want to delete this persona? This action cannot be undone.</Text>
        <Group justify="flex-end" mt="lg">
          <Button
            variant="subtle"
            onClick={() => {
              setDeleteModalOpen(false);
              setPersonaToDelete(null);
            }}
          >
            Cancel
          </Button>
          <Button color="red" onClick={handleDelete}>
            Delete
          </Button>
        </Group>
      </Modal>

      <Button
        leftSection={<IconPlus size={16} />}
        variant="light"
        onClick={() => navigate('/personas/create')}
        mb="md"
        mt="xs"
      >
        Add Persona
      </Button>

      <ScrollArea h="calc(100vh - 120px)" type="hover">
        <Stack gap="xs">
          {personas?.map((persona) => (
            <Paper
              key={persona.id}
              p="sm"
              radius="sm"
              bg="var(--mantine-color-dark-6)"
              data-dark={true}
              onClick={() => setActivePersona(activePersona?.id === persona.id ? null : persona)}
              style={{
                cursor: 'pointer',
                border:
                  activePersona?.id === persona.id
                    ? '2px solid var(--mantine-color-blue-5)'
                    : 'none',
                position: 'relative',
              }}
            >
              <Group align="center" wrap="nowrap">
                <NameAvatar name={persona.name} />
                <Box style={{ flex: 1, minWidth: 0 }}>
                  <Text size="sm" fw={500} lineClamp={1}>
                    {persona.name}
                  </Text>
                  <Text size="xs" c="dimmed" mt={2} lineClamp={2} title={persona.description}>
                    {persona.description}
                  </Text>
                </Box>
                <Group
                  visibleFrom="sm"
                  gap="xs"
                  style={{
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    background: 'var(--mantine-color-dark-7)',
                    borderRadius: 4,
                    padding: 4,
                    opacity: 0,
                    transition: 'opacity 0.2s',
                  }}
                  className="persona-actions"
                  onClick={(event) => event.stopPropagation()}
                >
                  <ActionIcon
                    size="sm"
                    variant="subtle"
                    onClick={() => navigate(`/personas/edit/${persona.id}`)}
                  >
                    <IconEdit size={16} />
                  </ActionIcon>
                  <ActionIcon
                    size="sm"
                    variant="subtle"
                    color="red"
                    onClick={() => {
                      setPersonaToDelete(persona.id);
                      setDeleteModalOpen(true);
                    }}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              </Group>
            </Paper>
          ))}
        </Stack>
      </ScrollArea>

      <style>
        {`
          .persona-actions { opacity: 0; }
          *:hover > .persona-actions { opacity: 1 !important; }
        `}
      </style>
    </Box>
  );
}
