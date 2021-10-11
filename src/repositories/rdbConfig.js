import {
  isPrEnvironment,
  assumeLocal
} from '../helpers/environment-helper.js';

const getHost = () => assumeLocal() ? 'localhost' : '10.245.135.3';
const getPort = () => 28015;
const getDbName = () => isPrEnvironment() ? `nfler_db_${process.env.PR_NUMBER}` : assumeLocal() ? 'nfler_db_local' : 'nfler_db';

const dbConfig = {
  host: getHost(),
  port: getPort(),
  db: getDbName(),
  password: process.env.DB_PASSWORD,
  user: 'admin'
};

export default dbConfig;
