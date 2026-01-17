import { SafeAreaView, View, Text, ScrollView, Pressable, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { palette } from '../../../theme/palette';
import { spacing, radii } from '../../../theme/tokens';
import { textStyles } from '../../../theme/typography';
import { applyShadow } from '../../../utils/shadow';

export default function ListingDetailScreen() {
  const router = useRouter();

  const specs = [
    { label: 'Year', value: '2023' },
    { label: 'Mileage', value: '5,000 km' },
    { label: 'Transmission', value: 'Automatic' },
    { label: 'Fuel Type', value: 'Petrol' },
    { label: 'Engine', value: '3.8L V6 Twin-Turbo' },
    { label: 'Drivetrain', value: 'AWD' },
  ];

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <Pressable style={s.iconBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={20} color={palette.lightText} />
        </Pressable>
        <Text style={[textStyles.h4, { color: palette.lightText }]}>Listing Details</Text>
        <View style={s.headerActions}>
          <Pressable style={s.iconBtn}>
            <Ionicons name="share-social-outline" size={20} color={palette.lightText} />
          </Pressable>
          <Pressable style={s.iconBtn}>
            <Ionicons name="heart-outline" size={20} color={palette.lightText} />
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.container}>
        {/* Image Gallery */}
        <View style={s.imageGallery}>
          <View style={s.mainImage}>
            <Ionicons name="car-sport" size={80} color={palette.textSecondary} />
          </View>
          <View style={s.featuredBadge}>
            <Ionicons name="star" size={12} color={palette.darkBg} />
            <Text style={[textStyles.caption, { color: palette.darkBg, fontSize: 10, fontWeight: '600', marginLeft: 2 }]}>
              Featured
            </Text>
          </View>
        </View>

        {/* Title & Price */}
        <View style={[s.card, applyShadow('card')]}>
          <Text style={[textStyles.h2, { color: palette.lightText }]}>Porsche 911 Turbo S</Text>
          <Text style={[textStyles.h1, { color: palette.gold, marginTop: spacing.sm }]}>AED 675,000</Text>
          <View style={s.location}>
            <Ionicons name="location-outline" size={16} color={palette.textSecondary} />
            <Text style={[textStyles.bodySmall, { color: palette.textSecondary, marginLeft: 4 }]}>
              Dubai Marina, Dubai
            </Text>
          </View>
        </View>

        {/* Specifications */}
        <View style={[s.card, applyShadow('card')]}>
          <Text style={[textStyles.h4, { color: palette.lightText, marginBottom: spacing.md }]}>
            Specifications
          </Text>
          <View style={s.specsGrid}>
            {specs.map((spec, idx) => (
              <View key={idx} style={s.specItem}>
                <Text style={[textStyles.caption, { color: palette.textSecondary }]}>{spec.label}</Text>
                <Text style={[textStyles.body, { color: palette.lightText, fontWeight: '600', marginTop: 2 }]}>
                  {spec.value}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Description */}
        <View style={[s.card, applyShadow('card')]}>
          <Text style={[textStyles.h4, { color: palette.lightText, marginBottom: spacing.md }]}>
            Description
          </Text>
          <Text style={[textStyles.body, { color: palette.textSecondary, lineHeight: 24 }]}>
            Immaculate condition Porsche 911 Turbo S. Full service history, single owner. All original parts with extended warranty. Ceramic brakes, sport exhaust, and premium interior package included.
          </Text>
        </View>

        {/* Seller Info */}
        <View style={[s.card, applyShadow('card')]}>
          <View style={s.seller}>
            <View style={s.avatar}>
              <Ionicons name="person" size={24} color={palette.darkBg} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[textStyles.body, { color: palette.lightText, fontWeight: '600' }]}>Ahmed Al-Mansouri</Text>
              <Text style={[textStyles.caption, { color: palette.textSecondary }]}>Member since 2020</Text>
            </View>
            <View style={s.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={20} color={palette.gold} />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={[s.bottomBar, applyShadow('lg')]}>
        <Pressable style={s.secondaryBtn}>
          <Ionicons name="chatbubble-outline" size={20} color={palette.gold} />
          <Text style={[textStyles.body, { color: palette.gold, marginLeft: spacing.sm }]}>Chat</Text>
        </Pressable>
        <Pressable style={s.primaryBtn}>
          <Ionicons name="call-outline" size={20} color={palette.darkBg} />
          <Text style={[textStyles.body, { color: palette.darkBg, marginLeft: spacing.sm, fontWeight: '600' }]}>Call Seller</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.darkBg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, backgroundColor: palette.cardBg, borderBottomWidth: 1, borderBottomColor: palette.border },
  headerActions: { flexDirection: 'row', gap: spacing.sm },
  iconBtn: { width: 40, height: 40, borderRadius: radii.lg, backgroundColor: palette.secondary, alignItems: 'center', justifyContent: 'center' },
  container: { padding: spacing.lg, paddingBottom: 100 },
  imageGallery: { position: 'relative', marginBottom: spacing.lg },
  mainImage: { width: '100%', height: 280, backgroundColor: palette.secondary, borderRadius: radii.lg, alignItems: 'center', justifyContent: 'center' },
  featuredBadge: { position: 'absolute', top: spacing.md, left: spacing.md, flexDirection: 'row', alignItems: 'center', backgroundColor: palette.gold, borderRadius: radii.sm, paddingHorizontal: spacing.sm, paddingVertical: 4 },
  card: { backgroundColor: palette.cardBg, borderRadius: radii.lg, padding: spacing.lg, marginBottom: spacing.md },
  location: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm },
  specsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg },
  specItem: { width: '47%' },
  seller: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: palette.gold, alignItems: 'center', justifyContent: 'center' },
  verifiedBadge: {},
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: palette.cardBg, flexDirection: 'row', gap: spacing.md, padding: spacing.lg, borderTopWidth: 1, borderTopColor: palette.border },
  secondaryBtn: { flex: 1, height: 52, borderRadius: radii.lg, borderWidth: 1, borderColor: palette.gold, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  primaryBtn: { flex: 1, height: 52, borderRadius: radii.lg, backgroundColor: palette.gold, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
});
