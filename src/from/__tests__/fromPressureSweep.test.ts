import { readFileSync } from 'fs';
import { join } from 'path';

import { fromPressureSweep } from '../fromPressureSweep';

test('fromPressureSweep', () => {
  let csv = readFileSync(
    join(__dirname, '../../../testFiles/Rt_300mbar.csv'),
    'latin1',
  );
  let analysis = fromPressureSweep(csv);
  let spectrum = analysis.getXYSpectrum({ index: 0 });

  expect(spectrum.variables.x.data).toHaveLength(18);
  expect(spectrum.variables.x.label).toStrictEqual('Power');

  expect(spectrum.variables.y.data).toHaveLength(18);
  expect(spectrum.variables.y.label).toStrictEqual('Temperature difference');

  expect(spectrum.title).toBe('Rt_300mbar');
});
