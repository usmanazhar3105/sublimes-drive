import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { palette } from '../../theme/palette';
import { textStyles } from '../../theme/typography';
import { spacing, radii } from '../../theme/tokens';

export default function VerifyGarageOwnerScreen() {
  const [garageName, setGarageName] = useState('');
  const [tradeLicense, setTradeLicense] = useState('');
  const [licensePhoto, setLicensePhoto] = useState<string | null>(null);
  const [location, setLocation] = useState('');

  const handleUploadPhoto = () => {
    setLicensePhoto('uploaded');
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
              Verify Your Garage
            </Text>
            <Text style={[textStyles.body, { color: palette.textSecondary }]}>
              Help us verify your automotive business
            </Text>
          </View>

          {/* Garage Name */}
          <View style={{ marginBottom: spacing.lg }}>
            <Text style={[textStyles.h4, { color: palette.lightText, marginBottom: spacing.sm }]}>
              Garage/Workshop Name
            </Text>
            <TextInput
              value={garageName}
              onChangeText={setGarageName}
              placeholder="Enter your business name"
              placeholderTextColor={palette.textSecondary}
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
          </View>

          {/* Trade License Number */}
          <View style={{ marginBottom: spacing.lg }}>
            <Text style={[textStyles.h4, { color: palette.lightText, marginBottom: spacing.sm }]}>
              Trade License Number
            </Text>
            <TextInput
              value={tradeLicense}
              onChangeText={setTradeLicense}
              placeholder="Enter license number"
              placeholderTextColor={palette.textSecondary}
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
          </View>

          {/* Location */}
          <View style={{ marginBottom: spacing.xl }}>
            <Text style={[textStyles.h4, { color: palette.lightText, marginBottom: spacing.sm }]}>
              Location
            </Text>
            <Pressable
              style={{
                backgroundColor: palette.cardBg,
                borderWidth: 1,
                borderColor: palette.border,
                borderRadius: radii.lg,
                padding: spacing.lg,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Ionicons name="location-outline" size={20} color={palette.gold} style={{ marginRight: spacing.sm }} />
              <Text style={[textStyles.body, { color: location ? palette.lightText : palette.textSecondary, flex: 1 }]}>
                {location || 'Select location'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={palette.textSecondary} />
            </Pressable>
          </View>

          {/* License Photo */}
          <View style={{ marginBottom: spacing['2xl'] }}>
            <Text style={[textStyles.h4, { color: palette.lightText, marginBottom: spacing.sm }]}>
              Trade License Document
            </Text>
            <Pressable
              onPress={handleUploadPhoto}
              style={{
                backgroundColor: palette.cardBg,
                borderWidth: 2,
                borderColor: licensePhoto ? palette.gold : palette.border,
                borderRadius: radii.lg,
                borderStyle: 'dashed',
                padding: spacing['3xl'],
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 160,
              }}
            >
              {licensePhoto ? (
                <View style={{ alignItems: 'center' }}>
                  <Ionicons name="checkmark-circle" size={48} color={palette.gold} />
                  <Text style={[textStyles.body, { color: palette.gold, marginTop: spacing.md }]}>
                    License Uploaded
                  </Text>
                  <Pressable onPress={handleUploadPhoto} style={{ marginTop: spacing.sm }}>
                    <Text style={[textStyles.bodySmall, { color: palette.textSecondary }]}>Tap to change</Text>
                  </Pressable>
                </View>
              ) : (
                <View style={{ alignItems: 'center' }}>
                  <Ionicons name="cloud-upload-outline" size={48} color={palette.textSecondary} />
                  <Text style={[textStyles.body, { color: palette.lightText, marginTop: spacing.md }]}>
                    Upload License
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
              <Ionicons name="shield-checkmark" size={20} color={palette.gold} style={{ marginRight: spacing.sm }} />
              <Text style={[textStyles.bodySmall, { color: palette.textSecondary, flex: 1 }]}>
                Verified garages get a badge and appear higher in search results
              </Text>
            </View>
          </View>

          {/* Submit Button */}
          <Pressable
            onPress={handleSubmit}
            disabled={!garageName || !tradeLicense || !licensePhoto}
            style={{
              backgroundColor: garageName && tradeLicense && licensePhoto ? palette.gold : palette.border,
              paddingVertical: spacing.lg,
              borderRadius: radii.lg,
              alignItems: 'center',
              marginTop: 'auto',
            }}
          >
            <Text
              style={[
                textStyles.button,
                { color: garageName && tradeLicense && licensePhoto ? palette.darkBg : palette.textSecondary },
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
