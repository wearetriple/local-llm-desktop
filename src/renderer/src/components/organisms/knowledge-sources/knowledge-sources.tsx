import { ActionIcon, Box, HoverCard, Stack, Text, UnstyledButton } from '@mantine/core';
import { IconFiles } from '@tabler/icons-react';
import type { KnowledgeSet } from '@shared/api-ipc/knowledge';

type KnowledgeSourcesProperties = {
  documentsUsed: Array<{ knowledgeSetId: string; file: string }>;
  knowledgeSetMap: Map<string, KnowledgeSet>;
};

const handleFileClick = (filePath: string) => {
  window.api.openFileInOS(filePath);
};

export function KnowledgeSources({ documentsUsed, knowledgeSetMap }: KnowledgeSourcesProperties) {
  return (
    <Box mt={8}>
      <HoverCard width={300} shadow="md">
        <HoverCard.Target>
          <ActionIcon variant="subtle" size="sm" c="darkgrey">
            <IconFiles size={16} />
          </ActionIcon>
        </HoverCard.Target>
        <HoverCard.Dropdown>
          <Stack gap="xs">
            <Text size="sm">These documents were used to generate this response:</Text>
            {[...new Set(documentsUsed.map((document) => document.knowledgeSetId))].map((setId) => {
              const knowledgeSet = knowledgeSetMap.get(setId);
              const files = documentsUsed.filter((document) => document.knowledgeSetId === setId);
              return (
                <Box key={setId}>
                  <Text size="sm" fw={500}>
                    {knowledgeSet?.name || 'Unknown Set'}
                  </Text>
                  {files.map((document, index) => (
                    <UnstyledButton
                      key={index}
                      onClick={() => void handleFileClick(document.file)}
                      style={(theme) => ({
                        width: '100%',
                        padding: '2px 8px',
                        borderRadius: theme.radius.sm,
                        '&:hover': {
                          backgroundColor: theme.colors.gray[1],
                        },
                      })}
                    >
                      <Text size="xs" c="dimmed">
                        {document.file}
                      </Text>
                    </UnstyledButton>
                  ))}
                </Box>
              );
            })}
          </Stack>
        </HoverCard.Dropdown>
      </HoverCard>
    </Box>
  );
}
