import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthContext, type AuthContextProps } from 'react-oidc-context';
import { App } from '../../App';
import { PRIVACY_CONTACT } from '../../pages/Privacy';
import { createMockAuth } from '../test-utils';

function renderAppAt(path: string, auth: AuthContextProps) {
  globalThis.history.pushState({}, '', path);
  return render(
    <AuthContext.Provider value={auth}>
      <App />
    </AuthContext.Provider>,
  );
}

function signedOut() {
  const signinRedirect = vi.fn().mockResolvedValue(undefined);
  return { auth: createMockAuth({ isAuthenticated: false, user: null, signinRedirect }), signinRedirect };
}

describe('privacy page', () => {
  afterEach(() => {
    globalThis.history.pushState({}, '', '/');
  });

  it('is shown to a signed-out visitor without redirecting to login', () => {
    const { auth, signinRedirect } = signedOut();

    renderAppAt('/privacy', auth);

    expect(screen.getByRole('heading', { level: 1, name: 'Privacy' })).toBeInTheDocument();
    expect(screen.getByText(/Last updated: 2026-11-04/)).toBeInTheDocument();
    expect(signinRedirect).not.toHaveBeenCalled();
  });

  it('still redirects a signed-out visitor to login on other pages', () => {
    const { auth, signinRedirect } = signedOut();

    renderAppAt('/', auth);

    expect(signinRedirect).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Welcome to Eventhub!')).not.toBeInTheDocument();
  });

  it('shows the contact address, highlighted while it is still a placeholder', () => {
    renderAppAt('/privacy', signedOut().auth);

    const contacts = screen.getAllByTestId('privacy-contact');
    expect(contacts.length).toBeGreaterThan(0);
    for (const contact of contacts) expect(contact).toHaveTextContent(PRIVACY_CONTACT);
    if (PRIVACY_CONTACT.startsWith('TODO')) expect(contacts[0]?.tagName).toBe('MARK');
  });

  it('is linked from the footer of every page', async () => {
    renderAppAt('/', createMockAuth());

    await userEvent.click(screen.getByRole('link', { name: 'Privacy' }));

    expect(screen.getByRole('heading', { level: 1, name: 'Privacy' })).toBeInTheDocument();
  });
});
