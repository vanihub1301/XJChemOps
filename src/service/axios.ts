import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFileInfo, normalizeFileUri } from '../utils/file';

const BASE_URL = 'http://192.168.10.8:8072/api/v1/';

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 20000,
    headers: {
        'Content-Type': 'application/json',
    },
});

const refreshApi = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

api.interceptors.request.use(
    async config => {
        const token = await AsyncStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        console.log('LOG : config:', config);
        return config;
    },
    error => Promise.reject(error)
);

api.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;

        if (error.response?.status === 525) {
            return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(token => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return api(originalRequest);
                    })
                    .catch(err => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshToken = await AsyncStorage.getItem('refresh_token');

                if (!refreshToken) {
                    throw new Error('No refresh token available');
                }

                const refreshResponse = await refreshApi.post('auth/reGenerateToken', {
                    refreshToken,
                });

                const newAccessToken =
                    refreshResponse.data.data?.accessToken ||
                    refreshResponse.data.data?.access_token;
                const newRefreshToken =
                    refreshResponse.data.data?.refreshToken ||
                    refreshResponse.data.data?.refresh_token ||
                    refreshToken;

                if (!newAccessToken) {
                    throw new Error('No access token received');
                }

                await AsyncStorage.setItem('access_token', newAccessToken);
                await AsyncStorage.setItem('refresh_token', newRefreshToken);

                processQueue(null, newAccessToken);

                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return api(originalRequest);

            } catch (refreshError) {
                processQueue(refreshError, null);
                await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'remember_me']);

                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
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

    const formData = new FormData();
    formData.append('file', {
        uri: normalizedUri,
        name: fileInfo.fileName,
        type: fileInfo.mimeType,
    } as any);

    try {
        const response = await fetch(endpoint, {
            method: 'PUT',
            body: formData,
            headers: {
                Accept: 'multipart/form-data',
            },
        });

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

export const uploadFaceDetection = async (imageUri: string) => {
    return uploadToEndpoint(imageUri, 'http://192.168.13.74:8000/check-face');
};

export const get = async <T = any>(
    url: string,
    params?: Record<string, any>,
    baseUrl?: string
): Promise<T> => {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    const config = baseUrl ? { baseURL: baseUrl + '/api/v1' } : {};
    const response = await api.get<T>(url + queryString, config);
    return response.data;
};

export const post = async <T = any>(
    url: string,
    data?: any,
    baseUrl?: string
): Promise<T> => {
    const config = baseUrl ? { baseURL: baseUrl + '/api/v1' } : {};
    const response = await api.post<T>(url, data, config);
    return response.data;
};

export const put = async <T = any>(
    url: string,
    data?: any,
    baseUrl?: string
): Promise<T> => {
    const config = baseUrl ? { baseURL: baseUrl + '/api/v1' } : {};
    const response = await api.put<T>(url, data, config);
    return response.data;
};

export const del = async <T = any>(
    url: string,
    id: string,
    baseUrl?: string
): Promise<T> => {
    const config = baseUrl ? { baseURL: baseUrl + '/api/v1' } : {};
    const response = await api.delete<T>(url, { ...config, params: { id } });
    return response.data;
};

export default api;
