export const SYSTEM_GET_DETAILS = 'system:get-details';
export type SystemGetDetails = {
  totalMemory: number; // in bytes
  freeMemory: number; // in bytes
  totalVRAM: number | null; // in bytes
  freeVRAM: number | null; // in bytes
};
