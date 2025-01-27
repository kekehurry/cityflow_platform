import Loading from '@/components/Loading';
import Robot from '@/components/Robot';

const LLMInterface = ({ loading }) => {
  return <>{loading ? <Loading dotSize={10} /> : <Robot emotion="happy" />}</>;
};

export default LLMInterface;
