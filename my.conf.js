// Karma configuration
// Generated on Mon Aug 15 2016 09:52:16 GMT+0200 (CEST)

module.exports = function(config) {
  const files = require('./src/script-manifest.json').map(src => 'src/' + src);
  files.unshift('./src/lib/three.js');

  files.push(
      {pattern: 'src/resource/**', watched: true, included: false},
      {pattern: 'test/integration/fixtures/**', watched: true, included: false},
      {pattern: 'test/system/input/**', watched: true, included: false},
      'test/browser-support/lib/expect.js',
      'test/browser-support/TestEnv.js',
      'test/browser-support/bootstrap.js',
      'test/integration/tests/*.js',
      'test/system/tests/*.js'
  );

  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha'],


    // list of files / patterns to load in the browser
    files: files,


    // list of files to exclude
    exclude: [
    ],

    customContextFile: 'test/browser-support/context.html',

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
    },

    proxies: {
      '/resource/': '/base/src/resource/'
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_DEBUG,


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
    concurrency: Infinity
  })
}
