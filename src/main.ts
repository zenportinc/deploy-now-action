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
    const configPath = core.getInput('config') || 'now.json';

    const nowJson = fs.readFileSync(configPath, 'utf8');
    const options = JSON.parse(nowJson);

    const deployment = await deploy(`${repoDir}/${buildDir}`, zeitToken, options);

    await postComment(formatDeployment(deployment, options.name), githubToken);
  } catch (error) {
    core.setFailed(error.message);
  }
}

async function deploy(path: string, token: string, options: object): Promise<object> {
  for await (const event of now.createLegacyDeployment(path, {
    token,
    ...options
  })) {
    core.debug(event.payload);

    switch (event.type) {
      case 'ready':
        return event.payload;
      case 'error':
        throw event.payload;
    }
  }

  throw new Error('No deployment');
}

function formatDeployment(deployment: object, name?: string): string {
  // @ts-ignore
  const { url } = deployment;

  return `New ${name + ' '}deployment available on now!\n> http://${url}`;
}

async function postComment(body: string, token: string) {
  const octokit = new github.GitHub(token);

  const { owner, repo, number: issue_number } = github.context.issue;

  await octokit.issues.createComment({ owner, repo, issue_number, body })
}

run();
