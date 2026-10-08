import { InfoRow } from '@/components/info-row';
import { PlaceholderButton } from '@/components/placeholder-button';
import { ScreenContainer } from '@/components/screen-container';
import { SectionCard } from '@/components/section-card';
import { dietMeals } from '@/data/mock-data';

const totalCalories = dietMeals.reduce((sum, meal) => sum + meal.calories, 0);

export default function DietScreen() {
  return (
    <ScreenContainer subtitle={`${totalCalories} kcal from ${dietMeals.length} mock meals.`}>
      {dietMeals.map((meal) => (
        <SectionCard key={meal.id} title={meal.name}>
          <InfoRow label="Meal" value={meal.meal} />
          <InfoRow label="Calories" value={`${meal.calories} kcal`} />
        </SectionCard>
      ))}

      <PlaceholderButton label="Add meal (placeholder)" />
    </ScreenContainer>
  );
}
