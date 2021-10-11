const isProductionEnvironment = () => process.env.ENVIRONMENT === 'production';
const isPrEnvironment = () => process.env.ENVIRONMENT === 'prenv';
const isLocal = () => process.env.ENVIRONMENT === 'local';

const assumeLocal = () => isLocal() || (!isProductionEnvironment() && !isPrEnvironment());

export {
  isProductionEnvironment,
  isPrEnvironment,
  isLocal,
  assumeLocal
};
