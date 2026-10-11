import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Circle, Polyline, Svg, Text as SvgText } from 'react-native-svg';

import { useHealthData } from '@/context/HealthDataContext';

type WeightChartProps = {
  width?: number;
  height?: number;
  showLabel?: boolean;
  showValue?: boolean;
  lineColor?: string;
  textColor?: string;
};

export const WeightChart: React.FC<WeightChartProps> = ({
  width = 150,
  height = 100,
  showLabel = true,
  showValue = true,
  lineColor = '#2f9d77',
  textColor = '#333',
}) => {
  const { weightHistory } = useHealthData();
  const safeWidth = Math.max(180, width);
  const safeHeight = Math.max(120, height);
  const padding = Math.min(24, Math.max(16, Math.floor(Math.min(safeWidth, safeHeight) / 6)));
  const chartWidth = Math.max(1, safeWidth - padding * 2);
  const chartHeight = Math.max(1, safeHeight - padding * 2);

  if (weightHistory.length === 0) {
    return (
      <View style={[styles.container, { width: safeWidth, height: safeHeight }]}>
        <Text style={[styles.noData, { color: textColor }]}>No weight data yet</Text>
      </View>
    );
  }

  const weights = weightHistory.map(entry => entry.kg);
  const minWeight = Math.min(...weights);
  const maxWeight = Math.max(...weights);
  const adjustedMin = minWeight - 0.5;
  const adjustedMax = maxWeight + 0.5;
  const range = Math.max(adjustedMax - adjustedMin, 1);
  const scaleX = (index: number) => padding + (index / Math.max(weightHistory.length - 1, 1)) * chartWidth;
  const scaleY = (weight: number) => padding + chartHeight - ((weight - adjustedMin) / range) * chartHeight;
  const linePoints = weightHistory.map((entry, index) => `${scaleX(index)},${scaleY(entry.kg)}`).join(' ');
  const latestWeight = weightHistory[weightHistory.length - 1].kg;

  return (
    <View style={[styles.container, { width: safeWidth, height: safeHeight }]}>
      {showLabel ? <Text style={[styles.chartTitle, { color: textColor }]}>Weight trend</Text> : null}
      <Svg width={safeWidth} height={safeHeight}>
        <Polyline points={linePoints} stroke={lineColor} strokeWidth={3} fill="none" />
        {weightHistory.map((point, index) => {
          const x = scaleX(index);
          const y = scaleY(point.kg);
          return (
            <React.Fragment key={point.id}>
              <Circle cx={x} cy={y} r={5} fill={lineColor} />
              {weightHistory.length <= 5 ? (
                <SvgText x={x} y={Math.max(14, y - 10)} textAnchor="middle" fill={textColor} fontSize={11}>
                  {point.kg.toFixed(1)}
                </SvgText>
              ) : null}
            </React.Fragment>
          );
        })}
        {showValue ? (
          <SvgText x={safeWidth / 2} y={safeHeight - 3} textAnchor="middle" fill={textColor} fontSize={12}>
            Latest: {latestWeight.toFixed(1)} kg
          </SvgText>
        ) : null}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  chartTitle: { alignSelf: 'center', fontSize: 14, fontWeight: '600', marginBottom: 4 },
  noData: { fontSize: 14, textAlign: 'center' },
});
