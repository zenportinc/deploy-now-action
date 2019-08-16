import * as core from '@actions/core';
import * as now from 'now-client';

async function run() {
  try {
    const token = core.getInput('zeit-token');
    const folder = core.getInput('folder') || '';

    for await (const event of now.createDeployment(`${__dirname}/${folder}`, { token })) {
      if (event.type === 'ready') {
        console.log(event.payload);
        break;
      }
    }

  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
