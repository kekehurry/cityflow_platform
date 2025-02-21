import Loading from '@/components/Loading';
import Robot from './utils/Robot';

const LLMInterface = ({ loading }) => {
  return <>{loading ? <Loading dotSize={10} /> : <Robot emotion="happy" />}</>;
};

export default LLMInterface;
