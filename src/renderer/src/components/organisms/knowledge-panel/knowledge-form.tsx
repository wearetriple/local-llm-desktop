/* eslint-disable @typescript-eslint/no-misused-promises */
import { Button, Group, Stack, Text, TextInput, ActionIcon } from '@mantine/core';
import { useForm } from '@mantine/form';
import { FileDropzone } from '@renderer/components/molecules/file-dropzone';
import type { SourcePath } from '@shared/api-ipc/knowledge';
import { IconFile, IconFolder, IconTrash } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { logger } from '@renderer/core/logger';

type FormValues = {
  name: string;
  sources: SourcePath[];
};

type KnowledgeFormProperties = {
  initialValues?: FormValues;
  onSubmit: (values: { name: string; sources: SourcePath[] }) => Promise<void>;
};

export function KnowledgeForm({ initialValues, onSubmit }: KnowledgeFormProperties) {
  const navigate = useNavigate();

  const form = useForm<FormValues>({
    initialValues: initialValues || {
      name: '',
      sources: [],
    },
  });

  const selectFolders = async () => {
    const folders = await window.api.openDirectoryDialog();
    if (folders === null) {
      return;
    }

    const currentSources = form.getValues().sources;
    const newFolders = folders
      .map((folder): SourcePath => ({ type: 'directory', path: folder }))
      .filter((newSource) => !currentSources.some((existing) => existing.path === newSource.path));

    form.setValues({
      sources: [...currentSources, ...newFolders],
    });
  };

  const addFiles = (files: File[]) => {
    const currentSources = form.getValues().sources;
    const filePaths: (string | null)[] = files.map((file) => {
      try {
        return window.api.getFilePath(file);
      } catch (error) {
        logger('Could not get file path', error);
        return null;
      }
    });

    const newSources = filePaths
      .filter((file) => file !== null)
      .map((file): SourcePath => ({ type: 'file', path: String(file) }))
      .filter((newSource) => !currentSources.some((existing) => existing.path === newSource.path));

    form.setValues({
      sources: [...currentSources, ...newSources],
    });
  };

  const deleteSource = (pathToDelete: string) => {
    const currentSources = form.getValues().sources;
    form.setValues({
      sources: currentSources.filter((source) => source.path !== pathToDelete),
    });
  };

  return (
    <form onSubmit={form.onSubmit((values) => void onSubmit(values))}>
      <Stack>
        <TextInput
          label="Name"
          placeholder="Enter knowledge set name"
          required
          {...form.getInputProps('name')}
        />

        {form.getValues().sources.length > 0 && (
          <Stack>
            {form.getValues().sources.map((source) => (
              <Group key={source.path} justify="space-between" wrap="nowrap">
                <Group wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
                  {source.type === 'directory' ? <IconFolder /> : <IconFile />}
                  <Text size="sm" truncate>
                    {source.path}
                  </Text>
                </Group>
                <ActionIcon color="red" variant="subtle" onClick={() => deleteSource(source.path)}>
                  <IconTrash size="1rem" />
                </ActionIcon>
              </Group>
            ))}
          </Stack>
        )}

        {form.getValues().sources.length === 0 && <Text>No folders or files selected</Text>}

        <Button variant="outline" onClick={selectFolders} leftSection={<IconFolder />}>
          Add folder
        </Button>
        <FileDropzone mimeTypes={['text/plain']} filesSelected={addFiles} />

        <Group justify="flex-end" mt="md">
          <Button variant="subtle" onClick={() => void navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit">Save</Button>
        </Group>
      </Stack>
    </form>
  );
}
