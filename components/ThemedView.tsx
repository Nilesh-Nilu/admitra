import React from 'react';
import { type ViewProps } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/Colors';
import { SIZES } from '@/constants/Sizes';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  children?: React.ReactNode;
};

export function ThemedView({ style, lightColor, darkColor, children, ...otherProps }: ThemedViewProps) {

  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={[
          {
            flex: 1,
            backgroundColor: COLORS.white,
            paddingHorizontal: SIZES.padding,
          },
          style,
        ]}
        {...otherProps}
      >
        {children}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
