import { Container, Title } from '@mantine/core';
import { PersonaForm } from '@renderer/components/organisms/personas-panel/persona-form';
import { PersonasContainer } from '@renderer/state/personas';
import { useNavigate, useParams } from 'react-router-dom';

export function EditPersona() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { personas, updatePersonas } = PersonasContainer.useContainer();

  const persona = personas?.find((p) => p.id === id);
  if (!persona) {
    void navigate(-1);
    return null;
  }

  const handleSubmit = async (values: { name: string; description: string; prompt: string }) => {
    if (!personas) {
      return;
    }

    const updatedPersonas = personas
      .map((p) => (p.id === id ? { ...p, ...values } : p))
      .sort((a, b) => a.name.localeCompare(b.name));

    await updatePersonas(updatedPersonas);
    await navigate(-1);
  };

  return (
    <Container size="sm" py="xl">
      <Title order={2} mb="lg">
        Edit Persona
      </Title>
      <PersonaForm initialValues={persona} onSubmit={handleSubmit} />
    </Container>
  );
}
