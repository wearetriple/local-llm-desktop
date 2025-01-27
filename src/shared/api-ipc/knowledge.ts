export type SourcePath = {
  path: string;
  type: 'file' | 'directory';
};

export type KnowledgeSet = {
  id: string;
  name: string;
  sources: SourcePath[];
};

export const LIST_KNOWLEDGE_SETS = 'list-knowledge-sets';
export const CREATE_KNOWLEDGE_SET = 'create-knowledge-set';
export const UPDATE_KNOWLEDGE_SET = 'update-knowledge-set';
export const DELETE_KNOWLEDGE_SET = 'delete-knowledge-set';
