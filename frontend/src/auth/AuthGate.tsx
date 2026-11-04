import { useContext, useEffect, useRef, type ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { AuthProvider, hasAuthParams, useAuth } from 'react-oidc-context';
import { AuthDisabledContext } from './auth-disabled';
import { userManager } from './user-manager';

// Removes `code` and `state` from the URL once the redirect callback has been handled.
function onSigninCallback(): void {
  globalThis.history.replaceState({}, document.title, globalThis.location.pathname);
}

/** Redirects unauthenticated visitors to the login page and renders children once signed in. */
export function RequireAuth({ children }: Readonly<{ children: ReactNode }>) {
  const auth = useAuth();
  const attempted = useRef(false);

  useEffect(() => {
    if (
      !hasAuthParams() &&
      !auth.isAuthenticated &&
      !auth.activeNavigator &&
      !auth.isLoading &&
      !auth.error &&
      !attempted.current
    ) {
      attempted.current = true;
      void auth.signinRedirect();
    }
  }, [auth]);

  if (auth.error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger" role="alert">
          Sign-in failed: {auth.error.message}
        </div>
        <button type="button" className="btn btn-primary" onClick={() => void auth.signinRedirect()}>
          Try again
        </button>
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    return (
      <div className="container mt-4" role="status">
        Redirecting to sign in...
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * Layout route for pages that need a signed-in user. Public pages (such as /privacy) sit outside it,
 * so they render without a login redirect. Lets everything through when authentication is disabled.
 */
export function RequireAuthRoute() {
  const authDisabled = useContext(AuthDisabledContext);
  if (authDisabled) return <Outlet />;
  return (
    <RequireAuth>
      <Outlet />
    </RequireAuth>
  );
}

/**
 * Provides the OIDC login context, or marks authentication as disabled (no login, no token) when no Keycloak
 * is configured. The login redirect itself happens per route, in RequireAuthRoute.
 */
export function AuthGate({ children }: Readonly<{ children: ReactNode }>) {
  if (!userManager) {
    return <AuthDisabledContext.Provider value={true}>{children}</AuthDisabledContext.Provider>;
  }
  return (
    <AuthProvider userManager={userManager} onSigninCallback={onSigninCallback}>
      {children}
    </AuthProvider>
  );
}
