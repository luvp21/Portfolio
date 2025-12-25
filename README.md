# Interactive Portfolio Website

A modern, interactive portfolio website built with Next.js featuring a desktop-style canvas interface with draggable panels, command bar navigation, and real-time visitor tracking.

## Short Description

This portfolio showcases my work as a Full Stack Developer through an innovative desktop-inspired interface. Visitors can interact with draggable panels, use keyboard shortcuts, and explore projects, experience, and achievements in an engaging way. The site includes real-time visitor tracking and is fully responsive for both desktop and mobile devices.

## Features

- **Desktop Canvas Interface**: Draggable, resizable panels that can be minimized, closed, pinned, and reset
- **Command Bar**: Keyboard-driven navigation (Ctrl+K or /) with fuzzy search for quick access to panels and features
- **Real-time Visitor Counter**: Live visitor tracking using Supabase with real-time updates and ordinal display
- **Theme Toggle**: Dark and light mode support with system preference detection
- **Responsive Design**: Separate mobile and desktop layouts optimized for each screen size
- **Panel Management**:
  - Drag and drop panels on desktop
  - LocalStorage persistence for panel positions
  - Z-index management for layering
  - Panel reset functionality
- **Interactive Components**:
  - Profile card with social links
  - Project showcase with tags and links
  - Experience timeline with expandable details
  - Tech stack display
  - Achievements showcase
  - Contact card with flip animation
- **Animations**: Smooth transitions and animations powered by Framer Motion
- **SEO Optimized**: Metadata, Open Graph tags, Twitter cards, and sitemap
- **Dock Navigation**: Quick access to panels via bottom dock (desktop)

## Tech Stack

### Frontend
- **Next.js 16** (App Router) - React framework
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icons
- **React Icons** - Additional icons

### Backend & Database
- **Supabase** - Database and real-time subscriptions
  - PostgreSQL database for visitor tracking
  - Real-time subscriptions for live updates
  - RPC functions for atomic increments

### UI Components
- **shadcn/ui** - Component library built on Radix UI
- **cmdk** - Command menu component
- **sonner** - Toast notifications
- **next-themes** - Theme management

### Tooling
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing
- **ESLint** - Code linting

## Project Structure

```
Portfolio/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   └── visit/         # Visitor tracking endpoint
│   ├── layout.tsx         # Root layout with metadata
│   ├── page.tsx           # Home page
│   ├── sitemap.ts         # SEO sitemap
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/                # shadcn/ui components
│   ├── PortfolioInterface.tsx  # Main interface component
│   ├── DesktopCanvas.tsx  # Desktop panel canvas
│   ├── MobileLayout.tsx   # Mobile layout
│   ├── command-bar.tsx    # Command menu
│   ├── dock.tsx          # Bottom dock navigation
│   ├── LiveVisitorBadge.tsx  # Visitor counter
│   ├── profile-card.tsx   # About panel
│   ├── project-card.tsx   # Project display
│   ├── experience-timeline.tsx  # Experience panel
│   ├── tech-stack.tsx    # Tech stack panel
│   ├── achievements-card.tsx    # Achievements panel
│   ├── contact-card.tsx  # Contact panel
│   └── theme-toggle/     # Theme switcher
├── lib/                   # Utilities
│   ├── supabaseClient.ts # Supabase client
│   └── utils.ts          # Helper functions
├── public/               # Static assets
│   ├── icons/            # SVG icons
│   └── *.png, *.pdf     # Images and documents
└── styles/               # Additional styles
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Supabase account and project
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/luvp21/Portfolio.git
cd Portfolio
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

4. Set up Supabase database:
   - Create a table named `visit_counters` with columns:
     - `name` (text, primary key)
     - `count` (integer, default 0)
   - Create an RPC function `increment_visit_counter`:
   ```sql
   CREATE OR REPLACE FUNCTION increment_visit_counter(p_name text)
   RETURNS integer AS $$
   DECLARE
     new_count integer;
   BEGIN
     INSERT INTO visit_counters (name, count)
     VALUES (p_name, 1)
     ON CONFLICT (name) DO UPDATE
     SET count = visit_counters.count + 1
     RETURNING count INTO new_count;
     RETURN new_count;
   END;
   $$ LANGUAGE plpgsql;
   ```
   - Enable Row Level Security (RLS) and real-time subscriptions for the `visit_counters` table

5. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) | Yes |

**Note**: Never commit `.env.local` or expose service role keys in client-side code.

## Screenshots / Demo

<!-- Add screenshots here -->
- Desktop view with draggable panels
- Mobile responsive layout
- Command bar interface
- Dark and light themes

Live demo: [https://luv-patel.vercel.app](https://luv-patel.vercel.app)

---

Built with Next.js, Tailwind CSS, and Supabase. Thanks for visiting! 🚀

