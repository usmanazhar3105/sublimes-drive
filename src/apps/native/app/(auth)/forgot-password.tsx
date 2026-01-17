import { SafeAreaView, View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { palette } from '../../theme/palette';
import { spacing, radii } from '../../theme/tokens';
import { textStyles } from '../../theme/typography';
import { applyShadow } from '../../utils/shadow';

export default function ForgotPasswordScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.container}>
        <Pressable style={s.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={palette.lightText} />
        </Pressable>

        <View style={s.iconContainer}>
          <Ionicons name="lock-open-outline" size={64} color={palette.gold} />
        </View>

        <Text style={[textStyles.h1, { color: palette.lightText, fontSize: 28, textAlign: 'center' }]}>
          Forgot Password?
        </Text>
        <Text style={[textStyles.body, { color: palette.textSecondary, marginTop: spacing.sm, textAlign: 'center' }]}>
          Enter your email to receive a reset link
        </Text>

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
        </View>

        <Pressable style={[s.primaryBtn, applyShadow('md')]}>
          <Text style={[textStyles.button, { color: palette.darkBg }]}>Send Reset Link</Text>
        </Pressable>

        <Pressable style={s.backToLogin} onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={18} color={palette.gold} />
          <Text style={[textStyles.body, { color: palette.gold, marginLeft: spacing.sm }]}>
            Back to Sign In
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.darkBg },
  container: { flex: 1, padding: spacing.xl },
  backBtn: { width: 40, height: 40, borderRadius: radii.lg, backgroundColor: palette.cardBg, alignItems: 'center', justifyContent: 'center' },
  iconContainer: { alignItems: 'center', marginTop: spacing['5xl'], marginBottom: spacing['3xl'] },
  form: { marginTop: spacing['3xl'], marginBottom: spacing['3xl'] },
  inputGroup: {},
  inputContainer: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: palette.cardBg, borderRadius: radii.lg, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderWidth: 1, borderColor: palette.border },
  input: { flex: 1, color: palette.lightText, fontSize: 16, paddingVertical: 0 },
  primaryBtn: { height: 52, borderRadius: radii.lg, backgroundColor: palette.gold, alignItems: 'center', justifyContent: 'center' },
  backToLogin: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: spacing.xl },
});
