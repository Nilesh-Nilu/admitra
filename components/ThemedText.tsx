import { StyleSheet, Text, type TextProps } from 'react-native';

import { SIZES_WITH_ALIASES as SIZES } from '@/constants/Sizes';
import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link' | 'poppins' | 'poppinsMedium' | 'poppinsSemiBold' | 'poppinsBold';
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
        type === 'poppins' ? styles.poppins : undefined,
        type === 'poppinsMedium' ? styles.poppinsMedium : undefined,
        type === 'poppinsSemiBold' ? styles.poppinsSemiBold : undefined,
        type === 'poppinsBold' ? styles.poppinsBold : undefined,
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
    fontFamily: 'Poppins-Regular',
  },
  defaultSemiBold: {
    fontSize: SIZES.fontSize.lg,
    lineHeight: 24,
    fontWeight: '600',
    fontFamily: 'Poppins-Medium',
  },
  title: {
    fontSize: SIZES.fontSize32,
    fontWeight: 'bold',
    lineHeight: 32,
    fontFamily: 'Poppins-Bold',
  },
  subtitle: {
    fontSize: SIZES.fontSize['2xl'],
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  },
  link: {
    lineHeight: 30,
    fontSize: SIZES.fontSize.lg,
    color: '#0a7ea4',
    fontFamily: 'Poppins-Regular',
  },
  poppins: {
    fontSize: SIZES.fontSize.lg,
    fontFamily: 'Poppins-Regular',
  },
  poppinsMedium: {
    fontSize: SIZES.fontSize.lg,
    fontFamily: 'Poppins-Medium',
  },
  poppinsSemiBold: {
    fontSize: SIZES.fontSize.lg,
    fontFamily: 'Poppins-SemiBold',
  },
  poppinsBold: {
    fontSize: SIZES.fontSize.lg,
    fontFamily: 'Poppins-Bold',
  },
});
