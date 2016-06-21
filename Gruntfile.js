module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt);

  var path = require('path');

  /**
   * Resolve external project resource as file path
   */
  function resolvePath(project, file) {
    return path.join(path.dirname(require.resolve(project)), file);
  }
  grunt.loadNpmTasks('grunt-bell');
  grunt.loadNpmTasks('grunt-notify');

  // project configuration
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    notify: {
      watch: {
        options: {
          title: 'Task Complete',  // optional
          message: 'build complete', //required
        }
      }
    },
    notify_hooks: {
    options: {
      enabled: true,
      max_jshint_notifications: 1, // maximum number of notifications from jshint output
      title: "BPMN", // defaults to the name in package.json, or will use project directory's name
      success: true, // whether successful grunt executions should be notified automatically
      duration: 1 // the duration of notification in seconds, for `notify-send only
    }
  },
    config: {
      sources: 'app',
      dist: 'dist'
    },

    jshint: {
      src: [
        ['<%=config.sources %>']
      ],
      options: {
        jshintrc: true
      }
    },

    browserify: {
      options: {
        browserifyOptions: {
          debug: true,
          insertGlobalVars: []
        },
        transform: [ 'brfs' ]
      },
      watch: {
        options: {
          watch: true
        },
        files: {
          '<%= config.dist %>/index.js': [ '<%= config.sources %>/**/*.js' ]
        }
      },
      app: {
        files: {
          '<%= config.dist %>/index.js': [ '<%= config.sources %>/**/*.js' ]
        }
      }
    },

    copy: {
      diagram_js: {
        files: [
          {
            src: resolvePath('diagram-js', 'assets/diagram-js.css'),
            dest: '<%= config.dist %>/css/diagram-js.css'
          }
        ]
      },
      bpmn_js: {
        files: [
          {
            expand: true,
            cwd: resolvePath('bpmn-js', 'assets'),
            src: ['**/*.*', '!**/*.js'],
            dest: '<%= config.dist %>/vendor'
          }
        ]
      },
      app: {
        files: [
          {
            expand: true,
            cwd: '<%= config.sources %>/',
            src: ['**/*.*', '!**/*.js'],
            dest: '<%= config.dist %>'
          }
        ]
      }
    },

    less: {
      options: {
        dumpLineNumbers: 'comments',
        paths: [
          'node_modules'
        ]
      },

      styles: {
        files: {
          'dist/css/app.css': 'styles/app.less'
        }
      }
    },

    watch: {
      samples: {
        files: [ '<%= config.sources %>/**/*.*' ],
        tasks: [ 'copy:app' , 'hasfailed']
      },

      less: {
        files: [
          'styles/**/*.less',
          'node_modules/bpmn-js-properties-panel/styles/**/*.less'
        ],
        tasks: [
          'less'
        ]
      },

      connect: {
        options: {
          livereload: 9014
        },
        files: [
          '<%= config.sources %>/**/*.css'
        ],
        tasks: []
      }
    },

    connect: {
      options: {
        appName: 'Firefox', // name of the app that opens, ie: open, start, xdg-open
        port: 9013,
        livereload: 9014,
        hostname: 'localhost'
      },
      livereload: {
        options: {
          open: { appName: 'Firefox' },
          base: [
            '<%= config.dist %>'
          ]
        }
      }
    }
  });

  // tasks
  grunt.registerTask('build', [ 'copy', 'less', 'browserify:app' ]);

  grunt.registerTask('auto-build', [
    'copy',
    'less',
    'browserify:watch',
    'connect:livereload',
    'watch',
    'notify_hooks'
    ]);

  grunt.registerTask('hasfailed', function() {
    console.log(grunt.fail.warncount)
  if (grunt.fail.warncount > 0) {
    grunt.log.write('\x07'); // beep!
    return false; // stops the task run
  }

  // This is required if you use any options.
  // otherwise continue the task run as normal
});

  grunt.registerTask('default', [ 'jshint','hasfailed', 'build' ]);
};
