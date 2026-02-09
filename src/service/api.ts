import { useState, useCallback, useRef } from 'react';
import { del, get, post, put } from './axios';
import { showToast } from './toast';

export const useAPI = () => {
    const loadingCount = useRef(0);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(async (callback: () => Promise<any>) => {
        setRefreshing(true);
        try {
            await callback();
        } catch (error) {
            showToast('Làm mới thất bại. Vui lòng thử lại.');
        } finally {
            setRefreshing(false);
        }
    }, []);

    const apiCall = useCallback(async <T,>(fn: () => Promise<T>, silent?: boolean): Promise<T> => {
        loadingCount.current += 1;
        if (!silent) { setLoading(true); }

        try {
            return await fn();
        } catch (error: any) {
            throw error;
        } finally {
            loadingCount.current -= 1;
            if (loadingCount.current === 0) {
                if (!silent) { setLoading(false); }
            }
        }
    }, []);

    const getData = useCallback(<T = any>(
        endpoint: string,
        params?: Record<string, any>,
        silent: boolean = true,
        baseUrl?: string
    ): Promise<T> => {
        return apiCall(() => get<T>(endpoint, params, baseUrl), silent);
    }, [apiCall]);

    const postData = useCallback(<T = any>(
        endpoint: string,
        body?: any,
        silent: boolean = true,
        baseUrl?: string
    ): Promise<T> => {
        return apiCall(() => post<T>(endpoint, body, baseUrl), silent);
    }, [apiCall]);

    const putData = useCallback(<T = any>(
        endpoint: string,
        body?: any,
        silent: boolean = true,
        baseUrl?: string
    ): Promise<T> => {
        return apiCall(() => put<T>(endpoint, body, baseUrl), silent);
    }, [apiCall]);

    const deleteData = useCallback(<T = any>(
        endpoint: string,
        id: string,
        silent: boolean = true,
        baseUrl?: string
    ): Promise<T> => {
        return apiCall(() => del<T>(endpoint, id, baseUrl), silent);
    }, [apiCall]);

    return {
        loading,
        refreshing,
        getData,
        postData,
        putData,
        deleteData,
        onRefresh,
    };
};
