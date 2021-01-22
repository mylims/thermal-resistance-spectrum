export interface SeriesType {
  data: number[];
  label: string;
  units?: string;
}

const map: Record<string, string> = {
  Timestamp: 't',
  'Reservoir Pressure': 'r',
  'Inlet Pressure': 'i',
  'Outlet Pressure': 'o',
  Voltage: 'v',
  Current: 'a',
  T1: 'e',
  T2: 'm',
  'Flow Rate': 'f',
};
export function keyMap(keys: string[]) {
  return keys.map((key, index) => {
    const mapped = map[key];
    if (mapped) return mapped;
    return String.fromCharCode(65 + index);
  });
}

const units: Record<string, string> = {
  Timestamp: 'ms',
  'Reservoir Pressure': 'mbar',
  'Inlet Pressure': 'mbar',
  'Outlet Pressure': 'mbar',
  Voltage: 'V',
  Current: 'A',
  T1: 'K',
  T2: 'K',
  'Flow Rate': 'ml/s',
};
export function appendUnits(data: Record<string, SeriesType>) {
  for (const key in data) {
    if (data[key]) {
      const { label } = data[key];
      const unit = units[label] || undefined;
      if (unit) data[key].units = unit;
    }
  }
  return data;
}
