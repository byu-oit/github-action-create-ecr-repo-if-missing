const { getInput, setFailed } = require('@actions/core')
const AWS = require('aws-sdk')

async function run () {
  try {
    const repositoryName = getInput('DOCKER_REPO_NAME', { required: true })

    const ecr = new AWS.ECR({ apiVersion: '2015-09-21' })

    const { repositories } = await ecr.describeRepositories({ repositoryNames: [repositoryName] }).promise()
    const repositoryExists = repositories.some(repo => repo.repositoryName === repositoryName)

    if (repositoryExists) {
      console.log('Repository already exists 🎉')
      return
    }

    console.log('Repository does not exist. Creating...')
    await ecr.createRepository({ repositoryName, imageScanningConfiguration: { scanOnPush: true } })

    const accessPolicyText = JSON.stringify({
      Version: '2008-10-17',
      Statement: [
        {
          Sid: 'pull',
          Effect: 'Allow',
          Principal: {
            Service: 'codebuild.amazonaws.com'
          },
          Action: [
            'ecr:GetDownloadUrlForLayer',
            'ecr:BatchGetImage',
            'ecr:BatchCheckLayerAvailability'
          ]
        }
      ]
    })

    const lifecyclePolicyText = JSON.stringify({
      rules: [
        {
          rulePriority: 10,
          description: 'Expire untagged images after 30 days',
          selection: {
            tagStatus: 'untagged',
            countType: 'sinceImagePushed',
            countUnit: 'days',
            countNumber: 30
          },
          action: {
            type: 'expire'
          }
        }
      ]
    })

    console.log('Applying repository access and lifecycle policies...')
    await Promise.all([
      ecr.setRepositoryPolicy({ repositoryName, policyText: accessPolicyText }).promise(),
      ecr.putLifecyclePolicy({ repositoryName, lifecyclePolicyText }).promise()
    ])

    console.log('Done! 🎉')
  } catch (e) {
    setFailed(`An error occurred: ${e.message || e}`)
  }
}

run()
