import { SafeAreaView, View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { palette } from '../../theme/palette';
import { spacing, radii } from '../../theme/tokens';
import { textStyles } from '../../theme/typography';
import { applyShadow } from '../../utils/shadow';

export default function OffersScreen() {
  const router = useRouter();

  const filters = ['All', 'Active', 'Expired', 'Upcoming'];
  
  const offers = [
    { id: 1, title: '50% OFF Premium Wash', shop: 'Speed Detailing', code: 'WASH50', expiry: '3 days left', type: 'Service', discount: '50%' },
    { id: 2, title: 'Buy 1 Get 1 Oil Change', shop: 'Auto Care Center', code: 'OIL2FOR1', expiry: '1 week left', type: 'Maintenance', discount: 'BOGO' },
    { id: 3, title: 'AED 200 OFF Tires', shop: 'Tire Masters', code: 'TIRE200', expiry: '2 weeks left', type: 'Parts', discount: 'AED 200' },
  ];

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <Text style={[textStyles.h3, { color: palette.lightText }]}>Offers</Text>
        <View style={s.headerIcons}>
          <Pressable style={s.iconBtn} onPress={() => router.push('/screens/search')}>
            <Ionicons name="search-outline" size={20} color={palette.lightText} />
          </Pressable>
          <Pressable style={s.iconBtn}>
            <Ionicons name="bookmark-outline" size={20} color={palette.lightText} />
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
        {/* Stats Card */}
        <View style={[s.statsCard, applyShadow('card')]}>
          <View style={s.stat}>
            <Text style={[textStyles.h3, { color: palette.gold }]}>12</Text>
            <Text style={[textStyles.caption, { color: palette.textSecondary }]}>Active Offers</Text>
          </View>
          <View style={s.divider} />
          <View style={s.stat}>
            <Text style={[textStyles.h3, { color: palette.gold }]}>5</Text>
            <Text style={[textStyles.caption, { color: palette.textSecondary }]}>Saved</Text>
          </View>
          <View style={s.divider} />
          <View style={s.stat}>
            <Text style={[textStyles.h3, { color: palette.gold }]}>AED 850</Text>
            <Text style={[textStyles.caption, { color: palette.textSecondary }]}>Saved Total</Text>
          </View>
        </View>

        {/* Offers List */}
        {offers.map((offer) => (
          <Pressable
            key={offer.id}
            style={[s.offerCard, applyShadow('card')]}
            onPress={() => router.push('/screens/offers/offer-detail')}
          >
            <View style={s.offerHeader}>
              <View style={s.offerIcon}>
                <Ionicons name="pricetag" size={24} color={palette.darkBg} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[textStyles.body, { color: palette.lightText, fontWeight: '600' }]} numberOfLines={1}>
                  {offer.title}
                </Text>
                <Text style={[textStyles.caption, { color: palette.textSecondary }]}>{offer.shop}</Text>
              </View>
              <View style={s.discountBadge}>
                <Text style={[textStyles.bodySmall, { color: palette.darkBg, fontWeight: '700' }]}>
                  {offer.discount}
                </Text>
              </View>
            </View>

            <View style={s.offerCode}>
              <View style={{ flex: 1 }}>
                <Text style={[textStyles.caption, { color: palette.textSecondary, marginBottom: 2 }]}>Promo Code</Text>
                <Text style={[textStyles.body, { color: palette.gold, fontWeight: '700', fontFamily: 'monospace' }]}>
                  {offer.code}
                </Text>
              </View>
              <Pressable style={s.copyBtn}>
                <Ionicons name="copy-outline" size={18} color={palette.gold} />
                <Text style={[textStyles.bodySmall, { color: palette.gold, marginLeft: 4, fontWeight: '600' }]}>Copy</Text>
              </Pressable>
            </View>

            <View style={s.offerFooter}>
              <View style={s.tag}>
                <Text style={[textStyles.caption, { color: palette.gold }]}>{offer.type}</Text>
              </View>
              <View style={s.expiry}>
                <Ionicons name="time-outline" size={12} color={palette.textSecondary} />
                <Text style={[textStyles.caption, { color: palette.textSecondary, marginLeft: 4 }]}>{offer.expiry}</Text>
              </View>
              <Pressable>
                <Ionicons name="bookmark-outline" size={20} color={palette.textSecondary} />
              </Pressable>
            </View>
          </Pressable>
        ))}
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
  statsCard: { flexDirection: 'row', backgroundColor: palette.cardBg, borderRadius: radii.lg, padding: spacing.lg, marginBottom: spacing.xl },
  stat: { flex: 1, alignItems: 'center' },
  divider: { width: 1, backgroundColor: palette.border },
  offerCard: { backgroundColor: palette.cardBg, borderRadius: radii.lg, padding: spacing.lg, marginBottom: spacing.md, borderWidth: 1, borderColor: palette.border },
  offerHeader: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  offerIcon: { width: 48, height: 48, borderRadius: radii.md, backgroundColor: palette.gold, alignItems: 'center', justifyContent: 'center' },
  discountBadge: { backgroundColor: palette.gold, borderRadius: radii.sm, paddingHorizontal: spacing.sm, paddingVertical: 4 },
  offerCode: { flexDirection: 'row', alignItems: 'center', backgroundColor: palette.secondary, borderRadius: radii.md, padding: spacing.md, marginTop: spacing.md, borderStyle: 'dashed', borderWidth: 1, borderColor: palette.gold },
  copyBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radii.sm, backgroundColor: palette.darkBg },
  offerFooter: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: palette.border },
  tag: { backgroundColor: palette.secondary, borderRadius: radii.sm, paddingHorizontal: spacing.sm, paddingVertical: 2, borderWidth: 1, borderColor: palette.gold },
  expiry: { flexDirection: 'row', alignItems: 'center', flex: 1 },
});
