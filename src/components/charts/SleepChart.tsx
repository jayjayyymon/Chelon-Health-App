import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Circle, Polyline, Svg, Text as SvgText } from 'react-native-svg';

import { useHealthData } from '@/context/HealthDataContext';

type SleepChartProps = {
  width?: number;
  height?: number;
  showLabel?: boolean;
  showValue?: boolean;
  lineColor?: string;
  textColor?: string;
};

export const SleepChart: React.FC<SleepChartProps> = ({
  width = 150,
  height = 100,
  showLabel = true,
  showValue = true,
  lineColor = '#9B59B6',
  textColor = '#333',
}) => {
  const { sleepHistory } = useHealthData();
  const safeWidth = Math.max(180, width);
  const safeHeight = Math.max(120, height);
  const padding = Math.min(24, Math.max(16, Math.floor(Math.min(safeWidth, safeHeight) / 6)));
  const chartWidth = Math.max(1, safeWidth - padding * 2);
  const chartHeight = Math.max(1, safeHeight - padding * 2);

  if (sleepHistory.length === 0) {
    return (
      <View style={[styles.container, { width: safeWidth, height: safeHeight }]}>
        <Text style={[styles.noData, { color: textColor }]}>No sleep data yet</Text>
      </View>
    );
  }

  const hours = sleepHistory.map(entry => entry.hours);
  const minHours = Math.min(...hours);
  const maxHours = Math.max(...hours);
  const adjustedMin = Math.max(0, minHours - 1);
  const adjustedMax = maxHours + 1;
  const adjustedRange = Math.max(adjustedMax - adjustedMin, 1);
  const scaleX = (index: number) => padding + (index / Math.max(sleepHistory.length - 1, 1)) * chartWidth;
  const scaleY = (value: number) => padding + chartHeight - ((value - adjustedMin) / adjustedRange) * chartHeight;
  const linePoints = sleepHistory.map((entry, index) => `${scaleX(index)},${scaleY(entry.hours)}`).join(' ');
  const latestHours = sleepHistory[sleepHistory.length - 1].hours;

  return (
    <View style={[styles.container, { width: safeWidth, height: safeHeight }]}>
      {showLabel ? <Text style={[styles.chartTitle, { color: textColor }]}>Sleep history</Text> : null}
      <Svg width={safeWidth} height={safeHeight}>
        <Polyline points={linePoints} stroke={lineColor} strokeWidth={3} fill="none" />
        {sleepHistory.map((point, index) => {
          const x = scaleX(index);
          const y = scaleY(point.hours);
          return (
            <React.Fragment key={point.id}>
              <Circle cx={x} cy={y} r={5} fill={index === sleepHistory.length - 1 ? lineColor : '#9db4aa'} />
              {sleepHistory.length <= 5 ? (
                <SvgText x={x} y={Math.max(14, y - 10)} textAnchor="middle" fill={textColor} fontSize={11}>
                  {point.hours.toFixed(1)}h
                </SvgText>
              ) : null}
            </React.Fragment>
          );
        })}
        {showValue ? (
          <SvgText x={safeWidth / 2} y={safeHeight - 3} textAnchor="middle" fill={textColor} fontSize={12}>
            Latest: {latestHours.toFixed(1)} hrs
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
