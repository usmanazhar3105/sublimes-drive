import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { palette } from '../../../theme/palette';
import { textStyles } from '../../../theme/typography';
import { spacing, radii } from '../../../theme/tokens';

export default function EditProfileScreen() {
  const [name, setName] = useState('John Doe');
  const [email, setEmail] = useState('john.doe@example.com');
  const [phone, setPhone] = useState('+971 50 123 4567');
  const [bio, setBio] = useState('Car enthusiast | BMW M Series lover');

  const handleSave = () => {
    router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.darkBg }}>
      <ScrollView>
        {/* Header */}
        <View style={{ padding: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="arrow-back" size={24} color={palette.lightText} />
          </Pressable>
          <Text style={[textStyles.h3, { color: palette.lightText, flex: 1 }]}>Edit Profile</Text>
          <Pressable onPress={handleSave}>
            <Text style={[textStyles.body, { color: palette.gold }]}>Save</Text>
          </Pressable>
        </View>

        <View style={{ padding: spacing.lg }}>
          {/* Avatar */}
          <View style={{ alignItems: 'center', marginBottom: spacing.xl }}>
            <View
              style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: palette.cardBg,
                marginBottom: spacing.md,
              }}
            />
            <Pressable>
              <Text style={[textStyles.body, { color: palette.gold }]}>Change Photo</Text>
            </Pressable>
          </View>

          {/* Name */}
          <View style={{ marginBottom: spacing.lg }}>
            <Text style={[textStyles.h4, { color: palette.lightText, marginBottom: spacing.sm }]}>Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
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

          {/* Email */}
          <View style={{ marginBottom: spacing.lg }}>
            <Text style={[textStyles.h4, { color: palette.lightText, marginBottom: spacing.sm }]}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
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

          {/* Phone */}
          <View style={{ marginBottom: spacing.lg }}>
            <Text style={[textStyles.h4, { color: palette.lightText, marginBottom: spacing.sm }]}>Phone</Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
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

          {/* Bio */}
          <View style={{ marginBottom: spacing.lg }}>
            <Text style={[textStyles.h4, { color: palette.lightText, marginBottom: spacing.sm }]}>Bio</Text>
            <TextInput
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={4}
              style={{
                backgroundColor: palette.cardBg,
                borderWidth: 1,
                borderColor: palette.border,
                borderRadius: radii.lg,
                padding: spacing.lg,
                ...textStyles.body,
                color: palette.lightText,
                minHeight: 100,
                textAlignVertical: 'top',
              }}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
