import * as fs from 'fs';
import * as github from '@actions/github';
import * as core from '@actions/core';
import * as now from 'now-client';

async function run() {
  try {
    const zeitToken = core.getInput('zeit-token');
    const githubToken = core.getInput('repo-token');
    const repoDir = core.getInput('repo-dir');
    const buildDir = core.getInput('build-dir') || '';

    const nowJson = fs.readFileSync('now.json', 'utf8');

    const deployment = await deploy(`${repoDir}/${buildDir}`, zeitToken, JSON.parse(nowJson));

    await postComment(deployment, githubToken);
  } catch (error) {
    core.setFailed(error.message);
  }
}

async function deploy(path: string, token: string, options: object) {
  for await (const event of now.createDeployment(path, {
    token,
    ...options
  })) {
    if (event.type === 'ready') {
      console.log(event.payload);
      return event.payload;
    }
  }
}

async function postComment(body: string, token: string) {
  const octokit = new github.GitHub(token);

  await octokit.issues.createComment({
    ...github.context.issue,
    body,
  })
}

run();
