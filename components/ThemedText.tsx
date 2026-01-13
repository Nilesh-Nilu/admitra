import { StyleSheet, Text, type TextProps } from 'react-native';

import { SIZES_WITH_ALIASES as SIZES } from '@/constants/Sizes';
import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  children,
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        style,
      ]}
      {...rest}
    >
      {children ?? ''}
    </Text>
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: SIZES.fontSize.lg,
    fontFamily: 'Roboto-Regular',
  },
  defaultSemiBold: {
    fontSize: SIZES.fontSize.lg,
    lineHeight: 24,
    fontWeight: '600',
    fontFamily: 'Roboto-Medium',
  },
  title: {
    fontSize: SIZES.fontSize32,
    fontWeight: 'bold',
    lineHeight: 32,
    fontFamily: 'Roboto-Bold',
  },
  subtitle: {
    fontSize: SIZES.fontSize['2xl'],
    fontWeight: 'bold',
    fontFamily: 'Roboto-Bold',
  },
  link: {
    lineHeight: 30,
    fontSize: SIZES.fontSize.lg,
    color: '#0a7ea4',
    fontFamily: 'Roboto-Regular',
  },
});
