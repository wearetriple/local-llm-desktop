import { useApiIpc } from '@renderer/hooks/use-api-ipc';
import { KnowledgeSet } from '@shared/api-ipc/knowledge';
import { createContainer } from 'unstated-next';

function useKnowledge() {
  const { data: knowledgeSets, refresh } = useApiIpc(() => window.api.listKnowledgeSets());

  const updateKnowledgeSet = async (knowledgeSet: KnowledgeSet) => {
    await window.api.updateKnowledgeSet(knowledgeSet.id, knowledgeSet.name, knowledgeSet.sources);

    await refresh();
  };

  const createKnowledgeSet = async (knowledgeSet: Omit<KnowledgeSet, 'id'>) => {
    await window.api.createKnowledgeSet(knowledgeSet.name, knowledgeSet.sources);

    await refresh();
  };

  const deleteKnowledgeSet = async (knowledgeSetId: string) => {
    await window.api.deleteKnowledgeSet(knowledgeSetId);

    await refresh();
  };

  return {
    knowledgeSets,
    updateKnowledgeSet,
    createKnowledgeSet,
    deleteKnowledgeSet,
  };
}

export const KnowledgeContainer = createContainer(useKnowledge);
