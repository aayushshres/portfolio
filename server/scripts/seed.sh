#!/bin/bash

# A script to seed the default data into the Cloudflare R2 bucket locally.
# Run this from the server directory.
# Uses `wrangler r2 object put` with local dev.
# Make sure your local worker is running or wrangler is properly set up.

echo "Seeding R2 data bucket..."

# Ensure we have a local bucket (wrangler handles this normally with `wrangler r2 object` in local mode if configured, but let's just use it against the actual bucket or a local persistence directory if using --local)

# Using wrangler local R2 storage
wrangler r2 object put portfolio-data/config/profile.json --file=seed/profile.json --local
wrangler r2 object put portfolio-data/config/settings.json --file=seed/settings.json --local
wrangler r2 object put portfolio-data/config/socials.json --file=seed/socials.json --local
wrangler r2 object put portfolio-data/config/projects.json --file=seed/projects.json --local
wrangler r2 object put portfolio-data/config/research.json --file=seed/research.json --local
wrangler r2 object put portfolio-data/config/publications.json --file=seed/publications.json --local

echo "Seed complete!"
