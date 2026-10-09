import { InfoRow } from '@/components/info-row';
import { PlaceholderButton } from '@/components/placeholder-button';
import { ScreenContainer } from '@/components/screen-container';
import { SectionCard } from '@/components/section-card';
import { doctors } from '@/data/mock-data';
import { Pressable, StyleSheet, View } from 'react-native';
import { Link } from 'expo-router';

export default function DoctorsScreen() {
  return (
    <ScreenContainer
      inTabs
      title="Doctors"
      subtitle="Select a doctor to book an appointment">
      {doctors.map((doctor) => (
        <Link
          key={doctor.id}
          href={`/book/${doctor.id}`}
          asChild>
          <Pressable style={styles.doctorCard}>
            <SectionCard title={doctor.name}>
              <View style={styles.content}>
                <InfoRow label="Specialty" value={doctor.specialty} />
                <InfoRow label="Next slot" value={doctor.nextSlot} />
                <PlaceholderButton label="Select doctor" />
              </View>
            </SectionCard>
          </Pressable>
        </Link>
      ))}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  doctorCard: {
    marginBottom: 16,
  },
  content: {
    padding: 12,
  },
});
