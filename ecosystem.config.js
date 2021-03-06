module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps : [

    // First application
    {
      name      : 'ka_tas',
      script    : '',
      env: {
        COMMON_VARIABLE: 'true'
      },
      env_production : {
        NODE_ENV: 'production'
      }
    }
  ],

  /**
   * Deployment section
   * http://pm2.keymetrics.io/docs/usage/deployment/
   */
  deploy : {
    test: {
      user: 'root',
      host: '192.168.10.110',
      ref: 'origin/master',
      repo: 'https://github.com/thinkmix/ka_tas.git',
      path: '/home/nginx/html/ka_tas',
      'post-deploy' : 'yarn install && yarn build && pm2 reload ecosystem.config.js --env test'
    },    
    onlineTest: {
      user: 'root',
      host: '47.98.43.180',
      ref: 'origin/master',
      repo: 'https://github.com/thinkmix/ka_tas.git',
      path: '/usr/local/nginx/html/ka_tas',
      'post-deploy' : 'yarn install && yarn build && pm2 reload ecosystem.config.js --env production'
    },
    production: {
      user: 'root',
      host: '47.97.198.73',
      ref: 'origin/master',
      repo: 'https://github.com/thinkmix/ka_tas.git',
      path: '/usr/local/nginx/html/ka_tas',
      'post-deploy' : 'yarn install && yarn build && pm2 reload ecosystem.config.js --env production'
    }
  }
};
