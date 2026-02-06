export const mimeTypeMap: { [key: string]: string } = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};

export interface FileItem {
    id: number;
    name: string;
    type: string;
    createdAt: Date;
    size?: string;
    uploadedBy?: string;
}

export interface SelectedFile {
    uri: string;
    name: string;
    displayName: string;
    size: number;
    mimeType: string;
    sizeFormatted: string;
    extension: string;
}