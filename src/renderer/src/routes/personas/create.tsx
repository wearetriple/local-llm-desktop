import { Container, Title } from '@mantine/core';
import { PersonaForm } from '@renderer/components/organisms/personas-panel/persona-form';
import { PersonasContainer } from '@renderer/state/personas';
import { useNavigate } from 'react-router-dom';

export function CreatePersona() {
  const navigate = useNavigate();
  const { personas, updatePersonas } = PersonasContainer.useContainer();

  const handleSubmit = async (values: { name: string; description: string; prompt: string }) => {
    if (!personas) {
      return;
    }

    const newPersona = {
      id: crypto.randomUUID(),
      ...values,
    };

    await updatePersonas([...personas, newPersona].sort((a, b) => a.name.localeCompare(b.name)));
    await navigate(-1);
  };

  return (
    <Container miw="500px" py="xl">
      <Title order={2} mb="lg">
        Create New Persona
      </Title>
      <PersonaForm onSubmit={handleSubmit} />
    </Container>
  );
}
