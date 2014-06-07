#! /usr/bin/env node

/*!
 * issue-link - index
 * Copyright(c) 2014 dead_horse <dead_horse@qq.com>
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var util = require('util');
var fs = require('fs');
var path = require('path');
var gurl = require('github-url-from-git');

var target = process.argv[2];
var output = process.argv[3] || target;
target = path.resolve(target);
output = path.resolve(output);

var gitpage;

try {
  var pkg = JSON.parse(fs.readFileSync('./package.json'));
  gitpage = getGithubPage(pkg.repository);
  if (!gitpage) {
    console.error('can not found github home page from package.json');
    process.exit(1);
  }
} catch (err) {
  console.error('package.json not exit');
  process.exit(1);
}

var content = fs.readFileSync(target, 'utf-8');
content = replace(content, gitpage);
fs.writeFileSync(output, content);
console.log('add issue links success');

function getGithubPage(repository) {
  if (!repository) return;

  if (typeof repository === 'string') {
    if (repository.match(/^.*?\/.*?$/)) {
      return 'https://github.com/' + repository;
    }
    return gurl(repository);
  }

  return gurl(repository.url);
}

function replace(content, gitpage) {
  // [#123](/issues/123) | #123
  var ISSUE_LINK_REG = /(\[ *#\d+ *\]\(.*?\))|(#(\d+))/g;

  return content.replace(ISSUE_LINK_REG, function (text, link, name, id) {
    if (id) {
      return util.format('[%s](%s/issues/%s)', name, gitpage, id);
    }
    return text;
  });
}
