import { Platform } from 'react-native';
import RNFS from 'react-native-fs';
import { mimeTypeMap } from '../types/file';

export const copyContentUriToFile = async (contentUri: string): Promise<string> => {
    try {
        const destPath = `${RNFS.TemporaryDirectoryPath}temp_${Date.now()}.jpg`;
        await RNFS.copyFile(contentUri, destPath);
        return `file://${destPath}`;
    } catch (error) {
        throw error;
    }
};

export const normalizeFileUri = (fileUri: string): string => {
    if (Platform.OS === 'android') {
        if (fileUri.startsWith('content://') || fileUri.startsWith('file://')) {
            return fileUri;
        }
        return 'file://' + fileUri;
    }

    return fileUri;
};

export const getFileInfo = (fileUri: string, customFileName?: string, customMimeType?: string) => {
    const fileName = customFileName || fileUri.split('/').pop();
    const extension = fileUri.split('.').pop()?.toLowerCase() || '';
    const mimeType = customMimeType || mimeTypeMap[extension] || 'application/octet-stream';

    return { fileName, mimeType };
};
