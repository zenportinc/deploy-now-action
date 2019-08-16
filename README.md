# Deploy now action

Action for deploying to [Now](https://zeit.co/now) and publish in the pull request a comment with a link.

## Example

Assuming for a classic javascript application project:

```yaml
name: "PR Checks"
on: [pull_request]

jobs:
  deploy:
    name: Deploy to now
    runs-on: ubuntu-latest
    steps:
      - name: Check out code
        uses: actions/checkout@master

      # If you can skip this part if you want to let Now do the builds
      - name: Install dependencies
        run: npm install
      - name: Build
        run: npm run build

      - name: Deploy to now
        uses: zenportinc/deploy-now-action@v1
        with:
          zeit-token: ${{ secrets.ZEIT_TOKEN }}
          repo-token: ${{ secrets.GITHUB_TOKEN }}
          # Don't forget to replace REPOSITORY_NAME by your repository name
          repo-dir: ${{ format('{0}/{1}', runner.workspace, 'REPOSITORY_NAME') }}
          # optional, if you build in this job
          build-dir: 'build'
```
