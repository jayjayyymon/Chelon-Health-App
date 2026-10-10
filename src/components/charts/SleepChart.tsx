import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Svg, Polyline, Circle, Text as SvgText } from 'react-native-svg';
import { useHealthData } from '@/context/HealthDataContext';

type SleepChartProps = {
  width?: number;
  height?: number;
  showLabel?: boolean;
};

export const SleepChart: React.FC<SleepChartProps> = ({
  width = 150,
  height = 100,
  showLabel = true
}) => {
  const { sleepHistory } = useHealthData();
  const sleepData = sleepHistory;

  if (sleepData.length === 0) {
    return (
      <View style={[styles.container, { width, height }]}>
        <Text style={styles.noData}>No sleep data</Text>
      </View>
    );
  }

  const padding = 20;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const hours = sleepData.map(d => d.hours);
  const minHours = Math.min(...hours);
  const maxHours = Math.max(...hours);
  const range = maxHours - minHours;
  const adjustedMin = minHours - 1; // Add padding
  const adjustedMax = maxHours + 1;
  const adjustedRange = adjustedMax - adjustedMin;

  const scaleX = (index: number) =>
    padding + (index / (sleepData.length - 1)) * chartWidth;

  const scaleY = (hours: number) =>
    padding + chartHeight - ((hours - adjustedMin) / adjustedRange) * chartHeight;

  const linePoints = sleepData.map((_, index) =>
    `${scaleX(index)},${scaleY(sleepData[index].hours)}`
  ).join(' ');

  return (
    <View style={[styles.container, { width, height }]}>
      {showLabel && (
        <Text style={styles.chartTitle}>Sleep History</Text>
      )}
      <Svg width={width} height={height}>
        {/* Line */}
        <Polyline
          points={linePoints}
          stroke="#9B59B6"
          strokeWidth={2}
          fill="none"
        />
        {/* Points */}
        {sleepData.map((point, index) => (
          <Circle
            key={point.id}
            cx={scaleX(index)}
            cy={scaleY(point.hours)}
            r={4}
            fill={index === sleepData.length - 1 ? '#9B59B6' : '#BDC3C7'}
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
          {sleepData[sleepData.length - 1].hours} hrs
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