export type SupportedFileExtension =
  | 'docx'
  | 'pptx'
  | 'xlsx'
  | 'odt'
  | 'odp'
  | 'ods'
  | 'pdf'
  | 'txt';

export const MIME_TYPES: Record<SupportedFileExtension, string> = {
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  odt: 'application/vnd.oasis.opendocument.text',
  odp: 'application/vnd.oasis.opendocument.presentation',
  ods: 'application/vnd.oasis.opendocument.spreadsheet',
  pdf: 'application/pdf',
  txt: 'text/plain',
};

export const FILE_EXTENSIONS = Object.keys(MIME_TYPES) as SupportedFileExtension[];

export const isValidFileExtension = (extension: string): extension is SupportedFileExtension => {
  return FILE_EXTENSIONS.includes(extension as SupportedFileExtension);
};
