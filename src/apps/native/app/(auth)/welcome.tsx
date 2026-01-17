import { SafeAreaView, View, Text, Pressable, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { palette } from '../../theme/palette';
import { spacing, radii } from '../../theme/tokens';
import { textStyles } from '../../theme/typography';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.container}>
        {/* Logo/Brand */}
        <View style={s.logoContainer}>
          <View style={s.logo}>
            <Ionicons name="car-sport" size={64} color={palette.gold} />
          </View>
          <Text style={[textStyles.h1, { color: palette.gold, marginTop: spacing.lg, fontSize: 32, fontWeight: '700' }]}>
            Sublimes Drive
          </Text>
          <Text style={[textStyles.body, { color: palette.textSecondary, marginTop: spacing.sm, textAlign: 'center' }]}>
            The Ultimate Car Community
          </Text>
        </View>

        {/* Features */}
        <View style={s.features}>
          <View style={s.feature}>
            <Ionicons name="people-circle-outline" size={32} color={palette.gold} />
            <Text style={[textStyles.bodySmall, { color: palette.lightText, marginTop: spacing.xs, textAlign: 'center' }]}>
              Connect with Car Enthusiasts
            </Text>
          </View>
          <View style={s.feature}>
            <Ionicons name="car-outline" size={32} color={palette.gold} />
            <Text style={[textStyles.bodySmall, { color: palette.lightText, marginTop: spacing.xs, textAlign: 'center' }]}>
              Buy & Sell Cars
            </Text>
          </View>
          <View style={s.feature}>
            <Ionicons name="construct-outline" size={32} color={palette.gold} />
            <Text style={[textStyles.bodySmall, { color: palette.lightText, marginTop: spacing.xs, textAlign: 'center' }]}>
              Find Trusted Garages
            </Text>
          </View>
        </View>

        {/* CTA Buttons */}
        <View style={s.actions}>
          <Pressable
            style={s.primaryBtn}
            onPress={() => router.push('/(auth)/signup')}
          >
            <Text style={[textStyles.button, { color: palette.darkBg }]}>Get Started</Text>
          </Pressable>

          <Pressable
            style={s.secondaryBtn}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={[textStyles.button, { color: palette.lightText }]}>Sign In</Text>
          </Pressable>

          <Pressable onPress={() => router.push('/(tabs)')}>
            <Text style={[textStyles.bodySmall, { color: palette.textSecondary, textAlign: 'center', marginTop: spacing.lg }]}>
              Continue as Guest
            </Text>
          </Pressable>
        </View>

        {/* Footer */}
        <Text style={[textStyles.caption, { color: palette.textSecondary, textAlign: 'center', marginTop: spacing['3xl'] }]}>
          By continuing, you agree to our{'\n'}
          <Text style={{ color: palette.gold }}>Terms of Service</Text> and{' '}
          <Text style={{ color: palette.gold }}>Privacy Policy</Text>
        </Text>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.darkBg },
  container: { flex: 1, padding: spacing.xl, justifyContent: 'space-between' },
  logoContainer: { alignItems: 'center', marginTop: spacing['5xl'] },
  logo: { width: 120, height: 120, borderRadius: 60, backgroundColor: palette.cardBg, alignItems: 'center', justifyContent: 'center' },
  features: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: spacing.md },
  feature: { alignItems: 'center', width: 100 },
  actions: { gap: spacing.md },
  primaryBtn: { height: 52, borderRadius: radii.lg, backgroundColor: palette.gold, alignItems: 'center', justifyContent: 'center' },
  secondaryBtn: { height: 52, borderRadius: radii.lg, borderWidth: 1, borderColor: palette.gold, alignItems: 'center', justifyContent: 'center' },
});
