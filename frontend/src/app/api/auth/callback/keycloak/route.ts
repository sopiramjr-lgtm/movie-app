import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (error || !code) {
    const msg = encodeURIComponent(errorDescription || error || "Google login failed");
    return NextResponse.redirect(`${baseUrl}/login?error=${msg}`);
  }

  try {
    const keycloakTokenUrl = `${process.env.KEYCLOAK_ISSUER_URI || "http://localhost:8080/realms/movie-app-realm"}/protocol/openid-connect/token`;
    const clientId = process.env.KEYCLOAK_CLIENT_ID || "movie-app-client";
    const clientSecret = process.env.KEYCLOAK_CLIENT_SECRET || "NXLH0qSVOgy0eXczjFfDiZrX239D91W5";
    const redirectUri = `${baseUrl}/api/auth/callback/keycloak`;

    // 1. Exchange code with Keycloak for tokens
    const tokenRes = await fetch(keycloakTokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      console.error("Keycloak token exchange error:", errText);
      return NextResponse.redirect(`${baseUrl}/login?error=TokenExchangeFailed`);
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token;

    // 2. Query Spring Boot /api/v1/users/me so user is auto-provisioned in PostgreSQL
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081";
    let userObj: any = {
      name: "Google User",
      email: "user@gmail.com",
      role: "ROLE_USER",
    };

    try {
      const meRes = await fetch(`${apiUrl}/api/v1/users/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (meRes.ok) {
        const meJson = await meRes.json();
        userObj = meJson.data;
      }
    } catch (e) {
      console.error("Provisioning check error:", e);
    }

    // 3. Return an HTML page that stores tokens in localStorage and redirects
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Logging in...</title>
        </head>
        <body style="background: #141414; color: white; display: flex; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif;">
          <div style="text-align: center;">
            <div style="border: 3px solid #333; border-top: 3px solid #E50914; border-radius: 50%; width: 36px; height: 36px; animation: spin 0.8s linear infinite; margin: 0 auto 16px;"></div>
            <p style="font-size: 14px; color: #a1a1aa;">Signing in with Google...</p>
          </div>
          <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
          <script>
            try {
              localStorage.setItem("access_token", ${JSON.stringify(accessToken)});
              localStorage.setItem("refresh_token", ${JSON.stringify(refreshToken)});
              localStorage.setItem("user", ${JSON.stringify(JSON.stringify({
                id: String(userObj.id || ""),
                name: userObj.displayName || userObj.name || "User",
                email: userObj.email || "",
                role: userObj.role || "ROLE_USER",
                image: userObj.avatarUrl || null,
                emailVerified: true,
                createdAt: userObj.createdAt || new Date().toISOString(),
              }))});
            } catch(e) {}
            const role = ${JSON.stringify(userObj.role || "")};
            if (role.includes("ADMIN")) {
              window.location.href = "/admin";
            } else {
              window.location.href = "/movies";
            }
          </script>
        </body>
      </html>
    `;

    return new NextResponse(html, {
      headers: { "Content-Type": "text/html" },
    });
  } catch (err: any) {
    console.error("Callback route error:", err);
    return NextResponse.redirect(`${baseUrl}/login?error=AuthenticationFailed`);
  }
}
