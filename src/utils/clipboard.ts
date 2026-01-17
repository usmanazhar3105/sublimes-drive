/**
 * Safe clipboard utility that handles environment restrictions
 * (e.g., Figma iframe preview, browsers without clipboard API)
 */

/**
 * Safely copy text to clipboard with proper error handling
 * Falls back to legacy method if modern API is blocked
 * @param text - Text to copy
 * @returns Promise<boolean> - true if successful, false otherwise
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  // Method 1: Try modern Clipboard API
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      // Silently handle clipboard errors in restricted environments
      if (error instanceof Error && error.name === 'NotAllowedError') {
        // Fall through to legacy method
      } else {
        console.warn('Clipboard API failed:', error);
      }
    }
  }

  // Method 2: Fallback to legacy execCommand (works in more contexts)
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    
    return successful;
  } catch (error) {
    console.warn('Legacy clipboard failed:', error);
    return false;
  }
}

/**
 * Check if clipboard API is available in current environment
 */
export function isClipboardAvailable(): boolean {
  return !!(navigator.clipboard && navigator.clipboard.writeText);
}
