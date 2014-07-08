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

  grunt.registerMultiTask('releaseable', 'Opinionated task for running the test, build, tag, publish cycle', function() {
    var VERSION_REGEXP = /([\'|\"]?version[\'|\"]?[ ]*:[ ]*[\'|\"]?)([\d||A-a|.|-]*)([\'|\"]?)/i;

    var packageVersion = grunt.file.readJSON('package.json').version;

    var opts = this.options({
      version: semver.valid(packageVersion) ? 'v' + packageVersion : packageVersion,
      build: 'npm prepublish',
      test: 'npm test',
      remote: 'origin',
      mainBranch: 'master',
      dryRun: false,
      silent: true,
      bumpCommitMsg: function(version){ return 'bumping version  to ' + version; },
      buildCommitMsg: function(version){ return 'building ' + version; }
    });

    function bumpFile(file){
      grunt.log.write('bumping '+ file + ' to ' + opts.version + '... ');
      if(!opts.dryRun){
        var content = grunt.file.read(file).replace(VERSION_REGEXP, function(match, prefix, parsedVersion, suffix){
          if (!match) {
            grunt.fatal('no version to bump in ' + file);
          }
          return prefix + opts.version + suffix;
        });
        grunt.file.write(file, content);
      }
      if(!opts.silent){
        grunt.log.ok();
      }
    }

    if(opts.test){
      grunt.log.write('running tests with ' + opts.test + '... ');
      if(!opts.dryRun){
        shelljs.exec(opts.test, {silent: opts.silent});
      }
      if(!opts.silent){
        grunt.log.ok();
      }
    }

    if(fs.existsSync('bower.json')){
      bumpFile('bower.json');

      grunt.log.write('commiting bummped files... ');
      if(!opts.dryRun){
        shelljs.exec('git commit -am"' + opts.bumpCommitMsg(opts.version) + '"', {silent: opts.silent});
      }
      if(!opts.silent){
        grunt.log.ok();
      }
    }

    grunt.log.write('checking out temporay branch to build and release on... ');
    if(!opts.dryRun){
      shelljs.exec('git checkout -b _releaseable', {silent: opts.silent});
    }
    if(!opts.silent){
      grunt.log.ok();
    }

    if(opts.build){
      grunt.log.write('building with ' + opts.build + '... ');
      if(!opts.dryRun){
        shelljs.exec(opts.build, {silent: opts.silent});
      }
      if(!opts.silent){
        grunt.log.ok();
      }
    }

    grunt.log.write('commiting built files... ');
    if(!opts.dryRun){
      shelljs.exec('git commit -am"' + opts.buildCommitMsg(opts.version) + '"', {silent: opts.silent});
    }
    if(!opts.silent){
      grunt.log.ok();
    }

    grunt.log.write('tagging build ' + opts.version + '... ');
    if(!opts.dryRun){
      shelljs.exec('git tag ' + opts.version, {silent: opts.silent});
    }
    if(!opts.silent){
      grunt.log.ok();
    }

    grunt.log.write('pushing build to ' + opts.remote + '... ');
    if(!opts.dryRun){
      shelljs.exec('git push --tags ' + opts.remote + ' ' + opts.version, {silent: opts.silent});
    }
    if(!opts.silent){
      grunt.log.ok();
    }

    grunt.log.write('publishing on NPM... ');
    if(!opts.dryRun){
      shelljs.exec('npm publish', {silent: opts.silent});
    }
    if(!opts.silent){
      grunt.log.ok();
    }

    grunt.log.write('cleaning up... ');
    if(!opts.dryRun){
      shelljs.exec('git checkout '+ opts.mainBranch, {silent: opts.silent});
      shelljs.exec('git branch -D _releaseable', {silent: opts.silent});
    }
    if(!opts.silent){
      grunt.log.ok();
    }
  });
};
