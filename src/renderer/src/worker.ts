import { ollamaApi } from '@renderer/services/ollama/api';

export type GenerateTitleMessage = {
  type: 'generateTitle';
  message: string;
  modelTag: string;
};
export type GenerateTitleResponse = {
  type: 'titleGenerated';
  title: string;
};
export type ErrorResponse = {
  type: 'error';
  error: string;
};

async function generateTitle(message: string, modelTag: string): Promise<string> {
  const response = await ollamaApi.generate({
    model: modelTag,
    prompt: `Based on the opening message: "${message}", suggest a short, descriptive title (up to 6 words) that captures the main topic or purpose of the potential conversation. Reply with ONLY the title.`,
    stream: false,
  });

  const reply = response.response.trim();
  // Remove any quotes from the start and end of the reply
  return reply.replaceAll(/^"|"$/g, '');
}

// eslint-disable-next-line unicorn/prefer-add-event-listener
self.onmessage = async (event: MessageEvent<GenerateTitleMessage>) => {
  if (event.data.type === 'generateTitle') {
    try {
      const title = await generateTitle(event.data.message, event.data.modelTag);
      self.postMessage({ type: 'titleGenerated', title } satisfies GenerateTitleResponse);
    } catch (error) {
      self.postMessage({ type: 'error', error: (error as Error).message } satisfies ErrorResponse);
    }
  }
};

export {};
