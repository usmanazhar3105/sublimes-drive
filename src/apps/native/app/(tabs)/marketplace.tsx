import { SafeAreaView, View, Text, ScrollView, Pressable, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { palette } from '../../theme/palette';
import { spacing, radii } from '../../theme/tokens';
import { textStyles } from '../../theme/typography';
import { applyShadow } from '../../utils/shadow';

export default function MarketplaceScreen() {
  const router = useRouter();

  const filters = ['All', 'Luxury', 'Sports', 'SUV', 'Sedan', 'Electric'];
  
  const listings = [
    { id: 1, title: 'Porsche 911 Turbo S', price: '675,000', location: 'Dubai', year: '2023', mileage: '5k km', featured: true },
    { id: 2, title: 'BMW M4 Competition', price: '385,000', location: 'Abu Dhabi', year: '2022', mileage: '12k km', featured: false },
    { id: 3, title: 'Mercedes-AMG GT', price: '495,000', location: 'Dubai', year: '2023', mileage: '8k km', featured: true },
  ];

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <Text style={[textStyles.h3, { color: palette.lightText }]}>Marketplace</Text>
        <View style={s.headerIcons}>
          <Pressable style={s.iconBtn} onPress={() => router.push('/screens/search')}>
            <Ionicons name="search-outline" size={20} color={palette.lightText} />
          </Pressable>
          <Pressable style={s.iconBtn}>
            <Ionicons name="options-outline" size={20} color={palette.lightText} />
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
        {/* View Toggle */}
        <View style={s.toolbar}>
          <Text style={[textStyles.bodySmall, { color: palette.textSecondary }]}>342 cars available</Text>
          <View style={s.viewToggle}>
            <Pressable style={[s.toggleBtn, s.toggleBtnActive]}>
              <Ionicons name="grid-outline" size={18} color={palette.gold} />
            </Pressable>
            <Pressable style={s.toggleBtn}>
              <Ionicons name="list-outline" size={18} color={palette.textSecondary} />
            </Pressable>
          </View>
        </View>

        {/* Listings Grid */}
        <View style={s.grid}>
          {listings.map((listing) => (
            <Pressable
              key={listing.id}
              style={[s.listingCard, applyShadow('card')]}
              onPress={() => router.push('/screens/marketplace/listing-detail')}
            >
              {listing.featured && (
                <View style={s.featuredBadge}>
                  <Ionicons name="star" size={12} color={palette.darkBg} />
                  <Text style={[textStyles.caption, { color: palette.darkBg, fontSize: 10, fontWeight: '600', marginLeft: 2 }]}>
                    Featured
                  </Text>
                </View>
              )}
              
              <View style={s.imagePlaceholder}>
                <Ionicons name="car-sport" size={48} color={palette.textSecondary} />
              </View>

              <View style={s.listingContent}>
                <Text style={[textStyles.body, { color: palette.lightText, fontWeight: '600' }]} numberOfLines={1}>
                  {listing.title}
                </Text>
                <Text style={[textStyles.h4, { color: palette.gold, marginTop: 2 }]}>AED {listing.price}</Text>
                
                <View style={s.listingDetails}>
                  <View style={s.detail}>
                    <Ionicons name="location-outline" size={12} color={palette.textSecondary} />
                    <Text style={[textStyles.caption, { color: palette.textSecondary, marginLeft: 2 }]}>{listing.location}</Text>
                  </View>
                  <View style={s.detail}>
                    <Ionicons name="calendar-outline" size={12} color={palette.textSecondary} />
                    <Text style={[textStyles.caption, { color: palette.textSecondary, marginLeft: 2 }]}>{listing.year}</Text>
                  </View>
                </View>

                <View style={s.detail}>
                  <Ionicons name="speedometer-outline" size={12} color={palette.textSecondary} />
                  <Text style={[textStyles.caption, { color: palette.textSecondary, marginLeft: 2 }]}>{listing.mileage}</Text>
                </View>
              </View>

              <Pressable style={s.heartBtn}>
                <Ionicons name="heart-outline" size={18} color={palette.lightText} />
              </Pressable>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {/* FAB */}
      <Pressable style={s.fab} onPress={() => router.push('/screens/listings/create-listing')}>
        <Ionicons name="add" size={28} color={palette.darkBg} />
      </Pressable>
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
  toolbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  viewToggle: { flexDirection: 'row', backgroundColor: palette.cardBg, borderRadius: radii.md, padding: 2 },
  toggleBtn: { padding: spacing.sm, borderRadius: radii.sm },
  toggleBtnActive: { backgroundColor: palette.darkBg },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  listingCard: { width: '48%', backgroundColor: palette.cardBg, borderRadius: radii.lg, overflow: 'hidden' },
  featuredBadge: { position: 'absolute', top: spacing.sm, left: spacing.sm, flexDirection: 'row', alignItems: 'center', backgroundColor: palette.gold, borderRadius: radii.sm, paddingHorizontal: 6, paddingVertical: 2, zIndex: 10 },
  imagePlaceholder: { width: '100%', height: 140, backgroundColor: palette.secondary, alignItems: 'center', justifyContent: 'center' },
  listingContent: { padding: spacing.md },
  listingDetails: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  detail: { flexDirection: 'row', alignItems: 'center' },
  heartBtn: { position: 'absolute', top: spacing.sm, right: spacing.sm, width: 32, height: 32, borderRadius: 16, backgroundColor: palette.cardBg, alignItems: 'center', justifyContent: 'center' },
  fab: { position: 'absolute', bottom: spacing['4xl'], right: spacing.lg, width: 56, height: 56, borderRadius: 28, backgroundColor: palette.gold, alignItems: 'center', justifyContent: 'center', ...applyShadow('lg') },
});
