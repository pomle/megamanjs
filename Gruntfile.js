module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    copy: {
        css: {
            files: [
                {
                    expand: true,
                    cwd: 'src/',
                    src: ['prod.css'],
                    dest: 'build/',
                    rename: function(dest, src) {
                        return dest + 'megaman.css';
                    },
                },
            ]
        },
        html: {
            files: [
                {
                    expand: true,
                    cwd: 'src/',
                    src: ['prod.html'],
                    dest: 'build/',
                    rename: function(dest, src) {
                        return dest + 'index.html';
                    },
                },
            ]
        },
        js: {
            files: [
                {
                    expand: true,
                    cwd: 'src/',
                    src: ['prod.js'],
                    dest: 'build/',
                    rename: function(dest, src) {
                        return dest + 'main.js';
                    },
                },
            ]
        },
        resources: {
            files: [
                {
                    expand: true,
                    cwd: 'src/game/resource',
                    src: ['**'],
                    dest: 'build/resource',
                },
            ]
        },
    },

    concat: {
      js: {
        nonull: true,
        options: {
          separator: '\n',
        },
        src: require('./src/script-manifest.json').map(function(p) {
            return './src/' + p;
        }),
        dest: 'build/megaman.js',
      },
    },
    uglify: {
      options: {
        mangle: true,
      },
      source: {
        src: 'build/megaman.js',
        dest: 'build/megaman.js',
      },
      bootstrap: {
        src: 'build/main.js',
        dest: 'build/main.js',
      },
    }
  });

  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('build', [
    'copy',
    'concat',
    'uglify',
  ]);

  grunt.registerTask('build:no-ugly', [
    'copy',
    'concat',
  ]);
};
