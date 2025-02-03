'use client';
import html2canvas from 'html2canvas';
import FingerprintJS from 'fingerprintjs2';
import { useState } from 'react';
import { nanoid } from 'nanoid';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

export const initUserId = async () => {
  if (typeof localStorage === 'undefined') {
    return null;
  }
  const data = localStorage.getItem('cs_flow') || '{}';
  const cs_data = JSON.parse(data);
  let userId = cs_data['userId'];
  if (!userId) {
    const components = await FingerprintJS.getPromise();
    userId = FingerprintJS.x64hash128(
      components.map((component) => component.value).join(''),
      31
    );
    cs_data['userId'] = userId;
    localStorage.setItem('cs_flow', JSON.stringify(cs_data));
  }
  return userId;
};

//get core modules
export const getCoreModuleList = async () => {
  const moduleList = await fetch(basePath + '/api/local/getModuleList')
    .then((res) => res.json())
    .then((data) => data.moduleList);
  return moduleList;
};

export const getSettings = (module) => {
  const updateManifest = (manifest) => {
    manifest.entrypoint = manifest.entrypoint
      ? manifest.entrypoint
      : 'index.js';
    manifest.data = {
      input: null,
      output: null,
      module: `${module}/${manifest.entrypoint}`,
    };
    manifest.config = {
      ...manifest.config,
      run: manifest.config.hasOwnProperty('run') ? manifest.config.run : true,
    };
    return manifest;
  };

  return new Promise((resolve, reject) => {
    import(`@/modules/${module}/manifest.json`)
      .then((manifest) => {
        import(`@/modules/${module}/${manifest.default.config.icon}`)
          .then((icon) => {
            let updatedManifest = updateManifest(manifest.default);
            updatedManifest.config.icon = icon.default?.src;
            resolve(updatedManifest);
          })
          .catch((err) => {
            const updatedManifest = updateManifest(manifest.default);
            resolve(updatedManifest);
          });
      })
      .catch((err) => {
        console.log(err);
        resolve(null);
      });
  });
};

async function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export const getFlowData = async ({ rfInstance, state }) => {
  if (rfInstance) {
    const flowData = rfInstance.toObject();
    const newFlowData = {
      ...flowData,
      nodes: await Promise.all(
        flowData.nodes.map(async (node) => {
          return {
            ...node,
            data: {
              ...node.data,
              input: null,
              output: null,
            },
            config: {
              ...node.config,
              icon:
                node.config.icon && node.config.icon.includes('base64')
                  ? node.config.icon
                  : await fetch(node.config.icon)
                      .then((res) => res.blob())
                      .then((blob) => blobToBase64(blob)),
              files:
                node.config.files &&
                (await Promise.all(
                  node.config.files.map(async (file) => {
                    return {
                      ...file,
                      data: file.data.includes('base64')
                        ? file.data
                        : await fetch(file.data)
                            .then((res) => res.blob())
                            .then((blob) => blobToBase64(blob)),
                    };
                  })
                )),
              run: false,
            },
          };
        })
      ),
      edges: [...flowData.edges],
      globalScale: 0.1,
    };
    const flowContainer = document.getElementById('react-flow');
    const clonedFlowContainer = flowContainer.cloneNode(true);
    clonedFlowContainer.style.background = '#0a0a0a';
    clonedFlowContainer.style.position = 'absolute';
    document.body.appendChild(clonedFlowContainer);
    let screenShot;
    await html2canvas(clonedFlowContainer).then((canvas) => {
      screenShot = canvas.toDataURL();
      // Resize the screenshot
      const img = new Image();
      img.src = screenShot;
      img.onload = () => {
        const maxWidth = 256;
        const scale = maxWidth / img.width;
        let canvasResized = document.createElement('canvas');
        canvasResized.width = maxWidth;
        canvasResized.height = img.height * scale;
        const ctx = canvasResized.getContext('2d');
        ctx.drawImage(img, 0, 0, canvasResized.width, canvasResized.height);
        screenShot = canvasResized.toDataURL();
        canvasResized = null;
      };
    });
    document.body.removeChild(clonedFlowContainer);
    const savedData = {
      ...state,
      ...newFlowData,
      screenShot,
    };
    console.log(savedData);
    return savedData;
  }
};

