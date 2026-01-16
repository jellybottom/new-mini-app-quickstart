const ROOT_URL =
  'https://the-awesome-and-based.vercel.app';

/**
 * MiniApp configuration object. Must follow the Farcaster MiniApp specification.
 *
 * @see {@link https://miniapps.farcaster.xyz/docs/guides/publishing}
 */
export const minikitConfig = {
  accountAssociation: {
    header: "eyJmaWQiOjI0MTgwMSwidHlwZSI6ImF1dGgiLCJrZXkiOiIweDU4ZEFCZjhCNTM5NzY1ZTA2ZDM3Yjk0OTlEMkQzNDg0ZTdlNmM4ODgifQ",
    payload: "eyJkb21haW4iOiJ0aGUtYXdlc29tZS1hbmQtYmFzZWQudmVyY2VsLmFwcCJ9",
    signature: "mukRpW8z+s10Nvfkf5zq0QtK8bnTai9KMMB3fcWqRxsQnDBN1UrJ5nB3dEDbCa7IoNllbYbXNYseXLfo3tyJ5Bs="
  },
  miniapp: {
    version: "1",
    name: "The Awesome And Based", 
    subtitle: "The most based app on Base", 
    description: "Get your daily dose of based vibes and love!",
    screenshotUrls: ["https://the-awesome-and-based.vercel.app/basedpepe.jpg"],
    iconUrl: "https://the-awesome-and-based.vercel.app/basedpepe.jpg",
    splashImageUrl: "https://the-awesome-and-based.vercel.app/basedpepe.jpg",
    splashBackgroundColor: "#000000",
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: "entertainment",
    tags: ["meme", "fun", "based", "love", "pepe"],
    heroImageUrl: "https://the-awesome-and-based.vercel.app/basedpepe.jpg", 
    tagline: "Stay Based, Stay Awesome",
    ogTitle: "The Awesome And Based App",
    ogDescription: "Get your daily dose of based vibes and love!",
    ogImageUrl: `${ROOT_URL}/basedpepe.jpg`,
  },
} as const;

