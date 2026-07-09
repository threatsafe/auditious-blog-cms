import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import sharp from 'sharp'
import path from 'path'
import { buildConfig, PayloadRequest } from 'payload'
import { fileURLToPath } from 'url'

import { Categories } from './collections/Categories'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Subscribers } from './collections/Subscribers'
import { Themes } from './collections/Themes'
import { Users } from './collections/Users'
import { Footer } from './Footer/config'
import { Header } from './Header/config'
import { ThemeSettings } from './globals/ThemeSettings/config'
import { plugins } from './plugins'
import { defaultLexical } from '@/fields/defaultLexical'
import { getServerSideURL } from './utilities/getURL'
import { notifySubscribersTask } from './jobs/notifySubscribersTask'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    // Force the admin panel to the light (white) theme.
    theme: 'light',
    components: {
      // Replace the default Payload logo/icon with the Auditious logo (public/logo.png).
      graphics: {
        Logo: '@/components/AdminLogo',
        Icon: '@/components/AdminIcon',
      },
      // The `BeforeLogin` component renders a message that you see while logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below.
      beforeLogin: ['@/components/BeforeLogin'],
      // The `BeforeDashboard` component renders the 'welcome' block that you see after logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below.
      beforeDashboard: ['@/components/BeforeDashboard'],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  // This config helps us configure global or default features that the other editors can inherit
  editor: defaultLexical,
  // SMTP transport for transactional/newsletter email. Reuses the SMTP* env vars.
  email: nodemailerAdapter({
    defaultFromAddress: process.env.SMTPEMAIL || 'no-reply@localhost',
    defaultFromName: 'Auditious Blog',
    transportOptions: {
      host: process.env.SMTPHOST,
      port: Number(process.env.SMTPPORT || 587),
      secure: process.env.SMTPSECURE === 'true',
      auth: {
        user: process.env.SMTPUSERNAME,
        pass: process.env.SMTPPASSWORD,
      },
    },
  }),
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URL || '',
    },
  }),
  collections: [Pages, Posts, Media, Categories, Users, Themes, Subscribers],
  cors: [getServerSideURL()].filter(Boolean),
  globals: [Header, Footer, ThemeSettings],
  plugins,
  secret: process.env.PAYLOAD_SECRET,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        // Allow logged in users to execute this endpoint (default)
        if (req.user) return true

        const secret = process.env.CRON_SECRET
        if (!secret) return false

        // If there is no logged in user, then check
        // for the Vercel Cron secret to be present as an
        // Authorization header:
        const authHeader = req.headers.get('authorization')
        return authHeader === `Bearer ${secret}`
      },
    },
    tasks: [notifySubscribersTask],
    // Drain the queue from the running server in development so post-publish
    // notifications send without an external cron. Production relies on the
    // CRON_SECRET-protected /api/payload-jobs/run endpoint instead.
    autoRun: [{ cron: '* * * * *', limit: 10, queue: 'default' }],
    shouldAutoRun: async () => process.env.NODE_ENV === 'development',
  },
})
