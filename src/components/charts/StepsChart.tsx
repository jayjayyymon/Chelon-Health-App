import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Svg, Polyline, Circle, Text as SvgText } from 'react-native-svg';
import { useHealthData } from '@/context/HealthDataContext';

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
  const { stepsHistory } = useHealthData();
  const stepsData = stepsHistory;

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
  const adjustedMin = minSteps - 500; // Add padding
  const adjustedMax = maxSteps + 500;
  const adjustedRange = adjustedMax - adjustedMin;

  const scaleX = (index: number) =>
    padding + (index / Math.max(stepsData.length - 1, 1)) * chartWidth;

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
          {stepsData[stepsData.length - 1].steps} steps
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