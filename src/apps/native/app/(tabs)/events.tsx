import { SafeAreaView, View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { palette } from '../../theme/palette';
import { spacing, radii } from '../../theme/tokens';
import { textStyles } from '../../theme/typography';
import { applyShadow } from '../../utils/shadow';

export default function EventsScreen() {
  const router = useRouter();

  const filters = ['Upcoming', 'This Week', 'This Month', 'Past'];
  
  const events = [
    { id: 1, title: 'Dubai SuperCar Meet', date: 'Mar 15', time: '7:00 PM', location: 'Dubai Marina', attendees: 245, type: 'Car Meet' },
    { id: 2, title: 'Track Day at Dubai Autodrome', date: 'Mar 20', time: '9:00 AM', location: 'Dubai Autodrome', attendees: 89, type: 'Track Day' },
    { id: 3, title: 'Classic Car Exhibition', date: 'Mar 25', time: '5:00 PM', location: 'Downtown Dubai', attendees: 432, type: 'Exhibition' },
  ];

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <Text style={[textStyles.h3, { color: palette.lightText }]}>Events</Text>
        <View style={s.headerIcons}>
          <Pressable style={s.iconBtn} onPress={() => router.push('/screens/search')}>
            <Ionicons name="search-outline" size={20} color={palette.lightText} />
          </Pressable>
          <Pressable style={s.iconBtn}>
            <Ionicons name="calendar-outline" size={20} color={palette.lightText} />
          </Pressable>
        </View>
      </View>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filters}>
        {filters.map((filter, idx) => (
          <Pressable key={idx} style={[s.filterChip, idx === 0 && s.filterChipActive]}>
            <Text style={[textStyles.bodySmall, { color: idx === 0 ? palette.darkBg : palette.lightText, fontWeight: '600' }]}>
              {filter}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={s.container}>
        {/* Quick Action */}
        <Pressable
          style={[s.quickAction, applyShadow('md')]}
          onPress={() => router.push('/screens/meetup/instant-meetup')}
        >
          <View style={s.actionIcon}>
            <Ionicons name="flash" size={24} color={palette.darkBg} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[textStyles.h4, { color: palette.lightText }]}>Instant Car Meet</Text>
            <Text style={[textStyles.bodySmall, { color: palette.textSecondary, marginTop: 2 }]}>
              Create a spontaneous meet-up nearby
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={palette.gold} />
        </Pressable>

        {/* Events List */}
        {events.map((event) => (
          <Pressable
            key={event.id}
            style={[s.eventCard, applyShadow('card')]}
            onPress={() => router.push('/screens/events/event-detail')}
          >
            <View style={s.dateBox}>
              <Text style={[textStyles.caption, { color: palette.textSecondary, textTransform: 'uppercase' }]}>
                {event.date.split(' ')[0]}
              </Text>
              <Text style={[textStyles.h3, { color: palette.gold, fontWeight: '700' }]}>
                {event.date.split(' ')[1]}
              </Text>
            </View>

            <View style={{ flex: 1 }}>
              <View style={s.eventHeader}>
                <Text style={[textStyles.body, { color: palette.lightText, fontWeight: '600', flex: 1 }]} numberOfLines={1}>
                  {event.title}
                </Text>
                <View style={s.typeBadge}>
                  <Text style={[textStyles.caption, { color: palette.gold, fontSize: 10 }]}>{event.type}</Text>
                </View>
              </View>

              <View style={s.eventDetails}>
                <View style={s.eventDetail}>
                  <Ionicons name="time-outline" size={14} color={palette.textSecondary} />
                  <Text style={[textStyles.caption, { color: palette.textSecondary, marginLeft: 4 }]}>{event.time}</Text>
                </View>
                <View style={s.eventDetail}>
                  <Ionicons name="location-outline" size={14} color={palette.textSecondary} />
                  <Text style={[textStyles.caption, { color: palette.textSecondary, marginLeft: 4 }]}>{event.location}</Text>
                </View>
              </View>

              <View style={s.eventFooter}>
                <View style={s.attendees}>
                  <Ionicons name="people-outline" size={16} color={palette.gold} />
                  <Text style={[textStyles.bodySmall, { color: palette.lightText, marginLeft: 4 }]}>
                    {event.attendees} attending
                  </Text>
                </View>
                <Pressable style={s.interestedBtn}>
                  <Text style={[textStyles.bodySmall, { color: palette.gold, fontWeight: '600' }]}>Interested</Text>
                </Pressable>
              </View>
            </View>
          </Pressable>
        ))}

        {/* Create Event Button */}
        <Pressable style={[s.createBtn, applyShadow('sm')]}>
          <Ionicons name="add-circle-outline" size={20} color={palette.gold} />
          <Text style={[textStyles.body, { color: palette.gold, marginLeft: spacing.sm, fontWeight: '600' }]}>
            Create Your Event
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.darkBg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  headerIcons: { flexDirection: 'row', gap: spacing.sm },
  iconBtn: { width: 40, height: 40, borderRadius: radii.lg, backgroundColor: palette.cardBg, alignItems: 'center', justifyContent: 'center' },
  filters: { paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  filterChip: { backgroundColor: palette.cardBg, borderRadius: radii.pill, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, marginRight: spacing.sm, borderWidth: 1, borderColor: palette.border },
  filterChipActive: { backgroundColor: palette.gold, borderColor: palette.gold },
  container: { padding: spacing.lg, paddingBottom: spacing['6xl'] },
  quickAction: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: palette.cardBg, borderRadius: radii.lg, padding: spacing.lg, marginBottom: spacing.xl, borderWidth: 1, borderColor: palette.gold },
  actionIcon: { width: 48, height: 48, borderRadius: radii.lg, backgroundColor: palette.gold, alignItems: 'center', justifyContent: 'center' },
  eventCard: { flexDirection: 'row', gap: spacing.md, backgroundColor: palette.cardBg, borderRadius: radii.lg, padding: spacing.lg, marginBottom: spacing.md },
  dateBox: { width: 60, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.secondary, borderRadius: radii.md, paddingVertical: spacing.sm },
  eventHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  typeBadge: { backgroundColor: palette.secondary, borderRadius: radii.sm, paddingHorizontal: spacing.sm, paddingVertical: 2, borderWidth: 1, borderColor: palette.gold },
  eventDetails: { flexDirection: 'row', gap: spacing.lg, marginTop: spacing.sm },
  eventDetail: { flexDirection: 'row', alignItems: 'center' },
  eventFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: palette.border },
  attendees: { flexDirection: 'row', alignItems: 'center' },
  interestedBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radii.sm, borderWidth: 1, borderColor: palette.gold },
  createBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: palette.cardBg, borderRadius: radii.lg, padding: spacing.lg, marginTop: spacing.md, borderWidth: 1, borderColor: palette.gold },
});