export const download = (data) => {
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${data.name || 'new_task'}.csflow.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export const upload = (rfInstance, initStore) => {
  const restore = new Promise((resolve, reject) => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.oninput = (e) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const flow = JSON.parse(e.target.result);
        if (flow) {
          const { x = 0, y = 0, zoom = 1 } = flow.viewport;
          const { nodes, edges } = flow;
          rfInstance.setViewport({ x, y, zoom });
          rfInstance.setNodes(nodes);
          rfInstance.setEdges(edges);
          resolve(flow);
        }
      };
      reader.readAsText(file);
    };
    fileInput.click();
  });
  restore.then((flow) => {
    initStore(flow);
  });
};

export const getLocalStorage = (key) => {
  if (typeof localStorage === 'undefined') {
    return null;
  }
  const data = localStorage.getItem('cs_flow') || '{}';
  const cs_data = JSON.parse(data);
  return cs_data[key];
};

export const useLocalStorage = (key, defaultValue) => {
  const [localValue, setLocalValue] = useState(() => {
    if (typeof localStorage === 'undefined') {
      return null;
    }
    const data = localStorage.getItem('cs_flow') || '{}';
    const cs_data = JSON.parse(data);
    let value = cs_data[key];
    value = value ? value : defaultValue;
    return value;
  });
  const setValue = (value) => {
    if (typeof localStorage === 'undefined') {
      return null;
    }
    setLocalValue(value);
    const data = localStorage.getItem('cs_flow') || '{}';
    const cs_data = JSON.parse(data);
    cs_data[key] = value;
    localStorage.setItem('cs_flow', JSON.stringify(cs_data));
  };

  return [localValue, setValue];
};

export const getUserModule = (id) => {
  const data = localStorage.getItem('cs_flow') || '{}';
  const cs_data = JSON.parse(data);
  const userModules = cs_data['userModules'] || [];
  return userModules.find((item) => item.id === id);
};

export const saveUserModule = (data) => {
  const cs_data = JSON.parse(localStorage.getItem('cs_flow') || '{}');
  let userModules = cs_data['userModules'] || [];
  const index = userModules.findIndex((item) => item.id === data.id);
  if (index > -1) {
    userModules[index] = data;
  } else {
    userModules.push(data);
  }
  cs_data['userModules'] = userModules;
  localStorage.setItem('cs_flow', JSON.stringify(cs_data));
};

export const deleteUserModule = (id) => {
  const cs_data = JSON.parse(localStorage.getItem('cs_flow') || '{}');
  let userModules = cs_data['userModules'] || [];
  userModules = userModules.filter((item) => item.id !== id);
  cs_data['userModules'] = userModules;
  localStorage.setItem('cs_flow', JSON.stringify(cs_data));
};

export const getUserFlow = (id) => {
  const data = localStorage.getItem('cs_flow') || '{}';
  const cs_data = JSON.parse(data);
  const userFlows = cs_data['userFlows'] || [];
  return userFlows.find((item) => item.id === id);
};

export const saveUserFlow = async ({ rfInstance, state }) => {
  const data = await getFlowData({ rfInstance, state });
  if (!data?.id) {
    data.id = nanoid();
  }
  const cs_data = JSON.parse(localStorage.getItem('cs_flow') || '{}');
  let userFlows = cs_data['userFlows'] || [];
  const index = userFlows.findIndex((item) => item.id === data.id);
  if (index > -1) {
    userFlows[index] = data;
  } else {
    userFlows.push(data);
  }
  cs_data['userFlows'] = userFlows;
  try {
    localStorage.setItem('cs_flow', JSON.stringify(cs_data));
    alert('Your workflow has been saved locally!');
  } catch (e) {
    if (e.name === 'QuotaExceededError') {
      alert(
        'Local storage limit exceeded. Please clear some data and try again.'
      );
    } else {
      throw e;
    }
  }
};

export const deleteUserFlow = async (id) => {
  const cs_data = JSON.parse(localStorage.getItem('cs_flow') || '{}');
  let userFlows = cs_data['userFlows'] || [];
  userFlows = userFlows.filter((item) => item.id !== id);
  cs_data['userFlows'] = userFlows;
  localStorage.setItem('cs_flow', JSON.stringify(cs_data));
};
