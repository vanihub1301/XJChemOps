export interface AuthState {
    fullName: string | null;
    isLoading: boolean;
    firstRunning: boolean;
    rotatingTank: Record<string, any>
    isSignedIn: boolean;
    timeLogin: string;
    initialize: () => Promise<void>;
    setName: ({ fullName }: { fullName: string }) => Promise<void>;
    setAuth: ({ isSignedIn }: { isSignedIn: boolean }) => Promise<void>;
    setRotatingTank: ({ rotatingTank }: { rotatingTank: Record<string, any> }) => Promise<void>;
    setTimeLogin: ({ timeLogin }: { timeLogin: string }) => Promise<void>;
    setLoading: ({ isLoading }: { isLoading: boolean }) => Promise<void>;
    logout: () => Promise<void>;
}

export interface User {
    code: string;
    name: string;
}

