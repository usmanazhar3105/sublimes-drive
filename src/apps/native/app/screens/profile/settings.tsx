import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { palette } from '../../../theme/palette';
import { textStyles } from '../../../theme/typography';
import { spacing, radii } from '../../../theme/tokens';

export default function ProfileSettingsScreen() {
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [privateProfile, setPrivateProfile] = useState(false);

  const SettingItem = ({
    icon,
    title,
    subtitle,
    rightElement,
    onPress,
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    rightElement?: React.ReactNode;
    onPress?: () => void;
  }) => (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: palette.cardBg,
        padding: spacing.lg,
        borderRadius: radii.lg,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: radii.md,
          backgroundColor: palette.darkBg,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: spacing.md,
        }}
      >
        <Ionicons name={icon as any} size={20} color={palette.gold} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[textStyles.body, { color: palette.lightText }]}>{title}</Text>
        {subtitle && <Text style={[textStyles.caption, { color: palette.textSecondary, marginTop: 2 }]}>{subtitle}</Text>}
      </View>
      {rightElement}
    </Pressable>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.darkBg }}>
      <ScrollView>
        {/* Header */}
        <View style={{ padding: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="arrow-back" size={24} color={palette.lightText} />
          </Pressable>
          <Text style={[textStyles.h3, { color: palette.lightText, flex: 1 }]}>Settings</Text>
        </View>

        <View style={{ padding: spacing.lg }}>
          {/* Account Section */}
          <Text style={[textStyles.h4, { color: palette.lightText, marginBottom: spacing.md }]}>Account</Text>
          <SettingItem
            icon="person-outline"
            title="Edit Profile"
            subtitle="Update your personal information"
            rightElement={<Ionicons name="chevron-forward" size={20} color={palette.textSecondary} />}
            onPress={() => {}}
          />
          <SettingItem
            icon="lock-closed-outline"
            title="Change Password"
            subtitle="Update your password"
            rightElement={<Ionicons name="chevron-forward" size={20} color={palette.textSecondary} />}
            onPress={() => {}}
          />
          <SettingItem
            icon="shield-checkmark-outline"
            title="Privacy"
            subtitle="Control who can see your profile"
            rightElement={
              <Switch
                value={privateProfile}
                onValueChange={setPrivateProfile}
                trackColor={{ false: palette.border, true: palette.gold }}
                thumbColor={palette.lightText}
              />
            }
          />

          {/* Notifications Section */}
          <Text style={[textStyles.h4, { color: palette.lightText, marginTop: spacing.xl, marginBottom: spacing.md }]}>
            Notifications
          </Text>
          <SettingItem
            icon="notifications-outline"
            title="Push Notifications"
            subtitle="Receive app notifications"
            rightElement={
              <Switch
                value={pushNotifications}
                onValueChange={setPushNotifications}
                trackColor={{ false: palette.border, true: palette.gold }}
                thumbColor={palette.lightText}
              />
            }
          />
          <SettingItem
            icon="mail-outline"
            title="Email Notifications"
            subtitle="Receive email updates"
            rightElement={
              <Switch
                value={emailNotifications}
                onValueChange={setEmailNotifications}
                trackColor={{ false: palette.border, true: palette.gold }}
                thumbColor={palette.lightText}
              />
            }
          />
          <SettingItem
            icon="megaphone-outline"
            title="Marketing Emails"
            subtitle="Receive offers and promotions"
            rightElement={
              <Switch
                value={marketingEmails}
                onValueChange={setMarketingEmails}
                trackColor={{ false: palette.border, true: palette.gold }}
                thumbColor={palette.lightText}
              />
            }
          />

          {/* Preferences Section */}
          <Text style={[textStyles.h4, { color: palette.lightText, marginTop: spacing.xl, marginBottom: spacing.md }]}>
            Preferences
          </Text>
          <SettingItem
            icon="language-outline"
            title="Language"
            subtitle="English"
            rightElement={<Ionicons name="chevron-forward" size={20} color={palette.textSecondary} />}
            onPress={() => {}}
          />
          <SettingItem
            icon="location-outline"
            title="Location"
            subtitle="Dubai, UAE"
            rightElement={<Ionicons name="chevron-forward" size={20} color={palette.textSecondary} />}
            onPress={() => {}}
          />

          {/* Support Section */}
          <Text style={[textStyles.h4, { color: palette.lightText, marginTop: spacing.xl, marginBottom: spacing.md }]}>
            Support
          </Text>
          <SettingItem
            icon="help-circle-outline"
            title="Help Center"
            rightElement={<Ionicons name="chevron-forward" size={20} color={palette.textSecondary} />}
            onPress={() => {}}
          />
          <SettingItem
            icon="chatbubble-outline"
            title="Contact Support"
            rightElement={<Ionicons name="chevron-forward" size={20} color={palette.textSecondary} />}
            onPress={() => {}}
          />

          {/* Danger Zone */}
          <Text style={[textStyles.h4, { color: palette.error, marginTop: spacing.xl, marginBottom: spacing.md }]}>
            Danger Zone
          </Text>
          <SettingItem
            icon="log-out-outline"
            title="Logout"
            rightElement={<Ionicons name="chevron-forward" size={20} color={palette.textSecondary} />}
            onPress={() => router.replace('/(auth)/welcome')}
          />
          <SettingItem
            icon="trash-outline"
            title="Delete Account"
            subtitle="Permanently delete your account"
            rightElement={<Ionicons name="chevron-forward" size={20} color={palette.error} />}
            onPress={() => {}}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
