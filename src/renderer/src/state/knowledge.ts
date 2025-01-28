import { useApiIpc } from '@renderer/hooks/use-api-ipc';
import type { KnowledgeSet } from '@shared/api-ipc/knowledge';
import { useState } from 'react';
import { createContainer } from 'unstated-next';

function useKnowledge() {
  const { data: knowledgeSets, refresh } = useApiIpc(() => window.api.listKnowledgeSets());
  const [selectedSets, setSelectedSets] = useState<string[]>([]);

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
    selectedSets,
    toggleKnowledgeSet: (knowledgeSetId: string) => {
      setSelectedSets((previous) => {
        if (previous.includes(knowledgeSetId)) {
          return previous.filter((id) => id !== knowledgeSetId);
        }
        return [...previous, knowledgeSetId];
      });
    },
  };
}

export const KnowledgeContainer = createContainer(useKnowledge);
