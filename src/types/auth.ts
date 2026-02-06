export interface AuthState {
    fullName: string | null;
    isLoading: boolean;
    firstRunning: boolean;
    rotatingTank: Record<string, any>
    isSignedIn: boolean;
    initialize: () => Promise<void>;
    setName: ({ fullName }: { fullName: string }) => Promise<void>;
    setAuth: ({ isSignedIn }: { isSignedIn: boolean }) => Promise<void>;
    setRotatingTank: ({ rotatingTank }: { rotatingTank: Record<string, any> }) => Promise<void>;
    logout: () => Promise<void>;
}
