# ![BYU logo](https://www.hscripts.com/freeimages/logos/university-logos/byu/byu-logo-clipart-128.gif) github-action-create-ecr-repo-if-missing
A GitHub Action for creating AWS ECR repositories

## Usage

```yaml
on: push
# ...
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      # ...
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_KEY }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET }}
          aws-region: us-west-2
      - name: Log into Amazon ECR
        id: ecr
        uses: aws-actions/amazon-ecr-login@v1
      - name: Create ECR Repo if Missing
        uses: byu-oit/github-action-create-ecr-repo-if-missing@v1
        with:
          DOCKER_REPO_NAME: ${{ env.REPO }} # Your repo name goes here
      # ...
```

## Contributing
Hopefully this is useful to others at BYU. Feel free to ask me some questions about it, but I make no promises about being able to commit time to support it.

### Modifying Source Code

Just run `npm install` locally. There aren't many files here, so hopefully it should be pretty straightforward.

### Cutting new releases

GitHub Actions will run the entry point from the `action.yml`. In our case, that happens to be `/dist/index.js`.

Actions run from GitHub repos. We don't want to check in `node_modules`. Hence, we package the app using `npm run package`.

Then, be sure to create a new GitHub release, following SemVer.
