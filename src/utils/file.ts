import { Platform } from 'react-native';
import RNFS from 'react-native-fs';
import { mimeTypeMap } from '../types/file';

export const getFileUrl = (fileId: string) => `http://192.168.10.8:8072/api/v1/generalPicture?id=${fileId}`;

export const copyContentUriToFile = async (contentUri: string): Promise<string> => {
    try {
        const destPath = `${RNFS.TemporaryDirectoryPath}temp_${Date.now()}.jpg`;
        await RNFS.copyFile(contentUri, destPath);
        return `file://${destPath}`;
    } catch (error) {
        throw error;
    }
};

export const getFileSize = async (fileUri: string): Promise<number> => {
    try {
        let uri = fileUri;

        if (uri.startsWith('content://')) {
            uri = await copyContentUriToFile(uri);
        }

        if (uri.startsWith('file://')) {
            const filePath = uri.replace('file://', '');
            const fileInfo = await RNFS.stat(filePath);
            const size = fileInfo.size;

            if (size < 1024) return size; // B
            return Number((size / 1024).toFixed(1)); // KB
            // return Number((size / (1024 * 1024)).toFixed(1)); // MB
        }

        return 0;
    } catch (error) {
        return 0;
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
