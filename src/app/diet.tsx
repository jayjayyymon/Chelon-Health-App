import { InfoRow } from '@/components/info-row';
import { ScreenContainer } from '@/components/screen-container';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { StyleSheet, TextInput, Button, View } from 'react-native';
import { Spacing } from '@/constants/theme';
import { useState } from 'react';
import { useHealthData } from '@/context/HealthDataContext';

export default function DietScreen() {
  const { dietMeals, addDietMeal, removeDietMeal } = useHealthData();
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState('');

  const totalCalories = dietMeals.reduce((sum, meal) => sum + meal.calories, 0);

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
    addDietMeal(newMeal);
    setFoodName('');
    setCalories('');
  };

  const handleRemoveMeal = (id: string) => {
    removeDietMeal(id);
  };

  return (
    <ScreenContainer subtitle={`${totalCalories} kcal from ${dietMeals.length} meals.`}>
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

      {dietMeals.length > 0 ? (
        dietMeals.map((meal) => (
          <ThemedView type="backgroundElement" style={[styles.cardStyle]}>
            <InfoRow label="Food Name" value={meal.name} />
            <InfoRow label="Calories" value={`${meal.calories} kcal`} />
            <Button
              title="Remove"
              onPress={() => handleRemoveMeal(meal.id)}
              color="#dc2626"
            />
          </ThemedView>
        ))
      ) : (
        <ThemedView type="backgroundElement" style={styles.emptyState}>
          <ThemedText type="subtitle">No meals logged yet</ThemedText>
          <ThemedText type="default">
            Add your first meal to start tracking your daily calorie intake.
          </ThemedText>
        </ThemedView>
      )}
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
  emptyState: {
    padding: 24,
    textAlign: 'center',
  },
  cardStyle: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
});