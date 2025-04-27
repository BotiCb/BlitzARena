import * as convict from 'convict';
import * as yaml from 'js-yaml';
import * as fs from 'fs';

interface FirebaseServiceAccount {
  project_id: string;
  private_key: string;
  client_email: string;
}

interface Config {
  serviceUrls:{
    gameSessionServiceUrl: string;
    modelTrainingServiceUrl: string;
  }
  server: {
    port: number;
    runSeeders: boolean;
    debugMode: boolean;
    targetLanguage: string;
  };
  db: {
    url: string;
  };
  auth: {
    jwtSecret: string;
    refreshTokenSecret: string;
    servicejwtSecret: string;
  };
  email: {
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPass: string;
  };
  firebase: {
    service_account: FirebaseServiceAccount;
  };
  testMode: boolean;
  clients: {
    web: {
      frontendUrl: string;
    };
  };
}

export const config = convict<Config>({
  server: {
    port: {
      doc: 'The port to bind',
      format: 'port',
      default: 3000,
      env: 'PORT',
    },
    runSeeders: {
      doc: 'If this value is true, run the seeders at start.',
      format: Boolean,
      default: false,
      env: 'RUN_SEEDERS',
    },
    debugMode: {
      doc: 'If this value is true, the logger is turned on.',
      format: Boolean,
      default: false,
      env: 'DEBUG_MODE',
    },
    targetLanguage: {
      doc: 'Application language',
      default: 'EN',
      format: String,
      env: 'TARGET_LANGUAGE',
    },
  },
  serviceUrls: {
    gameSessionServiceUrl: {
      doc: 'The url of the game session service',
      format: String,
      default: 'http://localhost:8000/api',
      env: 'GAME_SESSION_SERVICE_URL',
    },
    modelTrainingServiceUrl: {
      doc: 'The url of the model training service',
      format: String,
      default: 'http://localhost:7000/model-trainer-api',
      env: 'MODEL_TRAINING_SERVICE_URL',
    },
  },
  db: {
    url: {
      doc: 'The access url for mongodb',
      format: String,
      default: null,
      env: 'MONGO_DB_ACCESS_URL',
    },
  },
  auth: {
    jwtSecret: {
      doc: 'The secret used for signing JWT tokens',
      format: String,
      default: '',
      env: 'JWT_SIGNING_SECRET',
    },
    refreshTokenSecret: {
      doc: 'The secret used for signing refresh tokens',
      format: String,
      default: '',
      env: 'REFRESH_TOKEN_SIGNING_SECRET',
    },
    servicejwtSecret: {
      doc: 'The secret used for signing service JWT tokens',
      format: String,
      default: '',
      env: 'SERVICE_JWT_SIGNING_SECRET',
    },
  },
  email: {
    smtpHost: {
      doc: 'SMTP server host',
      format: String,
      default: '',
      env: 'SMTP_HOST',
    },
    smtpPort: {
      doc: 'SMTP server port',
      format: 'port',
      default: 587,
      env: 'SMTP_PORT',
    },
    smtpUser: {
      doc: 'SMTP server user',
      format: String,
      default: '',
      env: 'SMTP_USER',
    },
    smtpPass: {
      doc: 'SMTP server password',
      format: String,
      default: '',
      env: 'SMTP_PASS',
    },
    fromEmail: {
      doc: 'From email address',
      format: String,
      default: '',
      env: 'FROM_EMAIL',
    },
  },
  firebase: {
    service_account: {
      project_id: {
        doc: 'Firebase project ID',
        format: String,
        default: '',
        env: 'FIREBASE_PROJECT_ID',
      },

      private_key: {
        doc: 'Firebase private key',
        format: String,
        default: '',
        env: 'FIREBASE_PRIVATE_KEY',
      },
      client_email: {
        doc: 'Firebase client email',
        format: String,
        default: '',
        env: 'FIREBASE_CLIENT_EMAIL',
      },
    },
  },
  clients: {
    web: {
      frontendUrl: {
        doc: 'The url of the frontend',
        format: String,
        default: 'http://localhost:3000',
        env: 'FRONTEND_URL',
      },
    },
  },
  testMode: {
    format: Boolean,
    default: false,
    env: 'TEST_MODE',
  },
});

convict.addParser({ extension: ['yml', 'yaml'], parse: yaml.load });
const envFilePath = './.env.yml';
if (fs.existsSync(envFilePath)) {
  config.loadFile(envFilePath);
}
config.validate({ allowed: 'strict' });
