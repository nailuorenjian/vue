import defaultSettings from '@/settings'

const title = defaultSettings.title || 'Vue Demo'

export default function getPageTitle(pageTitle) {
  if (pageTitle) {
    return `${pageTitle} - ${title}`
  }
  return `${title}`
}
