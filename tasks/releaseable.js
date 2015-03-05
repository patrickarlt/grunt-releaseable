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
      build: 'npm run prepublish',
      test: 'npm test',
      remote: 'origin',
      mainBranch: 'master',
      dryRun: false,
      silent: true,
      bumpCommitMsg: function(version){ return 'bumping version  to ' + version; },
      buildCommitMsg: function(version){ return 'building ' + version; }
    });

    if(!opts.silent){
      grunt.log.subhead('Running Tests');
    }

    if(opts.test){
      grunt.log.write('running tests with ' + opts.test + '... ');
      if(!opts.dryRun){
        shelljs.exec(opts.test, {silent: opts.silent});
      }
      if(opts.silent){
        grunt.log.ok();
      }
    }

    if(fs.existsSync('bower.json')){
      if(!opts.silent){
        grunt.log.subhead('Bumping bower.json');
      }
      grunt.log.write('bumping bower.json to ' + opts.version + '... ');
      if(!opts.dryRun){
        var content = grunt.file.read('bower.json').replace(VERSION_REGEXP, function(match, prefix, parsedVersion, suffix){
          return prefix + opts.version + suffix;
        });
        grunt.file.write('bower.json', content);
      }
      if(opts.silent){
        grunt.log.ok();
      }

      grunt.log.write('commiting bummped files... ');
      if(!opts.dryRun){
        shelljs.exec('git commit -am"' + opts.bumpCommitMsg(opts.version) + '"', {silent: opts.silent});
      }
      if(opts.silent){
        grunt.log.ok();
      }
    }

    if(!opts.silent){
      grunt.log.subhead('Checking out temporay branch');
    }
    grunt.log.write('checking out temporay branch to build and release on... ');
    if(!opts.dryRun){
      shelljs.exec('git checkout -b _releaseable', {silent: opts.silent});
    }
    if(opts.silent){
      grunt.log.ok();
    }

    if(opts.build){
      if(!opts.silent){
        grunt.log.subhead('Starting build');
      }
      grunt.log.write('building with ' + opts.build + '... ');
      if(!opts.dryRun){
        shelljs.exec(opts.build, {silent: opts.silent});
      }
      if(opts.silent){
        grunt.log.ok();
      } else {
        grunt.log.subhead();
      }
    }

    if(!opts.silent){
      grunt.log.subhead('Adding built files to git');
    }
    grunt.log.write('adding built files... ');
    if(!opts.dryRun){
      var  filesToCommit = [];
      for (var i = this.files.length - 1; i >= 0; i--) {
        for (var j = this.files[i].src.length - 1; j >= 0; j--) {
          filesToCommit.push(this.files[i].src[j]);
        }
      }
      shelljs.exec('git add ' + filesToCommit.join(' ') + ' -f', {silent: opts.silent});
    }
    if(opts.silent){
      grunt.log.ok();
    }

    if(!opts.silent){
      grunt.log.subhead('Commiting built files');
    }
    grunt.log.write('commiting built files... ');
    if(!opts.dryRun){
      shelljs.exec('git commit -m"' + opts.buildCommitMsg(opts.version) + '"', {silent: opts.silent});
    }
    if(opts.silent){
      grunt.log.ok();
    }

    if(!opts.silent){
      grunt.log.subhead('Tagging build');
    }
    grunt.log.write('tagging build ' + opts.version + '... ');
    if(!opts.dryRun){
      shelljs.exec('git tag ' + opts.version, {silent: opts.silent});
    }
    if(opts.silent){
      grunt.log.ok();
    }

    if(!opts.silent){
      grunt.log.subhead('Pushing build');
    }
    grunt.log.write('pushing build to ' + opts.remote + '... ');
    if(!opts.dryRun){
      shelljs.exec('git push --tags ' + opts.remote + ' ' + opts.version, {silent: opts.silent});
    }
    if(opts.silent){
      grunt.log.ok();
    }

    if(!opts.silent){
      grunt.log.subhead('Publishing');
    }
    grunt.log.write('publishing on NPM... ');
    if(!opts.dryRun){
      shelljs.exec('npm publish', {silent: opts.silent});
    }
    if(opts.silent){
      grunt.log.ok();
    }

    if(!opts.silent){
      grunt.log.subhead('Clean up');
    }
    grunt.log.write('cleaning up... ');
    if(!opts.dryRun){
      shelljs.exec('git checkout '+ opts.mainBranch, {silent: opts.silent});
      shelljs.exec('git branch -D _releaseable', {silent: opts.silent});
    }
    if(opts.silent){
      grunt.log.ok();
    }
  });
};
