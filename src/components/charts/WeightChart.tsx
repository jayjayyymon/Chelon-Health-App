import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Svg, Polyline, Circle, Text as SvgText } from 'react-native-svg';
import { useHealthData } from '@/context/HealthDataContext';

type WeightChartProps = {
  width?: number;
  height?: number;
  showLabel?: boolean;
};

export const WeightChart: React.FC<WeightChartProps> = ({
  width = 150,
  height = 100,
  showLabel = true
}) => {
  const { weightHistory } = useHealthData();

  if (weightHistory.length === 0) {
    return (
      <View style={[styles.container, { width, height }]}>
        <Text style={styles.noData}>No weight data</Text>
      </View>
    );
  }

  // Calculate chart dimensions with padding
  const padding = 20;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // Find min and max weight for scaling
  const weights = weightHistory.map(d => d.kg);
  const minWeight = Math.min(...weights);
  const maxWeight = Math.max(...weights);
  const weightRange = maxWeight - minWeight;
  const adjustedMin = minWeight - 0.5; // Add some padding below min
  const adjustedMax = maxWeight + 0.5; // Add some padding above max
  const range = adjustedMax - adjustedMin;

  // Scale functions
  const scaleX = (index: number) =>
    padding + (index / (weightHistory.length - 1)) * chartWidth;

  const scaleY = (weight: number) =>
    padding + chartHeight - ((weight - adjustedMin) / range) * chartHeight;

  // Generate line points
  const linePoints = weightHistory.map((_, index) =>
    `${scaleX(index)},${scaleY(weightHistory[index].kg)}`
  ).join(' ');

  return (
    <View style={[styles.container, { width, height }]}>
      {showLabel && (
        <Text style={styles.chartTitle}>Weight History</Text>
      )}
      <Svg width={width} height={height}>
        {/* Line */}
        <Polyline
          points={linePoints}
          stroke="#FF6B6B"
          strokeWidth={2}
          fill="none"
        />
        {/* Points */}
        {weightHistory.map((point, index) => (
          <Circle
            key={point.id}
            cx={scaleX(index)}
            cy={scaleY(point.kg)}
            r={4}
            fill="#FF6B6B"
          />
        ))}
        {/* Optional: show current value */}
        <SvgText
          x={width - 10}
          y={20}
          textAnchor="end"
          fill="#333"
          fontSize={12}
        >
          {weightHistory[weightHistory.length - 1].kg} kg
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