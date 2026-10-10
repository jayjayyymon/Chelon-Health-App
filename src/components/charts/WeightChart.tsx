import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Circle, Polyline, Svg, Text as SvgText } from 'react-native-svg';

import { useHealthData } from '@/context/HealthDataContext';

type WeightChartProps = {
  width?: number;
  height?: number;
  showLabel?: boolean;
  lineColor?: string;
  textColor?: string;
};

export const WeightChart: React.FC<WeightChartProps> = ({
  width = 150,
  height = 100,
  showLabel = true,
  lineColor = '#2f9d77',
  textColor = '#333',
}) => {
  const { weightHistory } = useHealthData();
  const safeWidth = Math.max(80, width);
  const safeHeight = Math.max(64, height);

  if (weightHistory.length === 0) {
    return (
      <View style={[styles.container, { width: safeWidth, height: safeHeight }]}>
        <Text style={[styles.noData, { color: textColor }]}>No weight data</Text>
      </View>
    );
  }

  const padding = Math.min(20, Math.floor(Math.min(safeWidth, safeHeight) / 4));
  const chartWidth = Math.max(1, safeWidth - padding * 2);
  const chartHeight = Math.max(1, safeHeight - padding * 2);
  const weights = weightHistory.map(entry => entry.kg);
  const minWeight = Math.min(...weights);
  const maxWeight = Math.max(...weights);
  const adjustedMin = minWeight - 0.5;
  const adjustedMax = maxWeight + 0.5;
  const range = Math.max(adjustedMax - adjustedMin, 1);
  const scaleX = (index: number) => padding + (index / Math.max(weightHistory.length - 1, 1)) * chartWidth;
  const scaleY = (weight: number) => padding + chartHeight - ((weight - adjustedMin) / range) * chartHeight;
  const linePoints = weightHistory
    .map((entry, index) => `${scaleX(index)},${scaleY(entry.kg)}`)
    .join(' ');
  const latestWeight = weightHistory[weightHistory.length - 1].kg;

  return (
    <View style={[styles.container, { width: safeWidth, height: safeHeight }]}>
      {showLabel ? <Text style={[styles.chartTitle, { color: textColor }]}>Weight trend</Text> : null}
      <Svg width={safeWidth} height={safeHeight}>
        <Polyline points={linePoints} stroke={lineColor} strokeWidth={2.5} fill="none" />
        {weightHistory.map((point, index) => (
          <Circle key={point.id} cx={scaleX(index)} cy={scaleY(point.kg)} r={4} fill={lineColor} />
        ))}
        <SvgText x={safeWidth - padding / 2} y={padding} textAnchor="end" fill={textColor} fontSize={12}>
          {latestWeight.toFixed(1)} kg
        </SvgText>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  chartTitle: { alignSelf: 'flex-start', fontSize: 14, fontWeight: '600', marginBottom: 4 },
  noData: { fontSize: 14 },
});
