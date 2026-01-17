import { SafeAreaView, View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { palette } from '../../theme/palette';
import { spacing, radii } from '../../theme/tokens';
import { textStyles } from '../../theme/typography';
import { applyShadow } from '../../utils/shadow';

export default function LoginScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={s.container}>
          {/* Header */}
          <View style={s.header}>
            <Pressable style={s.backBtn} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={24} color={palette.lightText} />
            </Pressable>
          </View>

          {/* Title */}
          <View style={s.titleSection}>
            <Text style={[textStyles.h1, { color: palette.lightText, fontSize: 28 }]}>Welcome Back</Text>
            <Text style={[textStyles.body, { color: palette.textSecondary, marginTop: spacing.sm }]}>
              Sign in to continue
            </Text>
          </View>

          {/* Form */}
          <View style={s.form}>
            <View style={s.inputGroup}>
              <Text style={[textStyles.label, { color: palette.lightText, marginBottom: spacing.sm }]}>Email</Text>
              <View style={s.inputContainer}>
                <Ionicons name="mail-outline" size={20} color={palette.textSecondary} />
                <TextInput
                  style={s.input}
                  placeholder="Enter your email"
                  placeholderTextColor={palette.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={s.inputGroup}>
              <Text style={[textStyles.label, { color: palette.lightText, marginBottom: spacing.sm }]}>Password</Text>
              <View style={s.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color={palette.textSecondary} />
                <TextInput
                  style={s.input}
                  placeholder="Enter your password"
                  placeholderTextColor={palette.textSecondary}
                  secureTextEntry
                />
                <Pressable>
                  <Ionicons name="eye-outline" size={20} color={palette.textSecondary} />
                </Pressable>
              </View>
            </View>

            <Pressable onPress={() => router.push('/(auth)/forgot-password')}>
              <Text style={[textStyles.bodySmall, { color: palette.gold, textAlign: 'right' }]}>
                Forgot Password?
              </Text>
            </Pressable>
          </View>

          {/* Actions */}
          <View style={s.actions}>
            <Pressable
              style={[s.primaryBtn, applyShadow('md')]}
              onPress={() => router.push('/(tabs)')}
            >
              <Text style={[textStyles.button, { color: palette.darkBg }]}>Sign In</Text>
            </Pressable>

            <View style={s.divider}>
              <View style={s.dividerLine} />
              <Text style={[textStyles.caption, { color: palette.textSecondary, paddingHorizontal: spacing.md }]}>
                OR
              </Text>
              <View style={s.dividerLine} />
            </View>

            <Pressable style={[s.socialBtn, applyShadow('sm')]}>
              <Ionicons name="logo-google" size={20} color={palette.lightText} />
              <Text style={[textStyles.body, { color: palette.lightText, marginLeft: spacing.sm }]}>
                Continue with Google
              </Text>
            </Pressable>

            <Pressable style={[s.socialBtn, applyShadow('sm')]}>
              <Ionicons name="logo-apple" size={20} color={palette.lightText} />
              <Text style={[textStyles.body, { color: palette.lightText, marginLeft: spacing.sm }]}>
                Continue with Apple
              </Text>
            </Pressable>
          </View>

          {/* Footer */}
          <View style={s.footer}>
            <Text style={[textStyles.body, { color: palette.textSecondary }]}>
              Don't have an account?{' '}
              <Text style={{ color: palette.gold, fontWeight: '600' }} onPress={() => router.push('/(auth)/signup')}>
                Sign Up
              </Text>
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.darkBg },
  container: { flex: 1, padding: spacing.xl },
  header: { marginBottom: spacing.xl },
  backBtn: { width: 40, height: 40, borderRadius: radii.lg, backgroundColor: palette.cardBg, alignItems: 'center', justifyContent: 'center' },
  titleSection: { marginBottom: spacing['3xl'] },
  form: { gap: spacing.xl },
  inputGroup: {},
  inputContainer: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: palette.cardBg, borderRadius: radii.lg, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderWidth: 1, borderColor: palette.border },
  input: { flex: 1, color: palette.lightText, fontSize: 16, paddingVertical: 0 },
  actions: { marginTop: spacing['3xl'], gap: spacing.md },
  primaryBtn: { height: 52, borderRadius: radii.lg, backgroundColor: palette.gold, alignItems: 'center', justifyContent: 'center' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: spacing.md },
  dividerLine: { flex: 1, height: 1, backgroundColor: palette.border },
  socialBtn: { height: 52, borderRadius: radii.lg, borderWidth: 1, borderColor: palette.border, backgroundColor: palette.cardBg, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  footer: { alignItems: 'center', marginTop: spacing.xl },
});
