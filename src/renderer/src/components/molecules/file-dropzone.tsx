/* eslint-disable @typescript-eslint/no-misused-promises */
import { Group, Paper, Text } from '@mantine/core';
import { IconFile, IconHandMove, IconUpload, IconX } from '@tabler/icons-react';
import { useEffect, useRef, useState } from 'react';

type Properties = {
  mimeTypes: string[];
  filesSelected: (files: File[]) => void | Promise<void>;
};

export function FileDropzone({ mimeTypes, filesSelected }: Properties) {
  const dropzoneReference = useRef<HTMLDivElement>(null);
  const uploadReference = useRef<HTMLInputElement>(null);

  const [state, setState] = useState<'idle' | 'dragging' | 'reject' | 'accept'>('idle');

  const handleClick = () => {
    if (uploadReference.current) {
      uploadReference.current.click();
    }
  };

  const validateFiles = (files: File[]): boolean => {
    return files.every((file) => mimeTypes.includes(file.type));
  };

  useEffect(() => {
    if (!dropzoneReference.current) {
      return;
    }
    const dropzone = dropzoneReference.current;

    const preventDefault = (event: Event) => event.preventDefault();

    const handleDragOver = () => {
      setState('dragging');
    };

    const handleDragLeave = () => {
      setState('idle');
    };

    const handleDrop = (event: DragEvent) => {
      event.preventDefault();

      const files = event.dataTransfer?.files;
      if (files) {
        const fileArray = [...files];
        const isValid = validateFiles(fileArray);
        setState(isValid ? 'accept' : 'reject');

        if (isValid) {
          void filesSelected(fileArray);
        }

        // Reset state after a short delay
        setTimeout(() => setState('idle'), 1000);
      }
    };

    // Add event listeners
    for (const event of ['dragenter', 'dragover', 'dragleave', 'drop']) {
      dropzone.addEventListener(event, preventDefault);
    }

    dropzone.addEventListener('dragover', handleDragOver);
    dropzone.addEventListener('dragleave', handleDragLeave);
    dropzone.addEventListener('drop', handleDrop);

    // Cleanup event listeners on component unmount
    return () => {
      for (const event of ['dragenter', 'dragover', 'dragleave', 'drop']) {
        dropzone.removeEventListener(event, preventDefault);
      }
      dropzone.removeEventListener('dragover', handleDragOver);
      dropzone.removeEventListener('dragleave', handleDragLeave);
      dropzone.removeEventListener('drop', handleDrop);
    };
  }, []);

  const fileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) {
      return;
    }

    const fileArray = [...event.target.files];
    const isValid = validateFiles(fileArray);
    setState(isValid ? 'accept' : 'reject');

    if (isValid) {
      void filesSelected(fileArray);
    }

    // Reset state after a short delay
    setTimeout(() => setState('idle'), 1000);

    if (uploadReference.current) {
      uploadReference.current.value = '';
    }
  };

  return (
    <>
      <Group
        justify="center"
        gap="md"
        ref={dropzoneReference}
        onClick={handleClick}
        style={{ cursor: 'pointer' }}
      >
        {state === 'accept' && (
          <IconUpload size={52} color="var(--mantine-color-blue-6)" stroke={1.5} />
        )}
        {state === 'reject' && <IconX size={52} color="var(--mantine-color-red-6)" stroke={1.5} />}
        {state === 'dragging' && <IconHandMove size={52} stroke={1.5} />}

        {state === 'idle' && (
          <IconFile size={52} color="var(--mantine-color-dimmed)" stroke={1.5} />
        )}

        <Paper withBorder radius="md" p="md">
          <Text size="lg" inline>
            Drag files here or click to select
          </Text>
          <Text size="sm" c="dimmed" inline mt={5}>
            Add as many files as you like.
          </Text>
        </Paper>
      </Group>

      <input
        type="file"
        ref={uploadReference}
        multiple
        accept={mimeTypes.join(',')}
        onChange={fileSelected}
        className="is-hidden"
      />
    </>
  );
}
