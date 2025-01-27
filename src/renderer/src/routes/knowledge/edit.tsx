import { Container, Title } from '@mantine/core';
import { KnowledgeForm } from '@renderer/components/organisms/knowledge-panel/knowledge-form';
import { KnowledgeContainer } from '@renderer/state/knowledge';
import { SourcePath } from '@shared/api-ipc/knowledge';
import { useNavigate, useParams } from 'react-router-dom';

export function EditKnowledge() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { knowledgeSets, updateKnowledgeSet } = KnowledgeContainer.useContainer();

  const knowledge = knowledgeSets?.find((k) => k.id === id);
  if (!knowledge) {
    void navigate(-1);
    return null;
  }

  const handleSubmit = async (values: { name: string; sources: SourcePath[] }) => {
    if (!knowledge || !id) {
      return;
    }

    await updateKnowledgeSet({ id: id ?? '', ...values });
    await navigate(-1);
  };

  return (
    <Container miw="500px" py="xl">
      <Title order={2} mb="lg">
        Edit Knowledge Set
      </Title>
      {knowledge && <KnowledgeForm initialValues={knowledge} onSubmit={handleSubmit} />}
    </Container>
  );
}
