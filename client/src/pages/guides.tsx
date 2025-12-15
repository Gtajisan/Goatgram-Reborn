import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Key,
  Shield,
  Terminal,
  Settings,
  AlertTriangle,
  BookOpen,
  CheckCircle,
  Github,
  Mail,
  Heart,
} from "lucide-react";

const guides = [
  {
    id: 'appstate',
    icon: Key,
    title: 'Getting Your AppState (Cookies)',
    description: 'Learn how to extract Instagram session cookies for bot authentication',
    difficulty: 'Beginner',
    steps: [
      {
        title: 'Install a Cookie Extension',
        content: 'Install a browser extension like "c3c-fbstate" or "EditThisCookie" for Chrome/Firefox. These tools let you export cookies in JSON format.'
      },
      {
        title: 'Log into Instagram',
        content: 'Open Instagram in your browser and log into the account you want to use for the bot. Make sure you\'re fully logged in and can see your feed.'
      },
      {
        title: 'Export Cookies',
        content: 'Click on the cookie extension icon and export all cookies for instagram.com. Save this as a JSON file or copy the content.'
      },
      {
        title: 'Format as AppState',
        content: 'The exported cookies should be in JSON array format. Each cookie object should have: key, value, domain, path, hostOnly, creation, lastAccessed.'
      },
      {
        title: 'Add to Configuration',
        content: 'Go to Configuration > Auth tab, select "AppState (Cookies)" method, and paste your JSON into the AppState field. Click Save to apply.'
      },
    ],
    tips: [
      'Use a dedicated account for the bot, not your personal account',
      'Re-export cookies if you log out or clear browser data',
      'AppState is safer than username/password login',
    ]
  },
  {
    id: 'setup',
    icon: Settings,
    title: 'Bot Setup & Configuration',
    description: 'Complete guide to configuring your GoatBot v2 Instagram port',
    difficulty: 'Beginner',
    steps: [
      {
        title: 'Authentication Setup',
        content: 'First, set up authentication using either AppState (recommended) or username/password. Go to Configuration > Auth and enter your credentials.'
      },
      {
        title: 'Configure Bot Behavior',
        content: 'In Configuration > Bot tab, set your command prefix (default: /), choose language, and enable/disable features like auto-reconnect and auto-mark-read.'
      },
      {
        title: 'Set Up Proxy (Optional)',
        content: 'If you need to route traffic through a proxy, add your proxy URL in the Auth tab. Supports HTTP, HTTPS, and SOCKS5 protocols.'
      },
      {
        title: 'Start the Bot',
        content: 'Once configured, the bot will automatically connect. Check the Dashboard for connection status and the Logs page for detailed activity.'
      },
      {
        title: 'Test Commands',
        content: 'Send a message like "/help" or "/ping" to any chat where the bot is active to verify it\'s working correctly.'
      },
    ],
    tips: [
      'Start with default settings and adjust as needed',
      'Monitor the Logs page during initial setup for any errors',
      'The Dashboard shows real-time connection health',
    ]
  },
  {
    id: 'commands',
    icon: Terminal,
    title: 'Using Bot Commands',
    description: 'How to use and create custom commands',
    difficulty: 'Intermediate',
    steps: [
      {
        title: 'Basic Command Usage',
        content: 'All commands start with the prefix (default: /). Type /help in any chat to see available commands. Example: /ping, /weather London'
      },
      {
        title: 'Command Categories',
        content: 'Commands are organized into categories: utility (help, ping, info), fun (weather, quote), admin (ban, mute), and moderation. Some commands require admin permissions.'
      },
      {
        title: 'Managing Commands',
        content: 'Go to the Commands page to see all loaded commands. You can enable/disable individual commands using the toggle switch on each card.'
      },
      {
        title: 'Adding Custom Commands',
        content: 'Place JavaScript command files in the /scripts folder. Each file should export a module with config (name, description, usage) and onCall function.'
      },
      {
        title: 'Command Cooldowns',
        content: 'Each command has a cooldown period to prevent spam. The cooldown (in seconds) is shown on the command card. Admin commands may have no cooldown.'
      },
    ],
    tips: [
      'Use /help [command] to get detailed info about a specific command',
      'Check command cooldowns to avoid rate limiting',
      'Test new commands in a private chat first',
    ]
  },
  {
    id: 'safety',
    icon: Shield,
    title: 'Safety & Best Practices',
    description: 'Keep your account safe and avoid bans',
    difficulty: 'Important',
    steps: [
      {
        title: 'Use a Dedicated Account',
        content: 'Never use your personal Instagram account for bot automation. Create a separate business/creator account specifically for the bot.'
      },
      {
        title: 'Enable Rate Limiting',
        content: 'The bot includes built-in rate limiting to prevent excessive requests. Don\'t disable these protections. Monitor the rate limit status in Logs.'
      },
      {
        title: 'Use Random User Agents',
        content: 'Keep "Random User Agent" enabled in Configuration. This rotates browser fingerprints to make requests look more natural.'
      },
      {
        title: 'Set Appropriate Intervals',
        content: 'In Advanced settings, set listen interval to at least 3000ms (3 seconds). Higher values are safer but slower. Don\'t set below 2000ms.'
      },
      {
        title: 'Monitor Connection Health',
        content: 'Watch the connection health bar on the Dashboard. If it drops below 50%, consider pausing bot activity and refreshing the session.'
      },
      {
        title: 'Use Proxies for Extra Safety',
        content: 'Route traffic through a residential proxy to reduce the chance of detection. Avoid datacenter IPs when possible.'
      },
    ],
    tips: [
      'Start with slower intervals and speed up gradually',
      'If you get temporarily blocked, wait 24-48 hours before reconnecting',
      'Regularly refresh your AppState to maintain session validity',
      'Don\'t respond to every message instantly - add natural delays',
    ]
  },
  {
    id: 'troubleshooting',
    icon: AlertTriangle,
    title: 'Troubleshooting Common Issues',
    description: 'Solutions for frequent problems',
    difficulty: 'All Levels',
    steps: [
      {
        title: 'Bot Not Connecting',
        content: 'Check if your AppState is valid and not expired. Try exporting fresh cookies from your browser. Verify the account isn\'t locked or requiring verification.'
      },
      {
        title: 'Messages Not Sending',
        content: 'Check the Logs for rate limit warnings. Wait a few minutes and try again. Ensure the thread exists and you have permission to send messages.'
      },
      {
        title: 'Commands Not Working',
        content: 'Verify the command is enabled in the Commands page. Check if you\'re using the correct prefix. Make sure the command syntax is correct.'
      },
      {
        title: 'Frequent Disconnections',
        content: 'This usually means rate limiting. Increase the listen interval in Advanced settings. Consider using a proxy. Check if another instance is using the same account.'
      },
      {
        title: 'Session Expired',
        content: 'AppState cookies expire over time. Re-export your cookies from the browser and update the configuration. Make sure you\'re still logged into Instagram.'
      },
    ],
    tips: [
      'Always check Logs first when troubleshooting',
      'Restart the bot after making configuration changes',
      'Clear database cache if data seems stale',
    ]
  },
];

