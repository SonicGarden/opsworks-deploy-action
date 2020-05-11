import * as core from '@actions/core'
import Opsworks from 'aws-sdk/clients/opsworks'

interface DeployOptions {
  region: string
  StackId: string
  AppId: string
}

const deploy = async ({
  region,
  StackId,
  AppId
}: DeployOptions): Promise<string> => {
  const opsworks = new Opsworks({region})
  const {DeploymentId} = await opsworks
    .createDeployment({
      Command: {
        Name: 'deploy',
        Args: {}
      },
      Comment: 'github actions',
      StackId,
      AppId
    })
    .promise()

  if (!DeploymentId) {
    throw new Error('Fail deploy')
  }

  return DeploymentId
}

interface WaitForOptions {
  region: string
  DeploymentId: string
}

type Status = 'running' | 'successful' | 'failed'

const waitFor = async ({
  region,
  DeploymentId
}: WaitForOptions): Promise<Status> => {
  const opsworks = new Opsworks({region})
  const {Deployments} = await opsworks
    .waitFor('deploymentSuccessful', {
      DeploymentIds: [DeploymentId]
    })
    .promise()

  const deployment = Deployments
    ? Deployments.find(d => d.DeploymentId === DeploymentId)
    : null

  if (!deployment || !deployment['Status']) {
    throw new Error('Deployment not found')
  }

  return deployment['Status'] as Status
}

async function run(): Promise<void> {
  try {
    const region = core.getInput('region', {required: true})
    const StackId = core.getInput('stackId', {required: true})
    const AppId = core.getInput('appId', {required: true})

    const DeploymentId = await deploy({region, StackId, AppId})
    const status = await waitFor({
      region,
      DeploymentId
    })

    core.setOutput('status', status)

    if (status !== 'successful') {
      throw new Error(`Deploy ${status}!`)
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
