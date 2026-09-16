

const requiredEnvVars = [
  { key: "MONGO_URI", description: "MongoDB Atlas connection URI" },
  { key: "JWT_SECRET", description: "Secret string for signing JWT tokens" },
  { key: "CLOUDINARY_CLOUD_NAME", description: "Cloudinary cloud name for image uploads" },
  { key: "CLOUDINARY_API_KEY", description: "Cloudinary API key" },
  { key: "CLOUDINARY_API_SECRET", description: "Cloudinary API secret" },
];

const validateEnv = () => {
  const missing = [];

  for (const { key, description } of requiredEnvVars) {
    if (!process.env[key] || process.env[key].trim() === "") {
      missing.push({ key, description });
    }
  }

  if (missing.length > 0) {
    console.error("\n==================================================");
    console.error("❌ CRITICAL CONFIGURATION ERROR: Missing Environment Variables");
    console.error("==================================================");
    missing.forEach(({ key, description }) => {
      console.error(`  - ${key}: ${description}`);
    });
    console.error("\nPlease configure these variables in your .env file or deployment dashboard (Render/Vercel).");
    console.error("Refer to .env.example for guidance.\n");

    process.exit(1);
  }

  if (process.env.NODE_ENV === "production") {
    if (!process.env.CLIENT_URL) {
      console.warn("⚠️ [WARN] NODE_ENV is 'production' but CLIENT_URL is not set. Defaulting CORS to localhost:5173.");
    }
  }

  console.log("✅ [Config] Essential environment variables validated successfully.");
};

module.exports = validateEnv;
