import {
  Box,
  ImageList,
  Stack,
  Typography,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
} from '@mui/material';
import React, { useState, useEffect, useRef } from 'react';
import { nanoid } from 'nanoid';
import { addNode, updateMeta } from '@/store/actions';
import { connect } from 'react-redux';
import EditIcon from '@mui/icons-material/Edit';
import { getCoreModuleList, getSettings } from '@/utils/local';
import { searchModule } from '@/utils/dataset';
import SearchBar from './SearchBar';
import ModuleIcon from './ModuleIcon';
import { useLocalStorage } from '@/utils/local';

const mapStateToProps = (state, ownProps) => ({
  state: state,
  flowCodes: {
    ...state,
    data: null,
    nodes: state.nodes.map((node) => {
      return {
        ...node,
        icon: null,
        data: {
          ...node.data,
          input: null,
          output: null,
        },
        config: {
          ...node.config,
          scope: {},
          run: false,
        },
      };
    }),
    edges: [...state.edges],
    screenShot: null,
  },
  viewport: state.viewport,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  setNode: (node) => dispatch(addNode({ ...node })),
  setMeta: (meta) => dispatch(updateMeta(meta)),
});

export const ModuleList = (props) => {
  const { tab } = props;
  const [builderManifest, setBuilderManifest] = useState(null);
  const latestPropsRef = useRef(props);
  const [edit, setEdit] = useState(false);
  const [userModules, setUserModules] = useLocalStorage('userModules', []);
  const [basicModules, setBasicModules] = useState([]);
  const [coreModules, setCoreModules] = useState({});
  const [groupedModules, setGroupedModules] = useState({});

  useEffect(() => {
    latestPropsRef.current = props;
  }, [props]);

  // Get modules from server
  useEffect(() => {
    // get core modules from server
    const fetchModules = async (category, subList) => {
      const modules = await Promise.all(
        subList.map(async (moduleName) => {
          const id = nanoid();
          const module = `${category}/${moduleName}`;
          let manifest = await getSettings(module);
          if (!manifest) return null;
          manifest.id = id;
          if (manifest.module === 'builder') {
            setBuilderManifest({ ...manifest });
          }
          return manifest;
        })
      );
      return modules;
    };

    getCoreModuleList().then((moduleList) => {
      Object.entries(moduleList).forEach(([category, moduleList]) => {
        fetchModules(category, moduleList).then((modules) => {
          setCoreModules((prevModules) => ({
            ...prevModules,
            [category]: modules,
          }));
        });
      });
    });

    // get basic modules from server
    const params = { basic: true };
    searchModule(params).then((moduleList) => {
      if (!moduleList) return;
      const modules = moduleList.map((config) => {
        let module = { ...config };
        module.custom = true;
        module.expand = false;
        module.run = false;
        return module;
      });
      setBasicModules(modules);
    });
  }, []);

  // Group basic and user modules by category
  useEffect(() => {
    const groupModules = (moduleList) => {
      const groupedModules = {};
      Array.isArray(moduleList) &&
        moduleList.forEach((config) => {
          if (!config) return;
          if (!groupedModules[config.category]) {
            groupedModules[config.category] = [];
          }
          groupedModules[config.category].push({ ...config });
        });
      return groupedModules;
    };
    const groupedModules = groupModules([...basicModules, ...userModules]);
    setGroupedModules({ ...groupedModules });
  }, [userModules, basicModules]);

  useEffect(() => {
    const saveUserModule = (e) => {
      const data = e.detail;
      let newModules = userModules;
      const index = userModules.findIndex((item) => item.id === data.id);
      if (index > -1) {
        newModules[index] = data;
      } else {
        newModules.push(data);
      }
      setUserModules(newModules);
    };
    window.addEventListener('localModulesChange', saveUserModule);
    return () => {
      window.removeEventListener('locaModulesChange', saveUserModule);
    };
  }, []);

  return (
    <Box id="ModulePanel" hidden={tab !== 1}>
      <Stack direction="row" spacing={1} sx={{ pb: 2 }}>
        <SearchBar
          builderManifest={builderManifest}
          groupedModules={groupedModules}
          setNode={props.setNode}
        />
        <IconButton
          variant="outlined"
          onClick={() => {
            setEdit(!edit);
          }}
          sx={{
            color: edit ? 'secondary.main' : 'text.primary',
            border: '1px solid ',
            borderColor: edit ? 'secondary.main' : '#424242',
            transform: 'scale(0.8)',
          }}
        >
          <EditIcon />
        </IconButton>
      </Stack>
      <Stack key={'core'} direction="column" alignItems="left" spacing={1}>
        {Object.entries(coreModules).map(([category, coreModulesList]) => (
          <Box key={category}>
            <Accordion
              sx={{ border: '0px', background: 'none' }}
              variant="outlined"
              disableGutters
              defaultExpanded
            >
              <AccordionSummary
                sx={{ height: 10, minHeight: 30, m: 0, paddingLeft: 1 }}
              >
                <Typography variant="h6">
                  {`${category.toLowerCase()}`}
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ m: 0, p: 1, border: '0px' }}>
                <ImageList cols={3} rowHeight={5}>
                  {coreModulesList.map((manifest) => {
                    return (
                      <ModuleIcon
                        key={manifest.id}
                        manifest={manifest}
                        edit={edit}
                      />
                    );
                  })}
                </ImageList>
              </AccordionDetails>
            </Accordion>
            <Divider />
          </Box>
        ))}
      </Stack>
      <Stack key={'custom'} direction="column" alignItems="left" spacing={1}>
        {Object.entries(groupedModules).map(([category, customModules]) => (
          <Box key={category}>
            <Accordion
              sx={{ border: '0px', background: 'none' }}
              variant="outlined"
              disableGutters
            >
              <AccordionSummary
                sx={{ height: 10, minHeight: 30, m: 0, paddingLeft: 1 }}
              >
                <Typography variant="h6">
                  {`${category.toLowerCase()}`}
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ m: 0, p: 1, border: '0px' }}>
                <ImageList cols={3} rowHeight={5}>
                  {customModules.map((config) => {
                    if (!builderManifest) return null;
                    const id = nanoid();
                    const newManifest = { ...builderManifest };
                    newManifest.id = id;
                    newManifest.config = { ...config };
                    return (
                      <ModuleIcon
                        userModules={userModules}
                        setUserModules={setUserModules}
                        key={id}
                        manifest={newManifest}
                        edit={edit}
                      />
                    );
                  })}
                </ImageList>
              </AccordionDetails>
            </Accordion>
            <Divider />
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(ModuleList);
