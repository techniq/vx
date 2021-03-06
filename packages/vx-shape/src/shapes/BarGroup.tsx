import React from 'react';
import cx from 'classnames';
import { Group } from '@vx/group';
import Bar from './Bar';
import { BarGroup, ScaleType, GroupKey, $TSFIXME } from '../types';

export type BarGroupProps<Datum, Key> = {
  /** Array of data for which to generate grouped bars. */
  data: Datum[];
  /** Returns the value mapped to the x0 (group position) of a bar */
  x0: (d: Datum) => $TSFIXME;
  /** @vx/scale or d3-scale that takes an x0 value (position of group) and maps it to an x0 axis position of the group. */
  x0Scale: ScaleType;
  /** @vx/scale or d3-scale that takes a group key and maps it to an x axis position (within a group). */
  x1Scale: ScaleType;
  /** @vx/scale or d3-scale that takes an y value (Datum[key]) and maps it to a y axis position. */
  yScale: ScaleType;
  /** Returns the desired color for a bar with a given key and index. */
  color: (key: Key, index: number) => string;
  /** Array of keys corresponding to stack layers. */
  keys: Key[];
  /** Total height of the y-axis. */
  height: number;
  /** className applied to Bars. */
  className?: string;
  /** Top offset of rendered Bars. */
  top?: number;
  /** Left offset of rendered Bars. */
  left?: number;
  /** Override render function which is passed the computed BarGroups. */
  children?: (barGroups: BarGroup<Key>[]) => React.ReactNode;
};

/**
 * Generates bar groups as an array of objects and renders `<rect />`s for each datum grouped by `key`. A general setup might look like this:
 *
 * ```js
 * const data = [{
 *  date: date1,
 *  key1: value,
 *  key2: value,
 *  key3: value
 * }, {
 *  date: date2,
 *  key1: value,
 *  key2: value,
 *  key3: value,
 * }];
 *
 * const x0 = d => d.date;
 * const keys = [key1, key2, key3];
 *
 * const x0Scale = scaleBand({
 *  domain: data.map(x0),
 *  padding: 0.2
 * });
 * const x1Scale = scaleBand({
 *  domain: keys,
 *  padding: 0.1
 * });
 * const yScale = scaleLinear({
 *   domain: [0, Math.max(...data.map(d => Math.max(...keys.map(key => d[key]))))]
 * });
 * const color = scaleOrdinal({
 *   domain: keys,
 *   range: [blue, green, purple]
 * });
 * ```
 *
 * Example: [https://vx-demo.now.sh/bargroup](https://vx-demo.now.sh/bargroup)
 */
export default function BarGroupComponent<
  Datum extends { [key: string]: $TSFIXME },
  Key extends GroupKey = GroupKey
>({
  data,
  className,
  top,
  left,
  x0,
  x0Scale,
  x1Scale,
  yScale,
  color,
  keys,
  height,
  children,
  ...restProps
}: BarGroupProps<Datum, Key> &
  Omit<React.SVGProps<SVGRectElement>, keyof BarGroupProps<Datum, Key>>) {
  const x1Range = x1Scale.range();
  const x1Domain = x1Scale.domain();

  const barWidth =
    'bandwidth' in x1Scale && typeof x1Scale.bandwidth === 'function'
      ? x1Scale.bandwidth()
      : Math.abs(x1Range[x1Range.length - 1] - x1Range[0]) / x1Domain.length;

  const barGroups: BarGroup<Key>[] = data.map((group, i) => ({
    index: i,
    x0: x0Scale(x0(group))!,
    bars: keys.map((key, j) => {
      const value = group[key];
      return {
        index: j,
        key,
        value,
        width: barWidth,
        x: x1Scale(key) || 0,
        y: yScale(value) || 0,
        color: color(key, j),
        height: height - (yScale(value) || 0),
      };
    }),
  }));

  if (children) return <>{children(barGroups)}</>;

  return (
    <Group className={cx('vx-bar-group', className)} top={top} left={left}>
      {barGroups.map(barGroup => (
        <Group key={`bar-group-${barGroup.index}-${barGroup.x0}`} left={barGroup.x0}>
          {barGroup.bars.map(bar => (
            <Bar
              key={`bar-group-bar-${barGroup.index}-${bar.index}-${bar.value}-${bar.key}`}
              x={bar.x}
              y={bar.y}
              width={bar.width}
              height={bar.height}
              fill={bar.color}
              {...restProps}
            />
          ))}
        </Group>
      ))}
    </Group>
  );
}
