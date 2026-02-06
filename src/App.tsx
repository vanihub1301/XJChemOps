
import '../global.css';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppContent } from './components/app/AppContent';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import LoadAssets from './components/app/LoadAssets';
import ErrorBoundary from './components/app/ErrorBoundary';
import CodePush from 'react-native-code-push';

export const codePushOptions = {
  checkFrequency: CodePush.CheckFrequency.ON_APP_RESUME,
  installMode: CodePush.InstallMode.IMMEDIATE,
  updateDialog: {
    appendReleaseDescription: true,
    title: 'a new update is available!',
  },
};

function App(): React.JSX.Element {

  return (
    <ErrorBoundary>
      <GestureHandlerRootView>
        <SafeAreaProvider>
          <LoadAssets>
            <BottomSheetModalProvider>
              <AppContent />
            </BottomSheetModalProvider>
          </LoadAssets>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

export default CodePush(codePushOptions)(App);

