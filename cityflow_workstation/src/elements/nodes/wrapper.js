import React, { Suspense } from 'react';

//local cache for imported modules
const moduleCache = {};

const wrapper = (Container) => {
  return ({ ...props }) => {
    const { data } = props;
    if (!(data && data.module)) return null;
    let Module;
    if (moduleCache[data.module]) {
      Module = moduleCache[data.module];
    } else {
      Module = React.lazy(() =>
        import(`@/modules/${data.module}`).catch((err) => {
          console.error(err);
          const FallbackComponent = () => (
            <React.Fragment>{`Module ${data.module} not found`}</React.Fragment>
          );
          return { default: FallbackComponent };
        })
      );
      moduleCache[data.module] = Module;
    }
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <Container {...props}>
          <Module />
        </Container>
      </Suspense>
    );
  };
};

export default wrapper;
