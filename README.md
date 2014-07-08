# grunt-releaseable

Opinionated software release plugin for Grunt. Use to release projects on NPM, and Bower.

The process used by `grunt-releaseable` us based on the publish script for [Leaflet](https://github.com/Leaflet/Leaflet/blob/master/build/publish.sh) which releases on NPM and Bower but does not keep the built files in the main branch.

Releasing follows this process.

1. Run test script
2. If it exists, bump versions in `bower.json` to match `package.json`
3. Commit the bumped files
4. Checkout a temporary branch to make the build on
5. Run your build script
6. Commit the built files
7. Tag the build with the version number
8. Push the build to the specifcied remote
9. Publish on NPM
10. Checkout `master`
11. Delete the tempory branch

If you are using GitHub you will have a new tag at the version that will have the built files in the repo but the built files will not be commited into the main (or any other) branch.

If you are following SemVer and releasing on GitHub, your new tag will show up in the releases.

## Getting Started
This plugin requires Grunt `~0.4.2`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-releaseable --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-releaseable');
```

## The "releaseable" task

### Overview
In your project's Gruntfile, add a section named `releaseable` to the data object passed into `grunt.initConfig()`.

By default the task will run `npm test` and `npm prepublish` when building your repo. Make sure you add them to your `package.json` like so...

```js
  ...

  "scripts": {
    "test": "grunt test",
    "prepublish": "grunt build"
  },

  ...
```

The version you want to release is the version that is CURRENTLY in your `package.json`. So when you want to do a release. Take the following steps...

1. Manually incriment the version in yoru `package.json`.
2. Run `grunt releaseable`.
3. Enjoy your new release.

```js
grunt.initConfig({
  releaseable: {
    release: {
      options: {}
    }
  }
});
```

### Options

#### options.version
Type: `String`
Default value: `version` from your package.json. If the version in your package.json is a valid [SemVer](http://semver.org/) `v` will be prepended to your version.
 
The version to tag with repo with. version inside `bower.json` will also be bumped if it is in your project root.

#### options.build
Type: `String`
Default value: `'npm prepublish'`

The command to run to build your files for release. Defaults to `npm prepublish` since you should be a nice citizen and use [`npm scripts`](https://www.npmjs.org/doc/misc/npm-scripts.html).

#### options.test
Type: `String`
Default value: `'npm test'`

The command to run your tests before building. Defaults to `npm test` since you should be a nice citizen and use [`npm scripts`](https://www.npmjs.org/doc/misc/npm-scripts.html).

#### options.remote
Type: `String`
Default value: `'origin'`

The Git remote to push the built tag up to.

#### options.dryRun
Type: `Boolean`
Default value: `false`

If `true` will not actually run commands just print log messages so you can confirm setup is corrent.

#### options.silent
Type: `Boolean`
Default value: `true`

If `false` this will enable verbose output from all shell commands run by `grunt releaseable`.

#### options.bumpCommitMsg
Type: `Function`
Default value: `function(version){ return 'bumping version  to ' + version }`

Function used to format the commit message after setting version in `bower.json`.

#### options.buildCommitMsg
Type: `Function`
Default value: `function(version){ return 'build ' + version }`

Function used to format the commit message after building the project for release.

### Usage Examples

#### Default Options

```js
grunt.initConfig({
  releaseable: {
    release: {
      options: {
        version: 'VERSION FROM YOUR package.json',
        build: 'npm prepublish',
        test: 'npm test',
        remote: 'origin',
        mainBranch: 'master',
        dryRun: false,
        silent: true,
        bumpCommitMsg: function(version){ return 'bumping version  to ' + version; },
        buildCommitMsg: function(version){ return 'building ' + version; }
      }
    }
  }
});
```

#### Custom Options

This custom setup uses `grunt test` and `grunt build` in place of `npm test` and `npm prepublish`, always does a dry run, and always pushes to a specific remote.

```js
grunt.initConfig({
  releaseable: {
    release: {
      options: {
        version: 'v1.0.0',
        test: 'grunt test',
        build: 'grunt build',
        remote: 'git@github.com:patrickarlt/grunt-releaseable.git',
        dryRun: true
      }
    }
  },
});
```

#### With grunt-bump

If you REALLY don't want to bump the version in your `package.json` manually you can use [grunt-bump](https://github.com/vojtajina/grunt-bump).

```js
grunt.initConfig({
  bump: {
    options: {
      files: ['package.json'],
      commit: true,
      commitMessage: 'Release v%VERSION%',
      commitFiles: ['package.json'],
      createTag: false,
      push: true,
      pushTo: 'upstream',
    }
  },
  releaseable: {
    options: {,
      remote: 'upstream',
    }
  }
});
```

Once you have this setup you can use commands like `grunt bump:major` and then run `grunt releaseable`.

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_
