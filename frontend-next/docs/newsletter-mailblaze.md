# Newsletter connection

All NewsletterForm instances (subscribe page, sidebar and inline forms) and SignupPopup submit to the same Next.js POST `/api/newsletter` route. It loads the public CMS home page and submits its MailBlaze form **3792** using `NAME`, `LNAME` and `EMAIL`. MailBlaze API credentials stay in WordPress. No browser credentials or API key are required.

The comment form also subscribes through this route only when the reader explicitly checks its newsletter box and the comment was accepted. A failed signup does not undo or repost the comment; a separate button retries the signup. Directory contact messages and website searches do not subscribe visitors.

In CMS → Mail Blaze → Form → News Letter Sign Up → Settings, select **SA Homeschooling** and save. Leave the redirect URL empty: the frontend needs the plugin's explicit success notice. Keep form 3792 rendered on the CMS homepage; removing it makes submissions fail visibly. The mailing-list selection is never overridden by frontend request data.

The frontend reports success only when the returned form 3792 includes both the plugin's successful-form class and a success notice. Its message is displayed as text, including any double-opt-in instructions. HTTP 200 alone, redirects, missing forms, plugin errors and network failures never count as signup success. Interactive CAPTCHA requires further integration and fails closed for now.

The old browser-only signup flag is ignored. Only an accepted backend submission sets the new MailBlaze signup flag.

## Verify before launch

1. Save the selected CMS list and confirm its opt-in setting in MailBlaze.
2. On the frontend, submit an email address you control. Check Network → `/api/newsletter`: it should return `submitted: true` and the CMS message.
3. Check the subscriber inside the **SA Homeschooling** list in MailBlaze. Complete any confirmation email and verify the final subscriber status and name fields.
4. Repeat through the popup (`/?signupPopup=preview`) and a sidebar signup. Existing subscribers may be updated according to CMS settings.

Automated tests mock CMS responses and never add real subscribers. End-to-end delivery is not confirmed until a controlled email has been submitted and checked in MailBlaze. Local changes must be deployed before they affect the public frontend.

Run `node --test tests/newsletter-submission.test.mjs` and `node node_modules/typescript/bin/tsc --noEmit`.
