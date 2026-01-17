import { SafeAreaView, View, Text, ScrollView, TextInput, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { palette } from '../../../theme/palette';
import { spacing, radii } from '../../../theme/tokens';
import { textStyles } from '../../../theme/typography';
import { applyShadow } from '../../../utils/shadow';

export default function CreateListingScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Pressable style={s.iconBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={20} color={palette.lightText} />
        </Pressable>
        <Text style={[textStyles.h4, { color: palette.lightText }]}>Create Listing</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={s.container}>
        {/* Upload Photos */}
        <View style={s.section}>
          <Text style={[textStyles.h4, { color: palette.lightText, marginBottom: spacing.md }]}>
            Upload Photos
          </Text>
          <Pressable style={[s.uploadBox, applyShadow('sm')]}>
            <Ionicons name="images-outline" size={48} color={palette.gold} />
            <Text style={[textStyles.body, { color: palette.lightText, marginTop: spacing.sm }]}>
              Add Photos
            </Text>
            <Text style={[textStyles.caption, { color: palette.textSecondary }]}>
              Upload at least 3 photos
            </Text>
          </Pressable>
        </View>

        {/* Car Details */}
        <View style={s.section}>
          <Text style={[textStyles.h4, { color: palette.lightText, marginBottom: spacing.md }]}>
            Car Details
          </Text>
          
          <View style={s.inputGroup}>
            <Text style={[textStyles.label, { color: palette.lightText, marginBottom: spacing.sm }]}>Car Make</Text>
            <Pressable style={s.select}>
              <Text style={[textStyles.body, { color: palette.textSecondary, flex: 1 }]}>Select make</Text>
              <Ionicons name="chevron-down" size={20} color={palette.textSecondary} />
            </Pressable>
          </View>

          <View style={s.inputGroup}>
            <Text style={[textStyles.label, { color: palette.lightText, marginBottom: spacing.sm }]}>Model</Text>
            <Pressable style={s.select}>
              <Text style={[textStyles.body, { color: palette.textSecondary, flex: 1 }]}>Select model</Text>
              <Ionicons name="chevron-down" size={20} color={palette.textSecondary} />
            </Pressable>
          </View>

          <View style={s.inputGroup}>
            <Text style={[textStyles.label, { color: palette.lightText, marginBottom: spacing.sm }]}>Year</Text>
            <View style={s.inputContainer}>
              <TextInput
                style={s.input}
                placeholder="2023"
                placeholderTextColor={palette.textSecondary}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={s.inputGroup}>
            <Text style={[textStyles.label, { color: palette.lightText, marginBottom: spacing.sm }]}>Price (AED)</Text>
            <View style={s.inputContainer}>
              <TextInput
                style={s.input}
                placeholder="Enter price"
                placeholderTextColor={palette.textSecondary}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={s.inputGroup}>
            <Text style={[textStyles.label, { color: palette.lightText, marginBottom: spacing.sm }]}>Mileage (km)</Text>
            <View style={s.inputContainer}>
              <TextInput
                style={s.input}
                placeholder="Enter mileage"
                placeholderTextColor={palette.textSecondary}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={s.inputGroup}>
            <Text style={[textStyles.label, { color: palette.lightText, marginBottom: spacing.sm }]}>Description</Text>
            <View style={[s.inputContainer, { height: 120, alignItems: 'flex-start', paddingTop: spacing.md }]}>
              <TextInput
                style={[s.input, { height: '100%' }]}
                placeholder="Describe your car..."
                placeholderTextColor={palette.textSecondary}
                multiline
                numberOfLines={5}
              />
            </View>
          </View>
        </View>

        {/* Additional Options */}
        <View style={s.section}>
          <Text style={[textStyles.h4, { color: palette.lightText, marginBottom: spacing.md }]}>
            Boost Your Listing
          </Text>
          <View style={[s.boostCard, applyShadow('sm')]}>
            <Ionicons name="flash" size={24} color={palette.gold} />
            <View style={{ flex: 1 }}>
              <Text style={[textStyles.body, { color: palette.lightText, fontWeight: '600' }]}>
                Feature this listing
              </Text>
              <Text style={[textStyles.caption, { color: palette.textSecondary }]}>
                Get 10x more views
              </Text>
            </View>
            <Ionicons name="checkbox-outline" size={24} color={palette.gold} />
          </View>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={[s.bottomBar, applyShadow('lg')]}>
        <Pressable style={s.primaryBtn}>
          <Text style={[textStyles.button, { color: palette.darkBg }]}>Publish Listing</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.darkBg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, backgroundColor: palette.cardBg, borderBottomWidth: 1, borderBottomColor: palette.border },
  iconBtn: { width: 40, height: 40, borderRadius: radii.lg, backgroundColor: palette.secondary, alignItems: 'center', justifyContent: 'center' },
  container: { padding: spacing.lg, paddingBottom: 100 },
  section: { marginBottom: spacing['3xl'] },
  uploadBox: { height: 200, borderRadius: radii.lg, borderWidth: 2, borderStyle: 'dashed', borderColor: palette.border, backgroundColor: palette.cardBg, alignItems: 'center', justifyContent: 'center' },
  inputGroup: { marginBottom: spacing.lg },
  select: { flexDirection: 'row', alignItems: 'center', backgroundColor: palette.cardBg, borderRadius: radii.lg, paddingHorizontal: spacing.lg, paddingVertical: spacing.lg, borderWidth: 1, borderColor: palette.border },
  inputContainer: { backgroundColor: palette.cardBg, borderRadius: radii.lg, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderWidth: 1, borderColor: palette.border },
  input: { color: palette.lightText, fontSize: 16, paddingVertical: 0 },
  boostCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: palette.cardBg, borderRadius: radii.lg, padding: spacing.lg, borderWidth: 1, borderColor: palette.gold },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: palette.cardBg, padding: spacing.lg, borderTopWidth: 1, borderTopColor: palette.border },
  primaryBtn: { height: 52, borderRadius: radii.lg, backgroundColor: palette.gold, alignItems: 'center', justifyContent: 'center' },
});
