import IframeComponent from './utils/IframeComponent';

const BuilderInterface = ({ config, input, setOutput, setConfig }) => {
  return (
    <IframeComponent
      config={config}
      input={input}
      setOutput={setOutput}
      setConfig={setConfig}
    />
  );
};

export default BuilderInterface;
