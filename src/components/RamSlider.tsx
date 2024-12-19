import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Slider from '@mui/material/Slider';

function valueLabelFormat(value: number) {
  const units = ['GB', 'TB'];

  let unitIndex = 0;
  let scaledValue = value;

  while (scaledValue >= 1024 && unitIndex < units.length - 1) {
    unitIndex += 1;
    scaledValue /= 1024;
  }

  return `${scaledValue} ${units[unitIndex]}`;
}

function calculateValue(value: number) {
  return 2 ** value;
}

type NonLinearSliderProps = {
  value: number[]
  setValue: (value: number[]) => void
}

const NonLinearSlider: React.FC<NonLinearSliderProps> = ({ value, setValue }) => {

  return (
    <Box>
      <Typography gutterBottom id="non-linear-slider">
        Memory: {valueLabelFormat(calculateValue(value[0]))} - {valueLabelFormat(calculateValue(value[1]))}
      </Typography>
      <Slider
        value={[Math.log2(value[0]), Math.log2(value[1])]}
        min={0}
        step={1}
        max={10}
        scale={calculateValue}
        getAriaValueText={valueLabelFormat}
        valueLabelFormat={valueLabelFormat}
        onChange={(_e, value) => {
          if (Array.isArray(value)) {
            setValue(value.map(calculateValue) as number[])
          }
        }}
        valueLabelDisplay="auto"
        aria-labelledby="non-linear-slider"
        marks={true}
      />
    </Box>
  );
}

export default NonLinearSlider