function getDifficultyColor(difficulty: string) {
  switch (difficulty) {
    case 'Important':
      return 'bg-status-busy/20 text-status-busy';
    case 'Intermediate':
      return 'bg-status-away/20 text-status-away';
    default:
      return 'bg-status-online/20 text-status-online';
  }
}

export default function GuidesPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Guides & Documentation</h1>
          <p className="text-muted-foreground">Learn how to use GoatBot v2 Instagram Port</p>
        </div>
        <Badge variant="outline" className="gap-1">
          <BookOpen className="h-3 w-3" />
          {guides.length} Guides
        </Badge>
      </div>

      {/* Quick Start */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            Quick Start Checklist
          </CardTitle>
          <CardDescription>Follow these steps to get your bot running</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">1</span>
              <span>Extract your AppState cookies from Instagram (see guide below)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">2</span>
              <span>Go to Configuration and paste your AppState</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">3</span>
              <span>Configure bot settings (prefix, language, behavior)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">4</span>
              <span>Monitor Dashboard for connection status</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">5</span>
              <span>Test with /help or /ping command</span>
            </li>
          </ol>
        </CardContent>
      </Card>

      {/* Guides */}
      <ScrollArea className="h-[calc(100vh-350px)]">
        <div className="space-y-4 pr-4">
          {guides.map((guide) => (
            <Card key={guide.id} data-testid={`guide-card-${guide.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-md bg-primary/10">
                      <guide.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{guide.title}</CardTitle>
                      <CardDescription className="mt-1">{guide.description}</CardDescription>
                    </div>
                  </div>
                  <Badge className={getDifficultyColor(guide.difficulty)}>
                    {guide.difficulty}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="steps" className="border-none">
                    <AccordionTrigger className="text-sm font-medium py-2" data-testid={`accordion-steps-${guide.id}`}>
                      Step-by-Step Instructions ({guide.steps.length} steps)
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pt-2">
                        {guide.steps.map((step, index) => (
                          <div key={index} className="flex gap-3">
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-mono">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{step.title}</p>
                              <p className="text-sm text-muted-foreground mt-1">{step.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="tips" className="border-none">
                    <AccordionTrigger className="text-sm font-medium py-2" data-testid={`accordion-tips-${guide.id}`}>
                      Pro Tips ({guide.tips.length})
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-2 pt-2">
                        {guide.tips.map((tip, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-status-online mt-0.5 flex-shrink-0" />
                            <span className="text-muted-foreground">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>

      {/* Credits */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Heart className="h-5 w-5 text-status-busy" />
            Credits & Contact
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-3 p-3 bg-muted rounded-md">
              <Github className="h-5 w-5" />
              <div>
                <p className="font-medium">Developer</p>
                <p className="text-sm text-muted-foreground">Gtajisan</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted rounded-md">
              <Mail className="h-5 w-5" />
              <div>
                <p className="font-medium">Contact</p>
                <p className="text-sm text-muted-foreground font-mono">ffjisan804@gmail.com</p>
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            GoatBot v2 Instagram Port is based on the original GoatBot V2 by NTKhang03, 
            ported to Instagram using the Instagram-FCA library. Special thanks to all contributors 
            and the open-source community.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
