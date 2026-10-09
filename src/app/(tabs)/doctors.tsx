import { InfoRow } from '@/components/info-row';
import { PlaceholderButton } from '@/components/placeholder-button';
import { ScreenContainer } from '@/components/screen-container';
import { SectionCard } from '@/components/section-card';
import { doctors } from '@/data/mock-data';
import { Pressable, StyleSheet, View } from 'react-native';
import { useState } from 'react';

export default function DoctorsScreen() {
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);

  return (
    <ScreenContainer
      inTabs
      title="Doctors"
      subtitle="Select a doctor to view appointment details">
      {doctors.map((doctor) => {
        const isSelected = selectedDoctorId === doctor.id;

        return (
          <Pressable
            key={doctor.id}
            onPress={() => setSelectedDoctorId(doctor.id)}
            style={[styles.doctorCard, isSelected && styles.selectedDoctorCard]}>
            <SectionCard title={doctor.name}>
              <View style={styles.content}>
                <InfoRow label="Specialty" value={doctor.specialty} />
                <InfoRow label="Next slot" value={doctor.nextSlot} />
                {isSelected && (
                  <View style={styles.selectedIndicator}>
                    <PlaceholderButton label="Selected" />
                  </View>
                )}
                {!isSelected && (
                  <PlaceholderButton label="Select doctor" />
                )}
              </View>
            </SectionCard>
          </Pressable>
        );
      })}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  doctorCard: {
    marginBottom: 16,
  },
  selectedDoctorCard: {
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  content: {
    padding: 12,
  },
  selectedIndicator: {
    marginTop: 12,
    alignItems: 'center',
  },
});
