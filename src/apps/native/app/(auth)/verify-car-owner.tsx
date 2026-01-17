import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { palette } from '../../theme/palette';
import { textStyles } from '../../theme/typography';
import { spacing, radii } from '../../theme/tokens';

export default function VerifyCarOwnerScreen() {
  const [vinNumber, setVinNumber] = useState('');
  const [registrationPhoto, setRegistrationPhoto] = useState<string | null>(null);

  const handleUploadPhoto = () => {
    // Simulate photo upload
    setRegistrationPhoto('uploaded');
  };

  const handleSubmit = () => {
    router.push('/(auth)/onboarding');
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
        <View style={{ flex: 1, padding: spacing.xl }}>
          {/* Title */}
          <View style={{ marginBottom: spacing['3xl'] }}>
            <Text style={[textStyles.h1, { color: palette.lightText, marginBottom: spacing.sm }]}>
              Verify Car Ownership
            </Text>
            <Text style={[textStyles.body, { color: palette.textSecondary }]}>
              Help us verify you're a genuine car enthusiast
            </Text>
          </View>

          {/* VIN Number */}
          <View style={{ marginBottom: spacing.xl }}>
            <Text style={[textStyles.h4, { color: palette.lightText, marginBottom: spacing.sm }]}>
              Vehicle Identification Number (VIN)
            </Text>
            <TextInput
              value={vinNumber}
              onChangeText={setVinNumber}
              placeholder="Enter 17-digit VIN"
              placeholderTextColor={palette.textSecondary}
              maxLength={17}
              autoCapitalize="characters"
              style={{
                backgroundColor: palette.cardBg,
                borderWidth: 1,
                borderColor: palette.border,
                borderRadius: radii.lg,
                padding: spacing.lg,
                ...textStyles.body,
                color: palette.lightText,
              }}
            />
            <Text style={[textStyles.caption, { color: palette.textSecondary, marginTop: spacing.sm }]}>
              Found on your vehicle registration or dashboard
            </Text>
          </View>

          {/* Registration Photo */}
          <View style={{ marginBottom: spacing['2xl'] }}>
            <Text style={[textStyles.h4, { color: palette.lightText, marginBottom: spacing.sm }]}>
              Registration Document
            </Text>
            <Pressable
              onPress={handleUploadPhoto}
              style={{
                backgroundColor: palette.cardBg,
                borderWidth: 2,
                borderColor: registrationPhoto ? palette.gold : palette.border,
                borderRadius: radii.lg,
                borderStyle: 'dashed',
                padding: spacing['3xl'],
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 160,
              }}
            >
              {registrationPhoto ? (
                <View style={{ alignItems: 'center' }}>
                  <Ionicons name="checkmark-circle" size={48} color={palette.gold} />
                  <Text style={[textStyles.body, { color: palette.gold, marginTop: spacing.md }]}>
                    Document Uploaded
                  </Text>
                  <Pressable onPress={handleUploadPhoto} style={{ marginTop: spacing.sm }}>
                    <Text style={[textStyles.bodySmall, { color: palette.textSecondary }]}>Tap to change</Text>
                  </Pressable>
                </View>
              ) : (
                <View style={{ alignItems: 'center' }}>
                  <Ionicons name="cloud-upload-outline" size={48} color={palette.textSecondary} />
                  <Text style={[textStyles.body, { color: palette.lightText, marginTop: spacing.md }]}>
                    Upload Registration
                  </Text>
                  <Text style={[textStyles.caption, { color: palette.textSecondary, marginTop: spacing.sm }]}>
                    JPG, PNG up to 10MB
                  </Text>
                </View>
              )}
            </Pressable>
          </View>

          {/* Info Box */}
          <View
            style={{
              backgroundColor: palette.cardBg,
              borderLeftWidth: 4,
              borderLeftColor: palette.gold,
              padding: spacing.lg,
              borderRadius: radii.md,
              marginBottom: spacing.xl,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <Ionicons name="information-circle" size={20} color={palette.gold} style={{ marginRight: spacing.sm }} />
              <Text style={[textStyles.bodySmall, { color: palette.textSecondary, flex: 1 }]}>
                Your documents are encrypted and used only for verification. We don't share your information.
              </Text>
            </View>
          </View>

          {/* Submit Button */}
          <Pressable
            onPress={handleSubmit}
            disabled={!vinNumber || !registrationPhoto}
            style={{
              backgroundColor: vinNumber && registrationPhoto ? palette.gold : palette.border,
              paddingVertical: spacing.lg,
              borderRadius: radii.lg,
              alignItems: 'center',
              marginTop: 'auto',
            }}
          >
            <Text
              style={[
                textStyles.button,
                { color: vinNumber && registrationPhoto ? palette.darkBg : palette.textSecondary },
              ]}
            >
              Submit for Verification
            </Text>
          </Pressable>

          {/* Skip */}
          <Pressable onPress={() => router.push('/(auth)/onboarding')} style={{ alignItems: 'center', marginTop: spacing.lg }}>
            <Text style={[textStyles.bodySmall, { color: palette.gold }]}>Skip for now</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
