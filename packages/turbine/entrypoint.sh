find /data/logs -name "*.log" -type f -mtime +30 -delete || true
pnpm exec prisma migrate deploy
pnpm run start