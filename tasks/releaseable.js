/*
 * grunt-releaseable
 * https://github.com/patrickarlt/grunt-releaseable
 *
 * Copyright (c) 2014 Patrick Arlt
 * Licensed under the MIT license.
 */

'use strict';

var shelljs = require('shelljs');
var semver = require('semver');
var fs = require('fs');

module.exports = function(grunt) {

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask('releaseable', 'Opinionated software release plugin for Grunt. Use to release repos on NPM, Bower and Component.', function() {
    var VERSION_REGEXP = /([\'|\"]?version[\'|\"]?[ ]*:[ ]*[\'|\"]?)([\d||A-a|.|-]*)([\'|\"]?)/i;

    function bumpFile(file){
      grunt.log.write('bumping '+ file + ' to ' + opts.version + '... ');
      if(!opts.dryRun){
        var content = grunt.file.read(file).replace(VERSION_REGEXP, function(match){
          if (!match) {
            grunt.fatal('no version to bump in ' + file);
          }
          return opts.version;
        });
        grunt.file.write(file, content);
      }
      grunt.log.ok();
    }

    var packageVersion = grunt.file.readJSON('package.json').version;

    var opts = this.options({
      version: semver.valid(packageVersion) ? 'v' + packageVersion : packageVersion,
      build: 'npm prepublish',
      test: 'npm test',
      remote: 'origin',
      dryRun: false
    });

    if(opts.test){
      grunt.log.write('running tests with ' + opts.test + '... ');
      if(!opts.dryRun){
        shelljs.exec(opts.test);
      }
      grunt.log.ok();
    }

    if(fs.existsSync('bower.json')){
      bumpFile('bower.json');
    }

    if(fs.existsSync('component.json')){
      bumpFile('component.json');
    }

    if(fs.existsSync('bower.json') || fs.existsSync('component.json')){
      grunt.log.write('commiting bummped files... ');
      if(!opts.dryRun){
        shelljs.exec('git commit -am"bumping version  to'+ opts.version + '"');
      }
      grunt.log.ok();
    }

    grunt.log.write('checking out temporay branch to build and release on... ');
    if(!opts.dryRun){
      shelljs.exec('git checkout -b _releaseable');
    }
    grunt.log.ok();

    if(opts.build){
      grunt.log.write('building with ' + opts.build + '... ');
      if(!opts.dryRun){
        shelljs.exec(opts.build);
      }
      grunt.log.ok();
    }

    grunt.log.write('commiting built files... ');
    if(!opts.dryRun){
      shelljs.exec('git commit -am"build version '+ opts.version + '"');
    }
    grunt.log.ok();

    grunt.log.write('tagging build ' + opts.version + '... ');
    if(!opts.dryRun){
      shelljs.exec('git tag ' + opts.version);
    }
    grunt.log.ok();

    grunt.log.write('pushing build to ' + opts.remote + '... ');
    if(!opts.dryRun){
      shelljs.exec('git push --tags ' + opts.remote + ' ' + opts.version);
    }
    grunt.log.ok();

    grunt.log.write('publishing on NPM... ');
    if(!opts.dryRun){
      shelljs.exec('npm publish');
    }
    grunt.log.ok();

    grunt.log.write('cleaning up... ');
    if(!opts.dryRun){
      shelljs.exec('git checkout master');
      shelljs.exec('git branch -D _releaseable');
    }
    grunt.log.ok();
  });
};
