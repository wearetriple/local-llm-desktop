import { Ollama } from 'ollama';

interface PullProgress {
  status: string;
  digest?: string;
  total?: number;
  completed?: number;
}

interface PullOptions {
  onProgress?: (progress: PullProgress) => void;
}

export const ollamaApi = new Ollama();

export async function pullModel(model: string, options?: PullOptions) {
  const response = await ollamaApi.pull({ model, stream: true });

  for await (const part of response) {
    if (part.status === 'success') {
      return;
    }

    if (options?.onProgress) {
      options.onProgress({
        status: part.status,
        digest: part.digest,
        total: part.total,
        completed: part.completed,
      });
    }
  }
}
