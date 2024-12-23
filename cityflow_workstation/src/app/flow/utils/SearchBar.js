import { useEffect, useState } from 'react';
import { TextField, Autocomplete, Paper } from '@mui/material';
import { nanoid } from 'nanoid';

export default function SearchBar({
  builderManifest,
  groupedModules,
  setNode,
}) {
  const [options, setOptions] = useState([]);

  const handleChange = (e, v, r) => {
    if (r === 'reset') {
      const option = options.find((o) => o.name === v);
      console.log('option', option);
      const config = option.config;
      const newManifest = { ...builderManifest };
      newManifest.id = nanoid();
      newManifest.config = config;
      newManifest.config.category = 'custom';
      newManifest.config.basic = false;
      newManifest.position = {
        x: Math.random() * window.innerWidth * 0.3,
        y: Math.random() * window.innerHeight * 0.4 + window.innerHeight * 0.1,
      };
      setNode(newManifest);
    }
  };

  useEffect(() => {
    if (!groupedModules) return;
    let options = [];
    Object.entries(groupedModules).forEach(([category, group]) => {
      group.forEach((module) => {
        options.push({
          category: category,
          name: module.name,
          config: module,
        });
      });
    });
    setOptions(options);
  }, [groupedModules]);

  return (
    <Autocomplete
      id="grouped-demo"
      size="small"
      options={options}
      groupBy={(option) => option.category}
      getOptionLabel={(option) => option.name}
      isOptionEqualToValue={(option, value) => option.name === value.name}
      PaperComponent={({ children }) => (
        <Paper
          sx={{
            width: '100%',
            height: 300,
            overflow: 'auto',
            maxHeight: 400,
            scrollbarWidth: 'none',
          }}
        >
          {children}
        </Paper>
      )}
      ListboxProps={{ sx: { scrollbarWidth: 'none' } }}
      renderInput={(params) => (
        <TextField
          {...params}
          variant="outlined"
          placeholder="Search for modules"
          sx={{
            '& .MuiOutlinedInput-root': { borderRadius: '40px' },
          }}
        />
      )}
      onInputChange={handleChange}
      sx={{ width: '100%' }}
    />
  );
}
