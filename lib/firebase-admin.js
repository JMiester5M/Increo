import admin from "firebase-admin"

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    let serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
      : {
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        }

    // Fix private key newlines if they're escaped
    if (serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n")
    }

    console.log("Initializing Firebase Admin with projectId:", serviceAccount.projectId || serviceAccount.project_id)
    console.log("Client email:", serviceAccount.clientEmail || serviceAccount.client_email)
    console.log("Private key exists:", !!(serviceAccount.privateKey || serviceAccount.private_key))

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    })
    
    console.log("Firebase Admin initialized successfully")
  } catch (error) {
    console.error("Firebase Admin initialization error:", error.message)
    throw error
  }
}

const adminAuth = admin.auth()

export { adminAuth }
