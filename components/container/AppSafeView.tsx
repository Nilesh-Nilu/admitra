import { COLORS } from '@/constants/Colors';
import { SIZES_WITH_ALIASES as SIZES } from '@/constants/Sizes';
import React from 'react';
import { ViewStyle } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

interface AppSafeViewProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
}

const AppSafeView: React.FC<AppSafeViewProps> = ({ children, style }) => {
  const theme = 'light';

  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={[
          {
            flex: 1,
            backgroundColor:
              theme == 'light' ? COLORS.white : COLORS.black,
            padding: SIZES.padding,
          },
          style,
        ]}
      >
        {children}
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default AppSafeView;
