import { Globe, Github, MessageCircle, Send, Linkedin, Youtube, BookOpen, FileText, Twitter } from 'lucide-react';
import type { ProjectLinks } from '@/types/project';

/**
 * Official project links. Only links the project actually has are rendered —
 * never a disabled or empty icon.
 *
 * Every link is external and untrusted, so all carry rel="noopener noreferrer".
 */
const LINK_META: {
  key: keyof ProjectLinks;
  label: string;
  Icon: typeof Globe;
}[] = [
  { key: 'website', label: 'Website', Icon: Globe },
  { key: 'x', label: 'X (Twitter)', Icon: Twitter },
  { key: 'github', label: 'GitHub', Icon: Github },
  { key: 'discord', label: 'Discord', Icon: MessageCircle },
  { key: 'telegram', label: 'Telegram', Icon: Send },
  { key: 'linkedin', label: 'LinkedIn', Icon: Linkedin },
  { key: 'youtube', label: 'YouTube', Icon: Youtube },
  { key: 'medium', label: 'Medium', Icon: FileText },
  { key: 'docs', label: 'Documentation', Icon: BookOpen },
  { key: 'whitepaper', label: 'Whitepaper', Icon: FileText },
];

export function ProjectSocialLinks({
  links,
  max,
  showLabels = false,
}: {
  links: ProjectLinks;
  max?: number;
  showLabels?: boolean;
}) {
  const available = LINK_META.filter(meta => links[meta.key]);
  const visible = typeof max === 'number' ? available.slice(0, max) : available;

  if (visible.length === 0) return null;

  if (showLabels) {
    return (
      <ul className="flex flex-wrap gap-2">
        {visible.map(({ key, label, Icon }) => (
          <li key={key}>
            <a
              href={links[key]}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800 text-sm text-gray-700 dark:text-gray-300 hover:border-[#EFB81A] hover:text-[#EFB81A] transition-colors"
            >
              <Icon className="w-4 h-4" aria-hidden="true" />
              {label}
            </a>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ul className="flex items-center gap-1.5">
      {visible.map(({ key, label, Icon }) => (
        <li key={key}>
          <a
            href={links[key]}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-[#EFB81A] hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
            aria-label={label}
          >
            <Icon className="w-4 h-4" aria-hidden="true" />
          </a>
        </li>
      ))}
    </ul>
  );
}
