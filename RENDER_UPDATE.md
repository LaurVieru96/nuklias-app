# 🚨 Update Render Settings

Because of ESM module resolution issues with compiled TypeScript, we switched to using `tsx` for production execution.

### Go to Render Dashboard -> Settings -> Start Command

Change **Start Command** to:
```bash
npm start
```
(Since we updated package.json, `npm start` will now run `tsx server/index.ts`)

OR manually set it to:
```bash
npx tsx server/index.ts
```
