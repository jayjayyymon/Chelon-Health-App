import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Svg, Polyline, Circle, Text as SvgText } from 'react-native-svg';
import { stepsToday } from '@/data/mock-data';

// Generate mock steps data for the past 7 days
const generateMockStepsData = () => {
  const baseDate = new Date(); // Assume today
  const baseSteps = stepsToday.count;
  const mockData = [];

  for (let i = 0; i < 7; i++) {
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() - i);
    const dateString = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    // Generate steps with some variation around baseSteps, but ensure it's positive
    const steps = baseSteps + Math.floor((Math.random() - 0.5) * 2000); // +/- 1000 steps
    mockData.push({
      id: `steps-${i}`,
      date: dateString,
      steps: Math.max(steps, 1000), // minimum 1000 steps
    });
  }
  // Reverse so that oldest is first
  return mockData.reverse();
};

type StepsChartProps = {
  width?: number;
  height?: number;
  showLabel?: boolean;
};

export const StepsChart: React.FC<StepsChartProps> = ({
  width = 150,
  height = 100,
  showLabel = true
}) => {
  const stepsData = generateMockStepsData();
  // Replace the last element (today) with the actual data
  const actualIndex = stepsData.length - 1;
  stepsData[actualIndex] = {
    id: 'steps-actual',
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    steps: stepsToday.count,
  };

  if (stepsData.length === 0) {
    return (
      <View style={[styles.container, { width, height }]}>
        <Text style={styles.noData}>No steps data</Text>
      </View>
    );
  }

  const padding = 20;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const steps = stepsData.map(d => d.steps);
  const minSteps = Math.min(...steps);
  const maxSteps = Math.max(...steps);
  const range = maxSteps - minSteps;
  const adjustedMin = minSteps - 500; // Add padding
  const adjustedMax = maxSteps + 500;
  const adjustedRange = adjustedMax - adjustedMin;

  const scaleX = (index: number) =>
    padding + (index / (stepsData.length - 1)) * chartWidth;

  const scaleY = (steps: number) =>
    padding + chartHeight - ((steps - adjustedMin) / adjustedRange) * chartHeight;

  const linePoints = stepsData.map((_, index) =>
    `${scaleX(index)},${scaleY(stepsData[index].steps)}`
  ).join(' ');

  return (
    <View style={[styles.container, { width, height }]}>
      {showLabel && (
        <Text style={styles.chartTitle}>Steps History</Text>
      )}
      <Svg width={width} height={height}>
        {/* Line */}
        <Polyline
          points={linePoints}
          stroke="#2ECC71"
          strokeWidth={2}
          fill="none"
        />
        {/* Points */}
        {stepsData.map((point, index) => (
          <Circle
            key={point.id}
            cx={scaleX(index)}
            cy={scaleY(point.steps)}
            r={4}
            fill={index === stepsData.length - 1 ? '#2ECC71' : '#BDC3C7'}
          />
        ))}
        {/* Current value */}
        <SvgText
          x={width - 10}
          y={20}
          textAnchor="end"
          fill="#333"
          fontSize={12}
        >
          {stepsToday.count} steps
        </SvgText>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  noData: {
    fontSize: 14,
    color: '#999',
  },
});