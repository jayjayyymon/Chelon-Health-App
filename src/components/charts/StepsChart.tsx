import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Circle, Polyline, Svg, Text as SvgText } from 'react-native-svg';

import { useHealthData } from '@/context/HealthDataContext';

type StepsChartProps = {
  width?: number;
  height?: number;
  showLabel?: boolean;
  showValue?: boolean;
  lineColor?: string;
  textColor?: string;
};

export const StepsChart: React.FC<StepsChartProps> = ({
  width = 150,
  height = 100,
  showLabel = true,
  showValue = true,
  lineColor = '#2ECC71',
  textColor = '#333',
}) => {
  const { stepsHistory } = useHealthData();
  const safeWidth = Math.max(180, width);
  const safeHeight = Math.max(120, height);
  const padding = Math.min(24, Math.max(16, Math.floor(Math.min(safeWidth, safeHeight) / 6)));
  const chartWidth = Math.max(1, safeWidth - padding * 2);
  const chartHeight = Math.max(1, safeHeight - padding * 2);

  if (stepsHistory.length === 0) {
    return (
      <View style={[styles.container, { width: safeWidth, height: safeHeight }]}>
        <Text style={[styles.noData, { color: textColor }]}>No steps data yet</Text>
      </View>
    );
  }

  const steps = stepsHistory.map(entry => entry.steps);
  const minSteps = Math.min(...steps, 0);
  const maxSteps = Math.max(...steps);
  const adjustedMin = Math.max(0, minSteps - 500);
  const adjustedMax = maxSteps + 500;
  const adjustedRange = Math.max(adjustedMax - adjustedMin, 1000);
  const scaleX = (index: number) => padding + (index / Math.max(stepsHistory.length - 1, 1)) * chartWidth;
  const scaleY = (value: number) => padding + chartHeight - ((value - adjustedMin) / adjustedRange) * chartHeight;
  const linePoints = stepsHistory.map((entry, index) => `${scaleX(index)},${scaleY(entry.steps)}`).join(' ');
  const latestSteps = stepsHistory[stepsHistory.length - 1].steps;

  return (
    <View style={[styles.container, { width: safeWidth, height: safeHeight }]}>
      {showLabel ? <Text style={[styles.chartTitle, { color: textColor }]}>Steps history</Text> : null}
      <Svg width={safeWidth} height={safeHeight}>
        <Polyline points={linePoints} stroke={lineColor} strokeWidth={3} fill="none" />
        {stepsHistory.map((point, index) => {
          const x = scaleX(index);
          const y = scaleY(point.steps);
          return (
            <React.Fragment key={point.id}>
              <Circle cx={x} cy={y} r={5} fill={index === stepsHistory.length - 1 ? lineColor : '#9db4aa'} />
              {stepsHistory.length <= 5 ? (
                <SvgText x={x} y={Math.max(14, y - 10)} textAnchor="middle" fill={textColor} fontSize={10}>
                  {point.steps.toLocaleString()}
                </SvgText>
              ) : null}
            </React.Fragment>
          );
        })}
        {showValue ? (
          <SvgText x={safeWidth / 2} y={safeHeight - 3} textAnchor="middle" fill={textColor} fontSize={12}>
            Latest: {latestSteps.toLocaleString()} steps
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
