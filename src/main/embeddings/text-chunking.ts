import { logger } from '../core/logger';

export type ChunkingOptions = {
  /**
   * The target size for each chunk in characters
   */
  chunkSize: number;
  /**
   * The percentage of overlap with previous and next chunks (0-1)
   * Default: 0.1 (10%)
   */
  overlapPercentage?: number;
};

/**
 * Splits text into chunks with configurable overlap between chunks
 * @param text The text to split into chunks
 * @param options Chunking configuration options
 * @returns Array of text chunks with overlap
 */
export function createOverlappingChunks(text: string, options: ChunkingOptions): string[] {
  // Input validation
  if (!text || typeof text !== 'string') {
    return [];
  }

  // Clean and normalize the input text
  let cleanedText = text
    .replaceAll('\r\n', '\n') // Normalize line endings
    .replaceAll('\t', ' ') // Replace tabs with spaces
    .replaceAll(/\s+/g, ' ') // Normalize multiple spaces
    .trim();

  if (cleanedText.length === 0) {
    return [];
  }

  const { chunkSize, overlapPercentage = 0.1 } = options;

  // Validate and sanitize chunk size
  const validChunkSize = Math.max(100, Math.min(chunkSize, 2000)); // More conservative limits
  const validOverlapPercentage = Math.max(0.05, Math.min(overlapPercentage, 0.3)); // More conservative overlap

  // Handle edge cases
  if (cleanedText.length <= validChunkSize) {
    return [cleanedText];
  }

  try {
    const overlapSize = Math.floor(validChunkSize * validOverlapPercentage);
    const chunks: string[] = [];
    let currentPosition = 0;

    // Safety check for text length
    if (cleanedText.length > 1_000_000) {
      // 1MB limit
      logger('Text too large, truncating to 1MB');
      cleanedText = cleanedText.slice(0, 1_000_000);
    }

    while (currentPosition < cleanedText.length) {
      // Ensure we don't exceed text length
      const remainingLength = cleanedText.length - currentPosition;
      const currentChunkSize = Math.min(validChunkSize, remainingLength);

      // Calculate end position with bounds checking
      let endPosition = Math.min(currentPosition + currentChunkSize, cleanedText.length);

      // If we're not at the last chunk and have room for overlap
      if (endPosition < cleanedText.length && remainingLength > overlapSize) {
        // Look for natural break within a safe overlap region
        const maxSearchDistance = Math.min(overlapSize, remainingLength - currentChunkSize);
        const searchEndPosition = Math.min(endPosition + maxSearchDistance, cleanedText.length);

        const naturalBreak = findNaturalBreakPoint(cleanedText, endPosition, searchEndPosition);
        if (naturalBreak !== null && naturalBreak > endPosition) {
          endPosition = naturalBreak;
        }
      }

      // Extract chunk with bounds checking
      if (currentPosition < endPosition && endPosition <= cleanedText.length) {
        const chunk = cleanedText.slice(currentPosition, endPosition).trim();
        if (chunk.length > 0 && chunk.length <= validChunkSize * 1.5) {
          // Ensure chunk isn't too large
          chunks.push(chunk);
        }
      }

      // Move position forward
      const nextPosition = endPosition - overlapSize;
      // eslint-disable-next-line unicorn/prefer-ternary
      if (nextPosition <= currentPosition) {
        // Prevent getting stuck
        currentPosition = endPosition;
      } else {
        currentPosition = nextPosition;
      }

      // Emergency break if we're not making progress
      if (chunks.length > cleanedText.length / 10) {
        // Sanity check
        logger('Too many chunks created, stopping');
        break;
      }
    }

    return chunks;
  } catch (error) {
    logger('Error in createOverlappingChunks:', error);
    return [];
  }
}

/**
 * Finds a natural break point in text (space, period, etc.) between start and end positions
 * @param text The text to search in
 * @param start Start position to search from
 * @param end End position to search to
 * @returns Position of the natural break, or null if none found
 */
function findNaturalBreakPoint(text: string, start: number, end: number): number | null {
  if (!text || start < 0 || end > text.length || start >= end) {
    return null;
  }

  try {
    // Priority list of break characters (from most preferred to least)
    const breakCharacters = ['. ', '? ', '! ', '\n', '. ', ', ', ' '];

    const searchText = text.slice(start, end);
    for (const breakChar of breakCharacters) {
      const breakIndex = searchText.lastIndexOf(breakChar);
      if (breakIndex !== -1 && breakIndex < searchText.length) {
        const absolutePosition = start + breakIndex + breakChar.length;
        if (absolutePosition > start && absolutePosition <= end) {
          return absolutePosition;
        }
      }
    }
  } catch (error) {
    logger('Error in findNaturalBreakPoint:', error);
  }

  return null;
}
