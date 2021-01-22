import { Analysis } from 'common-spectrum';
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

export function fromPressureSweep(text: string) {
  const { data, meta } = ndParse(text, { keyMap });
  const parsedMeta = parseMeta(meta);
  const parsedData = appendUnits(data);
  const dataTemp = getDiff(parsedData, 'm', 'e', 'y', 'Temperature difference');
  const dataPressure = getDiff(dataTemp, 'i', 'o', 'p', 'Pressure difference');
  const dataPower = getMul(dataPressure, 'v', 'a', 'x', 'Power', 'W');

  let analysis = new Analysis();
  analysis.pushSpectrum(dataPower, {
    title: parsedMeta['Protocol name'],
    meta: parsedMeta,
  });

  return analysis;
}
