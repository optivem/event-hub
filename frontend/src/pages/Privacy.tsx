import { Layout } from '../components';

// TODO(user): replace with the real contact address (a role address, not a personal one) before this goes to prod.
export const PRIVACY_CONTACT = 'TODO-contact-address';

export const PRIVACY_LAST_UPDATED = '2026-11-04';

/** Renders the contact address; the placeholder is highlighted so it cannot slip into prod unnoticed. */
function Contact() {
  if (PRIVACY_CONTACT.startsWith('TODO')) {
    return <mark data-testid="privacy-contact">{PRIVACY_CONTACT}</mark>;
  }
  return (
    <a data-testid="privacy-contact" href={`mailto:${PRIVACY_CONTACT}`}>
      {PRIVACY_CONTACT}
    </a>
  );
}

/**
 * Public privacy notice (no login required). Also the privacy policy URL of the Google sign-in consent screen.
 */
export function Privacy() {
  return (
    <Layout title="Privacy">
      <article className="mb-4" style={{ maxWidth: '48rem' }}>
        <h1 className="h2">Privacy</h1>
        <p className="text-muted">Last updated: {PRIVACY_LAST_UPDATED}</p>

        <h2 className="h4 mt-4">Who runs this site</h2>
        <p>
          This site is run by the organizers of the Tech Excellence meetup. We use it to plan meetup events and the
          talks given at them. If you have any question about your personal data, contact us at <Contact />.
        </p>

        <h2 className="h4 mt-4">What we store</h2>
        <ul>
          <li>Your account: your name, your email address and your role on the site (for example organizer or speaker).</li>
          <li>Event and talk data you or the organizers enter, such as talk titles, descriptions and who gives a talk at which event.</li>
          <li>
            If you sign in with Google: we receive only your name and email address from Google. We do not receive
            your Google password and do not get access to anything else in your Google account.
          </li>
          <li>
            Technical logs: like most websites, our servers log requests (time, page, IP address and browser) to keep
            the site running and secure.
          </li>
        </ul>
        <p>
          We do not use advertising or analytics trackers. The only cookies are the ones needed to keep you signed in.
        </p>

        <h2 className="h4 mt-4">Why we store it</h2>
        <p>
          We store your data only to run the meetup: to let you sign in, to show who does what for an event, and to
          contact you about the events and talks you are involved in. We do not sell your data or share it with
          anyone for marketing.
        </p>

        <h2 className="h4 mt-4">Where it is hosted</h2>
        <p>
          The site runs on Google Cloud in the us-central1 region (United States). The database is hosted by Neon.
          The page styles are loaded from the jsDelivr content delivery network, which sees your IP address when your
          browser downloads them. These providers process the data on our behalf.
        </p>

        <h2 className="h4 mt-4">How long we keep it</h2>
        <p>
          We keep your account for as long as you take part in the meetup, and delete it when you ask us to or when
          it is no longer needed. Event and talk data is kept as the record of past meetups; if you ask, we remove
          your name from it. Technical logs are deleted automatically after 30 days.
        </p>

        <h2 className="h4 mt-4">Your rights</h2>
        <p>
          You can ask us for a copy of the data we hold about you, ask us to correct it, or ask us to delete it. Write
          to <Contact /> and we will answer within one month. You also have the right to complain to your data
          protection authority.
        </p>
      </article>
    </Layout>
  );
}
