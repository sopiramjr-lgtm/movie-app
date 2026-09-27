import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (error || !code) {
    const msg = encodeURIComponent(errorDescription || error || "Google sign-in was cancelled");
    return NextResponse.redirect(`${baseUrl}/login?error=${msg}`);
  }

  try {
    const clientId = process.env.GOOGLE_CLIENT_ID ;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = `${baseUrl}/api/auth/callback/google`;

    // 1. Exchange authorization code with Google for Google tokens
    const googleTokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!googleTokenRes.ok) {
      const errText = await googleTokenRes.text();
      console.error("Google token exchange error:", errText);
      return NextResponse.redirect(`${baseUrl}/login?error=GoogleTokenExchangeFailed`);
    }

    const googleTokens = await googleTokenRes.json();

    // 2. Fetch Google user profile
    const googleUserRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${googleTokens.access_token}` },
    });

    if (!googleUserRes.ok) {
      return NextResponse.redirect(`${baseUrl}/login?error=FailedToFetchGoogleProfile`);
    }

    const googleUser = await googleUserRes.json();
    const email = googleUser.email;
    const name = googleUser.name || email.split("@")[0];
    const picture = googleUser.picture || null;
    const googleSub = googleUser.sub;

    if (!email) {
      return NextResponse.redirect(`${baseUrl}/login?error=NoEmailProvidedByGoogle`);
    }

    // 3. Connect to Keycloak Admin to provision user and issue Keycloak tokens
    const keycloakIssuer = process.env.KEYCLOAK_ISSUER_URI || "http://localhost:8080/realms/movie-app-realm";
    const keycloakClientId = process.env.KEYCLOAK_CLIENT_ID || "movie-app-client";
    const keycloakClientSecret = process.env.KEYCLOAK_CLIENT_SECRET || "NXLH0qSVOgy0eXczjFfDiZrX239D91W5";

    // 3a. Get Keycloak master admin token
    const adminTokenRes = await fetch("http://localhost:8080/realms/master/protocol/openid-connect/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: "admin-cli",
        username: "admin",
        password: "admin",
        grant_type: "password",
      }),
    });

    let accessToken = "";
    let refreshToken = "";

    if (adminTokenRes.ok) {
      const adminTokenData = await adminTokenRes.json();
      const adminToken = adminTokenData.access_token;

      // 3b. Search for user in Keycloak
      const searchRes = await fetch(
        `http://localhost:8080/admin/realms/movie-app-realm/users?email=${encodeURIComponent(email)}`,
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );

      let keycloakUserId = "";
      if (searchRes.ok) {
        const users = await searchRes.json();
        if (users && users.length > 0) {
          keycloakUserId = users[0].id;
        }
      }

      const internalPassword = `GOOGLE_AUTH_${googleSub}_KHMERFLIX_SECURE`;

      // 3c. If user doesn't exist in Keycloak, create them
      if (!keycloakUserId) {
        const createRes = await fetch("http://localhost:8080/admin/realms/movie-app-realm/users", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${adminToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: email,
            email: email,
            firstName: name.split(" ")[0] || "User",
            lastName: name.split(" ").slice(1).join(" ") || "",
            enabled: true,
            emailVerified: true,
          }),
        });

        if (createRes.status === 201) {
          const loc = createRes.headers.get("Location");
          if (loc) keycloakUserId = loc.substring(loc.lastIndexOf("/") + 1);
        }

        // Fallback search if location header was not returned
        if (!keycloakUserId) {
          const reSearch = await fetch(
            `http://localhost:8080/admin/realms/movie-app-realm/users?email=${encodeURIComponent(email)}`,
            { headers: { Authorization: `Bearer ${adminToken}` } }
          );
          if (reSearch.ok) {
            const reUsers = await reSearch.json();
            if (reUsers && reUsers.length > 0) keycloakUserId = reUsers[0].id;
          }
        }
      }

      // 3d. Set user password in Keycloak so they can authenticate via standard grant
      if (keycloakUserId) {
        await fetch(`http://localhost:8080/admin/realms/movie-app-realm/users/${keycloakUserId}/reset-password`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${adminToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "password",
            value: internalPassword,
            temporary: false,
          }),
        });

        // 3e. Request real Keycloak tokens using standard password grant
        const tokenRes = await fetch(`${keycloakIssuer}/protocol/openid-connect/token`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_id: keycloakClientId,
            client_secret: keycloakClientSecret,
            username: email,
            password: internalPassword,
            grant_type: "password",
          }),
        });

        if (tokenRes.ok) {
          const kcData = await tokenRes.json();
          accessToken = kcData.access_token;
          refreshToken = kcData.refresh_token;
        }
      }
    }

    // 4. Query Spring Boot backend to auto-provision user in PostgreSQL
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081";
    let userObj: any = {
      id: "google-user",
      displayName: name,
      email: email,
      role: email === "sornsophiram11@gmail.com" ? "ROLE_ADMIN" : "ROLE_USER",
      avatarUrl: picture,
    };

    if (accessToken) {
      try {
        const meRes = await fetch(`${apiUrl}/api/v1/users/me`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (meRes.ok) {
          const meData = await meRes.json();
          userObj = meData.data || userObj;
          // Update avatar if not set
          if (!userObj.avatarUrl && picture) {
            await fetch(`${apiUrl}/api/v1/users/me`, {
              method: "PUT",
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                displayName: userObj.displayName || name,
                avatarUrl: picture,
              }),
            });
            userObj.avatarUrl = picture;
          }
        }
      } catch (err) {
        console.error("Backend user auto-provision error:", err);
      }
    }

    // 5. Store authentication in client storage and redirect
    const userRole = userObj.role || (email === "sornsophiram11@gmail.com" ? "ROLE_ADMIN" : "ROLE_USER");
    const isAdmin = userRole.includes("ADMIN") || userRole === "ROLE_ADMIN";

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Logging in...</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body style="background: #141414; color: white; display: flex; align-items: center; justify-content: center; height: 100vh; font-family: -apple-system, BlinkMacSystemFont, sans-serif; margin: 0;">
          <div style="text-align: center; padding: 20px;">
            <div style="border: 3px solid #333; border-top: 3px solid #E50914; border-radius: 50%; width: 40px; height: 40px; animation: spin 0.8s linear infinite; margin: 0 auto 16px;"></div>
            <h2 style="font-size: 18px; font-weight: 600; margin: 0 0 8px;">Connecting your Google account...</h2>
            <p style="font-size: 13px; color: #a1a1aa; margin: 0;">Welcome, ${name}</p>
          </div>
          <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
          <script>
            try {
              if (${JSON.stringify(accessToken)}) {
                localStorage.setItem("access_token", ${JSON.stringify(accessToken)});
              }
              if (${JSON.stringify(refreshToken)}) {
                localStorage.setItem("refresh_token", ${JSON.stringify(refreshToken)});
              }
              localStorage.setItem("user", ${JSON.stringify(JSON.stringify({
                id: String(userObj.id || ""),
                name: userObj.displayName || name,
                email: email,
                role: userRole,
                image: userObj.avatarUrl || picture,
                emailVerified: true,
                createdAt: userObj.createdAt || new Date().toISOString(),
              }))});
            } catch(e) {
              console.error("Storage error:", e);
            }
            const destination = ${JSON.stringify(isAdmin ? "/admin" : "/movies")};
            window.location.href = destination;
          </script>
        </body>
      </html>
    `;

    return new NextResponse(html, {
      headers: { "Content-Type": "text/html" },
    });
  } catch (err: any) {
    console.error("Google OAuth callback error:", err);
    return NextResponse.redirect(`${baseUrl}/login?error=GoogleAuthFailed`);
  }
}
