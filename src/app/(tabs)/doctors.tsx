import { InfoRow } from '@/components/info-row';
import { PlaceholderButton } from '@/components/placeholder-button';
import { ScreenContainer } from '@/components/screen-container';
import { SectionCard } from '@/components/section-card';
import { doctors } from '@/data/mock-data';

export default function DoctorsScreen() {
  return (
    <ScreenContainer
      inTabs
      title="Doctors"
      subtitle="Mock consultation list. Booking is not implemented.">
      {doctors.map((doctor) => (
        <SectionCard key={doctor.id} title={doctor.name}>
          <InfoRow label="Specialty" value={doctor.specialty} />
          <InfoRow label="Next slot" value={doctor.nextSlot} />
          <PlaceholderButton label="Book appointment (placeholder)" />
        </SectionCard>
      ))}
    </ScreenContainer>
  );
}
