import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { palette } from '../../theme/palette';
import { textStyles } from '../../theme/typography';
import { spacing, radii } from '../../theme/tokens';

type Role = 'car-owner' | 'garage-owner';

export default function RoleSelectionScreen() {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const handleContinue = () => {
    if (selectedRole === 'car-owner') {
      router.push('/(auth)/verify-car-owner');
    } else if (selectedRole === 'garage-owner') {
      router.push('/(auth)/verify-garage-owner');
    }
  };

  const RoleCard = ({ role, icon, title, description }: { role: Role; icon: string; title: string; description: string }) => {
    const isSelected = selectedRole === role;

    return (
      <Pressable
        onPress={() => setSelectedRole(role)}
        style={{
          backgroundColor: palette.cardBg,
          borderWidth: 2,
          borderColor: isSelected ? palette.gold : palette.border,
          borderRadius: radii.xl,
          padding: spacing.xl,
          marginBottom: spacing.lg,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md }}>
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: radii.lg,
              backgroundColor: isSelected ? palette.gold + '20' : palette.darkBg,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: spacing.md,
            }}
          >
            <Ionicons name={icon as any} size={24} color={isSelected ? palette.gold : palette.lightText} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[textStyles.h4, { color: palette.lightText }]}>{title}</Text>
          </View>
          {isSelected && <Ionicons name="checkmark-circle" size={24} color={palette.gold} />}
        </View>
        <Text style={[textStyles.bodySmall, { color: palette.textSecondary }]}>{description}</Text>
      </Pressable>
    );
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
              Select Your Role
            </Text>
            <Text style={[textStyles.body, { color: palette.textSecondary }]}>
              Choose how you'll be using Sublimes Drive
            </Text>
          </View>

          {/* Role Cards */}
          <RoleCard
            role="car-owner"
            icon="car-sport"
            title="Car Enthusiast"
            description="Join the community, list your car, participate in events, and connect with fellow enthusiasts"
          />
          <RoleCard
            role="garage-owner"
            icon="construct"
            title="Garage/Service Owner"
            description="Showcase your services, receive repair bids, and grow your automotive business"
          />

          {/* Continue Button */}
          <Pressable
            onPress={handleContinue}
            disabled={!selectedRole}
            style={{
              backgroundColor: selectedRole ? palette.gold : palette.border,
              paddingVertical: spacing.lg,
              borderRadius: radii.lg,
              alignItems: 'center',
              marginTop: 'auto',
            }}
          >
            <Text style={[textStyles.button, { color: selectedRole ? palette.darkBg : palette.textSecondary }]}>
              Continue
            </Text>
          </Pressable>

          {/* Skip */}
          <Pressable onPress={() => router.replace('/(tabs)')} style={{ alignItems: 'center', marginTop: spacing.lg }}>
            <Text style={[textStyles.bodySmall, { color: palette.gold }]}>Skip for now</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
