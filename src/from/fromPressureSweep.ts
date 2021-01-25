import { Analysis } from 'common-spectrum';
import SimpleLinearRegression from 'ml-regression-simple-linear';
import { ndParse } from 'ndim-parser';

import { appendUnits, keyMap, SeriesType } from '../utils';

function parseMeta(meta: Record<string, string>): Record<string, unknown> {
  if (!meta) return {};

  let ans: Record<string, unknown> = {};
  for (const key in meta) {
    const line = [key, ...meta[key].split(',')];
    for (let index = 0; index < line.length; index += 2) {
      if (line[index]) {
        const metaKey = line[index].split(':');
        ans[metaKey[0]] = line[index + 1];
      }
    }
  }

  return ans;
}

type Data = Record<string, SeriesType>;
function getDiff(
  data: Data,
  key1: string,
  key2: string,
  name: string,
  label: string,
) {
  const data1 = data[key1].data || [];
  const data2 = data[key2].data || [];
  const diffData = data1.map((val, index) => val - data2[index]);
  return {
    ...data,
    [name]: { data: diffData, label, units: data[key1].units },
  };
}

function getMul(
  data: Data,
  key1: string,
  key2: string,
  name: string,
  label: string,
  units: string,
) {
  const data1 = data[key1].data || [];
  const data2 = data[key2].data || [];
  const diffData = data1.map((val, index) => val * data2[index]);
  return {
    ...data,
    [name]: { data: diffData, label, units },
  };
}

function getInv(
  data: Data,
  key: string,
  name: string,
  label: string,
  units: string,
) {
  const originalData = data[key].data || [];
  const invData = originalData.map((val) => 1 / val);
  return {
    ...data,
    [name]: { data: invData, label, units },
  };
}

function getSlope(
  meta: Record<string, unknown>,
  data: Data,
  key1: string,
  key2: string,
  name: string,
  label: string,
  units: string,
) {
  const data1 = data[key1].data || [];
  const data2 = data[key2].data || [];
  const regression = new SimpleLinearRegression(data1, data2);
  const slope = regression.slope;
  return {
    ...meta,
    [name]: { value: slope, label, units },
  };
}

export function fromPressureSweep(text: string) {
  const { data, meta } = ndParse(text, { keyMap });

  // calculates data operations
  const parsedData = appendUnits(data);
  const dataTemp = getDiff(parsedData, 'm', 'e', 'y', 'Temperature difference');
  const dataPressure = getDiff(dataTemp, 'i', 'o', 'p', 'Pressure difference');
  const dataPower = getMul(dataPressure, 'v', 'a', 'x', 'Power', 'W');
  const dataInvFlow = getInv(dataPower, 'r', 'n', 'Inverse flow', 's/ml');

  // calculates metadata
  const parsedMeta = parseMeta(meta);
  const metaResitance = getSlope(
    parsedMeta,
    dataInvFlow,
    'x',
    'y',
    'totalThermalResistance',
    'Total thermal resistance',
    'K/W',
  );

  let analysis = new Analysis();
  analysis.pushSpectrum(dataInvFlow, {
    title: parsedMeta['Protocol name'],
    meta: metaResitance,
  });

  return analysis;
}
