/**
 * Device Utilities
 * Helper functions for device detection and responsive design
 */

import { Dimensions, Platform, StatusBar } from 'react-native';

export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';
export const isWeb = Platform.OS === 'web';

export function getScreenDimensions() {
  const { width, height } = Dimensions.get('window');
  return { width, height };
}

export function getStatusBarHeight(): number {
  if (isIOS) {
    return 44; // Safe area for iOS
  }
  if (isAndroid && StatusBar.currentHeight) {
    return StatusBar.currentHeight;
  }
  return 0;
}

export function isSmallDevice(): boolean {
  const { width } = getScreenDimensions();
  return width < 375;
}

export function isMediumDevice(): boolean {
  const { width } = getScreenDimensions();
  return width >= 375 && width < 430;
}

export function isLargeDevice(): boolean {
  const { width } = getScreenDimensions();
  return width >= 430;
}
