/**
 * Shadow Utility
 * Helper function to apply consistent shadows across iOS and Android
 */

import { ViewStyle } from 'react-native';
import { shadows } from '../theme/tokens';

type ShadowSize = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'card' | 'modal';

export function applyShadow(size: ShadowSize = 'md'): ViewStyle {
  return shadows[size];
}

export function createCustomShadow(
  color: string,
  offset: { width: number; height: number },
  opacity: number,
  radius: number,
  elevation: number
): ViewStyle {
  return {
    shadowColor: color,
    shadowOffset: offset,
    shadowOpacity: opacity,
    shadowRadius: radius,
    elevation,
  };
}
