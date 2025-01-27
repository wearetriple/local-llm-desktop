import { Button, Group, Stack, TextInput, Textarea } from '@mantine/core';
import { useForm } from '@mantine/form';
import type { Persona } from '@shared/api-ipc/personas';
import { useNavigate } from 'react-router-dom';

interface PersonaFormProperties {
  initialValues?: Persona;
  onSubmit: (values: Omit<Persona, 'id'>) => Promise<void>;
}

export function PersonaForm({ initialValues, onSubmit }: PersonaFormProperties) {
  const navigate = useNavigate();
  const form = useForm({
    initialValues: initialValues ?? {
      name: '',
      description: '',
      prompt: '',
    },
    validate: {
      name: (value) => (value.length < 2 ? 'Name must be at least 2 characters' : null),
      description: (value) => (value.length === 0 ? 'Description is required' : null),
      prompt: (value) => (value.length === 0 ? 'Prompt is required' : null),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    await onSubmit(values);
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack>
        <TextInput
          label="Name"
          placeholder="Enter persona name"
          required
          {...form.getInputProps('name')}
        />
        <Textarea
          label="Description"
          placeholder="Enter persona description"
          required
          minRows={3}
          maxRows={6}
          autosize
          {...form.getInputProps('description')}
        />
        <Textarea
          label="Prompt"
          placeholder="Enter system prompt for this persona"
          required
          minRows={6}
          maxRows={12}
          autosize
          {...form.getInputProps('prompt')}
        />
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
