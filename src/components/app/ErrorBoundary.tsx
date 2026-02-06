import React, { Component, ReactNode } from 'react';
import { View } from 'react-native';
import { Text } from '../common/Text';
import { Button } from '../common/Button';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: any) {
        // console.error('Error caught by boundary:', error, errorInfo);
    }

    resetError = () => {
        this.setState({ hasError: false, error: undefined });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <View className="flex-1 justify-center items-center p-4">
                    <Text variant="pageTitle" className="text-red-500 mb-2">
                        Oops! Something went wrong 😢
                    </Text>
                    <Text variant="body" className="text-center mb-4">
                        {this.state.error?.message || 'An unexpected error occurred'}
                    </Text>
                    <Button label='Try Again' variant="primary" onPress={this.resetError} />
                </View>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;