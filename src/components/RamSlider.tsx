import * as React from 'react';
import { useCallback, useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Slider from '@mui/material/Slider';

function valueLabelFormat(value: number) {
  if (value >= 1024) {
    return `${(value / 1024).toFixed(1)}TB`;
  }
  return `${value}GB`;
}

// Convert slider value (0-100) to RAM value
function scaleValue(value: number, maxValue: number): number {
  const minValue = 8;
  const exp = Math.log2(maxValue / minValue);
  const scaled = minValue * Math.pow(2, (exp * value) / 100);
  
  if (scaled < 64) {
    return Math.max(8, Math.round(scaled / 8) * 8);
  }
  return Math.pow(2, Math.round(Math.log2(scaled)));
}

// Convert RAM value back to slider value (0-100)
function unscaleValue(value: number, maxValue: number): number {
  const minValue = 8;
  const exp = Math.log2(maxValue / minValue);
  return (Math.log2(Math.max(minValue, value) / minValue) * 100) / exp;
}

type NonLinearSliderProps = {
  value: number[]
  setValue: (value: number[]) => void
  maxValue: number
}

const NonLinearSlider: React.FC<NonLinearSliderProps> = ({ value, setValue, maxValue }) => {
  // Convert actual RAM values to slider values (0-100)
  const sliderValue = useMemo(() => 
    value.map(v => Math.max(0, Math.min(100, unscaleValue(Math.max(8, v), maxValue)))),
    [value, maxValue]
  );

  const handleChange = useCallback((_e: Event, newValue: number | number[]) => {
    if (Array.isArray(newValue)) {
      const ramValues = newValue.map(v => scaleValue(v, maxValue));
      setValue(ramValues);
    }
  }, [maxValue, setValue]);

  const marks = useMemo(() => {
    const result = [{ value: 0, label: '8GB' }];
    let markValue = 16;
    while (markValue <= maxValue) {
      result.push({
        value: unscaleValue(markValue, maxValue),
        label: valueLabelFormat(markValue)
      });
      markValue *= 2;
    }
    return result;
  }, [maxValue]);

  return (
    <Box>
      <Typography variant="body2" gutterBottom>
        Memory: {valueLabelFormat(value[0])} - {valueLabelFormat(value[1])}
      </Typography>
      <Slider
        value={sliderValue}
        min={0}
        max={100}
        onChange={handleChange}
        getAriaValueText={(v: number) => valueLabelFormat(scaleValue(v, maxValue))}
        valueLabelFormat={(v: number) => valueLabelFormat(scaleValue(v, maxValue))}
        valueLabelDisplay="auto"
        size="small"
        marks={marks}
        disableSwap
      />
    </Box>
  );
}

export default React.memo(NonLinearSlider);
