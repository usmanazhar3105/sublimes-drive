import { SafeAreaView, View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { palette } from '../../../theme/palette';
import { spacing, radii } from '../../../theme/tokens';
import { textStyles } from '../../../theme/typography';
import { applyShadow } from '../../../utils/shadow';

export default function NotificationsScreen() {
  const router = useRouter();

  const notifications = [
    { id: 1, type: 'like', title: 'Ahmed liked your post', time: '2m ago', unread: true },
    { id: 2, type: 'comment', title: 'New comment on your listing', time: '1h ago', unread: true },
    { id: 3, type: 'offer', title: 'New offer: 20% off car wash', time: '3h ago', unread: false },
    { id: 4, type: 'event', title: 'Car meet starting in 2 hours', time: '5h ago', unread: false },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'like': return 'heart';
      case 'comment': return 'chatbubble';
      case 'offer': return 'pricetag';
      case 'event': return 'calendar';
      default: return 'notifications';
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Pressable style={s.iconBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={20} color={palette.lightText} />
        </Pressable>
        <Text style={[textStyles.h4, { color: palette.lightText }]}>Notifications</Text>
        <Pressable>
          <Text style={[textStyles.bodySmall, { color: palette.gold }]}>Mark all read</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={s.container}>
        {notifications.map((notif) => (
          <Pressable key={notif.id} style={[s.notifCard, notif.unread && s.notifUnread, applyShadow('sm')]}>
            <View style={[s.iconContainer, notif.unread && { backgroundColor: palette.gold }]}>
              <Ionicons name={getIcon(notif.type) as any} size={20} color={notif.unread ? palette.darkBg : palette.gold} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[textStyles.body, { color: palette.lightText, fontWeight: notif.unread ? '600' : '400' }]}>
                {notif.title}
              </Text>
              <Text style={[textStyles.caption, { color: palette.textSecondary, marginTop: 2 }]}>
                {notif.time}
              </Text>
            </View>
            {notif.unread && <View style={s.unreadDot} />}
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.darkBg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, backgroundColor: palette.cardBg, borderBottomWidth: 1, borderBottomColor: palette.border },
  iconBtn: { width: 40, height: 40, borderRadius: radii.lg, backgroundColor: palette.secondary, alignItems: 'center', justifyContent: 'center' },
  container: { padding: spacing.lg },
  notifCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: palette.cardBg, borderRadius: radii.lg, padding: spacing.lg, marginBottom: spacing.sm },
  notifUnread: { borderLeftWidth: 3, borderLeftColor: palette.gold },
  iconContainer: { width: 40, height: 40, borderRadius: radii.md, backgroundColor: palette.secondary, alignItems: 'center', justifyContent: 'center' },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: palette.gold },
});
