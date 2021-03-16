import { readFileSync } from 'fs';
import { join } from 'path';

import { fromPressureSweep } from '../fromPressureSweep';

test('fromPressureSweep', () => {
  let csv = readFileSync(
    join(__dirname, '../../../testFiles/Rt_300mbar.csv'),
    'latin1',
  );
  let analysis = fromPressureSweep(csv);
  let spectrum = analysis.getXYSpectrum({
    xLabel: 'Power',
    yLabel: 'Temperature difference',
  });

  expect(spectrum?.variables.x.data).toHaveLength(18);
  expect(spectrum?.variables.x.label).toStrictEqual('Power');

  expect(spectrum?.variables.y.data).toHaveLength(18);
  expect(spectrum?.variables.y.label).toStrictEqual('Temperature difference');

  expect(spectrum?.title).toBe('Rt_300mbar');
  expect(Number(spectrum?.meta?.['totalThermalResistance.value'])).toBeCloseTo(
    0.90567,
    4,
  );
});
