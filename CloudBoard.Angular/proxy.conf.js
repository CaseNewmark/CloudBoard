module.exports = {
    "/api/**": {
      target:
        process.env["services__apiservice__https__0"] ||
        process.env["services__apiservice__http__0"],
      secure: process.env["NODE_ENV"] !== "development",
    },
  };