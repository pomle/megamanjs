module.exports = function(_config) {

  const dependencies = require('./src/script-manifest.json').map(src => 'src/' + src);
  dependencies.unshift('./src/lib/three.js');

  const testFiles = [
    {pattern: 'src/resource/**', watched: true, included: false},
    {pattern: 'test/integration/fixtures/**', watched: true, included: false},
    {pattern: 'test/system/input/**', watched: true, included: false},
    'test/browser-support/lib/expect.js',
    'test/browser-support/TestEnv.js',
    'test/browser-support/bootstrap.js',
    'test/integration/tests/*.js',
    'test/system/tests/*.js',
  ];

  const config = {

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha'],


    // list of files / patterns to load in the browser
    files: dependencies.concat(testFiles),


    // list of files to exclude
    exclude: [
    ],

    customLaunchers: {
        Chrome_travis_ci: {
            base: 'Chrome',
            flags: ['--no-sandbox']
        }
    },

    customContextFile: 'test/browser-support/context.html',

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
    },

    proxies: {
      '/build/': '/base/build/',
      '/src/': '/base/src/',
      '/test/': '/base/test/',
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: [
      'progress',
      //'coverage',
    ],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: _config.LOG_DEBUG,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: [
        'Chrome',
        //'Firefox',
    ],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity,
  };

  if (process.env.TRAVIS) {
      config.browsers = ['Chrome_travis_ci'];
      config.singleRun = true;
      config.files = [
        'https://cdnjs.cloudflare.com/ajax/libs/three.js/r70/three.min.js',
        'build/megaman.es5.js',
      ].concat(testFiles);
  }

  _config.set(config);
}
