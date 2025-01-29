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
import { useNavigate } from 'react-router-dom';
import {
  IconEdit,
  IconTrash,
  IconPlus,
  IconFolder,
  IconCheck,
  IconSquare,
} from '@tabler/icons-react';
import { useState } from 'react';
import { KnowledgeContainer } from '@renderer/state/knowledge';

export function KnowledgePanel() {
  const navigate = useNavigate();
  const { knowledgeSets, deleteKnowledgeSet, toggleKnowledgeSet, selectedSets } =
    KnowledgeContainer.useContainer();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [knowledgeToDelete, setKnowledgeToDelete] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!knowledgeSets || !knowledgeToDelete) {
      return;
    }

    await deleteKnowledgeSet(knowledgeToDelete);

    setDeleteModalOpen(false);
    setKnowledgeToDelete(null);
  };

  return (
    <Box style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Modal
        opened={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setKnowledgeToDelete(null);
        }}
        title="Delete Knowledge Set"
      >
        <Text>
          Are you sure you want to delete this knowledge set? This action cannot be undone.
        </Text>
        <Group justify="flex-end" mt="lg">
          <Button
            variant="subtle"
            onClick={() => {
              setDeleteModalOpen(false);
              setKnowledgeToDelete(null);
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
        onClick={() => void navigate('/knowledge/create')}
        mb="md"
        mt="xs"
      >
        Add Knowledge Set
      </Button>

      <ScrollArea h="calc(100vh - 120px)" type="hover">
        <Stack gap="xs">
          {knowledgeSets?.map((knowledge) => (
            <Paper
              key={knowledge.id}
              p="sm"
              radius="sm"
              bg="var(--mantine-color-dark-6)"
              style={{
                border: selectedSets.includes(knowledge.id)
                  ? '1px solid var(--mantine-color-blue-filled)'
                  : '1px solid transparent',
                cursor: 'pointer',
              }}
              onClick={() => toggleKnowledgeSet(knowledge.id)}
            >
              <Group align="center" wrap="nowrap">
                <Box
                  className="knowledge-icon"
                  style={{
                    position: 'relative',
                    width: 40,
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <IconFolder
                    size={24}
                    fill={
                      selectedSets.includes(knowledge.id)
                        ? 'var(--mantine-color-blue-6)'
                        : 'inherit'
                    }
                    className="folder-icon"
                    style={{
                      color: selectedSets.includes(knowledge.id)
                        ? 'var(--mantine-color-blue-6)'
                        : 'inherit',
                    }}
                  />
                  {selectedSets.includes(knowledge.id) ? (
                    <IconCheck
                      size={24}
                      className="check-icon"
                      style={{ color: 'var(--mantine-color-blue-6)' }}
                    />
                  ) : (
                    <IconSquare size={24} className="check-icon" />
                  )}
                </Box>
                <Box style={{ flex: 1, minWidth: 0 }}>
                  <Text size="sm" fw={500} lineClamp={1}>
                    {knowledge.name}
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
                    zIndex: 2,
                  }}
                  className="knowledge-actions"
                  onClick={(event) => event.stopPropagation()}
                >
                  <ActionIcon
                    size="sm"
                    variant="subtle"
                    onClick={() => navigate(`/knowledge/edit/${knowledge.id}`)}
                  >
                    <IconEdit size={16} />
                  </ActionIcon>
                  <ActionIcon
                    size="sm"
                    variant="subtle"
                    color="red"
                    onClick={() => {
                      setKnowledgeToDelete(knowledge.id);
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
          .knowledge-actions { opacity: 0; }
          *:hover > .knowledge-actions { opacity: 1 !important; }

          .knowledge-icon {
            position: relative;
          }

          .knowledge-icon .check-icon {
            position: absolute;
            opacity: 0;
            transition: opacity 0.2s;
          }

          .knowledge-icon .folder-icon {
            transition: opacity 0.2s;
          }

          /* Show check-icon and hide folder-icon when hovering the Paper component */
          [data-mantine-color-scheme] .mantine-Paper-root:hover .check-icon {
            opacity: 1;
          }

          [data-mantine-color-scheme] .mantine-Paper-root:hover .folder-icon {
            opacity: 0;
          }
        `}
      </style>
    </Box>
  );
}
