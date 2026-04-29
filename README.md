# pr-digest

> GitHub Action that generates a weekly Markdown summary of merged PRs and sends it to Slack or email.

---

## Installation

```bash
npm install
npm run build
```

---

## Usage

Add the following workflow to your repository at `.github/workflows/pr-digest.yml`:

```yaml
name: Weekly PR Digest

on:
  schedule:
    - cron: '0 9 * * 1' # Every Monday at 9am UTC
  workflow_dispatch:

jobs:
  digest:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: your-org/pr-digest@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          slack-webhook-url: ${{ secrets.SLACK_WEBHOOK_URL }}
          email-to: team@example.com
          lookback-days: 7
```

### Inputs

| Input               | Required | Description                              |
|---------------------|----------|------------------------------------------|
| `github-token`      | ✅       | GitHub token for fetching PR data        |
| `slack-webhook-url` | ❌       | Slack Incoming Webhook URL               |
| `email-to`          | ❌       | Recipient email address                  |
| `lookback-days`     | ❌       | Number of days to look back (default: 7) |

> At least one of `slack-webhook-url` or `email-to` must be provided.

---

## Development

```bash
npm run dev      # Watch mode
npm run test     # Run tests
npm run build    # Compile TypeScript
```

---

## License

[MIT](./LICENSE)