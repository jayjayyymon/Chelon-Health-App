import { InfoRow } from '@/components/info-row';
import { PlaceholderButton } from '@/components/placeholder-button';
import { ScreenContainer } from '@/components/screen-container';
import { SectionCard } from '@/components/section-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { StyleSheet, TextInput, Button, View } from 'react-native';
import { useState } from 'react';

export default function DietScreen() {
  const [meals, setMeals] = useState<Array<{id: string; name: string; meal: string; calories: number}>>([]);
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState('');

  const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);

  const handleAddMeal = () => {
    const name = foodName.trim();
    const cal = parseInt(calories, 10);
    if (name === '' || isNaN(cal) || cal <= 0) {
      alert('Please enter a valid food name and calorie count.');
      return;
    }
    const newMeal = {
      id: Date.now().toString(),
      name,
      meal: 'Custom', // We don't have a meal type input, so default to Custom
      calories: cal,
    };
    setMeals([...meals, newMeal]);
    setFoodName('');
    setCalories('');
  };

  const handleRemoveMeal = (id: string) => {
    setMeals(meals.filter((meal) => meal.id !== id));
  };

  return (
    <ScreenContainer subtitle={`${totalCalories} kcal from ${meals.length} meals.`}>
      <ThemedView type="backgroundElement" style={styles.inputContainer}>
        <ThemedText type="smallBold">Add Food</ThemedText>
        <TextInput
          placeholder="Food name"
          value={foodName}
          onChangeText={setFoodName}
          style={styles.input}
        />
        <TextInput
          placeholder="Calories"
          value={calories}
          onChangeText={setCalories}
          keyboardType="numeric"
          style={styles.input}
        />
        <Button title="Add" onPress={handleAddMeal} color="#2563eb" />
      </ThemedView>

      {meals.map((meal) => (
        <SectionCard key={meal.id} title={meal.name}>
          <InfoRow label="Meal" value={meal.meal} />
          <InfoRow label="Calories" value={`${meal.calories} kcal`} />
          <Button
            title="Remove"
            onPress={() => handleRemoveMeal(meal.id)}
            color="#dc2626"
          />
        </SectionCard>
      ))}

      <PlaceholderButton label="Add meal (placeholder)" />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    gap: 12,
    padding: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 8,
    backgroundColor: '#fff',
  },
});