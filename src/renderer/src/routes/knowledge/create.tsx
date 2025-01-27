import { Container, Title } from '@mantine/core';
import { KnowledgeForm } from '@renderer/components/organisms/knowledge-panel/knowledge-form';
import { KnowledgeContainer } from '@renderer/state/knowledge';
import { SourcePath } from '@shared/api-ipc/knowledge';
import { useNavigate } from 'react-router-dom';

export function CreateKnowledge() {
  const navigate = useNavigate();
  const { knowledgeSets, createKnowledgeSet } = KnowledgeContainer.useContainer();

  const handleSubmit = async (values: { name: string; sources: SourcePath[] }) => {
    if (!knowledgeSets) {
      return;
    }

    const newKnowledge = {
      id: crypto.randomUUID(),
      ...values,
    };

    await createKnowledgeSet(newKnowledge);
    await navigate(-1);
  };

  return (
    <Container miw="500px" py="xl">
      <Title order={2} mb="lg">
        Create New Knowledge Set
      </Title>
      <KnowledgeForm onSubmit={handleSubmit} />
    </Container>
  );
}
