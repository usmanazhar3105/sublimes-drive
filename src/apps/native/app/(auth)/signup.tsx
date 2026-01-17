import { SafeAreaView, View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { palette } from '../../theme/palette';
import { spacing, radii } from '../../theme/tokens';
import { textStyles } from '../../theme/typography';
import { applyShadow } from '../../utils/shadow';

export default function SignupScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.container}>
          <Pressable style={s.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color={palette.lightText} />
          </Pressable>

          <Text style={[textStyles.h1, { color: palette.lightText, fontSize: 28, marginTop: spacing.xl }]}>
            Create Account
          </Text>
          <Text style={[textStyles.body, { color: palette.textSecondary, marginTop: spacing.sm }]}>
            Join the community
          </Text>

          <View style={s.form}>
            <View style={s.inputGroup}>
              <Text style={[textStyles.label, { color: palette.lightText, marginBottom: spacing.sm }]}>Full Name</Text>
              <View style={s.inputContainer}>
                <Ionicons name="person-outline" size={20} color={palette.textSecondary} />
                <TextInput style={s.input} placeholder="Enter your name" placeholderTextColor={palette.textSecondary} />
              </View>
            </View>

            <View style={s.inputGroup}>
              <Text style={[textStyles.label, { color: palette.lightText, marginBottom: spacing.sm }]}>Email</Text>
              <View style={s.inputContainer}>
                <Ionicons name="mail-outline" size={20} color={palette.textSecondary} />
                <TextInput style={s.input} placeholder="Enter your email" placeholderTextColor={palette.textSecondary} keyboardType="email-address" autoCapitalize="none" />
              </View>
            </View>

            <View style={s.inputGroup}>
              <Text style={[textStyles.label, { color: palette.lightText, marginBottom: spacing.sm }]}>Password</Text>
              <View style={s.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color={palette.textSecondary} />
                <TextInput style={s.input} placeholder="Create a password" placeholderTextColor={palette.textSecondary} secureTextEntry />
                <Pressable><Ionicons name="eye-outline" size={20} color={palette.textSecondary} /></Pressable>
              </View>
            </View>

            <View style={s.checkbox}>
              <Ionicons name="checkbox-outline" size={24} color={palette.gold} />
              <Text style={[textStyles.bodySmall, { color: palette.textSecondary, flex: 1 }]}>
                I agree to the <Text style={{ color: palette.gold }}>Terms of Service</Text> and{' '}
                <Text style={{ color: palette.gold }}>Privacy Policy</Text>
              </Text>
            </View>
          </View>

          <Pressable style={[s.primaryBtn, applyShadow('md')]} onPress={() => router.push('/(auth)/role-selection')}>
            <Text style={[textStyles.button, { color: palette.darkBg }]}>Create Account</Text>
          </Pressable>

          <Text style={[textStyles.body, { color: palette.textSecondary, textAlign: 'center', marginTop: spacing.xl }]}>
            Already have an account?{' '}
            <Text style={{ color: palette.gold, fontWeight: '600' }} onPress={() => router.push('/(auth)/login')}>Sign In</Text>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.darkBg },
  container: { padding: spacing.xl, paddingBottom: spacing['6xl'] },
  backBtn: { width: 40, height: 40, borderRadius: radii.lg, backgroundColor: palette.cardBg, alignItems: 'center', justifyContent: 'center' },
  form: { gap: spacing.xl, marginTop: spacing['3xl'], marginBottom: spacing['3xl'] },
  inputGroup: {},
  inputContainer: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: palette.cardBg, borderRadius: radii.lg, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderWidth: 1, borderColor: palette.border },
  input: { flex: 1, color: palette.lightText, fontSize: 16, paddingVertical: 0 },
  checkbox: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  primaryBtn: { height: 52, borderRadius: radii.lg, backgroundColor: palette.gold, alignItems: 'center', justifyContent: 'center' },
});
