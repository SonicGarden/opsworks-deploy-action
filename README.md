# Opsworks deploy action

## Usage:

```yaml
name: Release
on:
  push:
    branches:
      - master

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: SonicGarden/opsworks-deploy-action@v1
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.DEPLOY_AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.DEPLOY_AWS_SECRET_ACCESS_KEY }}
        with:
          stackId: xxxx
          appId: xxxx
```
