module.exports = function (grunt) {
  'use strict';

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' + 
          '<%= grunt.template.today("yyyy-mm-dd") %> */'
      },
      build: {
        files: {
          'jquery.rotation.min.js' : ['jquery.rotation.js']
        }
      }
    },
    jshint: {
      build: {
        src: ["jquery.rotation.js", "Gruntfile.js", "test/*.js"],
        jshintrc: true
      }
    },
    regarde: {
      uglify: {
        files: ['jquery.rotation.js'],
        tasks: ['uglify', 'jshint']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-regarde');

  grunt.registerTask('dev', ['regarde', 'jshint']);

  grunt.registerTask('default', ['uglify']);
};
