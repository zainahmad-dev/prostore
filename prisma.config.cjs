module.exports = {
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  migrations: {
    // Use the project's `db/seed.ts` with tsx (already used in package.json)
    seed: 'tsx ./db/seed.ts',
  },
};
