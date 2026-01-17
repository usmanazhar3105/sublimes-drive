import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { palette } from '../../theme/palette';
import { textStyles } from '../../theme/typography';
import { spacing, radii } from '../../theme/tokens';

export default function VerifyEmailScreen() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isResending, setIsResending] = useState(false);

  const handleCodeChange = (value: string, index: number) => {
    if (value.length <= 1) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);
    }
  };

  const handleVerify = () => {
    // Navigate to role selection after verification
    router.push('/(auth)/role-selection');
  };

  const handleResend = () => {
    setIsResending(true);
    setTimeout(() => {
      setIsResending(false);
      // Show success message
    }, 1000);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.darkBg }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header */}
        <View style={{ padding: spacing.lg, flexDirection: 'row', alignItems: 'center' }}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="arrow-back" size={24} color={palette.lightText} />
          </Pressable>
        </View>

        {/* Content */}
        <View style={{ flex: 1, padding: spacing.xl, paddingTop: spacing['4xl'] }}>
          {/* Icon */}
          <View style={{ alignItems: 'center', marginBottom: spacing['3xl'] }}>
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: palette.cardBg,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: spacing.lg,
              }}
            >
              <Ionicons name="mail-outline" size={40} color={palette.gold} />
            </View>
            <Text style={[textStyles.h2, { color: palette.lightText, textAlign: 'center' }]}>
              Verify Your Email
            </Text>
            <Text
              style={[
                textStyles.bodySmall,
                { color: palette.textSecondary, textAlign: 'center', marginTop: spacing.sm },
              ]}
            >
              We've sent a 6-digit code to{'\n'}
              <Text style={{ color: palette.gold }}>john.doe@example.com</Text>
            </Text>
          </View>

          {/* Code Input */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: spacing.md, marginBottom: spacing['2xl'] }}>
            {code.map((digit, index) => (
              <TextInput
                key={index}
                value={digit}
                onChangeText={(value) => handleCodeChange(value, index)}
                keyboardType="number-pad"
                maxLength={1}
                style={{
                  width: 48,
                  height: 56,
                  backgroundColor: palette.cardBg,
                  borderWidth: 1,
                  borderColor: digit ? palette.gold : palette.border,
                  borderRadius: radii.lg,
                  ...textStyles.h3,
                  color: palette.lightText,
                  textAlign: 'center',
                }}
              />
            ))}
          </View>

          {/* Verify Button */}
          <Pressable
            onPress={handleVerify}
            style={{
              backgroundColor: palette.gold,
              paddingVertical: spacing.lg,
              borderRadius: radii.lg,
              alignItems: 'center',
              marginBottom: spacing.lg,
            }}
          >
            <Text style={[textStyles.button, { color: palette.darkBg }]}>Verify Email</Text>
          </Pressable>

          {/* Resend Code */}
          <Pressable onPress={handleResend} disabled={isResending} style={{ alignItems: 'center' }}>
            <Text style={[textStyles.bodySmall, { color: isResending ? palette.textSecondary : palette.gold }]}>
              {isResending ? 'Sending...' : "Didn't receive code? Resend"}
            </Text>
          </Pressable>

          {/* Timer */}
          <View style={{ alignItems: 'center', marginTop: spacing.md }}>
            <Text style={[textStyles.caption, { color: palette.textSecondary }]}>
              Code expires in 05:00
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
