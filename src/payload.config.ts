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
    theme: 'light',
    meta: {
      titleSuffix: '- Auditious Blog',
      // Use the Auditious favicon in admin browser tabs (replaces Payload's default).
      icons: [
        {
          rel: 'icon',
          type: 'image/x-icon',
          url: '/favicon.ico',
        },
      ],
    },
    components: {
      graphics: {
        Logo: '@/components/AdminLogo',
        Icon: '@/components/AdminIcon',
      },
      beforeLogin: ['@/components/BeforeLogin'],
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
        const authHeader = req.headers.get('authorization')
        return authHeader === `Bearer ${secret}`
      },
    },
    tasks: [notifySubscribersTask],
    autoRun: [{ cron: '* * * * *', limit: 10, queue: 'default' }],
    shouldAutoRun: async () => process.env.NODE_ENV === 'development',
  },
})
