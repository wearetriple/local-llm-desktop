import { useApiIpc } from '@renderer/hooks/use-api-ipc';
import { Persona } from '@shared/api-ipc/personas';
import { useState } from 'react';
import { createContainer } from 'unstated-next';

function usePersonas() {
  const { data, error, loading, refresh } = useApiIpc(() => window.api.getPersonas());
  const [activePersona, setActivePersona] = useState<Persona | null>(null);

  async function updatePersonas(personas: Persona[]) {
    await window.api.writePersonas(personas);
    await refresh();
  }

  return {
    personas: data,
    updatePersonas,
    error,
    loading,
    activePersona,
    setActivePersona,
  };
}

export const PersonasContainer = createContainer(usePersonas);
