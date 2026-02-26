import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFileInfo, normalizeFileUri } from '../utils/file';

let BASE_URL = 'http://192.168.10.8:8072/api/v1/';

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 20000,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    async config => {
        if (!config.headers['X-Custom-BaseURL']) {
            const [serverIp, port] = await AsyncStorage.multiGet(['server_ip', 'port']);
            if (serverIp[1] && port[1]) {
                config.baseURL = `${serverIp[1]}:${port[1]}/api/v1/`;
            }
        } else {
            delete config.headers['X-Custom-BaseURL'];
        }
        if (config.baseURL && !config.baseURL.includes('http')) {
            config.baseURL = 'http://' + config.baseURL;
        }
        console.log('LOG : config:', config)
        return config;
    },
    error => Promise.reject(error)
);

api.interceptors.response.use(
    response => response,
    async error => {
        if (error.response?.status === 525) {
            return Promise.reject(error);
        }

        return Promise.reject(error);
    }
);

export const uploadToEndpoint = async (
    fileUri: string,
    endpoint: string,
    fileName?: string,
    mimeType?: string
): Promise<any> => {
    const normalizedUri = normalizeFileUri(fileUri);
    const fileInfo = getFileInfo(fileUri, fileName, mimeType);

    try {
        const fileResponse = await fetch(normalizedUri);
        const blob = await fileResponse.blob();

        const response = await fetch(endpoint, {
            method: 'PUT',
            body: blob,
            headers: {
                'Content-Type': fileInfo.mimeType,
                'Content-Disposition': `attachment; filename="${fileInfo.fileName}"`,
            },
        });
        console.log('LOG : uploadToEndpoint : response:', response)

        if (response.status === 200) {
            return response;
        } else {
            throw new Error(`Upload failed: ${response.status}`);
        }
    } catch (err) {
        return {
            code: -1,
            data: null,
            msg: err instanceof Error ? err.message : String(err),
        };
    }
};

export const uploadFile = async (fileUri: string, baseUrl: string, fileName?: string, mimeType?: string) => {
    return uploadToEndpoint(fileUri, baseUrl, fileName, mimeType);
};

export const get = async <T = any>(
    url: string,
    params?: Record<string, any>,
    baseUrl?: string
): Promise<T> => {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    const config = baseUrl ? {
        baseURL: baseUrl + '/api/v1',
        headers: { 'X-Custom-BaseURL': 'true' },
    } : {};
    const response = await api.get<T>(url + queryString, config);
    return response.data;
};

export const post = async <T = any>(
    url: string,
    data?: any,
    baseUrl?: string
): Promise<T> => {
    const config = baseUrl ? {
        baseURL: baseUrl + '/api/v1',
        headers: { 'X-Custom-BaseURL': 'true' },
    } : {};
    const response = await api.post<T>(url, data, config);
    return response.data;
};

export const put = async <T = any>(
    url: string,
    data?: any,
    baseUrl?: string
): Promise<T> => {
    const config = baseUrl ? {
        baseURL: baseUrl + '/api/v1',
        headers: { 'X-Custom-BaseURL': 'true' },
    } : {};
    const response = await api.put<T>(url, data, config);
    return response.data;
};

export const del = async <T = any>(
    url: string,
    id: string,
    baseUrl?: string
): Promise<T> => {
    const config = baseUrl ? {
        baseURL: baseUrl + '/api/v1',
        headers: { 'X-Custom-BaseURL': 'true' },
    } : {};
    const response = await api.delete<T>(url, { ...config, params: { id } });
    return response.data;
};

export default api;
