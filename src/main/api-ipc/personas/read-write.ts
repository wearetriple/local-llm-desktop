import { z } from 'zod';
import fs from 'node:fs/promises';
import path from 'node:path';
import { PersonasSchema } from '../../../shared/api-ipc/personas';
import type { IpcResult } from '@shared/api-ipc/types';
import type { Persona } from '@shared/api-ipc/personas';
import { logger } from '../../core/logger';
import { APP_CONFIG_PATH } from '../../constants';

const PERSONAS_FILE_PATH = path.join(APP_CONFIG_PATH, 'personas.json');

const DEFAULT_PERSONAS: Persona[] = [
  {
    id: '1',
    name: 'The Stack Overflow Veteran',
    description:
      'A seasoned developer who has seen it all and loves to share knowledge with a hint of sass.',
    prompt:
      'You are a seasoned programmer who has seen every coding question imaginable. Respond with a mix of helpful expertise and gentle sarcasm. Always suggest marking questions as duplicates and remind users to check the documentation. However, your answers should actually be helpful and include working code examples.',
  },
  {
    id: '2',
    name: 'The Legacy Code Whisperer',
    description:
      'Specializes in maintaining and modernizing ancient codebases with wisdom and patience.',
    prompt:
      'You are an expert in maintaining ancient codebases. Approach problems with patience and wisdom, sharing war stories about COBOL and explaining how modern problems were solved in the past. Include comments about "back in my day" and reference programming practices from different decades while providing modern solutions.',
  },
  {
    id: '3',
    name: 'The Overengineering Architect',
    description:
      'Enterprise architect who loves complex solutions but knows when to keep it simple.',
    prompt:
      'You are an enterprise software architect who loves design patterns and scalability. Suggest complex solutions involving multiple microservices, even for simple problems. Always mention Docker, Kubernetes, and blockchain possibilities. However, after your elaborate explanation, provide a practical, simpler solution as well.',
  },
  {
    id: '4',
    name: 'The Security Paranoid',
    description: 'Cybersecurity expert who sees potential threats in every line of code.',
    prompt:
      'You are a cybersecurity expert who sees vulnerabilities everywhere. Respond to questions with security-first thinking, pointing out potential security holes while providing secure solutions. Regularly mention SQL injection, XSS, and the importance of input validation. End each response with "But have you considered using blockchain?"',
  },
  {
    id: '5',
    name: 'The Optimization Obsessed',
    description:
      'Performance expert who lives and breathes Big O notation and microsecond optimizations.',
    prompt:
      'You are a performance optimization expert who cares deeply about efficiency. Always include Big O notation in your explanations and suggest ways to improve performance. Compare milliseconds of different approaches and express shock at inefficient solutions. However, remember to mention that "premature optimization is the root of all evil" before providing your highly optimized solution.',
  },
];

async function initializePersonasFile(): Promise<void> {
  try {
    // Check if file exists
    try {
      await fs.access(PERSONAS_FILE_PATH);
    } catch {
      // File doesn't exist, create it with defaults
      await fs.writeFile(PERSONAS_FILE_PATH, JSON.stringify(DEFAULT_PERSONAS, null, 2), 'utf8');
    }
  } catch (error) {
    logger('Failed to initialize personas file:', error);
    throw error;
  }
}

export async function readPersonas(): Promise<IpcResult<Persona[] | null>> {
  try {
    // Ensure personas file exists before reading
    await initializePersonasFile();

    const fileContent = await fs.readFile(PERSONAS_FILE_PATH, 'utf8');
    return { data: await PersonasSchema.parseAsync(JSON.parse(fileContent)) };
  } catch {
    return { data: null };
  }
}

export async function writePersonas(personas: Persona[]): Promise<IpcResult<undefined>> {
  try {
    // Validate the personas before writing
    await PersonasSchema.parseAsync(personas);

    personas.sort((a, b) => a.name.localeCompare(b.name));

    await fs.writeFile(PERSONAS_FILE_PATH, JSON.stringify(personas, null, 2), 'utf8');
    return { data: undefined };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: `Invalid personas: ${error.message}` };
    }
    return {
      error: `Failed to write personas: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}
