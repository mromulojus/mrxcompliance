# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/3819f65b-4b23-4932-aefe-72a206b05337

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/3819f65b-4b23-4932-aefe-72a206b05337) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/3819f65b-4b23-4932-aefe-72a206b05337) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## Access control for denúncias

The `denuncias` table in Supabase uses row-level security:

- Anonymous users may submit new denúncias but cannot view, update or delete any entries.
- Only authenticated users with the `compliance` role or superusers can read, update or delete existing denúncias.

These policies ensure public reporting while keeping report data restricted to the compliance team.

## Authentication Security Settings

- OTP expiry is set to **2 minutes (120 seconds)** in Supabase Auth to reduce attack window.
- Enable **Leaked password protection** in Supabase Auth so compromised passwords are rejected during signup and password changes.

Navigate to: Project > Authentication > Providers > Email/Phone and adjust these settings accordingly.

## Password Complexity Requirements

User passwords must meet the following minimum requirements:

- At least **12 characters** in length
- Include at least **one uppercase** and **one lowercase** letter
- Include at least **one number** and **one special character**

These requirements are enforced through Supabase Auth configuration to ensure strong
credentials across the platform.

## Security Incident Response

The application records activity for sensitive HR tables in `public.activity_logs`.
An automated monitor scans these logs hourly and flags anomalous access patterns.

If a potential security incident is detected:

1. **Contain** – revoke suspicious credentials and isolate affected services.
2. **Eradicate** – patch vulnerabilities and remove malicious artifacts.
3. **Recover** – restore from clean backups and verify system integrity.
4. **Review** – document the incident and update policies and monitoring rules.

Scheduled GitHub Actions also perform weekly dependency audits to surface
vulnerabilities early.

## Compliance

See [docs/compliance_credentials_rotation.md](docs/compliance_credentials_rotation.md) for the credential rotation procedure for the compliance team.
