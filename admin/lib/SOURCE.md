# Sveltia CMS 0.217.0

Unmodified distribution from the official npm package `@sveltia/cms@0.217.0`.

- Source: https://github.com/sveltia/sveltia-cms
- Package: https://registry.npmjs.org/@sveltia/cms/-/cms-0.217.0.tgz
- Package integrity: `sha512-F/Qn3CAL9mEDTEoT6ASfjTroyoVRP5y4x6bS5D5vuHw/ZKYsSgTHcWpYjdohMQeAPwS0JXxGf0nmImuuwewP3A==`
- License: MIT, retained in LICENSE.txt.

The core editor is self-hosted. Non-English UI translations are loaded by the upstream application from its version-pinned UNPKG locale path; CSP allows only that JSON path, not remote script execution. If unavailable, English UI remains usable and collection/field labels remain Chinese. Optional integrations and externally loaded syntax-highlighting engines are not enabled by this site's CSP.

No credentials are included. Review official releases/security advisories before updating the pinned version and its locale CSP path.

The icon font is self-hosted from https://cdn.jsdelivr.net/fontsource/fonts/material-symbols-outlined:vf@5.3.1/latin-wght-normal.woff2 (Fontsource Material Symbols Outlined 5.3.1); its upstream license is retained in FONT-LICENSE.txt. Body text uses system fonts instead of downloading optional UI fonts.
