import { SafeAreaView, View, Text, TextInput, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { palette } from '../../../theme/palette';
import { spacing, radii } from '../../../theme/tokens';
import { textStyles } from '../../../theme/typography';
import { applyShadow } from '../../../utils/shadow';

export default function SearchScreen() {
  const router = useRouter();

  const recentSearches = ['Porsche 911', 'Dubai garage', 'Car meet events'];
  const popularSearches = ['BMW M3', 'Mercedes G-Wagon', 'Tesla Model S', 'Range Rover'];

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Pressable style={s.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={palette.lightText} />
        </Pressable>
        <View style={s.searchContainer}>
          <Ionicons name="search-outline" size={20} color={palette.textSecondary} />
          <TextInput
            style={s.searchInput}
            placeholder="Search cars, garages, events..."
            placeholderTextColor={palette.textSecondary}
            autoFocus
          />
          <Pressable>
            <Ionicons name="close-circle" size={20} color={palette.textSecondary} />
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.container}>
        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filters}>
          {['All', 'Cars', 'Garages', 'Events', 'Posts', 'Users'].map((filter, idx) => (
            <Pressable key={idx} style={[s.filterChip, idx === 0 && s.filterChipActive]}>
              <Text style={[textStyles.bodySmall, { color: idx === 0 ? palette.darkBg : palette.lightText, fontWeight: '600' }]}>
                {filter}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Recent Searches */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={[textStyles.h4, { color: palette.lightText }]}>Recent</Text>
            <Pressable>
              <Text style={[textStyles.bodySmall, { color: palette.gold }]}>Clear</Text>
            </Pressable>
          </View>
          {recentSearches.map((search, idx) => (
            <Pressable key={idx} style={s.searchItem}>
              <Ionicons name="time-outline" size={20} color={palette.textSecondary} />
              <Text style={[textStyles.body, { color: palette.lightText, flex: 1, marginLeft: spacing.md }]}>
                {search}
              </Text>
              <Ionicons name="arrow-up-outline" size={20} color={palette.textSecondary} style={{ transform: [{ rotate: '45deg' }] }} />
            </Pressable>
          ))}
        </View>

        {/* Popular Searches */}
        <View style={s.section}>
          <Text style={[textStyles.h4, { color: palette.lightText, marginBottom: spacing.md }]}>
            Popular Searches
          </Text>
          <View style={s.popularGrid}>
            {popularSearches.map((search, idx) => (
              <Pressable key={idx} style={[s.popularChip, applyShadow('sm')]}>
                <Ionicons name="trending-up-outline" size={16} color={palette.gold} />
                <Text style={[textStyles.bodySmall, { color: palette.lightText, marginLeft: spacing.sm }]}>
                  {search}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.darkBg },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, backgroundColor: palette.cardBg, borderBottomWidth: 1, borderBottomColor: palette.border },
  backBtn: { width: 40, height: 40, borderRadius: radii.lg, backgroundColor: palette.secondary, alignItems: 'center', justifyContent: 'center' },
  searchContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: palette.secondary, borderRadius: radii.lg, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  searchInput: { flex: 1, color: palette.lightText, fontSize: 16, paddingVertical: spacing.sm },
  filters: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  filterChip: { backgroundColor: palette.cardBg, borderRadius: radii.pill, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, marginRight: spacing.sm, borderWidth: 1, borderColor: palette.border },
  filterChipActive: { backgroundColor: palette.gold, borderColor: palette.gold },
  container: { padding: spacing.lg },
  section: { marginBottom: spacing.xl },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  searchItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md },
  popularGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  popularChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: palette.cardBg, borderRadius: radii.pill, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderWidth: 1, borderColor: palette.border },
});
